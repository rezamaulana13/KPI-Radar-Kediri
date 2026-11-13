import type { Role } from "../data/types";
import { ENABLE_SPK } from "../config";

export interface NavItem { label: string; href: string; icon: string }
export interface NavGroup { title: string; items: NavItem[] }

const marketing: NavGroup = { title: "Marketing", items: [
  { label: "Oplah", href: "/marketing/oplah", icon: "news" },
  { label: "List Client", href: "/marketing/clients", icon: "building" },
  { label: "Program/Barter", href: "/marketing/programs", icon: "handshake" },
  { label: "Profiling", href: "/marketing/profiling", icon: "search" },
  { label: "Penawaran", href: "/marketing/offers", icon: "file" },
] };

export const NAV: Record<Role, NavGroup[]> = {
  admin: [
    { title: "Utama", items: [{ label: "Dashboard", href: "/dashboard", icon: "home" }] },
    { title: "Operasional & Monitoring", items: [
      { label: "Verifikasi Aktivitas", href: "/hrd/verifications", icon: "check" },
      { label: "Target Operasional", href: "/hrd/kpi/targets", icon: "flag" },
      { label: "Realisasi Capaian", href: "/hrd/kpi/achievements", icon: "chart" },
      { label: "Rekap Laporan Divisi", href: "/hrd/reports", icon: "clipboard" },
    ] },
    { ...marketing, title: "Modul Pemasaran" },
    { title: "Master Kepegawaian", items: [
      { label: "Pengguna (Staf & HRD)", href: "/admin/users", icon: "users" },
      { label: "Data Personel", href: "/admin/employees", icon: "badge" },
      { label: "Struktur Jabatan", href: "/admin/positions", icon: "briefcase" },
    ] },
    { title: "Sistem & Keamanan", items: [
      { label: "Log Audit Sistem", href: "/admin/audit-logs", icon: "shield" },
      { label: "Pengaturan Aplikasi", href: "/admin/settings", icon: "settings" },
    ] },
  ],
  hrd: [
    { title: "Utama", items: [{ label: "Dashboard HRD", href: "/dashboard", icon: "home" }] },
    { title: "Verifikasi & Personalia", items: [
      { label: "Antrean Verifikasi", href: "/hrd/verifications", icon: "check" },
      { label: "Data Personel", href: "/admin/employees", icon: "badge" },
    ] },
    { title: "Target & Laporan Bulanan", items: [
      { label: "Target Operasional", href: "/hrd/kpi/targets", icon: "flag" },
      { label: "Realisasi Capaian", href: "/hrd/kpi/achievements", icon: "chart" },
      { label: "Rekapitulasi Laporan", href: "/hrd/reports", icon: "clipboard" },
    ] },
    ...(ENABLE_SPK
      ? [
          {
            title: "SPK SAW (Khusus TA)",
            items: [
              { label: "Kriteria", href: "/hrd/spk/criteria", icon: "list" },
              { label: "Bobot", href: "/hrd/spk/weights", icon: "sliders" },
              { label: "Perhitungan SAW", href: "/hrd/spk/calculations", icon: "calc" },
              { label: "Peringkat", href: "/hrd/spk/rankings", icon: "trophy" },
            ],
          },
        ]
      : []),
  ],
  employee: [
    {
      title: "Menu Karyawan",
      items: [
        { label: "Beranda", href: "/", icon: "home" },
        { label: "Catat Aktivitas", href: "/catat-aktivitas", icon: "plus" },
        { label: "Riwayat Aktivitas", href: "/aktivitas-saya", icon: "clipboard" },
        { label: "Capaian Target", href: "/kinerja", icon: "chart" },
        { label: "Modul Marketing", href: "/modul-marketing", icon: "briefcase" },
        { label: "Alur Kerja & SOP", href: "/alur-kerja", icon: "document" },
      ],
    },
  ],
};
