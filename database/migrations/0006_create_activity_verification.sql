create table public.activity_verifications (
  id bigserial primary key, activity_id text not null references marketing_activities(id), status activity_status not null,
  verified_by text not null references employees(id), note text, created_at timestamptz not null default now()
);
create or replace function public.guard_self_verification() returns trigger language plpgsql as $$
declare a record;
begin
  select owner_id, created_by into a from marketing_activities where id = new.activity_id;
  if new.status <> 'pending' and (a.owner_id = new.verified_by or a.created_by = new.verified_by) then
    raise exception 'Tidak boleh memverifikasi aktivitas milik/inputan sendiri';
  end if;
  return new;
end $$;
create trigger trg_guard_self_verification before insert on public.activity_verifications for each row execute function public.guard_self_verification();
create table public.audit_logs (id bigserial primary key, at timestamptz not null default now(), actor_id text, action text not null, entity text not null, entity_id text, detail text);
