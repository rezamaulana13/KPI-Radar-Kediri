/**
 * Konfigurasi Ruang Lingkup Sistem (App Scope Config)
 * 
 * - "MKI": Mode Magang Kerja Industri (Sistem Informasi Manajemen Aktivitas & Monitoring Operasional)
 *          Modul SPK disembunyikan agar fokus pada pencatatan lapangan, verifikasi HRD, & target operasional.
 * - "TA":  Mode Tugas Akhir / Skripsi (Sistem Pendukung Keputusan SAW & 5 Fitur Intelligence Lanjutan)
 */
export const APP_MODE: "MKI" | "TA" = "MKI";

export const IS_MKI = APP_MODE === "MKI";
export const ENABLE_SPK = APP_MODE === "TA";

