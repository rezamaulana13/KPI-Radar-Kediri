-- Enum dan profil akun. Peran dibaca dari tabel ini, bukan dari metadata browser.
create type app_role as enum ('admin','hrd','supervisor','employee');
create type activity_status as enum ('pending','approved','rejected','revision');
create type activity_type as enum ('oplah','client','program','profiling','offer','progress','outcome');
create type kpi_scope as enum ('company','division','individual');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id text unique not null,
  role app_role not null default 'employee',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
