# PRD — Sistem Informasi Manajemen Aktivitas & Monitoring Operasional
## (Studi Kasus: Divisi Pemasaran & Sirkulasi PT Kediri Intermedia Pers — Jawa Pos Radar Kediri)

> **Dokumen Resmi:** Product Requirement Document (PRD) — Tahap Magang Kerja Industri (MKI)  
> **Versi:** 1.0 (Khusus MKI — Operasional & Monitoring)  
> **Status:** Siap Uji & Implementasi Magang  
> **Platform:** Web Responsive (Desktop & Mobile)  
> **Stack:** Astro (SSR) + Tailwind CSS + Supabase / PostgreSQL  
> **Fokus Divisi:** 100% Tunggal — Divisi Pemasaran & Sirkulasi Jawa Pos Radar Kediri  

---

## 1. Latar Belakang & Masalah Nyata di Tempat Magang

PT Kediri Intermedia Pers (Jawa Pos Radar Kediri) memiliki mobilitas tim pemasaran dan sirkulasi yang sangat tinggi di 7 wilayah edar (Kota Kediri, Kab. Kediri, Nganjuk, Tulungagung, Kota Blitar, Kab. Blitar, dan Trenggalek).

Selama pelaksanaan Magang Kerja Industri (MKI), ditemukan permasalahan operasional utama:
1. **Pencatatan Lapangan Masih Tercecer:** Laporan harian distribusi oplah, kunjungan dinas/OPD, prospek pengiklan UMKM/korporasi, dan pengajuan proposal iklan dicatat melalui kertas rekap fisik atau chat WhatsApp grup yang rawan hilang.
2. **Ketiadaan Validasi Bukti Berkas Terpusat:** HRD dan Supervisor kesulitan memverifikasi apakah kunjungan sales benar-benar terlaksana, apakah foto bukti tayang koran valid, atau bukti nota kesepakatan sudah lengkap.
3. **Rekapitulasi Manual Akhir Bulan:** Di akhir bulan, HRD harus memilah ratusan chat dan kertas formulir secara manual ke dalam lembar kerja spreadsheet untuk melihat rekapitulasi capaian target.

---

## 2. Tujuan Pengembangan Sistem (Fokus MKI)

1. Membangun portal pencatatan aktivitas terpusat berbasis web mobile-friendly untuk karyawan Divisi Pemasaran & Sirkulasi.
2. Menyediakan modul antrean verifikasi berkas (*Approval Workflow*) bagi HRD untuk memeriksa dan memvalidasi kelayakan bukti kerja lapangan.
3. Menyediakan dashboard monitoring progres target harian/bulanan secara real-time.
4. Menyediakan fitur ekspor data rekapitulasi operasional ke dalam format Excel (`.xlsx`) standar perusahaan.

> [!IMPORTANT]
> **Batasan Ruang Lingkup MKI:**  
> Sistem pada tahap MKI **tidak mencakup kalkulasi Sistem Pendukung Keputusan (SPK) ataupun perankingan otomatis**. Evaluasi akhir pada tahap ini murni berupa rekapitulasi data aktivitas yang telah disetujui (Approved) dan pencatatan capaian target kuantitatif (persentase capaian target).

---

## 3. Hak Akses & Peran Pengguna (3 Role Resmi)

Sistem membagi tugas secara tegas antara tata kelola IT, operasional verifikasi personalia, dan pelaporan lapangan:

| Role | Aktor Pengguna di Kantor | Fokus & Batasan Akses di Sistem | Tanggung Jawab Operasional |
| :--- | :--- | :--- | :--- |
| **Super Admin (`admin`)** | **Bagian IT / Administrator Sistem Utama** | **Akses Penuh Seluruh Sistem:**<br>- Mengelola status akun pengguna (Aktif/Nonaktif).<br>- Menetapkan peran akun (`employee` atau `hrd`).<br>- Mengatur struktur jabatan Divisi Pemasaran.<br>- Memegang Log Audit Keamanan Sistem.<br>- Akses verifikasi darurat dan rekap eksekutif. | Menjaga stabilitas aplikasi, mengontrol akses akun karyawan baru/keluar, dan mencegah manipulasi data. *(Dilarang mengubah status/role akun sendiri demi integritas sistem).* |
| **Admin HRD / Personalia (`hrd`)** | **Staf / Kepala Bagian Personalia (HRD & Umum)** | **Fokus Khusus Verifikasi & Laporan (5 Menu Ramping):**<br>- Dashboard Kinerja HRD.<br>- Antrean Verifikasi Bukti Berkas Lapangan.<br>- Basis Data Personel Pemasaran.<br>- Penetapan Target Kuantitatif Divisi.<br>- Ekspor Rekapitulasi Laporan Bulanan (.xlsx). | Memvalidasi keaslian nota/foto lapangan, meminta revisi jika bukti tidak lengkap, menentukan target kerja bulanan, dan menerbitkan rekapitulasi kinerja bulanan ke Direksi. *(Tidak mengurusi server, peran akun, atau audit log).* |
| **Pengguna Karyawan (`employee`)** | **Staf Pemasaran & Sirkulasi Lapangan** (Account Executive, Staf Oplah, dll.) | **Portal Lapangan Responsif:**<br>- Form Catat 7 Aktivitas Pemasaran.<br>- Unggah Foto Bukti & Dokumen.<br>- Riwayat Aktivitas & Status Validasi.<br>- Monitoring Capaian Target Pribadi.<br>- Ekspor Rapor Kinerja Pribadi (.xlsx). | Mencatat seluruh progres harian di lapangan secara disiplin dan memperbaiki laporan jika diminta revisi oleh HRD. |

---

## 4. Rincian Modul & Fitur Sistem (MKI)

### 4.1 Modul Karyawan: Pencatatan 7 Aktivitas Operasional Pemasaran
Karyawan dapat mencatat 7 jenis transaksi operasional lapangan dengan format data terstandarisasi:
1. **Distribusi & Oplah Sirkulasi:** Pencatatan jumlah koran dikirim ke agen/loper, retur koran, dan penambahan langganan baru.
2. **Database Klien & Mitra Iklan:** Registrasi profil pengiklan baru (Dinas Pemerintahan, BUMN, Swasta, UMKM).
3. **Pengajuan Proposal Penawaran Iklan:** Input nomor penawaran, jenis materi (display, advertorial, suplemen), nominal tarif, dan tanggal kirim.
4. **Progres Kunjungan & Follow-Up:** Log audiensi dengan pimpinan instansi, presentasi proposal, dan negosiasi.
5. **Riset & Profiling Pasar:** Pencatatan potensi anggaran promosi klien dan kompetitor.
6. **Program, Event & Barter Promosi:** Pengajuan kerja sama publikasi acara daerah / pameran.
7. **Status Kesepakatan (Closing Deal / Penolakan):** Pencatatan deal penayangan iklan atau dokumentasi alasan objektif jika penawaran ditolak mitra.

Setiap formulir dilengkapi input: Tanggal, Lokasi/Wilayah Edar, Deskripsi Kegiatan, Nilai/Volume, dan **Unggah Bukti Fisik/Foto/Dokumen**.

### 4.2 Modul HRD: Verifikasi Berkas Terpadu (*Approval System*)
- **Antrean Berkas Real-Time:** Menampilkan daftar aktivitas yang membutuhkan verifikasi HRD dengan status *Menunggu Verifikasi*.
- **Review Detail & Bukti:** Modal dialog untuk memeriksa bukti foto, catatan karyawan, dan kelayakan dokumen.
- **Aksi Verifikasi:**
  - `Setujui`: Aktivitas sah dan langsung diakumulasikan ke realisasi indikator target.
  - `Minta Revisi`: Memberikan catatan revisi kepada karyawan (karyawan dapat mengedit ulang).
  - `Tolak`: Aktivitas dibatalkan dengan alasan terdokumentasi.

### 4.3 Modul Manajemen Target & Capaian (Monitoring Manual)
- Input target bulanan untuk Divisi Pemasaran (misal: Target Oplah 500 eksemplar, Target Pendapatan Iklan Rp1,5 Miliar).
- Indikator capaian persentase otomatis:
  $$\text{Persentase Capaian} = \left(\frac{\text{Total Realisasi Disetujui}}{\text{Target}}\right) \times 100\%$$
- Grafik tren aktivitas harian per wilayah edar.

### 4.4 Modul Rekapitulasi & Ekspor Laporan Excel
- Filter rekapitulasi berdasarkan: Periode Bulan/Tahun, Karyawan, dan Jenis Aktivitas.
- Unduh lembar kerja Excel berformat rapi (`.xlsx`):
  - Sheet 1: Rangkuman Statistik Capaian Karyawan.
  - Sheet 2: Rincian Seluruh Transaksi Aktivitas yang Disetujui.

---

## 5. Batasan & Indikator Keberhasilan MKI

### 5.1 Batasan Masalah MKI
1. Sistem hanya mencakup alur pencatatan, verifikasi, monitoring target kuantitatif, dan ekspor laporan rekapitulasi.
2. Tidak terdapat pemodelan perankingan berbasis kriteria majemuk atau algoritma pendukung keputusan (SPK).
3. Penilaian kinerja akhir untuk reward/insentif karyawan masih diserahkan kepada kebijakan rekapitulasi manual oleh HRD/Manajemen.

### 5.2 Indikator Keberhasilan MKI
1. Seluruh staf Divisi Pemasaran & Sirkulasi dapat melakukan pelaporan harian dari smartphone secara tertib.
2. HRD dapat memvalidasi bukti fisik tanpa ada berkas yang hilang atau tercecer.
3. Proses rekapitulasi laporan bulanan yang semula memakan waktu 3–5 hari manual tereduksi menjadi ekspor 1-klik di sistem.

