create table public.divisions (id text primary key, code text unique not null, name text not null, is_active boolean not null default true);
create table public.positions (id text primary key, name text not null, level text not null);
create table public.employees (
  id text primary key, nip text unique not null, name text not null, email text unique not null,
  division_id text not null references divisions(id), position_id text not null references positions(id),
  supervisor_employee_id text references employees(id), is_active boolean not null default true,
  deleted_at timestamptz
);
alter table public.profiles add constraint profiles_employee_fk foreign key (employee_id) references employees(id);
create index on public.employees (division_id); create index on public.employees (supervisor_employee_id);
