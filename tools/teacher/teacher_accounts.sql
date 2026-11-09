-- Teacher accounts (made by the admin), class student accounts (made by the teacher), PIN reset, homework,
-- parents' page. Applied to Supabase as migration "teacher_accounts". Only adds; old class-code functions stay.

-- roles: the staff panel now offers pending / teacher / admin (old editor and reviewer rows stay valid)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('pending', 'teacher', 'editor', 'reviewer', 'admin'));

alter table public.classrooms add column if not exists teacher_id uuid references auth.users(id) on delete set null;
alter table public.students add column if not exists class_code text references public.classrooms(code) on delete set null;
alter table public.students add column if not exists parent_code text unique;
alter table public.class_results add column if not exists student_id uuid references public.students(id) on delete cascade;
create index if not exists class_results_student_idx on public.class_results(student_id);
create index if not exists students_class_idx on public.students(class_code);
create index if not exists classrooms_teacher_idx on public.classrooms(teacher_id);

create table if not exists public.homework (
  id bigint generated always as identity primary key,
  code text not null references public.classrooms(code) on delete cascade,
  chapter_key text not null,
  kind text not null check (kind in ('quiz', 'worksheet', 'experiment')),
  due date,
  created_at timestamptz not null default now()
);
create index if not exists homework_code_idx on public.homework(code);
alter table public.homework enable row level security;   -- no policies: only the functions below read it

create or replace function private.is_teacher() returns boolean language sql stable security definer set search_path = ''
as $$ select private.my_role() in ('teacher', 'admin') $$;

-- the class, if it belongs to the signed-in teacher (an admin may open every class)
create or replace function private.my_class(p_code text) returns public.classrooms language plpgsql stable security definer set search_path = ''
as $$
declare c public.classrooms;
begin
  if not private.is_teacher() then raise exception 'teachers_only'; end if;
  select * into c from public.classrooms where code = upper(trim(p_code));
  if c.code is null or (c.teacher_id is distinct from auth.uid() and not private.is_admin()) then raise exception 'not_your_class'; end if;
  return c;
end $$;

-- points saved in the student's account (student.js keeps the phone's ssp1.progress as a JSON string)
create or replace function private.student_points(d jsonb) returns integer language plpgsql immutable set search_path = ''
as $$
begin
  return coalesce(((d -> 'keys' ->> 'ssp1.progress')::jsonb ->> 'points')::integer, 0);
exception when others then return 0;
end $$;

create or replace function private.random_code(n int, alphabet text) returns text language plpgsql volatile set search_path = ''
as $$
declare s text := ''; i int;
begin
  for i in 1..n loop s := s || substr(alphabet, 1 + (get_byte(extensions.gen_random_bytes(1), 0) % length(alphabet)), 1); end loop;
  return s;
end $$;

/* ---------- admin: teachers ---------- */

create or replace function public.set_staff_role(p_user uuid, p_role text) returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'Admins only'; end if;
  if p_role not in ('pending', 'teacher', 'admin') then raise exception 'Unknown role'; end if;
  if p_user = auth.uid() then raise exception 'You cannot change your own role.'; end if;
  update public.profiles set role = p_role where id = p_user;
  if p_role <> 'pending' then
    update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = p_user;
  end if;
end $$;

create or replace function public.admin_create_teacher(p_email text, p_password text) returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_email text := lower(trim(p_email)); v_id uuid := gen_random_uuid();
begin
  if not private.is_admin() then raise exception 'Admins only'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'bad_email'; end if;
  if char_length(coalesce(p_password, '')) < 8 then raise exception 'short_password'; end if;
  if exists (select 1 from auth.users where lower(email) = v_email) then raise exception 'email_taken'; end if;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                          created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
          extensions.crypt(p_password, extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}',
          now(), now(), '', '', '', '');
  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (v_id::text, v_id, jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true), 'email', now(), now(), now());
  update public.profiles set role = 'teacher' where id = v_id;   -- the new-user trigger made it 'pending'
  return v_id;
end $$;

create or replace function public.admin_set_password(p_user uuid, p_password text) returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'Admins only'; end if;
  if char_length(coalesce(p_password, '')) < 8 then raise exception 'short_password'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now() where id = p_user;
end $$;

/* ---------- teacher: classes, students, homework ---------- */

create or replace function public.teacher_classes() returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_teacher() then raise exception 'teachers_only'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('code', c.code, 'name', c.name, 'school', c.school,
            'students', (select count(*) from public.students s where s.class_code = c.code)) order by c.created_at desc)
          from public.classrooms c where c.teacher_id = auth.uid()), '[]'::jsonb);
end $$;

create or replace function public.teacher_class_create(p_name text, p_school text default null) returns text language plpgsql security definer set search_path = ''
as $$
declare r jsonb;
begin
  if not private.is_teacher() then raise exception 'teachers_only'; end if;
  r := public.create_classroom(p_name, p_school, null);
  update public.classrooms set teacher_id = auth.uid() where code = r ->> 'code';
  return r ->> 'code';
end $$;

-- makes one account per name; returns the usernames, PINs and parents' codes once (PINs are stored hashed)
create or replace function public.teacher_add_students(p_code text, p_names text[]) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare c public.classrooms := private.my_class(p_code); v_name text; v_user text; v_pin text; v_parent text; v_base text; v_id uuid; out jsonb := '[]';
begin
  if coalesce(array_length(p_names, 1), 0) = 0 or array_length(p_names, 1) > 60 then raise exception 'one_to_sixty_names'; end if;
  foreach v_name in array p_names loop
    v_name := left(trim(v_name), 30);
    continue when v_name = '';
    v_base := left(regexp_replace(lower(split_part(v_name, ' ', 1)), '[^a-z]', '', 'g'), 8);
    if char_length(v_base) < 2 then v_base := 's'; end if;
    loop
      v_user := v_base || private.random_code(case when v_base = 's' then 5 else 3 end, '0123456789');
      exit when not exists (select 1 from public.students where username = v_user);
    end loop;
    loop
      v_parent := private.random_code(8, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
      exit when not exists (select 1 from public.students where parent_code = v_parent);
    end loop;
    v_pin := private.random_code(4, '0123456789');
    insert into public.students (username, pin_hash, display_name, class_code, parent_code)
    values (v_user, extensions.crypt(v_pin, extensions.gen_salt('bf', 8)), v_name, c.code, v_parent) returning id into v_id;
    out := out || jsonb_build_object('id', v_id, 'name', v_name, 'username', v_user, 'pin', v_pin, 'parent', v_parent);
  end loop;
  return out;
end $$;

create or replace function public.teacher_reset_pin(p_student uuid) returns text language plpgsql security definer set search_path = ''
as $$
declare v_code text; v_pin text := private.random_code(4, '0123456789');
begin
  select class_code into v_code from public.students where id = p_student;
  perform private.my_class(v_code);
  update public.students set pin_hash = extensions.crypt(v_pin, extensions.gen_salt('bf', 8)), failed_logins = 0, locked_until = null where id = p_student;
  return v_pin;
end $$;

create or replace function public.teacher_remove_student(p_student uuid) returns void language plpgsql security definer set search_path = ''
as $$
declare v_code text;
begin
  select class_code into v_code from public.students where id = p_student;
  perform private.my_class(v_code);
  update public.students set class_code = null where id = p_student;   -- the child keeps the account and its progress
end $$;

create or replace function public.teacher_class_data(p_code text) returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare c public.classrooms := private.my_class(p_code);
begin
  return jsonb_build_object(
    'class', jsonb_build_object('code', c.code, 'name', c.name, 'school', c.school, 'created_at', c.created_at),
    'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.display_name, 'username', s.username, 'parent', s.parent_code,
                  'points', private.student_points(s.data), 'locked', s.locked_until > now(),
                  'last', greatest(s.updated_at, (select max(r.created_at) from public.class_results r where r.student_id = s.id))) order by s.display_name)
                from public.students s where s.class_code = c.code), '[]'::jsonb),
    'results', coalesce((select jsonb_agg(jsonb_build_object('student_id', r.student_id, 'student', r.student, 'kind', r.kind, 'chapter', r.chapter_key,
                  'score', r.score, 'total', r.total, 'at', r.created_at) order by r.created_at desc)
                from (select * from public.class_results where code = c.code order by created_at desc limit 5000) r), '[]'::jsonb),
    'homework', coalesce((select jsonb_agg(jsonb_build_object('id', h.id, 'chapter', h.chapter_key, 'kind', h.kind, 'due', h.due, 'at', h.created_at,
                  'done', (select coalesce(jsonb_agg(distinct r.student_id), '[]'::jsonb) from public.class_results r
                           where r.code = c.code and r.student_id is not null and r.chapter_key = h.chapter_key and r.kind = h.kind and r.created_at >= h.created_at))
                  order by h.created_at desc) from public.homework h where h.code = c.code), '[]'::jsonb));
end $$;

create or replace function public.teacher_homework_add(p_code text, p_chapter text, p_kind text, p_due date) returns bigint language plpgsql security definer set search_path = ''
as $$
declare c public.classrooms := private.my_class(p_code); v_id bigint;
begin
  if p_kind not in ('quiz', 'worksheet', 'experiment') then raise exception 'bad_kind'; end if;
  if coalesce(p_chapter, '') !~ '^[0-9a-z/-]{3,80}$' then raise exception 'bad_chapter'; end if;
  insert into public.homework (code, chapter_key, kind, due) values (c.code, p_chapter, p_kind, p_due) returning id into v_id;
  return v_id;
end $$;

create or replace function public.teacher_homework_delete(p_id bigint) returns void language plpgsql security definer set search_path = ''
as $$
declare v_code text;
begin
  select code into v_code from public.homework where id = p_id;
  perform private.my_class(v_code);
  delete from public.homework where id = p_id;
end $$;

/* ---------- student and parents ---------- */

-- a finished quiz, worksheet, game or experiment goes to the student's class (if the teacher made the account)
create or replace function public.student_report(p_token text, p_kind text, p_chapter text, p_score integer, p_total integer) returns void
language plpgsql security definer set search_path = ''
as $$
declare s public.students;
begin
  select * into s from public.students where id = public._student_from_token(p_token);
  if s.id is null then raise exception 'signed_out' using errcode = '28000'; end if;
  if s.class_code is null then return; end if;
  if p_kind not in ('quiz', 'worksheet', 'experiment', 'game', 'competition') then raise exception 'bad_kind'; end if;
  if p_total is not null and p_score is not null and (p_score < 0 or p_score > p_total) then raise exception 'bad_score'; end if;
  if (select count(*) from public.class_results where student_id = s.id and created_at > now() - interval '1 hour') >= 60 then return; end if;
  insert into public.class_results (code, student, student_id, kind, chapter_key, score, total)
  values (s.class_code, s.display_name, s.id, p_kind, left(p_chapter, 80), p_score, p_total);
end $$;

create or replace function private.homework_for(p_student uuid, p_code text) returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', h.id, 'chapter', h.chapter_key, 'kind', h.kind, 'due', h.due,
           'done', exists (select 1 from public.class_results r where r.student_id = p_student and r.chapter_key = h.chapter_key
                           and r.kind = h.kind and r.created_at >= h.created_at)) order by h.due nulls last, h.id), '[]'::jsonb)
  from public.homework h where h.code = p_code and (h.due is null or h.due >= current_date - 7);
$$;

create or replace function public.student_home(p_token text) returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare s public.students; c public.classrooms;
begin
  select * into s from public.students where id = public._student_from_token(p_token);
  if s.id is null then raise exception 'signed_out' using errcode = '28000'; end if;
  select * into c from public.classrooms where code = s.class_code;
  return jsonb_build_object('class', case when c.code is null then null else jsonb_build_object('name', c.name, 'school', c.school) end,
    'parent', s.parent_code, 'homework', case when c.code is null then '[]'::jsonb else private.homework_for(s.id, c.code) end);
end $$;

-- read-only page for parents (/parent/?c=CODE)
create or replace function public.parent_view(p_code text) returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare s public.students; c public.classrooms;
begin
  select * into s from public.students where parent_code = upper(trim(p_code));
  if s.id is null then return null; end if;
  select * into c from public.classrooms where code = s.class_code;
  return jsonb_build_object('name', s.display_name, 'points', private.student_points(s.data), 'last', s.updated_at,
    'class', case when c.code is null then null else jsonb_build_object('name', c.name, 'school', c.school) end,
    'results', coalesce((select jsonb_agg(jsonb_build_object('kind', r.kind, 'chapter', r.chapter_key, 'score', r.score, 'total', r.total, 'at', r.created_at) order by r.created_at desc)
                 from (select * from public.class_results where student_id = s.id order by created_at desc limit 60) r), '[]'::jsonb),
    'homework', case when c.code is null then '[]'::jsonb else private.homework_for(s.id, c.code) end);
end $$;

-- who may call what
revoke all on function public.admin_create_teacher(text, text), public.admin_set_password(uuid, text), public.teacher_classes(),
  public.teacher_class_create(text, text), public.teacher_add_students(text, text[]), public.teacher_reset_pin(uuid),
  public.teacher_remove_student(uuid), public.teacher_class_data(text), public.teacher_homework_add(text, text, text, date),
  public.teacher_homework_delete(bigint), public.student_report(text, text, text, integer, integer), public.student_home(text),
  public.parent_view(text) from public, anon;
grant execute on function public.admin_create_teacher(text, text), public.admin_set_password(uuid, text), public.teacher_classes(),
  public.teacher_class_create(text, text), public.teacher_add_students(text, text[]), public.teacher_reset_pin(uuid),
  public.teacher_remove_student(uuid), public.teacher_class_data(text), public.teacher_homework_add(text, text, text, date),
  public.teacher_homework_delete(bigint) to authenticated;
grant execute on function public.student_report(text, text, text, integer, integer), public.student_home(text), public.parent_view(text) to anon, authenticated;
revoke all on function private.is_teacher(), private.my_class(text), private.student_points(jsonb), private.random_code(int, text),
  private.homework_for(uuid, text) from public, anon;
