-- Default deny. Uji dengan akun tiap peran, bukan hanya Admin (DESIGN §12.3).
create or replace function public.current_role() returns app_role language sql stable security definer set search_path = public as $$ select role from profiles where id = auth.uid() and is_active $$;
create or replace function public.current_employee() returns text language sql stable security definer set search_path = public as $$ select employee_id from profiles where id = auth.uid() and is_active $$;
create or replace function public.in_my_scope(owner text) returns boolean language sql stable security definer set search_path = public as $$
  select owner = current_employee()
      or (current_role() in ('admin','hrd'))
      or (current_role() = 'supervisor' and exists (select 1 from employees e where e.id = owner and e.supervisor_employee_id = current_employee()))
$$;
alter table profiles enable row level security; alter table employees enable row level security; alter table marketing_activities enable row level security;
alter table activity_verifications enable row level security; alter table clients enable row level security; alter table offers enable row level security;
alter table programs enable row level security; alter table audit_logs enable row level security; alter table assessment_results enable row level security;

create policy profiles_self on profiles for select using (id = auth.uid() or current_role() = 'admin');
create policy employees_read on employees for select using (in_my_scope(id));
create policy activities_read on marketing_activities for select using (in_my_scope(owner_id) or created_by = current_employee());
create policy activities_insert on marketing_activities for insert with check (current_role() in ('employee','supervisor') and created_by = current_employee() and in_my_scope(owner_id) and status = 'pending');
create policy activities_update_revision on marketing_activities for update using (status = 'revision' and (owner_id = current_employee() or created_by = current_employee()));
create policy verif_read on activity_verifications for select using (exists (select 1 from marketing_activities a where a.id = activity_id and in_my_scope(a.owner_id)));
create policy verif_insert on activity_verifications for insert with check (current_role() = 'supervisor' and verified_by = current_employee());
create policy clients_read on clients for select using (in_my_scope(owner_id));
create policy offers_read on offers for select using (in_my_scope(owner_id));
create policy programs_read on programs for select using (in_my_scope(owner_id));
create policy audit_admin_hrd on audit_logs for select using (current_role() in ('admin','hrd'));
create policy results_hrd on assessment_results for select using (current_role() = 'hrd');
-- Catatan: perubahan status aktivitas saat verifikasi sebaiknya lewat fungsi security definer/RPC, bukan UPDATE langsung.
