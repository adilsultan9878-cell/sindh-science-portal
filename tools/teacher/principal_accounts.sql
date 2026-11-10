-- Principal accounts: the admin makes a principal (email + password + school) and puts teachers in a school;
-- a teacher's classes then belong to that school and the principal sees them on /school/ after signing in.
-- Applied to Supabase as migration "principal_accounts". Only adds; the old code + key dashboard still works.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('pending', 'teacher', 'principal', 'editor', 'reviewer', 'admin'));
alter table public.profiles add column if not exists school_code text references public.schools(code) on delete set null;
create index if not exists profiles_school_idx on public.profiles(school_code);

-- what a principal sees: class and chapter totals (never student names) and the school's teachers
create or replace function private.school_data(p_code text) returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'school', jsonb_build_object('code', s.code, 'name', s.name, 'district', s.district, 'created_at', s.created_at),
    'teachers', coalesce((select jsonb_agg(jsonb_build_object('email', p.email,
                    'classes', (select count(*) from public.classrooms c where c.teacher_id = p.id)) order by p.email)
                  from public.profiles p where p.school_code = s.code and p.role = 'teacher'), '[]'::jsonb),
    'classes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', c.code, 'name', c.name,
        'students', greatest((select count(*) from public.students st where st.class_code = c.code),
                             (select count(distinct r.student) from public.class_results r where r.code = c.code)),
        'results', (select count(*) from public.class_results r where r.code = c.code),
        'quizzes', (select count(*) from public.class_results r where r.code = c.code and r.kind = 'quiz'),
        'avg_quiz', (select round(avg(100.0 * r.score / nullif(r.total, 0))) from public.class_results r where r.code = c.code and r.kind = 'quiz' and r.total > 0),
        'worksheets', (select count(*) from public.class_results r where r.code = c.code and r.kind = 'worksheet'),
        'experiments', (select count(*) from public.class_results r where r.code = c.code and r.kind = 'experiment'),
        'last', (select max(r.created_at) from public.class_results r where r.code = c.code)
      ) order by c.name)
      from public.classrooms c where c.school_code = s.code), '[]'::jsonb),
    'chapters', coalesce((
      select jsonb_agg(jsonb_build_object('class', x.code, 'chapter', x.chapter_key, 'avg', x.avg, 'quizzes', x.n, 'students', x.students))
      from (select r.code, r.chapter_key, round(avg(100.0 * r.score / nullif(r.total, 0))) avg, count(*) n, count(distinct r.student) students
            from public.class_results r join public.classrooms c on c.code = r.code
            where c.school_code = s.code and r.kind = 'quiz' and r.total > 0 and r.chapter_key is not null
            group by r.code, r.chapter_key) x), '[]'::jsonb))
  from public.schools s where s.code = p_code;
$$;

-- the old way (school code + principal key) keeps working, now with the same data
create or replace function public.school_results(p_school text, p_key text) returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v_school public.schools;
begin
  select * into v_school from public.schools where code = upper(trim(p_school));
  if v_school.code is null or v_school.key_hash <> encode(extensions.digest(upper(trim(p_key)), 'sha256'), 'hex') then
    raise exception 'Wrong school code or principal key';
  end if;
  return private.school_data(v_school.code);
end $$;

create or replace function public.principal_school() returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v_code text;
begin
  if private.my_role() not in ('principal', 'admin') then raise exception 'principals_only'; end if;
  select school_code into v_code from public.profiles where id = auth.uid();
  if v_code is null then raise exception 'no_school'; end if;
  return private.school_data(v_code);
end $$;

create or replace function public.set_staff_role(p_user uuid, p_role text) returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'Admins only'; end if;
  if p_role not in ('pending', 'teacher', 'principal', 'admin') then raise exception 'Unknown role'; end if;
  if p_user = auth.uid() then raise exception 'You cannot change your own role.'; end if;
  update public.profiles set role = p_role where id = p_user;
  if p_role <> 'pending' then
    update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = p_user;
  end if;
end $$;

create or replace function public.admin_create_school(p_name text, p_district text default null) returns text language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'Admins only'; end if;
  return public.create_school(p_name, p_district) ->> 'code';
end $$;

-- puts a teacher or principal in a school; a teacher's classes move with them
create or replace function public.admin_set_school(p_user uuid, p_school text) returns void language plpgsql security definer set search_path = ''
as $$
declare v_school text := nullif(upper(trim(coalesce(p_school, ''))), '');
begin
  if not private.is_admin() then raise exception 'Admins only'; end if;
  if v_school is not null and not exists (select 1 from public.schools where code = v_school) then raise exception 'no_school'; end if;
  update public.profiles set school_code = v_school where id = p_user;
  update public.classrooms set school_code = v_school where teacher_id = p_user;
end $$;

create or replace function public.admin_create_staff(p_email text, p_password text, p_role text, p_school text) returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_id uuid;
begin
  if not private.is_admin() then raise exception 'Admins only'; end if;
  if p_role not in ('teacher', 'principal') then raise exception 'Unknown role'; end if;
  if p_role = 'principal' and nullif(trim(coalesce(p_school, '')), '') is null then raise exception 'no_school'; end if;
  v_id := public.admin_create_teacher(p_email, p_password);
  update public.profiles set role = p_role where id = v_id;
  perform public.admin_set_school(v_id, p_school);
  return v_id;
end $$;

create or replace function public.admin_schools() returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'Admins only'; end if;
  return jsonb_build_object(
    'schools', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'name', name, 'district', district) order by name) from public.schools), '[]'::jsonb),
    'members', coalesce((select jsonb_object_agg(id, school_code) from public.profiles where school_code is not null), '{}'::jsonb));
end $$;

-- a teacher's new class joins the teacher's school
create or replace function public.teacher_class_create(p_name text, p_school text default null) returns text language plpgsql security definer set search_path = ''
as $$
declare r jsonb;
begin
  if not private.is_teacher() then raise exception 'teachers_only'; end if;
  r := public.create_classroom(p_name, p_school, null);
  update public.classrooms set teacher_id = auth.uid(), school_code = (select school_code from public.profiles where id = auth.uid())
  where code = r ->> 'code';
  return r ->> 'code';
end $$;

revoke all on function public.principal_school(), public.admin_create_school(text, text), public.admin_set_school(uuid, text),
  public.admin_create_staff(text, text, text, text), public.admin_schools() from public, anon;
grant execute on function public.principal_school(), public.admin_create_school(text, text), public.admin_set_school(uuid, text),
  public.admin_create_staff(text, text, text, text), public.admin_schools() to authenticated;
revoke all on function private.school_data(text) from public, anon;
