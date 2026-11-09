create table public.kpi_categories (id text primary key, name text not null, scope kpi_scope not null, description text);
create table public.kpi_indicators (
  id text primary key, code text unique not null, name text not null, category_id text not null references kpi_categories(id),
  unit text not null, measure text not null check (measure in ('sum','count')), direction text not null default 'benefit' check (direction in ('benefit','cost')),
  definition text, is_active boolean not null default true
);
create table public.kpi_targets (
  id text primary key, indicator_id text not null references kpi_indicators(id), period_id text not null references assessment_periods(id),
  scope kpi_scope not null, division_id text references divisions(id), employee_id text references employees(id), value numeric not null check (value >= 0),
  -- cakupan harus tegas: company tanpa subjek, division hanya division_id, individual hanya employee_id
  check ((scope='company' and division_id is null and employee_id is null)
      or (scope='division' and division_id is not null and employee_id is null)
      or (scope='individual' and employee_id is not null and division_id is null))
);
create unique index kpi_targets_unique on public.kpi_targets (indicator_id, period_id, scope, coalesce(division_id,''), coalesce(employee_id,''));
create table public.kpi_activity_mappings (
  id text primary key, activity_type activity_type not null, outcome text check (outcome in ('deal','no')),
  indicator_id text not null references kpi_indicators(id), field text not null check (field in ('count','qty','value')), note text
);
