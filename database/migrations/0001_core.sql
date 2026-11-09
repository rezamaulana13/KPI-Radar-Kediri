-- Radar Kediri: skema inti (alur vertikal aktivitas -> verifikasi -> KPI). Jalankan di Supabase SQL Editor.
create type app_role as enum ('admin','hrd','supervisor','employee');
create type activity_type as enum ('oplah','profiling','program','penawaran','progress','hasil');
create type verify_status as enum ('pending','approved','rejected','revision');

create table divisions (id uuid primary key default gen_random_uuid(), name text not null unique);
create table employees (
  id uuid primary key default gen_random_uuid(), full_name text not null,
  division_id uuid references divisions, position text, supervisor_id uuid references employees);
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role app_role not null default 'employee', employee_id uuid unique references employees);
create table assessment_periods (
  id uuid primary key default gen_random_uuid(), name text not null,
  start_date date not null, end_date date not null,
  status text not null default 'open' check (status in ('open','closed')), check (end_date >= start_date));

create table marketing_activities (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references assessment_periods,
  owner_id uuid not null references employees, created_by uuid not null references employees,
  activity_type activity_type not null, activity_date date not null,
  description text not null check (char_length(description) >= 10),
  quantity numeric(14,2), detail jsonb not null default '{}',
  status verify_status not null default 'pending',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (activity_type <> 'hasil' or detail->>'result' is not null),
  check (coalesce(detail->>'result','') <> 'no' or coalesce(btrim(detail->>'no_reason'),'') <> ''));
create index on marketing_activities (owner_id, status, activity_date);

create table activity_verifications (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references marketing_activities, verifier_id uuid not null references employees,
  status verify_status not null, note text, created_at timestamptz not null default now());

create table kpi_indicators (
  id uuid primary key default gen_random_uuid(), name text not null,
  scope text not null check (scope in ('company','division','individual')), unit text not null,
  measure text not null check (measure in ('sum_quantity','count')),
  direction text not null default 'benefit' check (direction in ('benefit','cost')), is_active boolean not null default true);
create table kpi_activity_mappings (
  id uuid primary key default gen_random_uuid(), indicator_id uuid not null references kpi_indicators,
  activity_type activity_type not null, detail_filter jsonb not null default '{}', unique (indicator_id, activity_type));
create table kpi_targets (
  id uuid primary key default gen_random_uuid(), indicator_id uuid not null references kpi_indicators,
  period_id uuid not null references assessment_periods,
  employee_id uuid references employees, division_id uuid references divisions,
  target_value numeric not null check (target_value > 0),
  check (employee_id is null or division_id is null));
create unique index kpi_targets_scope_uq on kpi_targets
  (indicator_id, period_id, coalesce(employee_id,'00000000-0000-0000-0000-000000000000'), coalesce(division_id,'00000000-0000-0000-0000-000000000000'));

-- Realisasi dihitung on-demand dari aktivitas APPROVED yang punya mapping (mudah diaudit).
create view kpi_achievements_v with (security_invoker = true) as
select a.period_id, a.owner_id as employee_id, m.indicator_id,
  case i.measure when 'sum_quantity' then coalesce(sum(a.quantity),0) else count(*) end as realization
from marketing_activities a
join kpi_activity_mappings m on m.activity_type = a.activity_type and a.detail @> m.detail_filter
join kpi_indicators i on i.id = m.indicator_id and i.is_active
where a.status = 'approved'
group by a.period_id, a.owner_id, m.indicator_id, i.measure;

-- Helper otorisasi (sumber role = tabel profiles)
create function app_role() returns app_role language sql stable security definer set search_path = public
  as $$ select role from profiles where id = auth.uid() $$;
create function app_employee() returns uuid language sql stable security definer set search_path = public
  as $$ select employee_id from profiles where id = auth.uid() $$;
create function is_supervisor_of(e uuid) returns boolean language sql stable security definer set search_path = public
  as $$ select exists (select 1 from employees where id = e and supervisor_id = app_employee()) $$;

-- Verifikasi atomik; aturan inti ditegakkan di database
create function verify_activity(p_activity uuid, p_status verify_status, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare a marketing_activities; me uuid := app_employee();
begin
  if app_role() <> 'supervisor' then raise exception 'forbidden'; end if;
  if p_status = 'pending' then raise exception 'invalid status'; end if;
  select * into a from marketing_activities where id = p_activity for update;
  if not found or a.status <> 'pending' then raise exception 'not pending'; end if;
  if not is_supervisor_of(a.owner_id) then raise exception 'outside scope'; end if;
  if a.owner_id = me or a.created_by = me then raise exception 'self verification'; end if;
  if p_status <> 'approved' and coalesce(btrim(p_note),'') = '' then raise exception 'note required'; end if;
  update marketing_activities set status = p_status, updated_at = now() where id = p_activity;
  insert into activity_verifications (activity_id, verifier_id, status, note) values (p_activity, me, p_status, p_note);
end $$;

-- RLS: default deny
alter table divisions enable row level security;  alter table employees enable row level security;
alter table profiles enable row level security;   alter table assessment_periods enable row level security;
alter table marketing_activities enable row level security; alter table activity_verifications enable row level security;
alter table kpi_indicators enable row level security; alter table kpi_activity_mappings enable row level security;
alter table kpi_targets enable row level security;

create policy profiles_read on profiles for select using (id = auth.uid() or app_role() = 'admin');
create policy divisions_read on divisions for select to authenticated using (true);
create policy divisions_admin on divisions for all using (app_role() = 'admin') with check (app_role() = 'admin');
create policy employees_read on employees for select to authenticated using (true);
create policy employees_admin on employees for all using (app_role() in ('admin','hrd')) with check (app_role() in ('admin','hrd'));
create policy periods_read on assessment_periods for select to authenticated using (true);
create policy periods_hrd on assessment_periods for all using (app_role() = 'hrd') with check (app_role() = 'hrd');
create policy ind_read on kpi_indicators for select to authenticated using (true);
create policy ind_hrd on kpi_indicators for all using (app_role() = 'hrd') with check (app_role() = 'hrd');
create policy map_read on kpi_activity_mappings for select to authenticated using (true);
create policy map_hrd on kpi_activity_mappings for all using (app_role() = 'hrd') with check (app_role() = 'hrd');
create policy tgt_read on kpi_targets for select to authenticated using (app_role() in ('hrd','admin') or employee_id = app_employee() or employee_id is null);
create policy tgt_hrd on kpi_targets for all using (app_role() = 'hrd') with check (app_role() = 'hrd');

create policy act_read on marketing_activities for select using (
  app_role() in ('hrd','admin') or owner_id = app_employee() or created_by = app_employee() or is_supervisor_of(owner_id));
create policy act_insert on marketing_activities for insert with check (
  status = 'pending' and created_by = app_employee() and app_role() in ('employee','supervisor')
  and (owner_id = app_employee() or is_supervisor_of(owner_id))
  and exists (select 1 from assessment_periods p where p.id = period_id and p.status = 'open'
              and activity_date between p.start_date and p.end_date));
create policy act_resubmit on marketing_activities for update
  using (created_by = app_employee() and status = 'revision') with check (status = 'pending');
create policy ver_read on activity_verifications for select using (
  exists (select 1 from marketing_activities a where a.id = activity_id));
