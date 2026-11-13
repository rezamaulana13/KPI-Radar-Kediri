# Database (Supabase / PostgreSQL)

Cara termudah dan paling praktis untuk inisialisasi database Supabase:
1. Buka **SQL Editor** di dashboard Supabase Anda.
2. Salin dan jalankan seluruh isi file [`database/supabase_setup.sql`](./supabase_setup.sql).
3. Skrip tersebut otomatis membuat:
   - Tipe ENUM (`app_role`: admin, hrd, employee).
   - Tabel profil dan kepegawaian (`profiles`, `employees`).
   - Tabel organisasi dan periode (`divisions`, `positions`, `assessment_periods`).
   - Tabel master KPI dan mapping (`kpi_categories`, `kpi_indicators`, `kpi_targets`, `kpi_activity_mappings`).
   - Tabel operasional marketing (`clients`, `offers`, `programs`, `marketing_activities`).
   - Tabel verifikasi & audit (`activity_verifications`, `audit_logs`, `assessment_results`).
   - View realisasi capaian KPI otomatis (`v_kpi_achievements`).
   - Trigger otomatisasi registrasi & Google OAuth (`handle_new_user`).
   - Kebijakan keamanan data Row Level Security (RLS).
   - Data master awal (Divisi, Jabatan, Indikator KPI, Periode, dan Target).
