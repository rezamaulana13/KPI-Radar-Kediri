import type { Role } from "../data/types";

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
    { title: "Utama", items: [{ label: "Dashboard Sistem", href: "/dashboard", icon: "home" }] },
    { title: "Manajemen Akun & Akses", items: [
      { label: "Pengguna & Hak Akses", href: "/admin/users", icon: "users" },
      { label: "Data Personel", href: "/admin/employees", icon: "badge" },
    ] },
    { title: "Tata Kelola & Keamanan", items: [
      { label: "Audit Trail & Log Sistem", href: "/admin/audit-logs", icon: "shield" },
      { label: "Pengaturan SIMOKP", href: "/admin/settings", icon: "settings" },
    ] },
  ],
  hrd: [
    { title: "Utama", items: [{ label: "Dashboard Utama", href: "/dashboard", icon: "home" }] },
    { title: "Operasional & Sirkulasi", items: [
      { label: "Antrean Verifikasi", href: "/hrd/verifications", icon: "check" },
      { label: "Sirkulasi Oplah", href: "/marketing/oplah", icon: "news" },
      { label: "Klien & Mitra", href: "/marketing/clients", icon: "building" },
      { label: "Proposal Penawaran", href: "/marketing/offers", icon: "file" },
    ] },
    { title: "Kinerja & KPI", items: [
      { label: "Target Kinerja", href: "/hrd/kpi/targets", icon: "flag" },
      { label: "Realisasi Capaian", href: "/hrd/kpi/achievements", icon: "chart" },
      { label: "Rekapitulasi Laporan", href: "/hrd/reports", icon: "clipboard" },
    ] },
    { title: "Kepegawaian", items: [
      { label: "Data Personel", href: "/admin/employees", icon: "badge" },
    ] },
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
