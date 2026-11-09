# Database (Supabase / PostgreSQL)

Jalankan berurutan `migrations/0001` sampai `0008` di SQL Editor, lalu `seeds/development_seed.sql`.
Hubungkan akun Supabase Auth ke `profiles` (employee_id + role). Nama tabel adalah rancangan awal (PRD §9).

Aplikasi saat ini membaca data lewat `src/lib/data/store.ts` (mode demo). Untuk memakai database,
ganti fungsi di `store.ts` dan `features/kpi/achievements.ts` dengan query repository ke tabel di atas;
UI, aturan verifikasi, skema validasi, dan SAW tidak perlu diubah.
