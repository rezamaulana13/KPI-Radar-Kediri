create table public.assessment_periods (
  id text primary key, name text not null, start_date date not null, end_date date not null,
  status text not null default 'draft' check (status in ('draft','active','closed')),
  check (end_date >= start_date)
);
