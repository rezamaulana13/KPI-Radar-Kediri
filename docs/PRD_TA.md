# PRD — Sistem Pendukung Keputusan (SPK) Evaluasi & Rekomendasi Kinerja Karyawan Berbasis Metode SAW
## (Studi Kasus: Divisi Pemasaran & Sirkulasi PT Kediri Intermedia Pers — Jawa Pos Radar Kediri)

> **Dokumen Resmi:** Product Requirement Document (PRD) — Tahap Tugas Akhir (TA) / Skripsi  
> **Versi:** 2.0 (Khusus TA — Pengembangan Lanjutan & DSS Intelligence)  
> **Status:** Riset Ilmiah & Implementasi Tugas Akhir  
> **Prasyarat Sistem:** Memperluas & Mengintegrasikan Sistem Pencatatan Operasional Hasil MKI  
> **Metodologi Ilmiah:** Simple Additive Weighting (SAW) + Sensitivity Analysis  

---

## 1. Latar Belakang Masalah Baru yang Ditemukan (Hasil Evaluasi MKI)

Pada tahap Magang Kerja Industri (MKI), sistem pencatatan operasional telah berhasil mendigitalisasi ratusan aktivitas kerja lapangan dan bukti fisik staf pemasaran. Namun, implementasi MKI memunculkan **permasalahan baru yang bersifat strategis dan manajerial**:

1. **Kompleksitas Evaluasi Multi-Kriteria:**
   Setiap peran staf pemasaran memiliki capaian yang bertolak belakang. Contoh: Karyawan A sangat aktif melakukan kunjungan prospek ($C_5$) dan input profiling pasar ($C_4$), tetapi minim deal closing ($C_3$). Sebaliknya, Karyawan B jarang kunjungan tetapi berhasil menutup deal bernilai besar. Manajemen kesulitan menentukan siapa karyawan dengan kontribusi terbaik secara adil karena setiap indikator memiliki nilai kepentingan berbeda.
2. **Subjektivitas & Bias Evaluasi Akhir:**
   Penentuan insentif bulanan dan nominasi staf teladan masih ditentukan berdasarkan rekap spreadsheet manual dan preferensi intuitif HRD/Manajer, sehingga memicu kecemburuan sosial antar staf lapangan.
3. **Ketiadaan Fitur Rekomendasi Keputusan & Simulasi:**
   Manajemen belum memiliki instrumen cerdas (*Decision Support System*) untuk melakukan simulasi skenario (*What-If Simulation*) bila prioritas bisnis berubah sewaktu-waktu (misal: saat fokus perusahaan bergeser dari akuisisi iklan koran cetak ke iklan suplemen/event).
4. **Karyawan Tidak Memiliki Feedback Kinerja Terstruktur:**
   Karyawan hanya mengetahui aktivitasnya disetujui/ditolak, tanpa memahami kelemahan kinerjanya atau perbandingan capaian dirinya terhadap standar divisi.

---

## 2. Tujuan Penelitian & Pengembangan Fitur Baru (Fokus TA)

1. Menerapkan algoritma **Simple Additive Weighting (SAW)** untuk menyelesaikan masalah evaluasi multi-kriteria dengan normalisasi matriks dan pembobotan matematis objektif.
2. Membangun **5 Fitur Baru Berskala Sistem Pendukung Keputusan (DSS)** yang melengkapi sistem operasional MKI:
   - **Fitur 1: Decision & Reward Engine (Klasifikasi Predikat & Generator Rekomendasi SK)**
   - **Fitur 2: Interactive Sensitivity & Weight Simulation (Simulasi What-If Bobot Dinamis)**
   - **Fitur 3: Head-to-Head Performance Comparison (Komparasi Grafis Radar/Spider Chart)**
   - **Fitur 4: Raport Kinerja & Individual Feedback Portal Karyawan**
   - **Fitur 5: Audit Trail & Frozen Snapshot Penilaian Bulanan**

---

## 3. Matriks Perbedaan Fitur: MKI vs TA

| Modul / Fitur | Status di MKI (Magang) | Status di TA (Tugas Akhir) | Keterangan Peningkatan di TA |
| :--- | :---: | :---: | :--- |
| **Input 7 Aktivitas Lapangan** | Sudah Ada | Dipertahankan | Menjadi basis data primer (*raw data*) untuk penilaian SAW. |
| **Verifikasi Bukti Berkas HRD** | Sudah Ada | Dipertahankan | Status *Approved* menjadi syarat mutlak masuk matriks keputusan. |
| **Monitoring Target Persentase** | Sudah Ada | Dipertahankan | Menjadi data pembanding terhadap hasil perankingan SAW. |
| **Modul SPK SAW Matematis** | **Belum Ada** | **BARU (TA)** | Kalkulasi matriks $X$, normalisasi $R$, dan nilai preferensi $V_i$. |
| **Decision & Reward Engine** | **Belum Ada** | **BARU (TA)** | Pengelompokan predikat otomatis + cetak Surat Rekomendasi Direksi. |
| **Interactive Weight Simulator** | **Belum Ada** | **BARU (TA)** | Slider sensitivitas bobot interaktif *real-time* untuk analisis stabilitas. |
| **Head-to-Head Comparison** | **Belum Ada** | **BARU (TA)** | Visualisasi perbandingan multi-dimensi antar kandidat (Radar Chart). |
| **Raport Kinerja Karyawan** | **Belum Ada** | **BARU (TA)** | Halaman rapor analitis personal + rekomendasi perbaikan untuk karyawan. |
| **Frozen Period & Audit Trail** | **Belum Ada** | **BARU (TA)** | Penguncian hasil perankingan per bulan agar tidak dapat dimanipulasi. |

---

## 4. Rincian 5 Fitur Baru Khusus Tugas Akhir (TA)

### 4.1 Modul Inti SPK SAW: 6 Kriteria Pemasaran Radar Kediri
Kinerja dievaluasi secara periodik (1 bulan sekali) terhadap seluruh staf Divisi Pemasaran & Sirkulasi menggunakan 6 kriteria:

| Kode | Kriteria Evaluasi | Sifat | Bobot Awal ($w_j$) | Sumber Data Sistem |
| :---: | :--- | :---: | :---: | :--- |
| **$C_1$** | Klien Baru Terdaftar | Benefit | 15% (0.15) | Akumulasi registrasi klien baru yang *Approved*. |
| **$C_2$** | Penawaran Iklan Dikirim | Benefit | 20% (0.20) | Akumulasi berkas penawaran tarif yang *Approved*. |
| **$C_3$** | Kesepakatan Deal Tercapai | Benefit | 30% (0.30) | Akumulasi penawaran berstatus *Deal* bernilai kontrak. |
| **$C_4$** | Riset Profiling Pasar | Benefit | 10% (0.10) | Dokumen analisis potensi anggaran belanja mitra. |
| **$C_5$** | Progres Kunjungan Lapangan | Benefit | 15% (0.15) | Log interaksi, follow-up, dan audiensi pimpinan. |
| **$C_6$** | Aktivitas Ditolak / Revisi | Cost | 10% (0.10) | Jumlah berkas ditolak/revisi (indikator ketidakdisiplinan). |

Formulasi Matematis:
1. **Normalisasi:**
   $$r_{ij} = \begin{cases} \dfrac{x_{ij}}{\max_i(x_{ij})}, & \text{jika } j \text{ adalah kriteria Benefit } (C_1-C_5) \\ \dfrac{\min_i(x_{ij})}{x_{ij}}, & \text{jika } j \text{ adalah kriteria Cost } (C_6) \end{cases}$$
2. **Nilai Preferensi:**
   $$V_i = \sum_{j=1}^{6} w_j \cdot r_{ij}$$

---

### 4.2 FITUR BARU 1: Decision & Reward Engine
Sistem tidak hanya menghasilkan angka ranking, tetapi langsung memberikan luaran manajerial:
- **Konversi Predikat Otomatis:**
  - $V_i \ge 0.85$: **Sangat Baik** $\rightarrow$ Rekomendasi: Bonus Kinerja Maksimal & Sertifikat Staf Teladan.
  - $0.70 \le V_i < 0.85$: **Baik** $\rightarrow$ Rekomendasi: Insentif Standar Penuh.
  - $0.55 \le V_i < 0.70$: **Cukup** $\rightarrow$ Rekomendasi: Pemenuhan Target Tanpa Insentif Tambahan.
  - $V_i < 0.55$: **Kurang** $\rightarrow$ Rekomendasi: Surat Pembinaan & Evaluasi Kerja Lapangan.
- **Generator Surat Rekomendasi Eksekutif (PDF):**
  Sekali klik, sistem menghasilkan lembar rekomendasi keputusan resmi berlogo Radar Kediri untuk ditandatangani Manajer Pemasaran dan Direksi.

### 4.3 FITUR BARU 2: Interactive Sensitivity & Weight Simulation (Simulasi What-If)
Fitur unggulan untuk kebutuhan analisis ilmiah di Tugas Akhir:
- HRD / Penguji dapat menggeser *interactive range slider* bobot $C_1 - C_6$ secara langsung di antarmuka web.
- Sistem secara *asynchronous* menghitung ulang matriks preferensi dan menampilkan grafik pergeseran ranking secara visual.
- Membuktikan stabilitas metode SAW terhadap fluktuasi kebijakan bobot kriteria.

### 4.4 FITUR BARU 3: Head-to-Head Comparison (Radar/Spider Chart)
- Memilih 2 sampai 3 nama karyawan marketing untuk dikomparasi secara berdampingan.
- Menampilkan grafik radar dengan 6 sumbu kriteria ternormalisasi.
- Membantu manajemen memahami secara gamblang profil kelebihan dan kekurangan masing-masing kandidat promosi.

### 4.5 FITUR BARU 4: Raport Kinerja & Feedback Karyawan (Portal Karyawan)
- Karyawan memiliki menu baru: **"Raport Kinerja Saya"**.
- Menampilkan:
  - Nilai preferensi akhir pribadi dan predikat yang diperoleh.
  - Grafik *radar chart* capaian diri dibandingkan rata-rata divisi (tanpa menampilkan identitas nama rekan lain demi privasi).
  - Rekomendasi perbaikan otomatis: misal, *"Nilai $C_6$ Anda tinggi karena 4 aktivitas ditolak. Perbaiki kelengkapan foto nota untuk meningkatkan skor bulan depan."*

### 4.6 FITUR BARU 5: Frozen Snapshot Period & Audit Log
- HRD dapat melakukan aksi **"Kunci & Sahkan Periode"** (misal: Periode November 2026).
- Setelah dikunci, data penilaian SAW bulan tersebut di-*freeze* (bersifat *read-only* permanen) untuk mencegah manipulasi data historis, dilengkapi riwayat tanggal pengesahan dan akun HRD penanggung jawab.

---

## 5. Rencana Pengujian Ilmiah untuk Naskah Skripsi / TA

1. **Pengujian Fungsional (Black Box Testing):** Memastikan seluruh alur SPK, simulasi slider, dan generator PDF berjalan 100% tanpa galat.
2. **Pengujian Akurasi Algoritma:** Membandingkan perhitungan manual (Excel) dengan perhitungan sistem untuk membuktikan tingkat akurasi 100%.
3. **Pengujian Sensitivitas Bobot:** Meneliti sejauh mana perubahan bobot $10\% - 20\%$ memengaruhi perubahan susunan peringkat (disajikan dalam Bab 4 Naskah Skripsi).
4. **Uji Penerimaan Pengguna (User Acceptance Testing - UAT):** Mengukur tingkat kepuasan HRD, Manajer Pemasaran, dan staf lapangan menggunakan skala Likert.

