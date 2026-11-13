# PRD — Sistem Informasi Pencatatan Aktivitas, Monitoring Target & Penilaian Kinerja Karyawan
## (Studi Kasus: Divisi Pemasaran & Sirkulasi PT Kediri Intermedia Pers — Jawa Pos Radar Kediri)

> **Dokumen Induk Resmi (Master PRD) v3.0**  
> **Platform:** Website Internal & Portal Karyawan (Responsive Desktop & Mobile)  
> **Framework:** Astro (SSR via `@astrojs/node`) + TypeScript + Tailwind CSS  
> **Database & Autentikasi:** Supabase (PostgreSQL + Auth RLS) dengan Mode Hybrid  
> **Fokus Divisi:** 100% Khusus Divisi Pemasaran & Sirkulasi PT Kediri Intermedia Pers  
> **Cakupan Wilayah:** 7 Wilayah Edar (Kota Kediri, Kab. Kediri, Nganjuk, Tulungagung, Kota Blitar, Kab. Blitar, Trenggalek)  
> **Dual Mode Arsitektur:** MKI Mode (Operasional Lapangan & Monitoring Target) & TA Mode (SPK SAW 6 Kriteria + 5 Fitur Kebaruan)  
> **Format Ekspor:** Berkas Excel terstruktur (`.xlsx`) resmi berjenjang dan CSV  

---

## 1. Ringkasan Eksekutif & Batasan Ruang Lingkup

Sistem Informasi Pencatatan Aktivitas, Monitoring Target, dan Evaluasi Kinerja ini dikembangkan secara spesifik dan berfokus penuh pada **1 (satu) divisi operasional**, yaitu **Divisi Pemasaran & Sirkulasi PT Kediri Intermedia Pers (Jawa Pos Radar Kediri)**.

Sistem ini **tidak mencakup divisi non-komersial** (seperti Redaksi, Percetakan, Keuangan Umum, atau IT), melainkan murni mengelola rantai bisnis periklanan dan peredaran koran:
1. **Sirkulasi & Distribusi Oplah Koran:** Pencatatan pengiriman oplah harian kepada agen, loper, sub-agen, pengecer, dan langganan instansi di 7 wilayah edar karesidenan Kediri dan Blitar.
2. **Kunjungan & Prospek Klien:** Pencatatan tahapan interaksi lapangan, audiensi dengan kepala dinas/organisasi perangkat daerah (OPD), presentasi rencana advertorial kepada BUMN/BUMD, serta penawaran ruang promosi ke pelaku korporasi dan UMKM.
3. **Pengajuan Proposal Penawaran Iklan:** Administrasi pengajuan tarif iklan display koran, advertorial liputan seremonial, suplemen edisi khusus, kerja sama event daerah, dan publikasi multimedia digital.
4. **Verifikasi Bukti Berkas HRD:** Pemeriksaan kelayakan berkas, keaslian foto kegiatan di lapangan, nota pembayaran oplah, surat tanda terima proposal penawaran, serta penentuan hasil kesepakatan (*Deal / Batal*).
5. **Monitoring Ketercapaian Target (Model Tab):** Pengawasan berkala realisasi target kolektif divisi maupun target khusus perorangan staf melalui antarmuka berbasis tab yang interaktif.
6. **Evaluasi Objektif Bulanan:** Rekapitulasi persentase ketercapaian target kuantitatif (fokus MKI) dan pemeringkatan berbasis metode *Simple Additive Weighting* (SAW) 6 kriteria (fokus Tugas Akhir).

---

## 2. Arsitektur Dual Mode (Pemisahan MKI vs TA)

Sistem dirancang dengan konfigurasi terpusat pada `src/lib/config.ts` untuk memisahkan secara tegas antara kebutuhan **Magang Kerja Industri (MKI)** dan **Tugas Akhir (TA)**:

```typescript
// src/lib/config.ts
export const APP_MODE: "MKI" | "TA" = "MKI";
export const ENABLE_SPK: boolean = APP_MODE === "TA";
```

### 2.1 Mode MKI (`APP_MODE = "MKI"`) — Fokus Operasional & Monitoring
* **Tujuan:** Menyelesaikan persoalan nyata di lapangan: pencatatan digital mobile, verifikasi bukti foto/nota oleh HRD, penetapan target bersama & individu, monitoring capaian real-time, dan ekspor laporan Excel.
* **Tampilan HRD:** Ramping dengan 5 menu utama (Dashboard HRD, Antrean Verifikasi, Data Personel, Target Operasional, Realisasi Capaian, Rekapitulasi Laporan).
* **Fitur SPK:** Menu SPK SAW disembunyikan sepenuhnya dari navigasi agar tidak tumpang tindih dengan sidang magang.

### 2.2 Mode TA (`APP_MODE = "TA"`) — Kebaruan Ilmiah & Riset DSS
* **Tujuan:** Menjawab kontribusi akademis tugas akhir dengan 5 kebaruan sistem pendukung keputusan (*Decision Support System*):
  1. *Decision & Reward Engine:* Rekomendasi otomatis pemberian reward/apresiasi berbasis kuadran kinerja.
  2. *Interactive Weight Simulator:* Simulasi perubahan bobot kriteria secara real-time sebelum disahkan.
  3. *Head-to-Head Radar Chart:* Visualisasi perbandingan multi-dimensi antar staf pemasaran.
  4. *Employee Performance Report Card:* Rapor komprehensif perorangan yang memadukan capaian target dan nilai preferensi SAW.
  5. *Frozen Period Snapshot:* Penguncian data dan matriks keputusan periode tertutup untuk integritas audit akademik.

---

## 3. Struktur Pengguna & Matriks Hak Akses (3 Role Resmi)

Sistem menerapkan prinsip *Role-Based Access Control* (RBAC) ketat dengan pemisahan domain yang jelas:

| Role | Aktor Pengguna | Lingkup Tanggung Jawab & Hak Akses Fitur |
|---|---|---|
| **Super Admin (`admin`)** | **Manajemen Puncak & IT Administrator** | - Mengelola status aktif/nonaktif akun pengguna sistem.<br>- Mengubah peran akun antara `employee` dan `hrd` (dilengkapi proteksi anti-self-lockout).<br>- Menata master data personel kepegawaian dan struktur jabatan fungsional.<br>- Mengakses log audit sistem, pengaturan aplikasi, dan verifikasi darurat.<br>- Mengunduh laporan eksekutif korporat format Excel. |
| **Admin HRD (`hrd`)** | **Personalia & Supervisor Divisi Pemasaran** | - Memverifikasi bukti aktivitas lapangan harian staf (Setujui, Minta Revisi, Tolak).<br>- Menentukan status akhir penawaran iklan (*Deal* bernilai omzet atau *Batal* berpenjelasan).<br>- Menetapkan nilai Target Bersama Divisi maupun Target Khusus Individu Staf.<br>- Memantau ketercapaian target melalui halaman Realisasi Capaian model tab.<br>- Mengunduh rekapitulasi laporan kinerja bulanan divisi format Excel (.xlsx). |
| **Pengguna Karyawan (`employee`)** | **Staf Lapangan Divisi Pemasaran & Sirkulasi** *(Account Executive, Staf Oplah, dll.)* | - Mengakses Portal Karyawan mandiri berbasis navbar horizontal (tanpa sidebar admin).<br>- Mencatat 3 kegiatan lapangan utama secara cepat dan melampirkan foto bukti.<br>- Memantau riwayat aktivitas harian dan memperbaiki berkas yang diminta revisi.<br>- Memantau progres capaian target dinamis yang ditetapkan HRD.<br>- Mengakses modul operasional marketing dan dokumentasi alur kerja/SOP.<br>- Menerima notifikasi lonceng saat target ditetapkan atau laporan disetujui/direvisi. |

---

## 4. Master Data Khusus Divisi Pemasaran

### 4.1 Entitas Divisi Tunggal
* **ID:** `DIV-MKT`
* **Kode:** `MKT`
* **Nama Resmi:** `Divisi Pemasaran & Sirkulasi`
* **Wilayah Kerja:** 7 Wilayah Edar Radar Kediri (Kota Kediri, Kab. Kediri, Nganjuk, Tulungagung, Kota Blitar, Kab. Blitar, Trenggalek).

### 4.2 Struktur Jabatan Fungsional
1. **Manajer Pemasaran (`POS-MGR`):** Penanggung jawab umum omzet iklan koran, edisi khusus, dan sirkulasi oplah.
2. **Supervisor Marketing (`POS-SPV`):** Pembimbing tim lapangan, pengarah negosiasi penawaran iklan, dan verifikator operasional.
3. **Account Executive / Eksekutif Iklan (`POS-EXM`):** Staf garda terdepan periklanan display, advertorial seremonial, dan program kemitraan.
4. **Staf Sirkulasi & Oplah (`POS-OPL`):** Pengelola distribusi fisik koran, koordinasi loper/agen koran, dan pemantauan retur.
5. **Admin Operasional Marketing (`POS-ADM`):** Penata kelola administrasi surat penawaran, jadwal edisi khusus, dan arsip bukti muat koran.

---

## 5. Rincian Modul & Alur Operasional (Core Features)

### 5.1 Portal Karyawan & Formulir 3 Kegiatan Lapangan
Formulir pencatatan aktivitas lapangan karyawan (`/catat-aktivitas`) telah disederhanakan menjadi **3 kategori pekerjaan lapangan riil**:

1. **Distribusi & Sirkulasi Oplah Koran (`oplah`):**
   * *Input data:* Tanggal, sumber distribusi (Agen, Loper, Pembaca Langganan), nama agen/mitra, jumlah eksemplar koran, foto bukti distribusi/nota.
   * *Output:* Berkontribusi langsung ke target kuantitatif Oplah Koran Divisi.
2. **Kunjungan & Prospek Klien (`progress`):**
   * *Input data:* Tanggal, instansi/klien yang dikunjungi, jenis interaksi (Pertemuan Awal, Audiensi Pimpinan, Negosiasi Proposal), deskripsi pembahasan, foto pertemuan/kartu nama PIC.
   * *Output:* Berkontribusi ke target aktivitas kunjungan lapangan.
3. **Pengajuan Proposal Penawaran Iklan (`offer`):**
   * *Input data:* Tanggal, klien/mitra sasaran, program/paket iklan (Advertorial, Display, Suplemen), estimasi nilai penawaran (Rupiah), foto tanda terima berkas proposal.
   * *Output:* Berkontribusi ke target volume pengajuan proposal.

> **Catatan Alur Deal/Batal:** Staf tidak perlu memilih opsi penutupan hasil secara terpisah. Penentuan apakah penawaran berujung *Deal* (kontrak sah) atau *Batal* divalidasi oleh HRD pada proses verifikasi penawaran.

### 5.2 Alur Kerja Verifikasi HRD & Supervisor
1. Laporan baru masuk ke antrean verifikasi (`/hrd/verifications`) dengan status `pending`.
2. Lonceng notifikasi HRD menyala merah memberitahukan adanya laporan masuk.
3. HRD memeriksa kesesuaian deskripsi dan bukti dokumen/foto.
4. **Opsi Verifikasi:**
   * **Setujui (`approved`):** Data sah. Angka otomatis diakumulasikan ke realisasi target kinerja dan lonceng notifikasi karyawan menyala hijau.
   * **Minta Revisi (`revision`):** HRD wajib menyertakan catatan koreksi (minimal 5 karakter). Status berubah menjadi `revision`, notifikasi masuk ke karyawan untuk diperbaiki via `/employee/activities/[id]`, lalu dapat diajukan kembali (`resubmit`).
   * **Tolak (`rejected`):** HRD menyertakan alasan penolakan. Data tidak dihitung ke akumulasi capaian.

### 5.3 Manajemen Target Operasional (`/hrd/kpi/targets`)
HRD dan Super Admin memiliki wewenang penuh mengatur target operasional untuk periode aktif:
* **Target Bersama (Kolektif Divisi):** Dibebankan kepada seluruh tim pemasaran (contoh: Target Oplah 500 eksemplar, Target Nilai Deal Rp35.000.000).
* **Target Individu (Khusus Staf):** Dibebankan spesifik kepada staf perorangan (contoh: Target Fara Dilla mengirimkan 15 proposal).
* **Fitur Manajemen:**
  * Tambah target baru melalui panel kanan.
  * Ubah target di tempat (*update in-place* via `targetId`, mencegah bug duplikasi baris).
  * Hapus target operasional dengan modal konfirmasi keamanan.
  * Kartu target pada Beranda Karyawan murni dinamis membaca data yang ditetapkan HRD.

### 5.4 Monitoring Realisasi Capaian Model Tab (`/hrd/kpi/achievements`)
Halaman pemantauan realisasi dirancang berbasis **2 Tab Navigasi Terintegrasi**:
* **Tab 1: Target Bersama (Kolektif Divisi):**
  * Kartu metrik: Total Target Bersama, Rata-rata Capaian Divisi (%), Target Tercapai ($\ge 100\%$), dan Total Log Disetujui.
  * Tabel capaian bersama dilengkapi visual progress bar warna dinamis, status lencana (*Tercapai, Progres Baik, Berjalan, Belum Ada Realisasi*), dan tombol *Sumber &rarr;* menuju rincian log aktivitas penyumbang.
* **Tab 2: Target Individu (Khusus Staf):**
  * Filter cepat per nama staf pemasaran.
  * Kartu metrik: Jumlah Staf Ber-Target, Rata-rata Capaian Staf (%), dan Target Individu Terpenuhi.
  * Tabel kinerja perorangan staf pemasaran.
  * Kotak informatif daftar nama staf yang belum memiliki target individu khusus beserta tombol cepat *Beri Target*.

### 5.5 Rekapitulasi Laporan Bulanan (`/hrd/reports`)
* Tabel rekapitulasi performa staf pemasaran: Nama Staf, Total Diajukan, Menunggu HRD, Disetujui, Perlu Revisi, Ditolak, dan Capaian Rata-Rata.
* Bebas dari tabel usang rekap jenis aktivitas yang tidak relevan.
* Tombol **Unduh Excel (.xlsx)** resmi dan **Unduh CSV**.

### 5.6 Sistem Notifikasi Lonceng Real-Time
* Notifikasi terisolasi per akun melalui tracking cookie `rk_notif_read_${user.id}`.
* Kalkulasi `maxTime` otomatis saat tombol *"Tandai Semua Sudah Dibaca"* ditekan, menjamin angka lonceng langsung menjadi 0 dan titik merah tereset tuntas.
* Tampilan Pusat Notifikasi (`/notifications`):
  * Akun Karyawan: Menggunakan `PublicLayout` horizontal (bebas dari sidebar admin).
  * Akun HRD/Admin: Menggunakan `DashboardLayout` dasbor personalia.

---

## 6. Spesifikasi SPK SAW (Modul Khusus TA)

Pada mode Tugas Akhir (`APP_MODE = "TA"`), sistem mengaktifkan kalkulasi matematis **Simple Additive Weighting (SAW)** dengan 6 kriteria:

| Kode | Kriteria Penilaian | Sifat | Bobot ($W_j$) | Sumber Data Realisasi Terverifikasi |
|---|---|:---:|:---:|---|
| **$C_1$** | Klien Baru Terdaftar | **Benefit** | **15% (0.15)** | Total pendaftaran klien baru yang disetujui HRD. |
| **$C_2$** | Proposal Iklan Dikirim | **Benefit** | **20% (0.20)** | Total berkas penawaran iklan yang disetujui HRD. |
| **$C_3$** | Kesepakatan Deal Tercapai | **Benefit** | **30% (0.30)** | Total penawaran yang divalidasi deal oleh HRD. |
| **$C_4$** | Riset & Profiling Pasar | **Benefit** | **10% (0.10)** | Total dokumen profiling potensi anggaran klien. |
| **$C_5$** | Kunjungan & Prospek Lapangan | **Benefit** | **15% (0.15)** | Total log kunjungan dan audiensi yang disetujui. |
| **$C_6$** | Laporan Ditolak / Direvisi | **Cost** | **10% (0.10)** | Akumulasi berkas kerja yang ditolak atau diminta revisi. |

### Formula Perhitungan:
1. **Normalisasi Matriks ($R$):**
   - Kriteria Benefit ($C_1 - C_5$):
     $$r_{ij} = \frac{x_{ij}}{\max_i(x_{ij})}$$
   - Kriteria Cost ($C_6$):
     $$r_{ij} = \frac{\min_i(x_{ij})}{x_{ij}}$$
2. **Nilai Preferensi Akhir ($V_i$):**
   $$V_i = \sum_{j=1}^{6} w_j \cdot r_{ij}$$
3. **Predikat Kinerja Resmi:**
   - **Sangat Baik:** $0.90 \le V_i \le 1.00$
   - **Baik:** $0.75 \le V_i < 0.90$
   - **Cukup:** $0.60 \le V_i < 0.75$
   - **Kurang:** $V_i < 0.60$

---

## 7. Arsitektur Rute & Halaman Sistem

Seluruh sistem menggunakan *Clean URL Route* tanpa tanda pagar (`#`):

### 7.1 Rute Portal Karyawan (Mobile & Desktop Friendly)
* `/` — **Beranda Portal:** Ringkasan metrik pribadi, target aktif dari HRD, status pengajuan, dan kartu aksi cepat.
* `/catat-aktivitas` — **Formulir 3 Kegiatan Lapangan:** Form pencatatan oplah, kunjungan prospek, dan proposal penawaran iklan.
* `/aktivitas-saya` — **Riwayat Aktivitas:** Tabel log pekerjaan dengan filter status verifikasi.
* `/kinerja` — **Capaian Target:** Pemantauan progres pemenuhan target bersama dan target personal staf.
* `/modul-marketing` — **Pusat Modul Operasional:** Modul pendukung (Sirkulasi Oplah, List Klien, Penawaran, Profiling, Program).
* `/alur-kerja` — **Panduan SOP:** Prosedur standar kerja lapangan Divisi Pemasaran Radar Kediri.
* `/notifications` — **Pusat Notifikasi Karyawan:** Riwayat pemberitahuan persetujuan dan target baru ber-layout topbar.
* `/profile` — **Profil Pengguna:** Data kepegawaian staf dan penautan akun Google OAuth.

### 7.2 Rute Dasbor HRD & Manajemen
* `/dashboard` — **Dasbor HRD:** Ringkasan kinerja divisi, antrean pending verifikasi, dan metrik operasional.
* `/hrd/verifications` & `/hrd/verifications/[id]` — **Antrean Verifikasi:** Modal inspeksi berkas bukti dan tombol Setujui/Revisi/Tolak.
* `/hrd/kpi/targets` — **Target Operasional:** Penetapan Target Bersama dan Target Khusus Individu, ubah in-place, dan hapus target.
* `/hrd/kpi/achievements` & `/hrd/kpi/achievements/[id]` — **Realisasi Capaian:** Model Tab (Bersama & Individu) dan drill-down bukti sumber.
* `/hrd/reports` — **Rekapitulasi Laporan Bulanan:** Rekap performa seluruh staf dan ekspor Excel/CSV.
* `/hrd/spk/calculations` *(Mode TA)* — **Kalkulasi SAW:** Matriks keputusan, matriks normalisasi, dan perankingan preferensi $V_i$.
* `/hrd/spk/results/[id]` *(Mode TA)* — **Pengesahan SAW:** Rincian perhitungan periode dan penguncian hasil penilaian.

### 7.3 Rute Administrasi Sistem (Super Admin)
* `/admin/users` — **Manajemen Pengguna:** Akun login digital, toggle aktif/nonaktif, ubah peran employee/hrd (proteksi self-lockout).
* `/admin/employees` — **Data Personel:** Database institusional pegawai, NIP, divisi pemasaran, dan jabatan fungsional.
* `/admin/audit-logs` — **Log Audit:** Jejak rekam keamanan seluruh perubahan data penting pada sistem.
* `/admin/settings` — **Pengaturan Aplikasi:** Konfigurasi parameter umum sistem.

### 7.4 Endpoint API Terintegrasi
* `POST /api/activities` — Menyimpan pelaporan aktivitas lapangan baru.
* `POST /api/activities/[id]` — Mengajukan kembali laporan setelah revisi (*resubmit*).
* `POST /api/hrd/verifications/[id]` — Memproses keputusan verifikasi berkas HRD.
* `POST /api/hrd/targets/save` — Menyimpan/memperbarui target operasional *in-place*.
* `POST /api/hrd/targets/delete` — Menghapus target operasional dari periode aktif.
* `POST /api/notifications/mark-read` — Mereset status baca notifikasi per user.
* `GET /api/export/excel?type=[employee|hrd|admin]` — Generator berkas Excel biner resmi (`.xlsx`).

---

## 8. Standar Keamanan & Keandalan Transaksi

1. **Server-Side Authorization:** Seluruh pembatasan peran dan akses halaman divalidasi pada level server (`Astro.locals.user` dan middleware), bebas dari manipulasi manipulasi skrip sisi klien.
2. **Proteksi Anti-Self-Lockout Super Admin:** Sistem secara tegas memblokir penonaktifan atau penurunan peran akun Super Admin yang sedang aktif demi integritas hak akses.
3. **Integritas Periode Tertutup:** Periode berstatus `closed` secara otomatis mengunci seluruh aktivitas, verifikasi, dan target dari perubahan susulan.
4. **Audit Trail Komprehensif:** Setiap tindakan login, registrasi, pembuatan aktivitas, keputusan verifikasi, hingga penetapan target dicatat ke tabel `audit_logs`.

---

> **PENGESAHAN:**  
> Dokumen Master PRD v3.0 ini telah diselaraskan 100% dengan kondisi kode program berjalan (*production-ready*) dan siap dipergunakan sebagai panduan implementasi resmi di **PT Kediri Intermedia Pers (Jawa Pos Radar Kediri)** serta dokumen pertanggungjawaban Magang Kerja Industri dan Tugas Akhir.
