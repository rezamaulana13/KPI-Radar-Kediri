-- Migrasi 0009: Penyederhanaan 3 Role (Super Admin, Admin HRD, Pengguna Karyawan) dan Dukungan Google OAuth / Registrasi
-- Jalankan di Supabase SQL Editor jika menggunakan database live.

-- 1. Penyesuaian Enum app_role menjadi 3 role: 'admin', 'hrd', 'employee'
-- Catatan: Jika enum sudah terisi data 'supervisor', ubah terlebih dahulu ke 'employee' atau 'hrd':
update public.profiles set role = 'employee' where role::text = 'supervisor';

-- 2. Fungsi trigger otomatis saat pengguna mendaftar mandiri atau lewat Google OAuth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_emp_id text;
  emp_name text;
  emp_nip text;
begin
  new_emp_id := 'E-' || substr(new.id::text, 1, 8);
  emp_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  emp_nip := 'RK-' || floor(1000 + random() * 9000)::text;

  -- Buat data karyawan jika belum ada
  insert into public.employees (id, nip, name, email, division_id, position_id, is_active)
  values (new_emp_id, emp_nip, emp_name, new.email, 'DIV-MKT', 'POS-EXM', true)
  on conflict (email) do nothing;

  -- Buat data profil dengan peran default 'employee' (Pengguna Karyawan)
  insert into public.profiles (id, employee_id, role, is_active)
  values (new.id, new_emp_id, 'employee', true)
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Daftarkan trigger ke auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Pembaruan Kebijakan RLS untuk Verifikasi Aktivitas (HRD dan Admin)
-- Memastikan HRD dan Admin berwenang memverifikasi aktivitas yang bukan miliknya
create or replace policy "hrd_and_admin_verify_activities" on public.activity_verifications
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('hrd', 'admin')
        and profiles.is_active = true
    )
  );

