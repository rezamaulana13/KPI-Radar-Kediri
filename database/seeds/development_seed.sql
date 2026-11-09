-- Seed minimal. Data lengkap ada di src/lib/data/mock.ts (data contoh, bukan data resmi).
insert into divisions (id, code, name) values ('DIV-MKT','MKT','Marketing'),('DIV-HRD','HRD','HRD & Umum'),('DIV-IT','IT','Teknologi Informasi');
insert into positions (id, name, level) values ('POS-SPV','Supervisor','Supervisor'),('POS-EXM','Eksekutif Marketing','Staf'),('POS-MGR','Manajer','Manajerial'),('POS-ADM','Administrator Sistem','Staf');
insert into assessment_periods (id, name, start_date, end_date, status) values ('PRD-2026-Q4','Triwulan IV 2026','2026-10-01','2026-12-31','active');
-- Setelah membuat user di Supabase Auth, hubungkan: insert into profiles (id, employee_id, role) values ('<uuid auth.users>', 'E02', 'employee');
