-- District League (/league/), applied as Supabase migration "district_league".
-- Uses the competition scores already in public.leaderboard (no second contest).
-- Month = calendar month in Asia/Karachi. Rounds: days 1-7, 8-14, 15-21, 22-end.
-- A district's score for a period = average of its best 20 players' best results (percent), with at least 5 players.
-- Each round pairs every district with another (round-robin order drawn from the month, so no pair repeats in a month).
-- Win 3, draw 1 (scores within 0.5), loss 0. If only one side has 5 players it wins; if neither, no match.

create index if not exists leaderboard_league_idx on public.leaderboard (created_at) where not hidden and city is not null;

create or replace function private.league_scores(p_from timestamp, p_to timestamp)
returns table (city text, score numeric, players int)
language sql stable security definer set search_path to ''
as $$
  with res as (
    select l.city, lower(trim(l.nickname)) as nick, max(round(100.0 * l.score / l.total, 1)) as pct
    from public.leaderboard l
    where not l.hidden and l.total > 0 and l.score between 0 and l.total
      and l.city is not null and l.city <> 'Other'
      and l.created_at >= p_from at time zone 'Asia/Karachi'
      and l.created_at <  p_to   at time zone 'Asia/Karachi'
    group by l.city, lower(trim(l.nickname))
  ), ranked as (
    select r.*, row_number() over (partition by r.city order by r.pct desc) as rn,
           count(*) over (partition by r.city) as n
    from res r
  )
  select r.city, round(avg(r.pct), 1), max(r.n)::int
  from ranked r where r.rn <= 20
  group by r.city
$$;
revoke all on function private.league_scores(timestamp, timestamp) from public, anon, authenticated;

create or replace function public.league_month(p_month text default null)
returns json
language plpgsql stable security definer set search_path to ''
as $$
declare
  v_now   timestamp := now() at time zone 'Asia/Karachi';
  v_cur   date := date_trunc('month', v_now)::date;
  v_month date;
  v_end   date;
  v_teams text[] := array['Karachi','Hyderabad','Sukkur','Larkana','Mirpurkhas','Shaheed Benazirabad','Jacobabad','Shikarpur',
    'Khairpur','Dadu','Thatta','Badin','Sanghar','Umerkot','Tharparkar','Jamshoro','Ghotki','Kashmore','Matiari',
    'Naushahro Feroze','Kambar Shahdadkot','Tando Allahyar','Tando Muhammad Khan','Sujawal'];
  v_order text[];
  n int;
  v_round_now int;
  r int; i int; a int; b int;
  r_from date; r_to date;
  sa numeric; pa int; sb numeric; pb int;
  v_status text; v_winner text;
  v_matches jsonb := '[]'::jsonb;
  v_res jsonb := '[]'::jsonb;
  v_scores jsonb;
  v_table json; v_last json; v_prev date;
begin
  if p_month is null or p_month = '' then
    v_month := v_cur;
  elsif p_month ~ '^\d{4}-\d{2}$' then
    v_month := to_date(p_month || '-01', 'YYYY-MM-DD');
    if v_month > v_cur or v_month < date '2026-01-01' then v_month := v_cur; end if;
  else
    v_month := v_cur;
  end if;
  v_end := (v_month + interval '1 month')::date;
  v_round_now := case when v_month < v_cur then 5 else least(4, (extract(day from v_now)::int - 1) / 7 + 1) end;

  -- the draw: districts in an order fixed by the month, then the round-robin "circle" for rounds 1-4
  select array_agg(t order by md5('ssp-league:' || to_char(v_month, 'YYYY-MM') || ':' || t)) into v_order from unnest(v_teams) t;
  n := array_length(v_order, 1);

  for r in 1..4 loop
    r_from := v_month + (r - 1) * 7;
    r_to := case when r = 4 then v_end else v_month + r * 7 end;
    v_scores := '{}'::jsonb;
    if r <= v_round_now then
      select coalesce(jsonb_object_agg(s.city, jsonb_build_object('s', s.score, 'p', s.players)), '{}'::jsonb) into v_scores
      from private.league_scores(r_from, r_to) s;
    end if;
    for i in 0..(n / 2 - 1) loop
      if i = 0 then a := n - 1; b := (r - 1) % (n - 1);
      else a := (r - 1 + i) % (n - 1); b := ((r - 1) - i + (n - 1)) % (n - 1); end if;
      sa := (v_scores -> v_order[a + 1] ->> 's')::numeric; pa := coalesce((v_scores -> v_order[a + 1] ->> 'p')::int, 0);
      sb := (v_scores -> v_order[b + 1] ->> 's')::numeric; pb := coalesce((v_scores -> v_order[b + 1] ->> 'p')::int, 0);
      v_winner := null;
      if pa >= 5 and pb >= 5 then
        if abs(sa - sb) <= 0.5 then v_winner := 'draw'; elsif sa > sb then v_winner := v_order[a + 1]; else v_winner := v_order[b + 1]; end if;
      elsif pa >= 5 then v_winner := v_order[a + 1];
      elsif pb >= 5 then v_winner := v_order[b + 1];
      end if;
      v_status := case when r > v_round_now then 'soon' when r = v_round_now then 'live' else 'done' end;
      if v_status = 'done' and v_winner is not null then
        v_res := v_res || jsonb_build_array(
          jsonb_build_object('team', v_order[a + 1], 'pts', case when v_winner = 'draw' then 1 when v_winner = v_order[a + 1] then 3 else 0 end),
          jsonb_build_object('team', v_order[b + 1], 'pts', case when v_winner = 'draw' then 1 when v_winner = v_order[b + 1] then 3 else 0 end));
      end if;
      v_matches := v_matches || jsonb_build_object('round', r, 'status', v_status,
        'a', v_order[a + 1], 'a_score', sa, 'a_players', pa,
        'b', v_order[b + 1], 'b_score', sb, 'b_players', pb,
        'winner', case when v_status = 'soon' then null else v_winner end);
    end loop;
  end loop;

  select coalesce(json_agg(row_to_json(x) order by x.points desc, x.score desc nulls last, x.players desc, x.city), '[]'::json) into v_table
  from (
    select t.city, coalesce(m.score, null) as score, coalesce(m.players, 0) as players,
           coalesce(g.played, 0) as played, coalesce(g.won, 0) as won, coalesce(g.drawn, 0) as drawn, coalesce(g.lost, 0) as lost,
           coalesce(g.points, 0) as points
    from unnest(v_teams) t(city)
    left join private.league_scores(v_month, v_end) m on m.city = t.city
    left join (
      select team, count(*)::int as played, count(*) filter (where pts = 3)::int as won,
             count(*) filter (where pts = 1)::int as drawn, count(*) filter (where pts = 0)::int as lost, sum(pts)::int as points
      from jsonb_to_recordset(v_res) as q(team text, pts int) group by team
    ) g on g.team = t.city
    where coalesce(m.players, 0) > 0 or coalesce(g.played, 0) > 0
  ) x;

  -- last month's winner (the Sindh Science Ajrak Trophy): first in last month's final table
  v_prev := (v_month - interval '1 month')::date;
  v_last := null;
  if v_prev >= date '2026-01-01' and v_month = v_cur then
    select (public.league_month(to_char(v_prev, 'YYYY-MM')) -> 'table' -> 0) into v_last;
    if v_last is not null and coalesce((v_last ->> 'points')::int, 0) = 0 then v_last := null; end if;
  end if;

  return json_build_object(
    'month', to_char(v_month, 'YYYY-MM'),
    'round', case when v_round_now > 4 then null else v_round_now end,
    'rounds', json_build_array(
      json_build_object('round', 1, 'from', v_month, 'to', v_month + 6),
      json_build_object('round', 2, 'from', v_month + 7, 'to', v_month + 13),
      json_build_object('round', 3, 'from', v_month + 14, 'to', v_month + 20),
      json_build_object('round', 4, 'from', v_month + 21, 'to', v_end - 1)),
    'rules', json_build_object('top', 20, 'min_players', 5, 'win', 3, 'draw', 1),
    'table', v_table,
    'matches', v_matches,
    'last_month', to_char(v_prev, 'YYYY-MM'),
    'last_winner', v_last
  );
end;
$$;
revoke all on function public.league_month(text) from public;
grant execute on function public.league_month(text) to anon, authenticated;
