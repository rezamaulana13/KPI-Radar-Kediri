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
    { title: "Utama", items: [{ label: "Dashboard", href: "/dashboard", icon: "home" }] },
    { title: "Master data", items: [
      { label: "Pengguna", href: "/admin/users", icon: "users" },
      { label: "Karyawan", href: "/admin/employees", icon: "badge" },
      { label: "Divisi", href: "/admin/divisions", icon: "building" },
      { label: "Jabatan", href: "/admin/positions", icon: "briefcase" },
    ] },
    { title: "Sistem", items: [
      { label: "Audit Log", href: "/admin/audit-logs", icon: "shield" },
      { label: "Pengaturan", href: "/admin/settings", icon: "settings" },
    ] },
  ],
  hrd: [
    { title: "Utama", items: [{ label: "Dashboard", href: "/dashboard", icon: "home" }] },
    { title: "Verifikasi", items: [
      { label: "Verifikasi Aktivitas", href: "/hrd/verifications", icon: "check" },
    ] },
    { title: "Penilaian KPI", items: [
      { label: "Periode Penilaian", href: "/hrd/periods", icon: "calendar" },
      { label: "Kategori KPI", href: "/hrd/kpi/categories", icon: "folder" },
      { label: "Indikator KPI", href: "/hrd/kpi/indicators", icon: "target" },
      { label: "Target KPI", href: "/hrd/kpi/targets", icon: "flag" },
      { label: "Mapping Aktivitas", href: "/hrd/kpi/mappings", icon: "link" },
      { label: "Realisasi KPI", href: "/hrd/kpi/achievements", icon: "chart" },
      { label: "Laporan", href: "/hrd/reports", icon: "clipboard" },
    ] },
    { title: "SPK (tahap TA)", items: [
      { label: "Kriteria", href: "/hrd/spk/criteria", icon: "list" },
      { label: "Bobot", href: "/hrd/spk/weights", icon: "sliders" },
      { label: "Perhitungan SAW", href: "/hrd/spk/calculations", icon: "calc" },
      { label: "Peringkat", href: "/hrd/spk/rankings", icon: "trophy" },
    ] },
    { ...marketing, title: "Marketing (lihat)" },
  ],
  employee: [
    { title: "Utama", items: [{ label: "Dashboard Saya", href: "/dashboard", icon: "home" }] },
    { title: "Aktivitas", items: [
      { label: "Aktivitas Saya", href: "/employee/activities", icon: "clipboard" },
      { label: "Tambah Aktivitas", href: "/employee/activities/new", icon: "plus" },
      { label: "Kinerja Saya", href: "/employee/performance", icon: "chart" },
    ] },
    marketing,
  ],
};
