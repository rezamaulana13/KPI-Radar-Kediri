-- ==============================================================================
-- SKRIP SETUP LENGKAP SUPABASE: SISTEM KINERJA & AKTIVITAS RADAR KEDIRI
-- ==============================================================================
-- Konfigurasi: 1 TABEL TUNGGAL PENGGUNA ('users') UNTUK DAFTAR, LOGIN & BIODATA
-- 3 Peran Resmi: 'admin' (Super Admin), 'hrd' (Admin HRD), 'employee' (Pengguna Karyawan)
-- Mendukung: Registrasi Email/Password & Google OAuth, Verifikasi HRD, dan SPK SAW
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. BERSIHKAN STRUKTUR LAMA SECARA AMAN (Mendukung Tabel maupun View)
-- ------------------------------------------------------------------------------
do $$
declare
  obj record;
begin
  for obj in (
    select relname, relkind
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in (
      'v_kpi_achievements', 'profiles', 'employees', 'users',
      'activity_verifications', 'marketing_activities', 'program_participants',
      'programs', 'offers', 'clients', 'kpi_activity_mappings', 'kpi_targets',
      'kpi_indicators', 'kpi_categories', 'assessment_results', 'assessment_periods',
      'positions', 'divisions', 'audit_logs'
    )
  ) loop
    if obj.relkind = 'v' then
      execute format('drop view if exists public.%I cascade', obj.relname);
    elsif obj.relkind = 'r' then
      execute format('drop table if exists public.%I cascade', obj.relname);
    end if;
  end loop;
end $$;

-- Hapus trigger auth lama yang bermasalah jika masih terpasang
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;

drop type if exists public.app_role cascade;
drop type if exists public.activity_status cascade;
drop type if exists public.activity_type cascade;
drop type if exists public.kpi_scope cascade;

-- ------------------------------------------------------------------------------
-- 1. ENUM & TIPE DATA RESMI (3 Role)
-- ------------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'hrd', 'employee');
create type public.activity_status as enum ('pending', 'approved', 'rejected', 'revision');
create type public.activity_type as enum ('oplah', 'client', 'program', 'profiling', 'offer', 'progress', 'outcome');
create type public.kpi_scope as enum ('company', 'division', 'individual');

-- ------------------------------------------------------------------------------
-- 2. TABEL ORGANISASI MASTER (Divisi & Jabatan)
-- ------------------------------------------------------------------------------
create table public.divisions (
  id text primary key,
  code text unique not null,
  name text not null,
  is_active boolean not null default true
);

create table public.positions (
  id text primary key,
  name text not null,
  level text not null
);

-- Seed Data Awal Divisi & Jabatan Khusus Divisi Pemasaran (Fokus Tunggal Sistem)
insert into public.divisions (id, code, name) values
  ('DIV-MKT', 'MKT', 'Divisi Pemasaran & Sirkulasi')
on conflict (id) do update set name = excluded.name;

insert into public.positions (id, name, level) values
  ('POS-MGR', 'Manajer Pemasaran', 'Manajerial'),
  ('POS-SPV', 'Supervisor Marketing', 'Supervisor'),
  ('POS-EXM', 'Account Executive / Eksekutif Iklan', 'Staf'),
  ('POS-OPL', 'Staf Sirkulasi & Oplah', 'Staf'),
  ('POS-ADM', 'Admin Operasional Marketing', 'Staf')
on conflict (id) do update set name = excluded.name, level = excluded.level;

-- ------------------------------------------------------------------------------
-- 3. SATU TABEL TUNGGAL PENGGUNA ('users'): PENDAFTARAN, LOGIN, ROLE & BIODATA
-- ------------------------------------------------------------------------------
-- Terhubung langsung 1:1 dengan auth.users Supabase (via id uuid)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nip text,
  name text not null default 'Karyawan',
  email text not null,
  role public.app_role not null default 'employee',
  division_id text references public.divisions(id),
  position_id text references public.positions(id),
  supervisor_id uuid references public.users(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Izin akses tabel users untuk autentikasi Supabase
grant all on table public.users to postgres, service_role, authenticated, anon;

-- Index pencarian cepat
create index idx_users_email on public.users (email);
create index idx_users_role on public.users (role);
create index idx_users_division on public.users (division_id);

-- Periode Penilaian
create table public.assessment_periods (
  id text primary key,
  name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  check (end_date >= start_date)
);

-- ------------------------------------------------------------------------------
-- 4. TABEL KPI MASTER & MAPPING AKTIVITAS
-- ------------------------------------------------------------------------------
create table public.kpi_categories (
  id text primary key,
  name text not null,
  scope public.kpi_scope not null,
  description text
);

create table public.kpi_indicators (
  id text primary key,
  code text unique not null,
  name text not null,
  category_id text not null references public.kpi_categories(id),
  unit text not null,
  measure text not null default 'count' check (measure in ('sum', 'count')),
  direction text not null default 'benefit' check (direction in ('benefit', 'cost')),
  definition text,
  is_active boolean not null default true
);

create table public.kpi_targets (
  id text primary key,
  indicator_id text not null references public.kpi_indicators(id),
  period_id text not null references public.assessment_periods(id),
  scope public.kpi_scope not null,
  division_id text references public.divisions(id),
  employee_id uuid references public.users(id),
  value numeric not null check (value >= 0)
);

create table public.kpi_activity_mappings (
  id text primary key,
  activity_type public.activity_type not null,
  outcome text check (outcome in ('deal', 'no')),
  indicator_id text not null references public.kpi_indicators(id),
  field text not null check (field in ('count', 'qty', 'value')),
  note text
);

-- ------------------------------------------------------------------------------
-- 5. TABEL OPERASIONAL PEMASARAN & TRANSAKSI
-- ------------------------------------------------------------------------------
create table public.clients (
  id text primary key,
  name text not null,
  sector text,
  contact text,
  phone text,
  city text,
  owner_id uuid not null references public.users(id),
  created_at date not null default current_date
);

create table public.programs (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('program', 'barter')),
  start_date date,
  end_date date,
  owner_id uuid not null references public.users(id),
  value numeric not null default 0,
  status text not null default 'rencana' check (status in ('rencana', 'berjalan', 'selesai'))
);

create table public.program_participants (
  program_id text references public.programs(id) on delete cascade,
  client_id text references public.clients(id) on delete cascade,
  primary key (program_id, client_id)
);

create table public.offers (
  id text primary key,
  client_id text not null references public.clients(id),
  program_name text not null,
  owner_id uuid not null references public.users(id),
  offer_date date not null,
  value numeric not null check (value > 0),
  period_id text references public.assessment_periods(id),
  note text
);

create table public.marketing_activities (
  id text primary key,
  type public.activity_type not null,
  owner_id uuid not null references public.users(id),
  created_by uuid not null references public.users(id),
  activity_date date not null,
  period_id text not null references public.assessment_periods(id),
  description text not null check (char_length(description) >= 10),
  status public.activity_status not null default 'pending',
  client_id text references public.clients(id),
  offer_id text references public.offers(id),
  program_id text references public.programs(id),
  qty integer check (qty > 0),
  value numeric check (value >= 0),
  source text,
  source_name text,
  progress_type text,
  potential text,
  outcome text check (outcome in ('deal', 'no')),
  reason_category text,
  reason text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint no_requires_reason check (
    outcome is distinct from 'no' or (reason_category is not null and char_length(coalesce(reason, '')) >= 10)
  )
);
create index idx_marketing_activities_owner_period_status on public.marketing_activities (owner_id, period_id, status);
create index idx_marketing_activities_offer on public.marketing_activities (offer_id);

-- ------------------------------------------------------------------------------
-- 6. TABEL VERIFIKASI, AUDIT, & HASIL SPK (SAW)
-- ------------------------------------------------------------------------------
create table public.activity_verifications (
  id bigserial primary key,
  activity_id text not null references public.marketing_activities(id),
  status public.activity_status not null,
  verified_by uuid not null references public.users(id),
  note text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigserial primary key,
  at timestamptz not null default now(),
  actor_id uuid references public.users(id),
  action text not null,
  entity text not null,
  entity_id text,
  detail text
);

create table public.assessment_results (
  id text primary key,
  period_id text references public.assessment_periods(id),
  version int not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  snapshot jsonb not null
);

-- View Realisasi KPI Otomatis (Hanya aktivitas yang approved)
create or replace view public.v_kpi_achievements as
select
  t.id as target_id,
  t.indicator_id,
  t.period_id,
  t.scope,
  t.division_id,
  t.employee_id,
  t.value as target_value,
  coalesce(
    case
      when m.field = 'count' then count(a.id)
      when m.field = 'qty' then sum(a.qty)
      when m.field = 'value' then sum(a.value)
      else 0
    end,
    0
  ) as actual_value,
  case
    when t.value > 0 then
      round(
        coalesce(
          case
            when m.field = 'count' then count(a.id)::numeric
            when m.field = 'qty' then sum(a.qty)
            when m.field = 'value' then sum(a.value)
            else 0
          end,
          0
        ) / t.value * 100,
        2
      )
    else 0
  end as percentage
from public.kpi_targets t
join public.kpi_activity_mappings m on m.indicator_id = t.indicator_id
left join public.marketing_activities a on
  a.period_id = t.period_id
  and a.type = m.activity_type
  and (m.outcome is null or a.outcome = m.outcome)
  and a.status = 'approved'
  and a.deleted_at is null
  and (
    (t.scope = 'company') or
    (t.scope = 'division' and a.owner_id in (select id from public.users where division_id = t.division_id)) or
    (t.scope = 'individual' and a.owner_id = t.employee_id)
  )
group by t.id, t.indicator_id, t.period_id, t.scope, t.division_id, t.employee_id, t.value, m.field;

-- ------------------------------------------------------------------------------
-- 7. TRIGGER INTEGRITAS & REGISTRASI OTOMATIS
-- ------------------------------------------------------------------------------
-- Aturan Integritas: Verifikator dilarang menyetujui aktivitasnya sendiri
create or replace function public.guard_self_verification()
returns trigger language plpgsql as $$
declare
  act_owner uuid;
begin
  select owner_id into act_owner from public.marketing_activities where id = new.activity_id;
  if act_owner is not null and act_owner = new.verified_by then
    raise exception 'Integritas dilanggar: Verifikator tidak boleh memverifikasi aktivitasnya sendiri.';
  end if;
  return new;
end;
$$;

drop trigger if exists tr_guard_self_verification on public.activity_verifications;
create trigger tr_guard_self_verification
  before insert or update on public.activity_verifications
  for each row execute function public.guard_self_verification();

-- Bersihkan trigger custom lama pada auth.users agar pendaftaran akun tidak terhalang
do $$
declare
  t text;
begin
  for t in (
    select tgname
    from pg_trigger
    join pg_class on pg_trigger.tgrelid = pg_class.oid
    join pg_namespace on pg_class.relnamespace = pg_namespace.oid
    where pg_namespace.nspname = 'auth'
      and pg_class.relname = 'users'
      and not tgisinternal
  ) loop
    execute format('drop trigger if exists %I on auth.users cascade', t);
  end loop;
end $$;

drop function if exists public.handle_new_user() cascade;

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid() and is_active;
$$;

create or replace function public.current_user_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.users where id = auth.uid() and is_active;
$$;

create or replace function public.in_my_scope(owner uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select owner = auth.uid() or (public.current_role() in ('admin', 'hrd'));
$$;

alter table public.users enable row level security;
alter table public.marketing_activities enable row level security;
alter table public.activity_verifications enable row level security;
alter table public.clients enable row level security;
alter table public.offers enable row level security;
alter table public.programs enable row level security;
alter table public.program_participants enable row level security;
alter table public.audit_logs enable row level security;
alter table public.assessment_results enable row level security;
alter table public.divisions enable row level security;
alter table public.positions enable row level security;
alter table public.assessment_periods enable row level security;
alter table public.kpi_categories enable row level security;
alter table public.kpi_indicators enable row level security;
alter table public.kpi_activity_mappings enable row level security;
alter table public.kpi_targets enable row level security;

-- Users / Akun: Terbaca untuk data profil, Update role hanya oleh Super Admin
create policy users_select on public.users for select using (true);
create policy users_insert on public.users for insert with check (true);
create policy users_update on public.users for update using (public.current_role() = 'admin' or id = auth.uid());
create policy users_admin on public.users for all using (public.current_role() = 'admin');

-- Activities: Karyawan melihat & kelola milik sendiri, HRD/Admin melihat semua
create policy activities_select on public.marketing_activities for select using (public.in_my_scope(owner_id) or created_by = auth.uid());
create policy activities_insert on public.marketing_activities for insert with check (created_by = auth.uid() and status = 'pending');
create policy activities_update on public.marketing_activities for update using (
  (status = 'revision' and (owner_id = auth.uid() or created_by = auth.uid()))
  or public.current_role() in ('admin', 'hrd')
);

-- Verifications: HRD & Admin berwenang memverifikasi
create policy verif_select on public.activity_verifications for select using (true);
create policy verif_insert on public.activity_verifications for insert with check (
  public.current_role() in ('admin', 'hrd') and verified_by = auth.uid()
);

-- Clients, Offers, Programs: Terbuka untuk tim terkait & HRD/Admin
create policy clients_all on public.clients for all using (public.in_my_scope(owner_id));
create policy offers_all on public.offers for all using (public.in_my_scope(owner_id));
create policy programs_all on public.programs for all using (public.in_my_scope(owner_id));
create policy participants_all on public.program_participants for all using (true);

-- Master Data / Referensi: Dapat dibaca oleh semua
create policy divisions_select on public.divisions for select using (true);
create policy positions_select on public.positions for select using (true);
create policy periods_select on public.assessment_periods for select using (true);
create policy kpi_categories_select on public.kpi_categories for select using (true);
create policy kpi_indicators_select on public.kpi_indicators for select using (true);
create policy kpi_mappings_select on public.kpi_activity_mappings for select using (true);
create policy kpi_targets_select on public.kpi_targets for select using (true);

-- Audit Log & SPK Results
create policy audit_select on public.audit_logs for select using (public.current_role() in ('admin', 'hrd'));
create policy results_hrd on public.assessment_results for all using (public.current_role() in ('admin', 'hrd'));

-- ------------------------------------------------------------------------------
-- 9. DATA AWAL (MASTER SEED DATA)
-- ------------------------------------------------------------------------------
-- Master Divisi
insert into public.divisions (id, code, name) values
  ('DIV-MKT', 'MKT', 'Marketing'),
  ('DIV-RED', 'RED', 'Redaksi'),
  ('DIV-SIR', 'SIR', 'Sirkulasi'),
  ('DIV-PRD', 'PRD', 'Percetakan'),
  ('DIV-KEU', 'KEU', 'Keuangan'),
  ('DIV-HRD', 'HRD', 'HRD & Umum'),
  ('DIV-IT',  'IT',  'Teknologi Informasi')
on conflict (id) do nothing;

-- Master Jabatan
insert into public.positions (id, name, level) values
  ('POS-MGR', 'Manajer', 'Manajerial'),
  ('POS-EXM', 'Eksekutif Marketing', 'Staf'),
  ('POS-OPL', 'Staf Oplah', 'Staf'),
  ('POS-RED', 'Redaktur', 'Staf'),
  ('POS-STF', 'Staf Umum', 'Staf'),
  ('POS-ADM', 'Administrator Sistem', 'Staf')
on conflict (id) do nothing;

-- Periode Awal
insert into public.assessment_periods (id, name, start_date, end_date, status) values
  ('PRD-2026-Q4', 'Triwulan IV 2026', '2026-10-01', '2026-12-31', 'active')
on conflict (id) do nothing;

-- Kategori KPI
insert into public.kpi_categories (id, name, scope, description) values
  ('CAT-COM', 'KPI Perusahaan', 'company', 'Sasaran bersama seluruh divisi.'),
  ('CAT-DIV', 'KPI Divisi', 'division', 'Sasaran yang dipertanggungjawabkan satu divisi.'),
  ('CAT-IND', 'KPI Individu', 'individual', 'Sasaran perorangan yang dinilai pada periode berjalan.')
on conflict (id) do nothing;

-- Indikator KPI Resmi Radar Kediri
insert into public.kpi_indicators (id, code, name, category_id, unit, measure, direction, definition) values
  ('IND-01', 'OPL', 'Perolehan Oplah', 'CAT-DIV', 'eksemplar', 'sum', 'benefit', 'Total eksemplar dari aktivitas oplah yang disetujui.'),
  ('IND-02', 'CLN', 'Client Baru Terdaftar', 'CAT-IND', 'client', 'count', 'benefit', 'Jumlah client baru pada List Client yang disetujui.'),
  ('IND-03', 'PNW', 'Penawaran Dikirim', 'CAT-IND', 'penawaran', 'count', 'benefit', 'Jumlah penawaran/proposal yang disetujui.'),
  ('IND-04', 'DEA', 'Deal Tercapai', 'CAT-IND', 'deal', 'count', 'benefit', 'Jumlah penawaran berhasil ditutup Deal dan disetujui.'),
  ('IND-05', 'NDL', 'Nilai Deal', 'CAT-DIV', 'Rp', 'sum', 'benefit', 'Total nilai penawaran yang berhasil Deal dan disetujui.'),
  ('IND-06', 'PRF', 'Riset Profiling Selesai', 'CAT-IND', 'riset', 'count', 'benefit', 'Jumlah riset profiling client yang disetujui.'),
  ('IND-07', 'PRG', 'Program/Barter Terlaksana', 'CAT-DIV', 'program', 'count', 'benefit', 'Jumlah program atau barter yang disetujui.'),
  ('IND-08', 'KNJ', 'Progress & Kunjungan', 'CAT-IND', 'kunjungan', 'count', 'benefit', 'Jumlah pencatatan progress pendekatan/kunjungan yang disetujui.'),
  ('IND-09', 'PIK', 'Pendapatan Iklan Perusahaan', 'CAT-COM', 'Rp', 'sum', 'benefit', 'Pendapatan iklan seluruh perusahaan.')
on conflict (id) do nothing;

-- Mapping Aktivitas ke Indikator KPI
insert into public.kpi_activity_mappings (id, activity_type, outcome, indicator_id, field, note) values
  ('MAP-01', 'oplah', null, 'IND-01', 'qty', 'Jumlah eksemplar dijumlahkan.'),
  ('MAP-02', 'client', null, 'IND-02', 'count', 'Satu client baru dihitung satu.'),
  ('MAP-03', 'offer', null, 'IND-03', 'count', 'Satu penawaran dihitung satu.'),
  ('MAP-04', 'outcome', 'deal', 'IND-04', 'count', 'Hanya hasil Deal.'),
  ('MAP-05', 'outcome', 'deal', 'IND-05', 'value', 'Nilai penawaran yang Deal dijumlahkan.'),
  ('MAP-06', 'profiling', null, 'IND-06', 'count', 'Satu riset dihitung satu.'),
  ('MAP-07', 'program', null, 'IND-07', 'count', 'Satu program/barter dihitung satu.'),
  ('MAP-08', 'progress', null, 'IND-08', 'count', 'Satu pencatatan progress dihitung satu.')
on conflict (id) do nothing;

-- Target KPI Contoh Triwulan
insert into public.kpi_targets (id, indicator_id, period_id, scope, division_id, employee_id, value) values
  ('TG-01', 'IND-09', 'PRD-2026-Q4', 'company', null, null, 4500000000),
  ('TG-02', 'IND-01', 'PRD-2026-Q4', 'division', 'DIV-MKT', null, 1500),
  ('TG-03', 'IND-05', 'PRD-2026-Q4', 'division', 'DIV-MKT', null, 100000000),
  ('TG-04', 'IND-07', 'PRD-2026-Q4', 'division', 'DIV-MKT', null, 2)
on conflict (id) do nothing;

-- ==============================================================================
-- SETUP SELESAI
-- ==============================================================================
