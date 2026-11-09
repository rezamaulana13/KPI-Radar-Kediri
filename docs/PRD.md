# PRD — Sistem Informasi Aktivitas dan Kinerja Karyawan Radar Kediri

> **Status:** Draft implementasi v1.0  
> **Platform:** Website internal  
> **Framework:** Astro (SSR)  
> **Backend & Database:** Supabase (PostgreSQL + Auth + Storage bila diperlukan)  
> **Fokus rilis pertama:** MKI — sistem operasional, pencatatan aktivitas Marketing, verifikasi, dan rekap KPI dasar  
> **Pengembangan lanjutan:** TA — Sistem Pendukung Keputusan (SPK) penilaian kinerja menggunakan metode SAW

---

## 1. Ringkasan Produk

Sistem Informasi Aktivitas dan Kinerja Karyawan Radar Kediri adalah website internal untuk mengelola data karyawan, struktur divisi, aktivitas operasional, indikator KPI, target, realisasi, dan penilaian kinerja.

Sistem dirancang untuk seluruh divisi Radar Kediri. Modul Marketing menjadi modul operasional prioritas karena memiliki alur aktivitas yang telah diidentifikasi, yaitu perolehan oplah, pengelolaan List Client, program/barter, riset profiling, penawaran, progress, serta hasil Deal atau NO.

Aktivitas yang dicatat tidak otomatis menjadi nilai kinerja. Aktivitas harus melalui verifikasi Supervisor. Aktivitas yang disetujui kemudian dipetakan ke indikator KPI yang sesuai dan dihitung sebagai realisasi berdasarkan aturan pengukuran dan periode yang ditetapkan.

### 1.1 Prinsip utama

1. Satu aplikasi dan satu database dikembangkan bertahap dari MKI ke TA.
2. MKI berfokus pada sistem operasional dan pengelolaan data KPI dasar.
3. TA menambahkan perhitungan SPK menggunakan metode SAW.
4. Data aktivitas harus memiliki pemilik, pencatat, tanggal, status, dan jejak verifikasi.
5. Hasil SAW merupakan rekomendasi pendukung keputusan, bukan keputusan otomatis terkait bonus, promosi, atau sanksi.
6. Aturan KPI, target, bobot, dan hak akses harus divalidasi oleh mitra.

---

## 2. Latar Belakang dan Permasalahan

Proses penilaian kinerja yang berjalan saat ini menggunakan spreadsheet. HRD menyiapkan template, membagikannya kepada pihak divisi, menerima kembali file yang telah diisi, lalu menggabungkan dan menghitung hasilnya. Proses berbasis file berpotensi menimbulkan keterlambatan, duplikasi versi, kesalahan input, dan pekerjaan rekap berulang.

Di sisi Marketing, aktivitas seperti perolehan oplah, riset, penawaran, kunjungan, progress, Deal, dan NO perlu dicatat secara lebih terstruktur. Data aktivitas tersebut dapat menjadi sumber realisasi KPI setelah diperiksa Supervisor.

### 2.1 Masalah yang ingin diselesaikan

- Data karyawan, divisi, KPI, dan periode belum dikelola dalam satu aplikasi terpusat.
- Pengumpulan dan konsolidasi spreadsheet membutuhkan pekerjaan manual.
- Aktivitas Marketing belum terhubung secara langsung dengan rekap KPI.
- Status verifikasi dan riwayat perubahan aktivitas perlu dapat ditelusuri.
- Perhitungan dan pelaporan KPI perlu menggunakan aturan yang konsisten.
- Pada tahap TA, perusahaan membutuhkan dukungan perhitungan multikriteria yang transparan.

---

## 3. Tujuan Produk

### 3.1 Tujuan MKI

- Menyediakan aplikasi internal berbasis web untuk mengelola master data karyawan dan divisi.
- Mengelola periode, kategori, indikator, dan target KPI.
- Menyediakan pencatatan aktivitas operasional Marketing.
- Memungkinkan karyawan dan Supervisor melakukan input aktivitas.
- Menyediakan verifikasi aktivitas oleh Supervisor.
- Memetakan aktivitas yang disetujui ke indikator KPI.
- Menyediakan rekap realisasi dan pencapaian KPI dasar.

### 3.2 Tujuan TA

- Mengembangkan modul SPK penilaian kinerja karyawan berbasis KPI.
- Menerapkan metode Simple Additive Weighting (SAW).
- Menampilkan matriks keputusan, normalisasi, nilai preferensi, dan ranking.
- Menguji hasil perhitungan sistem terhadap perhitungan pembanding.
- Menyediakan informasi pendukung bagi HRD/manajemen.

---

## 4. Pengguna dan Hak Akses

Sistem memiliki empat role utama. Hak akses harus diperiksa di server dan didukung kebijakan Row Level Security (RLS) di Supabase.

| Role | Tanggung jawab dan akses |
|---|---|
| Admin | Mengelola akun, master data, konfigurasi sistem, dan akses administratif |
| HRD | Mengelola periode, kategori/indikator KPI, target, bobot pada tahap TA, rekap, dan laporan |
| Supervisor | Menginput aktivitas bila diperlukan, memverifikasi aktivitas tim, memantau realisasi tim |
| Employee | Menginput aktivitas sendiri, melihat status aktivitas, memperbaiki data yang diminta revisi, melihat informasi yang diizinkan |

### 4.1 Aturan akses

- Employee hanya dapat melihat dan mengelola data yang menjadi kewenangannya.
- Supervisor hanya dapat mengakses tim/divisi yang menjadi tanggung jawabnya.
- HRD memiliki akses sesuai cakupan pengelolaan penilaian perusahaan.
- Admin memiliki akses administratif, tetapi aktivitas sensitif tetap dicatat pada audit log.
- Pengguna tidak boleh memverifikasi aktivitas yang dibuatnya sendiri, kecuali kebijakan mitra secara eksplisit mengizinkan dan mekanisme kontrolnya ditetapkan.
- Role dari metadata browser tidak boleh dipercaya; otorisasi harus bersumber dari data server/database.

---

## 5. Ruang Lingkup Produk

### 5.1 Cakupan MKI — rilis pertama

**Fondasi aplikasi**
- Login, logout, sesi, middleware/guard, dan pembatasan role.
- Layout dashboard internal.
- Master karyawan, divisi, jabatan, dan relasi Supervisor.
- Pengelolaan periode penilaian.

**Pengelolaan KPI**
- Master kategori KPI: perusahaan, divisi, individu.
- Master indikator KPI.
- Satuan, jenis pengukuran, arah indikator, dan status aktif.
- Target KPI per periode dan cakupan yang sesuai.
- Pemetaan jenis aktivitas ke indikator KPI.
- Rekap realisasi KPI dasar.

**Operasional Marketing**
- Oplah.
- List Client.
- Program dan barter.
- Riset Profiling.
- Penawaran/proposal.
- Progress pendekatan dan kunjungan.
- Hasil Deal atau NO.
- Alasan NO wajib diisi jika hasilnya NO.

**Verifikasi dan laporan**
- Status pending, approved, rejected, revision.
- Catatan pemeriksaan Supervisor.
- Riwayat verifikasi.
- Rekap aktivitas dan KPI dengan filter periode/divisi/karyawan.
- Audit log untuk perubahan penting.

### 5.2 Cakupan TA — bukan bagian rilis MKI

- Pengaturan bobot kriteria.
- Penentuan benefit/cost.
- Penyusunan matriks keputusan.
- Normalisasi SAW.
- Perhitungan nilai preferensi.
- Ranking karyawan.
- Tampilan rincian perhitungan.
- Pengujian hasil SAW dan evaluasi pengguna.

### 5.3 Di luar cakupan awal

- Website publik.
- Aplikasi mobile native.
- Payroll dan penggajian.
- Keputusan otomatis bonus/promosi/sanksi.
- Integrasi dengan sistem eksternal yang belum disepakati.
- Implementasi modul operasional lengkap untuk setiap divisi sebelum kebutuhan divisi tersebut divalidasi.

---

## 6. Alur Bisnis Utama

### 6.1 Alur aktivitas Marketing

1. Employee atau Supervisor membuat aktivitas.
2. Penginput memilih pemilik aktivitas (`employee_id`) dan mengisi tanggal, jenis, rincian, serta data detail.
3. Sistem menyimpan aktivitas dengan status `pending`.
4. Supervisor yang berwenang memeriksa aktivitas.
5. Supervisor memilih `approved`, `rejected`, atau `revision` dan menambahkan catatan bila diperlukan.
6. Aktivitas `approved` menjadi sumber perhitungan realisasi KPI.
7. Aktivitas yang direvisi dapat diperbaiki dan diajukan kembali.
8. Aktivitas yang ditolak tidak dihitung sebagai realisasi.

### 6.2 Alur penawaran

1. Marketing memilih atau membuat client.
2. Marketing membuat data penawaran/proposal.
3. Setiap pendekatan, kunjungan, atau tindak lanjut dicatat sebagai progress.
4. Penawaran dapat memiliki beberapa progress.
5. Ketika proses berakhir, hasil ditetapkan menjadi `deal` atau `no`.
6. Jika `no`, kategori alasan dan penjelasan wajib diisi.
7. Hasil akhir dan aktivitas terkait dapat diverifikasi sesuai aturan Supervisor.

### 6.3 Alur integrasi aktivitas ke KPI

1. Aktivitas disimpan.
2. Supervisor menyetujui aktivitas.
3. Sistem mencari mapping aktivitas ke indikator KPI.
4. Backend menghitung nilai realisasi berdasarkan aturan indikator.
5. Realisasi diakumulasikan pada karyawan dan periode yang sesuai.
6. HRD melihat realisasi dibanding target.
7. Pada tahap TA, data KPI yang telah tervalidasi diproses oleh SAW.

> Aktivitas yang belum disetujui, ditolak, atau tidak memiliki mapping KPI tidak boleh diam-diam menambah realisasi.

---

## 7. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas | Rilis |
|---|---|---:|---|
| FR-001 | Pengguna dapat login dan logout | Must | MKI |
| FR-002 | Sistem membatasi halaman dan aksi berdasarkan role | Must | MKI |
| FR-003 | Admin mengelola divisi dan jabatan | Must | MKI |
| FR-004 | Admin/HRD mengelola data karyawan dan relasi Supervisor | Must | MKI |
| FR-005 | HRD mengelola periode penilaian | Must | MKI |
| FR-006 | HRD mengelola kategori dan indikator KPI | Must | MKI |
| FR-007 | HRD mengelola target KPI | Must | MKI |
| FR-008 | Employee dan Supervisor dapat mencatat aktivitas Marketing | Must | MKI |
| FR-009 | Sistem menyimpan identitas pemilik aktivitas dan penginput | Must | MKI |
| FR-010 | Supervisor dapat memverifikasi aktivitas yang menjadi kewenangannya | Must | MKI |
| FR-011 | Sistem mewajibkan alasan jika hasil penawaran adalah NO | Must | MKI |
| FR-012 | Sistem menyimpan progress penawaran | Must | MKI |
| FR-013 | Sistem memetakan aktivitas approved ke indikator KPI | Must | MKI |
| FR-014 | Sistem menghitung realisasi KPI sesuai aturan mapping | Must | MKI |
| FR-015 | HRD dapat melihat rekap KPI per periode/divisi/karyawan | Must | MKI |
| FR-016 | Sistem mencatat perubahan penting | Should | MKI |
| FR-017 | Sistem menyediakan ekspor laporan | Could | MKI |
| FR-018 | HRD mengatur bobot kriteria SAW | Must | TA |
| FR-019 | Sistem menghitung normalisasi dan nilai preferensi SAW | Must | TA |
| FR-020 | Sistem menampilkan ranking dan rincian perhitungan | Must | TA |

---

## 8. Aturan Bisnis

1. Setiap aktivitas memiliki satu pemilik aktivitas dan satu pencatat. Keduanya dapat berbeda.
2. Aktivitas harus memiliki tanggal, jenis, dan deskripsi yang cukup untuk diverifikasi.
3. Aktivitas baru berstatus `pending`.
4. Hanya Supervisor yang berwenang yang dapat melakukan verifikasi.
5. Aktivitas yang dibuat oleh Supervisor tetap harus mengikuti aturan verifikasi; hindari self-approval.
6. Aktivitas `approved` dapat dihitung ke KPI jika memiliki mapping dan periode yang valid.
7. Perubahan data setelah disetujui harus menghasilkan verifikasi ulang atau mekanisme koreksi yang dapat diaudit.
8. Hasil penawaran `no` wajib memiliki alasan.
9. Satu penawaran dapat memiliki banyak progress, tetapi satu hasil akhir aktif.
10. Target KPI harus memiliki cakupan yang jelas: perusahaan, divisi, atau individu.
11. Indikator dan target yang digunakan dalam penilaian harus berlaku pada periode terkait.
12. Periode yang telah ditutup tidak dapat diubah oleh pengguna biasa.
13. Perubahan bobot, target, atau mapping harus memiliki riwayat.
14. SAW menggunakan data yang telah disahkan dan aturan bobot yang disetujui.
15. Predikat `Sangat Baik`, `Baik`, `Cukup`, dan `Kurang` harus memakai rentang nilai yang disahkan perusahaan.

---

## 9. Model Data Tingkat Produk

Tabel inti yang direncanakan:

### Master dan akun
- `profiles`
- `divisions`
- `positions`
- `employees`
- `assessment_periods`

### KPI
- `kpi_categories`
- `kpi_indicators`
- `kpi_targets`
- `kpi_activity_mappings`
- `kpi_achievements`

### Marketing
- `clients`
- `marketing_activities`
- `oplah_records`
- `programs`
- `program_participants`
- `profiling_records`
- `offers`
- `offer_progress`
- `offer_outcomes`

### Verifikasi dan penilaian
- `activity_verifications`
- `assessment_results`
- `assessment_details`
- `audit_logs`

Nama tabel ini merupakan rancangan awal. Detail kolom, tipe data, relasi, constraint, index, trigger, dan kebijakan RLS ditetapkan pada dokumen/implementasi database terpisah.

---

## 10. Rancangan Halaman dan Navigasi

### Umum
- `/login`
- `/dashboard`
- `/profile`
- `/notifications` (opsional)

### Admin
- `/admin/users`
- `/admin/employees`
- `/admin/divisions`
- `/admin/positions`
- `/admin/settings`
- `/admin/audit-logs`

### HRD
- `/hrd/periods`
- `/hrd/kpi/categories`
- `/hrd/kpi/indicators`
- `/hrd/kpi/targets`
- `/hrd/kpi/achievements`
- `/hrd/reports`

### Supervisor
- `/supervisor/activities`
- `/supervisor/verifications`
- `/supervisor/team-performance`

### Employee
- `/employee/activities`
- `/employee/activities/new`
- `/employee/performance`

### Marketing
- `/marketing/oplah`
- `/marketing/clients`
- `/marketing/programs`
- `/marketing/profiling`
- `/marketing/offers`
- `/marketing/offers/[id]`

### TA — SPK (ditambahkan kemudian)
- `/hrd/spk/criteria`
- `/hrd/spk/weights`
- `/hrd/spk/calculations`
- `/hrd/spk/rankings`
- `/hrd/spk/results/[id]`

Halaman dapat dibatasi berdasarkan role meskipun berada dalam struktur route yang sama.

---

## 11. Kebutuhan Nonfungsional

### Keamanan
- Supabase Auth untuk autentikasi.
- Server-side authorization pada setiap operasi sensitif.
- RLS untuk tabel yang berisi data internal.
- Service role key hanya digunakan pada server dan tidak pernah dikirim ke browser.
- Validasi input di server.
- Lampiran internal disimpan pada bucket privat jika Supabase Storage digunakan.

### Kinerja dan keandalan
- Pagination untuk tabel data.
- Index pada foreign key, tanggal, status, employee, division, dan period.
- Query dibatasi sesuai filter dan hak akses.
- Error ditangani dengan pesan yang aman dan dapat ditindaklanjuti.
- Perhitungan KPI dapat ditelusuri kembali ke data sumber.

### Kemudahan penggunaan
- Tampilan responsif untuk desktop dan tablet.
- Form dibagi berdasarkan kelompok informasi.
- Status menggunakan label yang konsisten.
- Filter periode, divisi, karyawan, dan status.
- Konfirmasi sebelum tindakan yang mengubah atau menghapus data.

### Audit
- Simpan siapa membuat, mengubah, memverifikasi, dan kapan tindakan terjadi.
- Perubahan target, mapping, bobot, hasil verifikasi, dan hasil penilaian harus dapat ditelusuri.

---

## 12. Kriteria Penerimaan (Acceptance Criteria)

### Aktivitas
- Pengguna yang berhak dapat membuat aktivitas.
- Sistem menyimpan pemilik aktivitas dan penginput secara terpisah.
- Aktivitas baru berstatus pending.
- Employee tidak dapat memverifikasi aktivitas sendiri.
- Supervisor hanya dapat memverifikasi aktivitas sesuai cakupannya.
- Aktivitas approved masuk perhitungan hanya jika mapping dan periodenya valid.

### Penawaran
- Satu penawaran dapat memiliki lebih dari satu progress.
- Penawaran dapat ditetapkan Deal atau NO.
- Sistem menolak penyimpanan hasil NO tanpa alasan.
- Riwayat perubahan status penawaran dapat ditelusuri.

### KPI
- Target terhubung ke indikator dan periode.
- Sistem membedakan KPI perusahaan, divisi, dan individu.
- Realisasi hanya menggunakan sumber yang disetujui.
- HRD dapat melihat rincian sumber realisasi.

### Keamanan
- Pengguna tanpa hak tidak dapat membuka route atau melakukan request terlarang.
- Kebijakan RLS mencegah akses data lintas kewenangan.
- Kredensial rahasia tidak tersedia di client bundle.

---

## 13. Pengujian

1. **Black-box testing:** login, role, CRUD, validasi, verifikasi, penawaran, rekap.
2. **Integration testing:** aktivitas approved masuk KPI dan aktivitas pending/rejected tidak masuk.
3. **Data integrity testing:** foreign key, duplikasi, perubahan setelah approval, periode tutup.
4. **Security testing dasar:** akses route, endpoint, dan data berdasarkan role.
5. **UAT:** HRD, Supervisor, dan perwakilan karyawan mencoba skenario nyata.
6. **TA — SAW:** bandingkan setiap tahap matriks, normalisasi, nilai preferensi, dan ranking dengan perhitungan pembanding.

---

## 14. Data yang Harus Dikonfirmasi ke Mitra

Sebelum database dan rumus final dibakukan, minta:

- Daftar seluruh divisi, jabatan, karyawan, dan relasi Supervisor.
- Template spreadsheet penilaian yang sedang digunakan.
- Daftar KPI perusahaan, divisi, dan individu.
- Definisi, satuan, target, rumus, dan contoh penghitungan setiap KPI.
- Periode penilaian dan aturan penutupan periode.
- Bobot dan pihak yang berwenang menetapkannya.
- Data historis beberapa periode untuk pengujian.
- Format pencatatan oplah dan definisi sumber agen/loper/pembaca.
- Format List Client, program/barter, profiling, proposal, progress, Deal/NO.
- Kategori resmi alasan NO.
- Aturan verifikasi dan bukti pendukung.
- Aturan koreksi data setelah disetujui.
- Rentang predikat nilai.

Gunakan data perusahaan hanya dengan izin. Samarkan identitas karyawan untuk dokumen akademik jika identitas asli tidak dibutuhkan.

---

## 15. Roadmap Implementasi

| Tahap | Pekerjaan | Hasil |
|---|---|---|
| 0 | Validasi mitra dan kebutuhan | Daftar KPI, aturan, contoh data |
| 1 | Setup Astro SSR dan Supabase | Fondasi proyek |
| 2 | Auth, role, master karyawan/divisi | Manajemen akses dan master |
| 3 | Periode dan master KPI | Konfigurasi KPI |
| 4 | Modul Marketing | Aktivitas dan transaksi Marketing |
| 5 | Verifikasi dan integrasi KPI | Realisasi KPI dasar |
| 6 | Dashboard dan laporan MKI | Sistem MKI siap diuji |
| 7 | Modul SAW untuk TA | SPK dan ranking |
| 8 | Pengujian dan dokumentasi | Bukti uji dan laporan |

### Prioritas pengerjaan

Bangun satu alur vertikal sampai selesai terlebih dahulu: login → input aktivitas → verifikasi Supervisor → mapping KPI → realisasi → rekap HRD. Setelah alur tersebut stabil, lengkapi submodul Marketing lainnya. Jangan membangun seluruh dashboard sebelum alur data utama benar.

---

## 16. Keputusan yang Sudah Diketahui dan Asumsi

### Keputusan yang sudah diberikan
- Website internal untuk satu perusahaan.
- Cakupan modul direncanakan untuk seluruh divisi.
- Marketing memiliki kebutuhan operasional khusus.
- Employee dan Supervisor sama-sama dapat menginput aktivitas.
- Supervisor melakukan verifikasi.
- Alasan NO wajib diisi.
- Periode penilaian dipilih HRD.
- KPI mencakup tingkat perusahaan, divisi, dan individu.
- Hasil penilaian menggunakan nilai numerik dan predikat.
- Teknologi: Astro SSR dan Supabase.
- Arah TA: SPK penilaian KPI dengan metode SAW.

### Belum final — wajib validasi
- Daftar nama divisi dan struktur organisasi.
- Daftar indikator KPI resmi dan definisinya.
- Rumus, target, satuan, dan bobot KPI.
- Kriteria benefit/cost.
- Aturan detail oplah dan program/barter.
- Kategori alasan NO.
- Kebijakan bukti aktivitas dan self-verification.
- Rentang predikat nilai.
- Kebijakan periode dan koreksi data.

---

## 17. Definisi Selesai untuk Rilis MKI

Rilis MKI dapat dinyatakan memenuhi ruang lingkup awal jika:

- Pengguna dapat login dan hanya mengakses fitur sesuai role.
- Master karyawan, divisi, jabatan, periode, dan KPI dapat dikelola.
- Aktivitas Marketing dapat dicatat dan diverifikasi.
- Alur penawaran dan kewajiban alasan NO berjalan.
- Aktivitas approved terhubung dengan realisasi KPI sesuai mapping.
- HRD dapat melihat rekap KPI dasar.
- Pengujian alur utama dan pembatasan akses terdokumentasi.
- Data uji dan aturan bisnis telah divalidasi bersama mitra.

**Catatan akademik:** judul dan metode final tetap mengikuti persetujuan dosen pembimbing serta pedoman program studi.
