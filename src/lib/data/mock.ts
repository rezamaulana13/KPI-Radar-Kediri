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

const e = (id: string, nip: string, name: string, role: T.Role, divisionId: string, positionId: string, supervisorId: string | null, lastLogin: string, email?: string): T.Employee => ({
  id, nip, name, email: email || `${name.toLowerCase().split(" ")[0]}@radarkediri.example`, role, divisionId, positionId, supervisorId, active: true, lastLogin,
});
export const employees: T.Employee[] = [
  e("81b8993a-e523-4595-9d21-2e4b1753e1ac", "RK-5760", "Reza Maulana", "admin", "DIV-MKT", "POS-MGR", null, "2026-11-21T07:00:00.000Z", "rezamaulanaply@gmail.com"),
  e("0fd19390-ff21-474b-9475-3ec2616ea816", "RK-4020", "HRD Radar Kediri", "hrd", "DIV-MKT", "POS-SPV", null, "2026-11-21T07:00:00.000Z", "hrdradarkediri@gmail.com"),
  e("7f48b651-5109-4aa9-9937-d45352916b06", "RK-2340", "fara dilla", "employee", "DIV-MKT", "POS-EXM", "0fd19390-ff21-474b-9475-3ec2616ea816", "2026-11-21T07:00:00.000Z", "faradilla@gmail.com"),
  e("cdda2ff0-6ea1-44d1-a6d5-ed89e9a9b411", "RK-8098", "memet", "employee", "DIV-MKT", "POS-OPL", "0fd19390-ff21-474b-9475-3ec2616ea816", "2026-11-21T07:00:00.000Z", "memet13@gmail.com"),
];

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
  ind("IND-01", "OPL", "Perolehan Oplah Bersih Terjual", "CAT-DIV", "eksemplar", "sum", "Total eksemplar bersih terjual (setelah dikurangi retur) dari sirkulasi yang disetujui."),
  ind("IND-02", "CLN", "Client Baru Terdaftar", "CAT-IND", "client", "count", "Jumlah client baru pada List Client yang disetujui."),
  ind("IND-03", "PNW", "Proposal Penawaran Dikirim", "CAT-IND", "penawaran", "count", "Jumlah penawaran/proposal yang disetujui."),
  ind("IND-04", "DEA", "Deal Closing Tercapai", "CAT-IND", "deal", "count", "Jumlah penawaran berhasil ditutup Deal dan disetujui."),
  ind("IND-05", "NDL", "Omzet Iklan Kas Tunai", "CAT-DIV", "Rp", "sum", "Penerimaan kas tunai riil dari penawaran Deal yang disetujui."),
  ind("IND-06", "PRF", "Riset Profiling Selesai", "CAT-IND", "riset", "count", "Jumlah riset profiling client yang disetujui."),
  ind("IND-07", "BAR", "Nilai Realisasi Barter", "CAT-DIV", "Rp", "sum", "Total nilai barang/jasa barter dari kerja sama yang disetujui."),
  ind("IND-08", "KNJ", "Progress & Kunjungan", "CAT-IND", "kunjungan", "count", "Jumlah pencatatan progress pendekatan/kunjungan yang disetujui."),
  ind("IND-09", "PIK", "Pendapatan Komersial Perusahaan", "CAT-COM", "Rp", "sum", "Pendapatan komersial seluruh perusahaan. Diisi oleh Admin/Direksi."),
];

const tg = (id: string, indicatorId: string, periodId: string, scope: T.KpiScope, value: number, who: Partial<T.KpiTarget> = {}): T.KpiTarget =>
  ({ id, indicatorId, periodId, scope, value, ...who });
export const kpiTargets: T.KpiTarget[] = [
  tg("TG-01", "IND-09", "PRD-2026-11", "company", 1_500_000_000),
  tg("TG-02", "IND-01", "PRD-2026-11", "division", 500, { divisionId: "DIV-MKT" }),
  tg("TG-03", "IND-05", "PRD-2026-11", "division", 35_000_000, { divisionId: "DIV-MKT" }),
  tg("TG-04", "IND-07", "PRD-2026-11", "division", 15_000_000, { divisionId: "DIV-MKT" }),
  tg("TG-OCT-1", "IND-01", "PRD-2026-10", "division", 450, { divisionId: "DIV-MKT" }),
];

export const kpiMappings: T.KpiMapping[] = [
  { id: "MAP-01", activityType: "oplah", indicatorId: "IND-01", field: "qty", note: "Jumlah eksemplar bersih terjual dijumlahkan." },
  { id: "MAP-02", activityType: "client", indicatorId: "IND-02", field: "count", note: "Satu client baru dihitung satu." },
  { id: "MAP-03", activityType: "offer", indicatorId: "IND-03", field: "count", note: "Satu penawaran dihitung satu." },
  { id: "MAP-04", activityType: "outcome", outcome: "deal", indicatorId: "IND-04", field: "count", note: "Hanya hasil Deal." },
  { id: "MAP-05", activityType: "outcome", outcome: "deal", indicatorId: "IND-05", field: "value", note: "Porsi kas tunai dari penawaran Deal." },
  { id: "MAP-06", activityType: "profiling", indicatorId: "IND-06", field: "count", note: "Satu riset dihitung satu." },
  { id: "MAP-07", activityType: "program", indicatorId: "IND-07", field: "value", note: "Nilai program promosi/barter terlaksana." },
  { id: "MAP-07B", activityType: "outcome", outcome: "deal", indicatorId: "IND-07", field: "value", note: "Porsi nilai barter dari penawaran Deal." },
  { id: "MAP-08", activityType: "progress", indicatorId: "IND-08", field: "count", note: "Satu pencatatan progress dihitung satu." },
  { id: "MAP-09", activityType: "outcome", outcome: "deal", indicatorId: "IND-09", field: "value", note: "Total nilai penawaran Deal yang disetujui untuk omzet perusahaan." },
];

export const noReasonCategories = ["Anggaran terbatas", "Memilih media lain", "Belum ada kebutuhan", "Keputusan ditunda", "Lainnya"];
export const progressTypes = ["Telepon", "Kunjungan", "Presentasi", "Kirim proposal", "Negosiasi"];
export const oplahSources = ["Agen", "Loper", "Pembaca/langganan"];

export const clients: T.Client[] = [
  { id: "CL-001", name: "Dinas Komunikasi & Informatika Kota Kediri", sector: "Pemerintahan Daerah (OPD)", contact: "Bpk. Hendro Wijaya (Kabid IKP)", phone: "081234567891", city: "Kota Kediri", ownerId: "7f48b651-5109-4aa9-9937-d45352916b06", createdAt: "2026-11-01" },
  { id: "CL-002", name: "Bank Jatim Cabang Kediri", sector: "Perbankan / BUMD", contact: "Ibu Ratna Dewi (Pemasaran)", phone: "081298765432", city: "Kota Kediri", ownerId: "7f48b651-5109-4aa9-9937-d45352916b06", createdAt: "2026-11-02" },
  { id: "CL-003", name: "PT Gudang Garam Tbk", sector: "Korporasi Swasta", contact: "Bpk. Aditya Pratama (CSR & Promosi)", phone: "081333445566", city: "Kab. Kediri", ownerId: "7f48b651-5109-4aa9-9937-d45352916b06", createdAt: "2026-11-03" },
  { id: "CL-004", name: "Universitas Brawijaya Kampus Kediri", sector: "Pendidikan Tinggi", contact: "Ibu Dr. Maya Safitri (Humas)", phone: "081555667788", city: "Kota Kediri", ownerId: "7f48b651-5109-4aa9-9937-d45352916b06", createdAt: "2026-11-04" },
  { id: "CL-005", name: "RSUD Gambiran Kota Kediri", sector: "Kesehatan / Pelayanan Publik", contact: "Bpk. Dr. Taufik Hidayat", phone: "081222334455", city: "Kota Kediri", ownerId: "7f48b651-5109-4aa9-9937-d45352916b06", createdAt: "2026-11-05" },
];

export const offers: T.Offer[] = [
  {
    id: "OFR-001",
    clientId: "CL-001",
    programName: "Paket Advertorial Liputan Program Pemkot 1 Hal Full Color",
    ownerId: "7f48b651-5109-4aa9-9937-d45352916b06",
    date: "2026-11-02",
    value: 12500000,
    cashValue: 12500000,
    barterValue: 0,
    partnershipType: "tunai",
    periodId: "PRD-2026-11",
    note: "Diajukan untuk suplemen liputan pembangunan daerah Kota Kediri",
    realizationStatus: "sebagian",
  },
  {
    id: "OFR-002",
    clientId: "CL-002",
    programName: "Display Banner Produk Tabungan Bank Jatim 1/2 Halaman",
    ownerId: "7f48b651-5109-4aa9-9937-d45352916b06",
    date: "2026-11-03",
    value: 7500000,
    cashValue: 5000000,
    barterValue: 2500000,
    partnershipType: "hybrid",
    barterType: "jasa",
    barterDesc: "Voucher belanja mitra UMKM binaan perbankan senilai Rp2.500.000",
    periodId: "PRD-2026-11",
    note: "Kombinasi kas transfer Rp5.000.000 dan barter voucher promosi",
    realizationStatus: "rencana",
  },
  {
    id: "OFR-003",
    clientId: "CL-003",
    programName: "Sponsorship Ruang Iklan Barter Fasilitas Hotel Grand Surya",
    ownerId: "7f48b651-5109-4aa9-9937-d45352916b06",
    date: "2026-11-05",
    value: 15000000,
    cashValue: 0,
    barterValue: 15000000,
    partnershipType: "barter",
    barterType: "barang",
    barterDesc: "Barter 10 voucher kamar deluxe & fasilitas ballroom untuk rapat direksi",
    periodId: "PRD-2026-11",
    note: "Barter media murni tanpa kas keluar/masuk",
    realizationStatus: "selesai",
  },
];
export const programs: T.Program[] = [];
export const activities: T.Activity[] = [
  {
    id: "ACT-OPL-003",
    type: "oplah",
    ownerId: "cdda2ff0-6ea1-44d1-a6d5-ed89e9a9b411",
    createdBy: "cdda2ff0-6ea1-44d1-a6d5-ed89e9a9b411",
    date: "2026-11-21",
    periodId: "PRD-2026-11",
    description: "Distribusi koran harian pagi edisi akhir pekan ke Agen Sumber Rejeki Kediri Kota",
    status: "pending",
    qty: 250,
    returnQty: 15,
    soldQty: 235,
    returnCondition: "layak_stok",
    editionName: "Edisi Harian 21 Nov 2026",
    source: "Agen",
    sourceName: "Agen Sumber Rejeki Kediri Kota",
    createdAt: "2026-11-21T07:30:00.000Z",
  },
  {
    id: "ACT-OFR-001",
    type: "offer",
    ownerId: "7f48b651-5109-4aa9-9937-d45352916b06",
    createdBy: "7f48b651-5109-4aa9-9937-d45352916b06",
    date: "2026-11-21",
    periodId: "PRD-2026-11",
    description: "Pengajuan proposal promosi advertorial 1 halaman penuh Dinas Komunikasi & Informatika Kota Kediri",
    status: "pending",
    clientId: "CL-001",
    offerId: "OFR-001",
    value: 12500000,
    cashValue: 12500000,
    barterValue: 0,
    partnershipType: "tunai",
    createdAt: "2026-11-21T08:15:00.000Z",
  },
  {
    id: "ACT-OPL-001",
    type: "oplah",
    ownerId: "cdda2ff0-6ea1-44d1-a6d5-ed89e9a9b411",
    createdBy: "cdda2ff0-6ea1-44d1-a6d5-ed89e9a9b411",
    date: "2026-11-10",
    periodId: "PRD-2026-11",
    description: "Distribusi oplah harian pagi dan suplemen daerah ke Agen Berkah Kediri Kota",
    status: "approved",
    qty: 350,
    returnQty: 25,
    soldQty: 325,
    returnCondition: "layak_stok",
    editionName: "Edisi Harian 10 Nov 2026",
    source: "Agen",
    sourceName: "Agen Berkah Kediri Kota",
    createdAt: "2026-11-10T07:30:00.000Z",
  },
  {
    id: "ACT-OPL-002",
    type: "oplah",
    ownerId: "cdda2ff0-6ea1-44d1-a6d5-ed89e9a9b411",
    createdBy: "cdda2ff0-6ea1-44d1-a6d5-ed89e9a9b411",
    date: "2026-11-12",
    periodId: "PRD-2026-11",
    description: "Pengiriman koran harian pagi ke jaringan loper Pare dan pelanggan instansi",
    status: "approved",
    qty: 200,
    returnQty: 10,
    soldQty: 190,
    returnCondition: "layak_stok",
    editionName: "Edisi Harian 12 Nov 2026",
    source: "Loper",
    sourceName: "Koordinator Loper Wilayah Pare",
    createdAt: "2026-11-12T07:15:00.000Z",
  },
];
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
  { label: "Sangat Baik (A)", min: 0.85, max: 1.0 },
  { label: "Baik (B)", min: 0.70, max: 0.8499 },
  { label: "Cukup (C)", min: 0.55, max: 0.6999 },
  { label: "Kurang (D)", min: 0, max: 0.5499 },
];
export const PREDICATE_RATIFIED = true;
