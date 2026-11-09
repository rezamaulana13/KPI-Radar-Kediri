-- Strategi awal: agregasi on-demand (paling mudah diaudit). View ini menjumlahkan HANYA aktivitas approved dengan mapping valid.
create or replace view public.v_kpi_achievements as
select t.id as target_id, t.indicator_id, t.period_id, t.scope, t.division_id, t.employee_id, t.value as target_value,
  coalesce(sum(case m.field when 'count' then 1 when 'qty' then a.qty else a.value end),0) as actual
from kpi_targets t
join kpi_activity_mappings m on m.indicator_id = t.indicator_id
left join marketing_activities a on a.status='approved' and a.deleted_at is null and a.period_id = t.period_id
  and a.type = m.activity_type and (m.outcome is null or m.outcome = a.outcome)
  and (t.scope='company'
    or (t.scope='individual' and a.owner_id = t.employee_id)
    or (t.scope='division' and a.owner_id in (select id from employees where division_id = t.division_id)))
group by t.id;
create table public.assessment_results (id text primary key, period_id text references assessment_periods(id), version int not null, created_by text references employees(id), created_at timestamptz not null default now(), snapshot jsonb not null);
