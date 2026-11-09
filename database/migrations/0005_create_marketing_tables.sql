create table public.clients (id text primary key, name text not null, sector text, contact text, phone text, city text, owner_id text not null references employees(id), created_at date not null default current_date);
create table public.programs (id text primary key, name text not null, kind text not null check (kind in ('program','barter')), start_date date, end_date date, owner_id text not null references employees(id), value numeric not null default 0, status text not null default 'rencana');
create table public.program_participants (program_id text references programs(id) on delete cascade, client_id text references clients(id), primary key (program_id, client_id));
create table public.offers (id text primary key, client_id text not null references clients(id), program_name text not null, owner_id text not null references employees(id), offer_date date not null, value numeric not null check (value > 0), period_id text references assessment_periods(id), note text);
create table public.marketing_activities (
  id text primary key, type activity_type not null, owner_id text not null references employees(id), created_by text not null references employees(id),
  activity_date date not null, period_id text not null references assessment_periods(id), description text not null check (char_length(description) >= 10),
  status activity_status not null default 'pending',
  client_id text references clients(id), offer_id text references offers(id), program_id text references programs(id),
  qty integer check (qty > 0), value numeric check (value >= 0), source text, source_name text, progress_type text, potential text,
  outcome text check (outcome in ('deal','no')), reason_category text, reason text,
  deleted_at timestamptz,
  -- FR-011: hasil NO wajib beralasan
  constraint no_requires_reason check (outcome is distinct from 'no' or (reason_category is not null and char_length(coalesce(reason,'')) >= 10))
);
-- satu hasil akhir aktif per penawaran
create unique index one_active_outcome on public.marketing_activities (offer_id) where type='outcome' and status in ('pending','approved') and deleted_at is null;
create index on public.marketing_activities (owner_id, period_id, status); create index on public.marketing_activities (offer_id);
