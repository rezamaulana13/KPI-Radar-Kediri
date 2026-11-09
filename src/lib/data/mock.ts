/**
 * DATA CONTOH untuk mode demo. Nama, divisi, KPI, target, dan bobot di sini
 * BUKAN data resmi Radar Kediri: PRD §14 & DESIGN §18 menyebut seluruhnya wajib
 * divalidasi mitra. Identitas karyawan sengaja disamarkan.
 */
import type * as T from "./types";

export const divisions: T.Division[] = [
  { id: "DIV-RED", code: "RED", name: "Redaksi", active: true },
  { id: "DIV-MKT", code: "MKT", name: "Marketing", active: true },
  { id: "DIV-SIR", code: "SIR", name: "Sirkulasi", active: true },
  { id: "DIV-PRD", code: "PRD", name: "Percetakan", active: true },
  { id: "DIV-KEU", code: "KEU", name: "Keuangan", active: true },
  { id: "DIV-HRD", code: "HRD", name: "HRD & Umum", active: true },
  { id: "DIV-IT", code: "IT", name: "Teknologi Informasi", active: true },
];

export const positions: T.Position[] = [
  { id: "POS-MGR", name: "Manajer", level: "Manajerial" },
  { id: "POS-SPV", name: "Supervisor", level: "Supervisor" },
  { id: "POS-EXM", name: "Eksekutif Marketing", level: "Staf" },
  { id: "POS-OPL", name: "Staf Oplah", level: "Staf" },
  { id: "POS-RED", name: "Redaktur", level: "Staf" },
  { id: "POS-STF", name: "Staf Umum", level: "Staf" },
  { id: "POS-ADM", name: "Administrator Sistem", level: "Staf" },
];

const e = (id: string, nip: string, name: string, role: T.Role, divisionId: string, positionId: string, supervisorId: string | null, lastLogin: string): T.Employee => ({
  id, nip, name, email: `${name.toLowerCase().split(" ")[0]}@radarkediri.example`, role, divisionId, positionId, supervisorId, active: true, lastLogin,
});
export const employees: T.Employee[] = [
  e("E01", "RK-0101", "Bambang Hartono", "employee", "DIV-MKT", "POS-SPV", null, "2026-11-08T07:42:00+07:00"),
  e("E02", "RK-0102", "Dewi Lestari", "employee", "DIV-MKT", "POS-EXM", "E01", "2026-11-08T08:05:00+07:00"),
  e("E03", "RK-0103", "Andi Prasetyo", "employee", "DIV-MKT", "POS-EXM", "E01", "2026-11-07T16:20:00+07:00"),
  e("E04", "RK-0104", "Siti Rahmawati", "employee", "DIV-MKT", "POS-EXM", "E01", "2026-11-07T14:11:00+07:00"),
  e("E05", "RK-0105", "Rudi Santoso", "employee", "DIV-MKT", "POS-OPL", "E01", "2026-11-06T09:30:00+07:00"),
  e("E06", "RK-0201", "Rina Wulandari", "hrd", "DIV-HRD", "POS-MGR", null, "2026-11-08T07:55:00+07:00"),
  e("E07", "RK-0301", "Agus Setiawan", "admin", "DIV-IT", "POS-ADM", null, "2026-11-05T10:02:00+07:00"),
  e("E08", "RK-0401", "Hendra Wijaya", "employee", "DIV-RED", "POS-SPV", null, "2026-11-07T11:40:00+07:00"),
  e("E09", "RK-0402", "Yuni Kartika", "employee", "DIV-RED", "POS-RED", "E08", "2026-11-07T09:15:00+07:00"),
  e("E10", "RK-0501", "Lukman Hakim", "employee", "DIV-SIR", "POS-STF", null, "2026-11-04T13:20:00+07:00"),
  e("E11", "RK-0601", "Maya Puspita", "employee", "DIV-KEU", "POS-STF", null, "2026-11-06T15:45:00+07:00"),
  e("E12", "RK-0701", "Eko Nugroho", "employee", "DIV-PRD", "POS-STF", null, "2026-11-03T08:10:00+07:00"),
];

export const periods: T.Period[] = [
  { id: "PRD-2026-Q4", name: "Triwulan IV 2026", start: "2026-10-01", end: "2026-12-31", status: "active" },
  { id: "PRD-2026-Q3", name: "Triwulan III 2026", start: "2026-07-01", end: "2026-09-30", status: "closed" },
  { id: "PRD-2027-Q1", name: "Triwulan I 2027", start: "2027-01-01", end: "2027-03-31", status: "draft" },
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
  tg("TG-01", "IND-09", "PRD-2026-Q4", "company", 4_500_000_000),
  tg("TG-02", "IND-01", "PRD-2026-Q4", "division", 1500, { divisionId: "DIV-MKT" }),
  tg("TG-03", "IND-05", "PRD-2026-Q4", "division", 100_000_000, { divisionId: "DIV-MKT" }),
  tg("TG-04", "IND-07", "PRD-2026-Q4", "division", 2, { divisionId: "DIV-MKT" }),
  tg("TG-05", "IND-01", "PRD-2026-Q4", "individual", 1000, { employeeId: "E05" }),
  ...["E02", "E03", "E04"].flatMap((emp, i) => [
    tg(`TG-1${i}1`, "IND-02", "PRD-2026-Q4", "individual", 3, { employeeId: emp }),
    tg(`TG-1${i}2`, "IND-03", "PRD-2026-Q4", "individual", 3, { employeeId: emp }),
    tg(`TG-1${i}3`, "IND-04", "PRD-2026-Q4", "individual", 2, { employeeId: emp }),
    tg(`TG-1${i}4`, "IND-06", "PRD-2026-Q4", "individual", 2, { employeeId: emp }),
    tg(`TG-1${i}5`, "IND-08", "PRD-2026-Q4", "individual", 4, { employeeId: emp }),
  ]),
  tg("TG-Q3-1", "IND-01", "PRD-2026-Q3", "division", 1200, { divisionId: "DIV-MKT" }),
  tg("TG-Q3-2", "IND-02", "PRD-2026-Q3", "individual", 2, { employeeId: "E04" }),
  tg("TG-Q3-3", "IND-03", "PRD-2026-Q3", "individual", 2, { employeeId: "E04" }),
  tg("TG-Q3-4", "IND-04", "PRD-2026-Q3", "individual", 1, { employeeId: "E04" }),
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
];

export const noReasonCategories = ["Anggaran terbatas", "Memilih media lain", "Belum ada kebutuhan", "Keputusan ditunda", "Lainnya"];
export const progressTypes = ["Telepon", "Kunjungan", "Presentasi", "Kirim proposal", "Negosiasi"];
export const oplahSources = ["Agen", "Loper", "Pembaca/langganan"];

export const clients: T.Client[] = [
  { id: "CL-001", name: "Toko Maju Jaya", sector: "Retail", contact: "Bu Ratna", phone: "0812-0000-0101", city: "Kota Kediri", ownerId: "E02", createdAt: "2026-10-02" },
  { id: "CL-002", name: "RS Sehat Sentosa", sector: "Kesehatan", contact: "Pak Hadi", phone: "0812-0000-0102", city: "Kota Kediri", ownerId: "E03", createdAt: "2026-10-04" },
  { id: "CL-003", name: "Dealer Kediri Raya Motor", sector: "Otomotif", contact: "Pak Wahyu", phone: "0812-0000-0103", city: "Kabupaten Kediri", ownerId: "E02", createdAt: "2026-10-09" },
  { id: "CL-004", name: "BPR Arta Mandiri", sector: "Keuangan", contact: "Bu Lina", phone: "0812-0000-0104", city: "Kota Kediri", ownerId: "E04", createdAt: "2026-10-06" },
  { id: "CL-005", name: "Universitas Swasta Kediri", sector: "Pendidikan", contact: "Pak Teguh", phone: "0812-0000-0105", city: "Kota Kediri", ownerId: "E03", createdAt: "2026-10-14" },
  { id: "CL-006", name: "Restoran Nusantara", sector: "Kuliner", contact: "Bu Sari", phone: "0812-0000-0106", city: "Kabupaten Nganjuk", ownerId: "E04", createdAt: "2026-09-05" },
];

export const offers: T.Offer[] = [
  { id: "OFR-001", clientId: "CL-001", programName: "Iklan Halaman Ekonomi 1/4 halaman", ownerId: "E02", date: "2026-10-05", value: 12_500_000, periodId: "PRD-2026-Q4", note: "Paket 4 terbit." },
  { id: "OFR-002", clientId: "CL-002", programName: "Advertorial Kesehatan", ownerId: "E03", date: "2026-10-08", value: 28_000_000, periodId: "PRD-2026-Q4", note: "Paket 2 advertorial + 8 iklan." },
  { id: "OFR-003", clientId: "CL-003", programName: "Paket Iklan Otomotif", ownerId: "E02", date: "2026-10-12", value: 45_000_000, periodId: "PRD-2026-Q4", note: "Menyambut pameran otomotif akhir tahun." },
  { id: "OFR-004", clientId: "CL-004", programName: "Barter Iklan & Sponsorship", ownerId: "E04", date: "2026-10-15", value: 30_000_000, periodId: "PRD-2026-Q4", note: "Skema barter dengan layanan perbankan." },
  { id: "OFR-005", clientId: "CL-005", programName: "Iklan Penerimaan Mahasiswa Baru", ownerId: "E03", date: "2026-10-20", value: 20_000_000, periodId: "PRD-2026-Q4", note: "" },
  { id: "OFR-006", clientId: "CL-006", programName: "Iklan Kuliner Akhir Pekan", ownerId: "E04", date: "2026-09-14", value: 6_500_000, periodId: "PRD-2026-Q3", note: "" },
];

export const programs: T.Program[] = [
  { id: "PRG-001", name: "Barter Iklan & Sponsor Festival Kuliner Kediri", kind: "barter", start: "2026-10-18", end: "2026-11-30", ownerId: "E04", participantClientIds: ["CL-004", "CL-006", "CL-001"], value: 18_000_000, status: "berjalan" },
  { id: "PRG-002", name: "Koran Masuk Sekolah (Literasi)", kind: "program", start: "2026-11-01", end: "2026-12-15", ownerId: "E03", participantClientIds: ["CL-005", "CL-002"], value: 0, status: "rencana" },
];

type A = Partial<T.Activity>;
const act = (id: string, type: T.ActivityType, ownerId: string, createdBy: string, date: string, status: T.ActivityStatus, description: string, x: A = {}): T.Activity =>
  ({ id, type, ownerId, createdBy, date, status, description, periodId: date < "2026-10-01" ? "PRD-2026-Q3" : "PRD-2026-Q4", ...x });
export const activities: T.Activity[] = [
  act("ACT-001", "oplah", "E05", "E05", "2026-10-03", "approved", "Penambahan oplah wilayah Pare.", { qty: 320, source: "Agen", sourceName: "Agen Pare" }),
  act("ACT-002", "oplah", "E05", "E05", "2026-10-10", "approved", "Penambahan oplah kota melalui loper.", { qty: 450, source: "Loper", sourceName: "Loper Kota Kediri" }),
  act("ACT-003", "oplah", "E05", "E05", "2026-10-24", "approved", "Langganan korporasi baru.", { qty: 280, source: "Pembaca/langganan", sourceName: "Langganan korporasi" }),
  act("ACT-004", "oplah", "E02", "E02", "2026-11-03", "pending", "Tambahan agen wilayah Gurah.", { qty: 150, source: "Agen", sourceName: "Agen Gurah" }),
  act("ACT-005", "oplah", "E03", "E01", "2026-11-05", "pending", "Input Supervisor atas nama Andi: loper Ngadiluwih.", { qty: 200, source: "Loper", sourceName: "Loper Ngadiluwih" }),
  act("ACT-006", "oplah", "E05", "E05", "2026-09-12", "approved", "Oplah wilayah Nganjuk.", { qty: 510, source: "Agen", sourceName: "Agen Nganjuk" }),
  act("ACT-007", "client", "E02", "E02", "2026-10-02", "approved", "Client baru: Toko Maju Jaya.", { clientId: "CL-001" }),
  act("ACT-008", "client", "E03", "E03", "2026-10-04", "approved", "Client baru: RS Sehat Sentosa.", { clientId: "CL-002" }),
  act("ACT-009", "client", "E04", "E04", "2026-10-06", "approved", "Client baru: BPR Arta Mandiri.", { clientId: "CL-004" }),
  act("ACT-010", "client", "E03", "E03", "2026-10-14", "approved", "Client baru: Universitas Swasta Kediri.", { clientId: "CL-005" }),
  act("ACT-011", "client", "E04", "E04", "2026-09-05", "approved", "Client baru: Restoran Nusantara.", { clientId: "CL-006" }),
  act("ACT-012", "client", "E02", "E02", "2026-10-09", "approved", "Client baru: Dealer Kediri Raya Motor.", { clientId: "CL-003" }),
  act("ACT-013", "profiling", "E02", "E02", "2026-10-03", "approved", "Riset kebutuhan promosi toko dan pola pembelian pelanggan.", { clientId: "CL-001", potential: "Sedang" }),
  act("ACT-014", "profiling", "E03", "E03", "2026-10-06", "approved", "Riset layanan rumah sakit dan segmen pembaca terkait kesehatan.", { clientId: "CL-002", potential: "Tinggi" }),
  act("ACT-015", "profiling", "E04", "E04", "2026-10-08", "revision", "Riset BPR Arta Mandiri.", { clientId: "CL-004", potential: "Tinggi" }),
  act("ACT-016", "profiling", "E03", "E03", "2026-10-16", "pending", "Riset penerimaan mahasiswa baru universitas.", { clientId: "CL-005", potential: "Tinggi" }),
  act("ACT-017", "offer", "E02", "E02", "2026-10-05", "approved", "Penawaran iklan ekonomi 1/4 halaman.", { offerId: "OFR-001", clientId: "CL-001", value: 12_500_000 }),
  act("ACT-018", "offer", "E03", "E03", "2026-10-08", "approved", "Penawaran advertorial kesehatan.", { offerId: "OFR-002", clientId: "CL-002", value: 28_000_000 }),
  act("ACT-019", "offer", "E02", "E02", "2026-10-12", "approved", "Penawaran paket iklan otomotif.", { offerId: "OFR-003", clientId: "CL-003", value: 45_000_000 }),
  act("ACT-020", "offer", "E04", "E04", "2026-10-15", "approved", "Penawaran barter iklan dan sponsorship.", { offerId: "OFR-004", clientId: "CL-004", value: 30_000_000 }),
  act("ACT-021", "offer", "E03", "E03", "2026-10-20", "pending", "Penawaran iklan penerimaan mahasiswa baru.", { offerId: "OFR-005", clientId: "CL-005", value: 20_000_000 }),
  act("ACT-022", "offer", "E04", "E04", "2026-09-14", "approved", "Penawaran iklan kuliner.", { offerId: "OFR-006", clientId: "CL-006", value: 6_500_000 }),
  act("ACT-023", "progress", "E02", "E02", "2026-10-12", "approved", "Kunjungan ke toko, presentasi contoh layout.", { offerId: "OFR-001", progressType: "Kunjungan" }),
  act("ACT-024", "progress", "E02", "E02", "2026-10-20", "approved", "Negosiasi harga paket 4 terbit.", { offerId: "OFR-001", progressType: "Negosiasi" }),
  act("ACT-025", "progress", "E03", "E03", "2026-10-15", "approved", "Presentasi ke manajemen rumah sakit.", { offerId: "OFR-002", progressType: "Presentasi" }),
  act("ACT-026", "progress", "E02", "E02", "2026-10-22", "approved", "Kunjungan showroom dan survei lokasi pameran.", { offerId: "OFR-003", progressType: "Kunjungan" }),
  act("ACT-027", "progress", "E04", "E04", "2026-10-25", "approved", "Negosiasi skema barter.", { offerId: "OFR-004", progressType: "Negosiasi" }),
  act("ACT-028", "progress", "E03", "E03", "2026-11-04", "pending", "Telepon tindak lanjut ke bagian humas kampus.", { offerId: "OFR-005", progressType: "Telepon" }),
  act("ACT-029", "progress", "E04", "E04", "2026-10-18", "rejected", "Kunjungan ke BPR.", { offerId: "OFR-004", progressType: "Kunjungan" }),
  act("ACT-030", "outcome", "E02", "E02", "2026-10-28", "approved", "Penawaran iklan ekonomi ditutup Deal.", { offerId: "OFR-001", outcome: "deal", value: 12_500_000 }),
  act("ACT-031", "outcome", "E03", "E03", "2026-11-02", "approved", "Rumah sakit memutuskan tidak melanjutkan.", { offerId: "OFR-002", outcome: "no", reasonCategory: "Anggaran terbatas", reason: "Anggaran promosi kuartal ini sudah terserap; diminta menghubungi lagi awal tahun." }),
  act("ACT-032", "outcome", "E04", "E04", "2026-11-04", "pending", "Skema barter disepakati kedua pihak.", { offerId: "OFR-004", outcome: "deal", value: 30_000_000 }),
  act("ACT-033", "outcome", "E04", "E04", "2026-09-30", "approved", "Restoran memilih media lain.", { offerId: "OFR-006", outcome: "no", reasonCategory: "Memilih media lain", reason: "Sudah terikat kontrak dengan media daring lokal sampai akhir tahun." }),
  act("ACT-034", "program", "E04", "E01", "2026-10-18", "approved", "Barter iklan dan sponsor Festival Kuliner Kediri.", { programId: "PRG-001" }),
  act("ACT-035", "program", "E03", "E03", "2026-11-01", "pending", "Program Koran Masuk Sekolah.", { programId: "PRG-002" }),
];

export const verifications: T.Verification[] = [
  ...activities.filter((a) => a.status !== "pending").map((a, i): T.Verification => ({
    id: `VER-${String(i + 1).padStart(3, "0")}`, activityId: a.id, status: a.status, by: "E01",
    at: `${a.date}T15:${String((i * 7) % 60).padStart(2, "0")}:00+07:00`,
    note: a.status === "approved" ? "Data dan bukti sesuai." : a.status === "revision" ? "Data potensi dan sumber riset belum lengkap. Mohon dilengkapi lalu ajukan kembali." : "Bukti kunjungan tidak lengkap.",
  })),
];

export const auditLogs: T.AuditLog[] = [
  { id: "AUD-001", at: "2026-10-01T08:00:00+07:00", actorId: "E06", action: "periode.diaktifkan", entity: "assessment_periods", entityId: "PRD-2026-Q4", detail: "Periode Triwulan IV 2026 diaktifkan." },
  { id: "AUD-002", at: "2026-10-01T08:20:00+07:00", actorId: "E06", action: "target.dibuat", entity: "kpi_targets", entityId: "TG-02", detail: "Target Perolehan Oplah divisi Marketing: 1.500 eksemplar." },
  { id: "AUD-003", at: "2026-10-01T08:25:00+07:00", actorId: "E06", action: "target.dibuat", entity: "kpi_targets", entityId: "TG-03", detail: "Target Nilai Deal divisi Marketing: Rp100.000.000." },
  { id: "AUD-004", at: "2026-10-02T09:10:00+07:00", actorId: "E07", action: "mapping.diubah", entity: "kpi_activity_mappings", entityId: "MAP-05", detail: "Mapping Hasil Deal ke Nilai Deal diubah dari hitung menjadi jumlah nilai." },
  { id: "AUD-005", at: "2026-10-28T16:05:00+07:00", actorId: "E01", action: "verifikasi.disetujui", entity: "activities", entityId: "ACT-030", detail: "Aktivitas ACT-030 disetujui." },
  { id: "AUD-006", at: "2026-10-18T10:12:00+07:00", actorId: "E01", action: "verifikasi.ditolak", entity: "activities", entityId: "ACT-029", detail: "Aktivitas ACT-029 ditolak: bukti kunjungan tidak lengkap." },
  { id: "AUD-007", at: "2026-10-09T11:00:00+07:00", actorId: "E01", action: "verifikasi.revisi", entity: "activities", entityId: "ACT-015", detail: "Aktivitas ACT-015 diminta revisi." },
  { id: "AUD-008", at: "2026-09-30T17:00:00+07:00", actorId: "E06", action: "periode.ditutup", entity: "assessment_periods", entityId: "PRD-2026-Q3", detail: "Periode Triwulan III 2026 ditutup." },
];

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
