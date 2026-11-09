# DESIGN — Sistem Informasi Aktivitas dan Kinerja Karyawan Radar Kediri

> **Status:** Draft desain implementasi v1.0  
> **Framework:** Astro SSR  
> **Backend:** Supabase PostgreSQL + Auth + optional Storage  
> **Jenis aplikasi:** Internal dashboard  
> **Dokumen pasangan:** `PRD.md`

---

## 1. Tujuan Dokumen

Dokumen ini menjelaskan arsitektur teknis, struktur folder Astro, pembagian modul, pola halaman, alur data, keamanan, dan pedoman implementasi agar proyek mudah dikembangkan dan dipelihara oleh satu fullstack developer.

Desain dibuat untuk satu aplikasi yang berkembang dari MKI ke TA. Modul SAW disiapkan sebagai modul lanjutan dan tidak perlu diaktifkan pada rilis MKI.

---

## 2. Prinsip Desain

1. **Feature-oriented:** file dikelompokkan berdasarkan domain/fitur, bukan menumpuk seluruh kode dalam satu folder.
2. **Server-first:** query database, validasi role, dan aturan bisnis berjalan di server.
3. **Separation of concerns:** halaman hanya mengatur tampilan dan alur request; service menangani logika bisnis; repository/query menangani akses data.
4. **Typed data:** gunakan TypeScript untuk model, input, dan hasil service.
5. **Reusable UI:** komponen umum dipakai lintas modul.
6. **Secure by default:** semua route privat dan endpoint sensitif melakukan pemeriksaan sesi serta izin.
7. **Traceable:** setiap data operasional memiliki identitas pembuat, pemilik, dan riwayat verifikasi.
8. **MKI-first:** implementasikan alur inti sebelum menambah fitur TA.

---

## 3. Stack Teknologi

| Area | Pilihan |
|---|---|
| Framework | Astro dengan SSR |
| Bahasa | TypeScript |
| Rendering | Server-side rendering untuk aplikasi internal |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Authorization | Role/permission di server + Supabase RLS |
| File storage | Supabase Storage private bucket (bila lampiran diperlukan) |
| Styling | CSS terstruktur; dapat memakai CSS Modules atau stylesheet global |
| Form validation | Zod atau validator TypeScript sejenis |
| Testing | Unit test untuk fungsi bisnis, integration test, black-box, UAT |

### 3.1 Catatan adapter SSR

Pilih adapter Astro sesuai tempat deployment yang disetujui perusahaan. Jangan mengunci konfigurasi deployment sebelum mengetahui hosting yang akan dipakai. Mode SSR harus aktif dan environment variables disiapkan pada environment hosting.

### 3.2 Dependensi inti yang disarankan

- `astro`
- `@supabase/supabase-js`
- `@supabase/ssr` (untuk pola autentikasi SSR berbasis cookie yang sesuai versi library)
- `zod`
- `typescript`

Tambahkan library UI, chart, export, atau testing hanya saat kebutuhan konkretnya muncul. Hindari memasang banyak dependensi sejak awal.

---

## 4. Arsitektur Aplikasi

```text
Browser
  |
  | HTTPS
  v
Astro SSR
  |
  +-- Middleware: session + route guard
  |
  +-- Pages: render UI
  |
  +-- API routes/actions: validate request + authorize
  |
  +-- Services: business rules
  |
  +-- Repositories: database queries
  |
  v
Supabase
  +-- Auth
  +-- PostgreSQL
  +-- RLS policies
  +-- Private Storage (optional)
```

### 4.1 Tanggung jawab lapisan

**Pages / UI**
- Menampilkan halaman.
- Mengambil data dari server saat render.
- Menampilkan form, tabel, filter, status, dan pesan validasi.
- Tidak memuat service-role key atau logika rahasia.

**Middleware**
- Membaca sesi pengguna.
- Menyimpan identitas pengguna pada `locals`.
- Melindungi route privat secara umum.
- Tidak menggantikan pemeriksaan izin pada setiap operasi.

**API routes**
- Memvalidasi body/query parameter.
- Memastikan sesi tersedia.
- Memastikan pengguna berhak melakukan aksi.
- Memanggil service.
- Mengembalikan response yang konsisten.

**Services**
- Menjalankan aturan bisnis.
- Mengelola alur approval.
- Menghitung realisasi KPI.
- Menjaga konsistensi proses lintas tabel.

**Repositories**
- Menjalankan query Supabase.
- Mengisolasi detail akses database dari service.

**Database**
- Menegakkan foreign key, unique constraint, check constraint, index, dan RLS.
- Menjadi sumber data utama.

---

## 5. Struktur Folder dan File Astro

Berikut struktur yang direkomendasikan untuk proyek yang berkembang bertahap. Folder `spk` disiapkan untuk TA, tetapi tidak perlu diimplementasikan pada fase MKI.

```text
radar-kediri/
│
├── public/
│   ├── favicon.svg
│   ├── images/
│   │   ├── logo-radar-kediri.svg
│   │   └── illustrations/
│   └── fonts/
│
├── database/
│   ├── migrations/
│   │   ├── 0001_create_profiles.sql
│   │   ├── 0002_create_organization.sql
│   │   ├── 0003_create_assessment_periods.sql
│   │   ├── 0004_create_kpi_master.sql
│   │   ├── 0005_create_marketing_tables.sql
│   │   ├── 0006_create_activity_verification.sql
│   │   ├── 0007_create_kpi_achievements.sql
│   │   └── 0008_create_rls_policies.sql
│   ├── seeds/
│   │   └── development_seed.sql
│   └── README.md
│
├── docs/
│   ├── PRD.md
│   ├── DESIGN.md
│   ├── ERD.md
│   ├── DATABASE.md
│   ├── ACCESS_CONTROL.md
│   ├── BUSINESS_RULES.md
│   └── TEST_PLAN.md
│
├── src/
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── tokens.css
│   │   │   ├── layout.css
│   │   │   └── utilities.css
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Input.astro
│   │   │   ├── Select.astro
│   │   │   ├── Textarea.astro
│   │   │   ├── Badge.astro
│   │   │   ├── Modal.astro
│   │   │   ├── DataTable.astro
│   │   │   ├── Pagination.astro
│   │   │   ├── EmptyState.astro
│   │   │   ├── ConfirmDialog.astro
│   │   │   └── FormError.astro
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.astro
│   │   │   ├── Sidebar.astro
│   │   │   ├── Topbar.astro
│   │   │   ├── Breadcrumbs.astro
│   │   │   └── PageHeader.astro
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.astro
│   │   │   ├── SummaryPanel.astro
│   │   │   └── ActivitySummary.astro
│   │   │
│   │   └── feedback/
│   │       ├── Alert.astro
│   │       ├── ToastContainer.astro
│   │       └── LoadingState.astro
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   │
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   │
│   │   ├── employees/
│   │   │   ├── components/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   │
│   │   ├── organization/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   │
│   │   ├── periods/
│   │   │   ├── components/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   │
│   │   ├── kpi/
│   │   │   ├── categories/
│   │   │   │   ├── components/
│   │   │   │   ├── schemas/
│   │   │   │   └── services/
│   │   │   ├── indicators/
│   │   │   │   ├── components/
│   │   │   │   ├── schemas/
│   │   │   │   └── services/
│   │   │   ├── targets/
│   │   │   │   ├── components/
│   │   │   │   ├── schemas/
│   │   │   │   └── services/
│   │   │   ├── achievements/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   └── types.ts
│   │   │   └── mappings/
│   │   │       ├── schemas/
│   │   │       └── services/
│   │   │
│   │   ├── marketing/
│   │   │   ├── activities/
│   │   │   │   ├── components/
│   │   │   │   ├── schemas/
│   │   │   │   ├── services/
│   │   │   │   └── types.ts
│   │   │   ├── oplah/
│   │   │   ├── clients/
│   │   │   ├── programs/
│   │   │   ├── profiling/
│   │   │   ├── offers/
│   │   │   └── progress/
│   │   │
│   │   ├── verification/
│   │   │   ├── components/
│   │   │   ├── schemas/
│   │   │   └── services/
│   │   │
│   │   ├── reports/
│   │   │   ├── components/
│   │   │   └── services/
│   │   │
│   │   └── spk/
│   │       ├── criteria/
│   │       ├── weights/
│   │       ├── decision-matrix/
│   │       ├── saw/
│   │       ├── rankings/
│   │       └── results/
│   │
│   ├── layouts/
│   │   ├── AuthLayout.astro
│   │   └── DashboardLayout.astro
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── get-current-user.ts
│   │   │   └── require-auth.ts
│   │   ├── permissions/
│   │   │   ├── roles.ts
│   │   │   ├── permissions.ts
│   │   │   └── can.ts
│   │   ├── validation/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── utils/
│   │   └── formatters/
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── login.astro
│   │   ├── logout.ts
│   │   ├── dashboard.astro
│   │   │
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   ├── employees/
│   │   │   ├── divisions/
│   │   │   ├── positions/
│   │   │   └── audit-logs/
│   │   │
│   │   ├── hrd/
│   │   │   ├── periods/
│   │   │   ├── kpi/
│   │   │   │   ├── categories/
│   │   │   │   ├── indicators/
│   │   │   │   ├── targets/
│   │   │   │   └── achievements/
│   │   │   ├── reports/
│   │   │   └── spk/
│   │   │       ├── criteria/
│   │   │       ├── weights/
│   │   │       ├── calculations/
│   │   │       └── rankings/
│   │   │
│   │   ├── supervisor/
│   │   │   ├── activities/
│   │   │   ├── verifications/
│   │   │   └── team-performance/
│   │   │
│   │   ├── employee/
│   │   │   ├── activities/
│   │   │   └── performance/
│   │   │
│   │   ├── marketing/
│   │   │   ├── oplah/
│   │   │   ├── clients/
│   │   │   ├── programs/
│   │   │   ├── profiling/
│   │   │   └── offers/
│   │   │       └── [id]/
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       ├── employees/
│   │       ├── activities/
│   │       ├── verifications/
│   │       ├── marketing/
│   │       └── kpi/
│   │
│   ├── middleware.ts
│   └── env.d.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── .env.example
├── .gitignore
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### 5.1 Aturan penempatan file

- `pages/`: hanya route Astro dan file endpoint.
- `features/`: kode berdasarkan domain fitur (schema, service, type, komponen spesifik).
- `components/ui/`: komponen tampilan generik yang tidak bergantung pada domain.
- `components/layout/`: sidebar, topbar, shell, breadcrumb.
- `lib/`: utilitas lintas fitur, Supabase client, auth, permission.
- `database/`: migrasi SQL dan seed development.
- `docs/`: dokumentasi proyek.
- `tests/`: pengujian unit, integrasi, dan fixtures.
- `features/spk/` dan `pages/hrd/spk/`: disiapkan untuk TA; jangan dipaksakan masuk scope MKI.

---

## 6. Konvensi Penamaan

| Elemen | Konvensi | Contoh |
|---|---|---|
| Folder | kebab-case atau lowercase | `marketing-activities/` |
| File Astro component | PascalCase | `ActivityForm.astro` |
| File TypeScript | kebab-case | `create-activity.ts` |
| Fungsi | camelCase | `createActivity()` |
| Tipe/interface | PascalCase | `MarketingActivity` |
| Konstanta | UPPER_SNAKE_CASE | `ACTIVITY_STATUS` |
| Database table | snake_case plural | `marketing_activities` |
| Database column | snake_case | `created_by` |
| Route URL | lowercase plural | `/marketing/clients` |
| Environment variable | UPPER_SNAKE_CASE | `SUPABASE_URL` |

Gunakan nama yang menggambarkan tujuan. Hindari nama terlalu umum seperti `data.ts`, `helper.ts`, `main2.ts`, atau `process.ts` jika fungsi sebenarnya dapat disebut lebih spesifik.

---

## 7. Pola Implementasi Astro

### 7.1 SSR configuration

Konfigurasi adapter bergantung pada hosting. Contoh bentuk konfigurasi (sesuaikan adapter yang dipilih):

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
```

Jika deployment bukan Node standalone, ganti adapter sesuai platform. Jangan memasang adapter yang tidak sesuai dengan target hosting.

### 7.2 Environment variables

`.env.example`:

```env
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Ketentuan:
- URL dan anon/publishable key boleh digunakan pada client sesuai pola Supabase.
- Service role key hanya boleh digunakan di server untuk kebutuhan administratif yang benar-benar memerlukannya.
- Utamakan client server dengan sesi pengguna agar RLS tetap berlaku.
- Jangan commit `.env` ke Git.
- Nama environment variable harus mengikuti konfigurasi versi Supabase yang dipakai.

### 7.3 Server Supabase client

Buat satu modul pembuat server client yang mengintegrasikan cookie request/response dengan pola SSR resmi library Supabase yang dipilih. Hindari membuat client server berbeda-beda pada setiap halaman.

Pola konseptual:

```ts
// src/lib/supabase/server.ts
// Implementasikan menggunakan @supabase/ssr dan Astro cookies.
// Pastikan getAll/setAll cookie sesuai API versi library yang dipasang.
```

Client browser hanya dibuat jika memang ada interaksi browser yang membutuhkan Supabase secara langsung. Untuk operasi bisnis sensitif, utamakan endpoint/server action agar validasi dan otorisasi tidak dilewati.

### 7.4 Middleware dan locals

Middleware bertugas:
- Membuat Supabase server client untuk request.
- Memperbarui/membaca sesi sesuai pola SSR.
- Mengambil identitas pengguna.
- Menyimpan user dan client pada `Astro.locals`.
- Mengarahkan pengguna yang belum login dari route privat.

Tambahkan tipe `App.Locals` di `src/env.d.ts` untuk user, supabase client, dan data role yang diperlukan.

Middleware bukan satu-satunya lapisan keamanan. Setiap service/action tetap memeriksa permission.

### 7.5 Route handler

Pisahkan endpoint berdasarkan domain, misalnya:
- `POST /api/activities`
- `PATCH /api/activities/[id]`
- `POST /api/verifications/[id]`
- `GET /api/kpi/achievements`

Gunakan schema validation untuk body dan query. Kembalikan status HTTP yang sesuai dan jangan mengirim detail internal database ke pengguna.

### 7.6 Service layer

Contoh pembagian:
- `create-activity.ts`
- `update-activity.ts`
- `verify-activity.ts`
- `calculate-kpi-achievement.ts`
- `get-kpi-summary.ts`

Service harus memeriksa:
1. Sesi pengguna.
2. Permission.
3. Validitas input.
4. Status data saat ini.
5. Aturan bisnis.
6. Konsistensi transaksi/operasi database.

---

## 8. Desain Database dan Relasi

### 8.1 Domain master

- `profiles` terhubung ke `auth.users`.
- `employees` menyimpan profil kepegawaian dan mengacu ke `profiles`.
- `employees` terhubung ke `divisions` dan `positions`.
- Relasi Supervisor dapat disimpan melalui `supervisor_employee_id` atau tabel penugasan tim jika satu karyawan dapat memiliki lebih dari satu Supervisor.

### 8.2 Domain Marketing

- `marketing_activities` adalah header aktivitas.
- `oplah_records`, `profiling_records`, dan `offers` menyimpan detail sesuai jenis aktivitas.
- `clients` adalah master client.
- `programs` dan `program_participants` mengelola program/barter.
- `offers` dapat memiliki banyak `offer_progress`.
- `offers` memiliki satu hasil akhir aktif pada `offer_outcomes`.
- `activity_verifications` menyimpan riwayat verifikasi.

### 8.3 Domain KPI

- `kpi_categories` membedakan perusahaan, divisi, dan individu.
- `kpi_indicators` menyimpan definisi ukuran.
- `kpi_targets` menyimpan target sesuai periode dan cakupan.
- `kpi_activity_mappings` menghubungkan jenis aktivitas dengan indikator.
- `kpi_achievements` menyimpan agregasi realisasi yang dapat ditelusuri.

### 8.4 Pertimbangan penting skema

- Model target harus mampu merepresentasikan target level perusahaan, divisi, dan individu tanpa ambiguitas.
- Tambahkan kolom scope yang eksplisit atau desain relasi target yang tegas; hindari mengisi employee_id dan division_id secara sembarang.
- Buat unique constraint agar satu indikator tidak memiliki target ganda pada scope/periode yang sama.
- `no_reason` wajib saat outcome bernilai `no`, dengan check constraint atau validasi database setara.
- Status verifikasi sebaiknya menggunakan enum/check constraint.
- Data approved yang diedit harus melalui proses verifikasi ulang.
- Gunakan soft delete untuk master/transaksi yang perlu dipertahankan demi audit; jangan menghapus histori penilaian.
- Simpan angka dengan tipe numeric yang sesuai, bukan floating point untuk nilai uang.
- Gunakan timezone yang konsisten dan simpan timestamp dalam format timestamptz.

---

## 9. Alur UI dan Navigasi

### 9.1 Layout utama

```text
+-----------------------------------------------------------+
| Logo Radar Kediri                 Periode | Notifikasi | User
+-------------------+---------------------------------------+
| Sidebar           | Breadcrumb                             |
|                   | Judul halaman                          |
| Dashboard         |                                       |
| Aktivitas         | Konten utama                           |
| Marketing         |                                       |
| KPI               | Tabel / Form / Ringkasan                |
| Laporan           |                                       |
| Pengaturan        |                                       |
+-------------------+---------------------------------------+
```

### 9.2 Navigasi berdasarkan role

**Admin**
- Dashboard
- Pengguna
- Karyawan
- Divisi
- Jabatan
- Audit Log
- Pengaturan

**HRD**
- Dashboard
- Periode Penilaian
- Kategori KPI
- Indikator KPI
- Target KPI
- Realisasi KPI
- Laporan
- SPK (TA)

**Supervisor**
- Dashboard Tim
- Aktivitas Tim
- Verifikasi
- Kinerja Tim

**Employee**
- Dashboard Saya
- Aktivitas Saya
- Tambah Aktivitas
- Kinerja Saya

**Marketing**
- Oplah
- List Client
- Program/Barter
- Profiling
- Penawaran
- Progress
- Deal/NO

Navigasi aktual dapat menggabungkan menu berdasarkan permission pengguna. Jangan menampilkan menu yang tidak relevan.

---

## 10. Desain Halaman Inti

### 10.1 Login
- Identitas aplikasi.
- Input email dan password.
- Tombol masuk.
- Pesan kesalahan yang aman.
- Tidak menyediakan registrasi publik; akun dibuat Admin sesuai kebijakan.

### 10.2 Dashboard
- Ringkasan sesuai role.
- Periode aktif.
- Aktivitas menunggu verifikasi.
- Ringkasan realisasi KPI.
- Shortcut ke tugas utama.
- Hindari menampilkan metrik yang belum memiliki sumber data valid.

### 10.3 Aktivitas Marketing
- Filter tanggal, jenis aktivitas, pemilik, status.
- Tabel daftar aktivitas.
- Tombol tambah aktivitas sesuai hak.
- Kolom pemilik dan pencatat.
- Status verifikasi.
- Detail aktivitas dan riwayat verifikasi.

### 10.4 Form aktivitas
Field umum:
- Pemilik aktivitas.
- Tanggal aktivitas.
- Jenis aktivitas.
- Deskripsi.
- Lampiran/bukti bila diwajibkan.

Field detail berubah berdasarkan jenis:
- Oplah: sumber, nama agen/loper/pembaca sesuai kebutuhan, jumlah.
- Profiling: client, hasil riset, potensi.
- Penawaran: client, program, tanggal, nilai penawaran.
- Progress: penawaran, tanggal, tipe progress, catatan.
- Deal/NO: hasil akhir; jika NO, alasan wajib.

### 10.5 Verifikasi Supervisor
- Daftar pending.
- Detail data dan bukti.
- Informasi pembuat serta pemilik aktivitas.
- Aksi approve, reject, revision.
- Catatan verifikasi.
- Riwayat status.

### 10.6 Master KPI dan target
- Daftar kategori.
- Indikator, satuan, tipe pengukuran, benefit/cost.
- Target per periode dan scope.
- Mapping aktivitas ke indikator.
- Riwayat perubahan konfigurasi.

### 10.7 Rekap KPI
- Filter periode/divisi/karyawan.
- Target, realisasi, persentase capaian jika sesuai definisi.
- Rincian sumber aktivitas.
- Status data dan waktu kalkulasi.
- Predikat hanya ditampilkan setelah rentang predikat disahkan.

### 10.8 SPK SAW (TA)
- Pilih periode dan kelompok alternatif.
- Pilih kriteria yang berlaku.
- Atur bobot dan jenis benefit/cost.
- Tampilkan matriks keputusan.
- Tampilkan matriks normalisasi.
- Tampilkan nilai preferensi.
- Tampilkan ranking dan penjelasan.
- Simpan versi hasil kalkulasi agar hasil periode lampau dapat direproduksi.

---

## 11. Design System dan Pedoman Visual

### 11.1 Arah visual

Gunakan gaya dashboard korporat yang bersih, profesional, dan mudah dibaca. Fokus utama adalah keterbacaan tabel, formulir, status, dan angka KPI; bukan dekorasi.

### 11.2 Token warna awal

Warna berikut merupakan rekomendasi awal dan dapat disesuaikan dengan identitas visual Radar Kediri.

| Token | Nilai | Penggunaan |
|---|---|---|
| `--color-primary-900` | `#12345A` | Sidebar, heading kuat |
| `--color-primary-700` | `#176B87` | Tombol utama/link |
| `--color-primary-100` | `#EAF2F8` | Highlight lembut |
| `--color-surface` | `#FFFFFF` | Card dan panel |
| `--color-page` | `#F5F7FA` | Latar halaman |
| `--color-text` | `#253244` | Teks utama |
| `--color-muted` | `#64748B` | Teks sekunder |
| `--color-border` | `#DCE3EA` | Border |
| `--color-success` | `#15803D` | Approved/success |
| `--color-warning` | `#B45309` | Pending/warning |
| `--color-danger` | `#B91C1C` | Rejected/error |

### 11.3 Status badge

| Status | Tampilan |
|---|---|
| Pending | Kuning/netral |
| Approved | Hijau |
| Rejected | Merah |
| Revision | Oranye |
| Deal | Hijau |
| NO | Merah atau netral dengan alasan terlihat |

Jangan hanya mengandalkan warna; selalu tampilkan teks status.

### 11.4 Komponen UI

- Button: primary, secondary, danger, ghost.
- Input, select, textarea.
- Date picker.
- Badge/status.
- Card/stat card.
- Data table dengan pagination.
- Filter bar.
- Modal konfirmasi.
- Empty state.
- Loading state.
- Alert dan form error.
- Breadcrumb dan page header.

### 11.5 Responsivitas

- Desktop: sidebar tetap dan konten utama lebar.
- Tablet: sidebar dapat diciutkan.
- Mobile: navigasi berubah menjadi drawer; tabel dapat digeser horizontal atau diubah menjadi list card.
- Form harus tetap nyaman di layar kecil.

---

## 12. Keamanan dan Otorisasi

### 12.1 Prinsip
- Default deny: akses ditolak kecuali ada izin.
- Server-side authorization untuk semua mutasi.
- RLS aktif pada tabel sensitif.
- Hindari query menggunakan service role untuk request pengguna biasa.
- Gunakan least privilege.

### 12.2 Pemeriksaan setiap request
1. Apakah sesi valid?
2. Apakah role memiliki permission?
3. Apakah data berada dalam cakupan divisi/tim pengguna?
4. Apakah status data memungkinkan aksi?
5. Apakah input valid?
6. Apakah aksi perlu dicatat pada audit log?

### 12.3 Kebijakan penting
- Employee tidak dapat membaca data karyawan lain tanpa izin.
- Supervisor hanya dapat memverifikasi anggota tim sesuai assignment.
- HRD dapat mengakses data penilaian sesuai tanggung jawab.
- Admin dapat mengelola akun dan master.
- Lampiran disimpan privat.
- Jangan menyimpan password sendiri; gunakan Supabase Auth.

RLS harus diuji dengan akun dari masing-masing role, bukan hanya diuji dari akun Admin.

---

## 13. Alur Data dan Konsistensi

### 13.1 Verifikasi aktivitas

```text
Create activity
    |
    v
Pending
    |
    v
Supervisor review
    |
    +---- Reject ------> Not included in KPI
    |
    +---- Revision ----> Employee edits and resubmits
    |
    +---- Approve -----> Eligible for KPI mapping
                              |
                              v
                      Calculate achievement
                              |
                              v
                       KPI period summary
```

### 13.2 Strategi perhitungan realisasi

Tentukan salah satu pendekatan setelah aturan KPI mitra jelas:

**On-demand aggregation**
- Realisasi dihitung dari aktivitas approved saat halaman rekap dibuka.
- Cocok untuk volume data kecil dan aturan sederhana.
- Query harus dioptimalkan.

**Stored aggregation**
- Realisasi disimpan pada tabel `kpi_achievements` dan diperbarui saat aktivitas disetujui/dikoreksi.
- Cocok untuk laporan historis dan dashboard yang lebih cepat.
- Memerlukan mekanisme transaksi/idempotency agar aktivitas tidak dihitung dua kali.

Untuk tahap awal, pilih desain yang paling mudah diaudit. Jangan mengimplementasikan dua mekanisme sekaligus tanpa kebutuhan.

### 13.3 Idempotency dan duplikasi
- Setiap sumber aktivitas harus dapat dikenali secara unik.
- Pemrosesan ulang event approval tidak boleh menggandakan nilai realisasi.
- Perubahan approved harus menghasilkan koreksi yang tercatat, bukan penambahan nilai kedua.
- Pertimbangkan tabel ledger/agregasi sumber jika aturan audit memerlukannya.

---

## 14. Persiapan SAW untuk TA

SAW ditempatkan dalam domain `features/spk/`, terpisah dari pengelolaan KPI operasional.

### 14.1 Pipeline
1. Memilih periode dan alternatif karyawan.
2. Mengambil kriteria yang berlaku.
3. Mengambil bobot dan tipe benefit/cost.
4. Membentuk matriks keputusan.
5. Menormalisasi nilai.
6. Menghitung nilai preferensi.
7. Mengurutkan ranking.
8. Menyimpan snapshot hasil dan versi konfigurasi.

### 14.2 Rumus

Benefit:

```text
r_ij = x_ij / max(x_j)
```

Cost:

```text
r_ij = min(x_j) / x_ij
```

Preferensi:

```text
V_i = Σ (w_j × r_ij)
```

### 14.3 Validasi
- Total bobot harus 1 atau 100%.
- Bobot harus non-negatif.
- Penanganan nilai nol dan data kosong harus ditetapkan.
- Kriteria harus comparable antar alternatif.
- Hindari menghitung indikator yang sama dua kali.
- Hasil harus dapat direproduksi dari snapshot input dan konfigurasi.
- Tampilkan rincian perhitungan, bukan hanya ranking.

---

## 15. Pengujian Teknis

### Unit test
- Validasi form.
- Perhitungan realisasi.
- Aturan alasan NO.
- Pemeriksaan status transisi.
- Fungsi normalisasi dan preferensi SAW (TA).

### Integration test
- Aktivitas dibuat → diverifikasi → KPI diperbarui.
- Aktivitas rejected tidak memengaruhi KPI.
- Perubahan setelah approval memicu koreksi/verifikasi ulang.
- Role dan RLS membatasi akses.
- Penawaran NO tanpa alasan ditolak.

### UAT
Skenario dilakukan oleh:
- Admin: mengelola akun dan master.
- HRD: mengelola periode/KPI dan melihat rekap.
- Supervisor: memverifikasi aktivitas.
- Employee: menginput aktivitas dan melihat status.

---

## 16. Urutan Implementasi

### Sprint 0 — Validasi
- Konfirmasi daftar divisi dan struktur organisasi.
- Dapatkan template KPI dan contoh perhitungan.
- Pastikan aturan oplah, client, program, penawaran, progress, Deal/NO.
- Pastikan role dan cakupan Supervisor.

### Sprint 1 — Fondasi
- Inisialisasi Astro SSR.
- Setup Supabase.
- Setup environment.
- Buat layout, global styles, auth, dan middleware.
- Buat migration profiles, divisions, positions, employees.

### Sprint 2 — Master dan KPI
- Periode penilaian.
- Kategori dan indikator KPI.
- Target.
- Mapping aktivitas ke KPI.

### Sprint 3 — Marketing
- List Client.
- Aktivitas dan detail oplah.
- Program/barter.
- Profiling.
- Penawaran dan progress.
- Deal/NO.

### Sprint 4 — Verifikasi dan integrasi
- Queue verifikasi Supervisor.
- Status dan riwayat.
- Realisasi KPI.
- Audit log.

### Sprint 5 — Dashboard dan pengujian MKI
- Dashboard per role.
- Rekap KPI.
- Laporan.
- Black-box dan UAT.

### Sprint TA — SPK
- Bobot.
- Matriks keputusan.
- Normalisasi.
- Nilai preferensi.
- Ranking.
- Pengujian perhitungan dan dokumentasi penelitian.

---

## 17. Checklist Sebelum Mulai Coding

- [ ] Konfirmasi hosting/deployment SSR.
- [ ] Buat repository Git.
- [ ] Buat project Supabase development.
- [ ] Siapkan `.env.example` dan `.gitignore`.
- [ ] Konfirmasi daftar divisi dan role.
- [ ] Dapatkan template KPI asli.
- [ ] Konfirmasi target, satuan, rumus, dan periode.
- [ ] Konfirmasi SOP verifikasi dan bukti.
- [ ] Konfirmasi definisi data oplah dan List Client.
- [ ] Konfirmasi status Deal/NO dan kategori alasan.
- [ ] Finalisasi ERD dan migration pertama.
- [ ] Buat akun uji untuk setiap role.

---

## 18. Keputusan yang Tidak Boleh Diasumsikan

Hal-hal berikut belum boleh dianggap final sampai mitra mengonfirmasi:

- Daftar divisi dan jabatan.
- Daftar indikator dan target KPI.
- Bobot KPI dan jenis benefit/cost.
- Rumus konversi aktivitas ke realisasi.
- Apakah jumlah NO menjadi KPI negatif atau hanya metrik evaluasi.
- Definisi valid oplah dan sumbernya.
- Kategori alasan NO.
- Bukti wajib untuk setiap aktivitas.
- Apakah Supervisor boleh memverifikasi aktivitas yang ia input sendiri.
- Rentang predikat hasil penilaian.
- Aturan data historis, periode, dan koreksi setelah periode ditutup.

---

## 19. Definisi Desain Siap Diimplementasikan

Desain dianggap siap masuk coding ketika:
- Struktur route dan folder disepakati.
- ERD dan migration awal disetujui.
- Role dan matriks permission jelas.
- Alur aktivitas dan verifikasi tervalidasi.
- Definisi indikator, target, dan mapping KPI tersedia.
- Deployment SSR dipilih.
- Rencana pengujian alur inti disiapkan.

**Urutan coding yang disarankan:** mulai dari autentikasi dan master data, kemudian selesaikan satu alur penuh aktivitas → verifikasi → KPI. Setelah itu baru perluas ke seluruh submodul Marketing dan dashboard.
