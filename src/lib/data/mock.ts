/**
 * DATA CONTOH untuk mode demo. Nama, divisi, KPI, target, dan bobot di sini
 * BUKAN data resmi Radar Kediri: PRD §14 & DESIGN §18 menyebut seluruhnya wajib
 * divalidasi mitra. Identitas karyawan sengaja disamarkan.
 */
import type * as T from "./types";

export const divisions: T.Division[] = [
  { id: "DIV-MKT", code: "MKT", name: "Divisi Pemasaran & Sirkulasi", active: true },
];

export const positions: T.Position[] = [
  { id: "POS-MGR", name: "Manajer Pemasaran", level: "Manajerial" },
  { id: "POS-SPV", name: "Supervisor Marketing", level: "Supervisor" },
  { id: "POS-EXM", name: "Account Executive / Eksekutif Iklan", level: "Staf" },
  { id: "POS-OPL", name: "Staf Sirkulasi & Oplah", level: "Staf" },
  { id: "POS-ADM", name: "Admin Operasional Marketing", level: "Staf" },
];

const e = (id: string, nip: string, name: string, role: T.Role, divisionId: string, positionId: string, supervisorId: string | null, lastLogin: string): T.Employee => ({
  id, nip, name, email: `${name.toLowerCase().split(" ")[0]}@radarkediri.example`, role, divisionId, positionId, supervisorId, active: true, lastLogin,
});
export const employees: T.Employee[] = [];

export const periods: T.Period[] = [
  { id: "PRD-2026-12", name: "Desember 2026", start: "2026-12-01", end: "2026-12-31", status: "draft" },
  { id: "PRD-2026-11", name: "November 2026", start: "2026-11-01", end: "2026-11-30", status: "active" },
  { id: "PRD-2026-10", name: "Oktober 2026", start: "2026-10-01", end: "2026-10-31", status: "closed" },
  { id: "PRD-2026-09", name: "September 2026", start: "2026-09-01", end: "2026-09-30", status: "closed" },
  { id: "PRD-2026-08", name: "Agustus 2026", start: "2026-08-01", end: "2026-08-31", status: "closed" },
];

export const kpiCategories: T.KpiCategory[] = [
  { id: "CAT-COM", name: "KPI Perusahaan", scope: "company", description: "Sasaran bersama seluruh divisi." },
  { id: "CAT-DIV", name: "KPI Divisi", scope: "division", description: "Sasaran yang dipertanggungjawabkan satu divisi." },
  { id: "CAT-IND", name: "KPI Individu", scope: "individual", description: "Sasaran perorangan yang dinilai pada periode berjalan." },
];

const ind = (id: string, code: string, name: string, categoryId: string, unit: string, measure: T.Measure, definition: string): T.KpiIndicator =>
  ({ id, code, name, categoryId, unit, measure, direction: "benefit", definition, active: true });
export const indicators: T.KpiIndicator[] = [
  ind("IND-01", "OPL", "Perolehan Oplah", "CAT-DIV", "eksemplar", "sum", "Total eksemplar dari aktivitas oplah yang disetujui."),
  ind("IND-02", "CLN", "Client Baru Terdaftar", "CAT-IND", "client", "count", "Jumlah client baru pada List Client yang disetujui."),
  ind("IND-03", "PNW", "Penawaran Dikirim", "CAT-IND", "penawaran", "count", "Jumlah penawaran/proposal yang disetujui."),
  ind("IND-04", "DEA", "Deal Tercapai", "CAT-IND", "deal", "count", "Jumlah penawaran berhasil ditutup Deal dan disetujui."),
  ind("IND-05", "NDL", "Nilai Deal", "CAT-DIV", "Rp", "sum", "Total nilai penawaran yang berhasil Deal dan disetujui."),
  ind("IND-06", "PRF", "Riset Profiling Selesai", "CAT-IND", "riset", "count", "Jumlah riset profiling client yang disetujui."),
  ind("IND-07", "PRG", "Program/Barter Terlaksana", "CAT-DIV", "program", "count", "Jumlah program atau barter yang disetujui."),
  ind("IND-08", "KNJ", "Progress & Kunjungan", "CAT-IND", "kunjungan", "count", "Jumlah pencatatan progress pendekatan/kunjungan yang disetujui."),
  ind("IND-09", "PIK", "Pendapatan Iklan Perusahaan", "CAT-COM", "Rp", "sum", "Pendapatan iklan seluruh perusahaan. Diisi manual oleh HRD; tidak punya mapping aktivitas."),
];

const tg = (id: string, indicatorId: string, periodId: string, scope: T.KpiScope, value: number, who: Partial<T.KpiTarget> = {}): T.KpiTarget =>
  ({ id, indicatorId, periodId, scope, value, ...who });
export const kpiTargets: T.KpiTarget[] = [
  tg("TG-01", "IND-09", "PRD-2026-11", "company", 1_500_000_000),
  tg("TG-02", "IND-01", "PRD-2026-11", "division", 500, { divisionId: "DIV-MKT" }),
  tg("TG-03", "IND-05", "PRD-2026-11", "division", 35_000_000, { divisionId: "DIV-MKT" }),
  tg("TG-04", "IND-07", "PRD-2026-11", "division", 1, { divisionId: "DIV-MKT" }),
  tg("TG-OCT-1", "IND-01", "PRD-2026-10", "division", 450, { divisionId: "DIV-MKT" }),
];

export const kpiMappings: T.KpiMapping[] = [
  { id: "MAP-01", activityType: "oplah", indicatorId: "IND-01", field: "qty", note: "Jumlah eksemplar dijumlahkan." },
  { id: "MAP-02", activityType: "client", indicatorId: "IND-02", field: "count", note: "Satu client baru dihitung satu." },
  { id: "MAP-03", activityType: "offer", indicatorId: "IND-03", field: "count", note: "Satu penawaran dihitung satu." },
  { id: "MAP-04", activityType: "outcome", outcome: "deal", indicatorId: "IND-04", field: "count", note: "Hanya hasil Deal." },
  { id: "MAP-05", activityType: "outcome", outcome: "deal", indicatorId: "IND-05", field: "value", note: "Nilai penawaran yang Deal dijumlahkan." },
  { id: "MAP-06", activityType: "profiling", indicatorId: "IND-06", field: "count", note: "Satu riset dihitung satu." },
  { id: "MAP-07", activityType: "program", indicatorId: "IND-07", field: "count", note: "Satu program/barter dihitung satu." },
  { id: "MAP-08", activityType: "progress", indicatorId: "IND-08", field: "count", note: "Satu pencatatan progress dihitung satu." },
  { id: "MAP-09", activityType: "outcome", outcome: "deal", indicatorId: "IND-09", field: "value", note: "Total nilai penawaran Deal yang disetujui untuk omzet perusahaan." },
];

export const noReasonCategories = ["Anggaran terbatas", "Memilih media lain", "Belum ada kebutuhan", "Keputusan ditunda", "Lainnya"];
export const progressTypes = ["Telepon", "Kunjungan", "Presentasi", "Kirim proposal", "Negosiasi"];
export const oplahSources = ["Agen", "Loper", "Pembaca/langganan"];

export const clients: T.Client[] = [
  { id: "CL-001", name: "Dinas Komunikasi & Informatika Kota Kediri", sector: "Pemerintahan Daerah (OPD)", contact: "Bpk. Hendro Wijaya (Kabid IKP)", phone: "081234567891", city: "Kota Kediri", ownerId: "USR-003", createdAt: "2026-11-01" },
  { id: "CL-002", name: "Bank Jatim Cabang Kediri", sector: "Perbankan / BUMD", contact: "Ibu Ratna Dewi (Pemasaran)", phone: "081298765432", city: "Kota Kediri", ownerId: "USR-003", createdAt: "2026-11-02" },
  { id: "CL-003", name: "PT Gudang Garam Tbk", sector: "Korporasi Swasta", contact: "Bpk. Aditya Pratama (CSR & Promosi)", phone: "081333445566", city: "Kab. Kediri", ownerId: "USR-003", createdAt: "2026-11-03" },
  { id: "CL-004", name: "Universitas Brawijaya Kampus Kediri", sector: "Pendidikan Tinggi", contact: "Ibu Dr. Maya Safitri (Humas)", phone: "081555667788", city: "Kota Kediri", ownerId: "USR-003", createdAt: "2026-11-04" },
  { id: "CL-005", name: "RSUD Gambiran Kota Kediri", sector: "Kesehatan / Pelayanan Publik", contact: "Bpk. Dr. Taufik Hidayat", phone: "081222334455", city: "Kota Kediri", ownerId: "USR-003", createdAt: "2026-11-05" },
];

export const offers: T.Offer[] = [
  { id: "OFR-001", clientId: "CL-001", programName: "Paket Advertorial Liputan Program Pemkot 1 Hal Full Color", ownerId: "USR-003", date: "2026-11-02", value: 12500000, periodId: "PRD-2026-11", note: "Diajukan untuk suplemen liputan pembangunan daerah" },
  { id: "OFR-002", clientId: "CL-002", programName: "Display Banner Produk Tabungan Bank Jatim 1/2 Hal", ownerId: "USR-003", date: "2026-11-03", value: 7500000, periodId: "PRD-2026-11", note: "Rencana terbit rubrik Ekonomi & Bisnis edisi Jumat" },
  { id: "OFR-003", clientId: "CL-003", programName: "Sponsorship Utama Event Jalan Sehat HUT Radar Kediri 2026", ownerId: "USR-003", date: "2026-11-05", value: 25000000, periodId: "PRD-2026-11", note: "Sponsor utama kategori korporasi nasional" },
];
export const programs: T.Program[] = [];
export const activities: T.Activity[] = [];
export const verifications: T.Verification[] = [];
export const auditLogs: T.AuditLog[] = [];

export const spkCriteria: T.SpkCriterion[] = [
  { id: "C1", indicatorId: "IND-02", code: "C1", name: "Client Baru Terdaftar", direction: "benefit", weight: 0.15, source: "Realisasi IND-02" },
  { id: "C2", indicatorId: "IND-03", code: "C2", name: "Penawaran Dikirim", direction: "benefit", weight: 0.2, source: "Realisasi IND-03" },
  { id: "C3", indicatorId: "IND-04", code: "C3", name: "Deal Tercapai", direction: "benefit", weight: 0.3, source: "Realisasi IND-04" },
  { id: "C4", indicatorId: "IND-06", code: "C4", name: "Riset Profiling Selesai", direction: "benefit", weight: 0.1, source: "Realisasi IND-06" },
  { id: "C5", indicatorId: "IND-08", code: "C5", name: "Progress & Kunjungan", direction: "benefit", weight: 0.15, source: "Realisasi IND-08" },
  { id: "C6", code: "C6", name: "Aktivitas Ditolak/Revisi", direction: "cost", weight: 0.1, source: "Jumlah aktivitas berstatus rejected atau revision" },
];

export const predicateRanges = [
  { label: "Sangat Baik", min: 0.9, max: 1 },
  { label: "Baik", min: 0.75, max: 0.8999 },
  { label: "Cukup", min: 0.6, max: 0.7499 },
  { label: "Kurang", min: 0, max: 0.5999 },
];
export const PREDICATE_RATIFIED = false;
