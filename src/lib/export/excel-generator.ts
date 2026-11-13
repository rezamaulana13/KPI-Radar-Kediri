import ExcelJS from "exceljs";
import { db, activitiesFor, employee, divisionName, positions } from "../data/store";
import { achievements } from "../../features/kpi/achievements";
import { computeSaw } from "../../features/spk/saw";
import { sawAlternatives } from "../../features/spk/build-input";
import { num, rupiah, dateID, TYPE_LABEL, STATUS_LABEL } from "../formatters";

// Palette styling profesional
const HEADER_FILL_BLUE: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF12345A" }, // Navy khas Radar Kediri
};

const HEADER_FILL_GOLD: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD97706" },
};

const HEADER_FILL_GRAY: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF1F5F9" },
};

const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFE2E8F0" } },
  left: { style: "thin", color: { argb: "FFE2E8F0" } },
  bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
  right: { style: "thin", color: { argb: "FFE2E8F0" } },
};

/**
 * 1. EXCEL UNTUK KARYAWAN / PENGGUNA (EMPLOYEE)
 * Berisi Rekapitulasi Kinerja Bulanan & Log Aktivitas Pribadi
 */
export async function generateEmployeeExcel(userId: string, periodId: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "PT Kediri Intermedia Pers (Radar Kediri)";
  wb.created = new Date();

  const p = db.periods.find((x) => x.id === periodId) ?? db.periods[0];
  const emp = db.employees.find((e) => e.id === userId) || employee(userId);
  const posName = positions.find((pos) => pos.id === emp?.positionId)?.name ?? "Eksekutif Marketing";
  const divName = divisionName(emp?.divisionId) || "Divisi Pemasaran & Sirkulasi";
  const nip = emp?.nip || `RK-${userId.slice(0, 4).toUpperCase()}`;

  // Data aktivitas dan KPI
  const myActs = activitiesFor({ id: userId, role: "employee" })
    .filter((a) => a.periodId === p.id && (a.ownerId === userId || a.createdBy === userId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const rows = achievements(p.id);
  const myTargets = rows.filter((r) => r.target.employeeId === userId);
  const measurable = myTargets.filter((r) => r.percent != null);
  const avgPercent = measurable.length
    ? Math.round(measurable.reduce((s, r) => s + Math.min(r.percent!, 100), 0) / measurable.length)
    : 0;

  const approvedCount = myActs.filter((a) => a.status === "approved").length;
  const pendingCount = myActs.filter((a) => a.status === "pending").length;
  const revisionCount = myActs.filter((a) => a.status === "revision").length;
  const rejectedCount = myActs.filter((a) => a.status === "rejected").length;

  // --- SHEET 1: RAPOR KINERJA BULANAN ---
  const ws1 = wb.addWorksheet("Rapor Kinerja Bulanan");
  ws1.views = [{ showGridLines: true }];

  // Header Title
  ws1.mergeCells("A1:G1");
  ws1.getCell("A1").value = "PT KEDIRI INTERMEDIA PERS — JAWA POS RADAR KEDIRI";
  ws1.getCell("A1").font = { name: "Arial", size: 14, bold: true, color: { argb: "FF12345A" } };

  ws1.mergeCells("A2:G2");
  ws1.getCell("A2").value = `REKAPITULASI CAPAIAN TARGET KINERJA (KPI) BULANAN`;
  ws1.getCell("A2").font = { name: "Arial", size: 12, bold: true };

  ws1.mergeCells("A3:G3");
  ws1.getCell("A3").value = `Periode Evaluasi: ${p.name} (${p.start} s/d ${p.end})`;
  ws1.getCell("A3").font = { name: "Arial", size: 10, italic: true, color: { argb: "FF64748B" } };

  // Profil Karyawan Box
  ws1.addRow([]);
  ws1.addRow(["Nama Karyawan", emp?.name ?? "Karyawan", "", "Rata-rata Capaian", `${avgPercent}%`]);
  ws1.addRow(["NIP", nip, "", "Total Laporan Diajukan", myActs.length]);
  ws1.addRow(["Jabatan", posName, "", "Laporan Disetujui (Sah)", approvedCount]);
  ws1.addRow(["Divisi", divName, "", "Menunggu Verifikasi", pendingCount]);
  ws1.addRow(["Tanggal Unduh", new Date().toLocaleString("id-ID"), "", "Perlu Revisi / Ditolak", revisionCount + rejectedCount]);

  for (let r = 5; r <= 9; r++) {
    ws1.getCell(`A${r}`).font = { bold: true };
    ws1.getCell(`D${r}`).font = { bold: true };
    ws1.getCell(`E${r}`).font = { bold: true, color: { argb: r === 5 ? "FF16A34A" : "FF0F172A" } };
  }

  // Tabel Target & Realisasi
  ws1.addRow([]);
  const tableHeaderRow = ws1.addRow([
    "No",
    "Kode",
    "Indikator Kinerja (KPI)",
    "Satuan",
    "Target Bulanan",
    "Realisasi Terverifikasi",
    "Capaian (%)",
    "Status Evaluasi",
  ]);

  tableHeaderRow.eachCell((cell) => {
    cell.fill = HEADER_FILL_BLUE;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  myTargets.forEach((t, idx) => {
    const pctVal = t.percent != null ? Math.round(t.percent) : 0;
    const statusText = pctVal >= 100 ? "Tercapai Optimal" : pctVal >= 75 ? "Memenuhi Target" : "Perlu Peningkatan";
    const row = ws1.addRow([
      idx + 1,
      t.indicator.code,
      t.indicator.name,
      t.indicator.unit,
      t.target.value,
      t.actual,
      `${pctVal}%`,
      statusText,
    ]);

    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(4).alignment = { horizontal: "center" };
    row.getCell(5).alignment = { horizontal: "right" };
    row.getCell(6).alignment = { horizontal: "right" };
    row.getCell(7).alignment = { horizontal: "right" };
    row.getCell(8).alignment = { horizontal: "center" };

    row.eachCell((c) => {
      c.border = BORDER_THIN;
      c.font = { name: "Arial", size: 10 };
    });
  });

  ws1.columns = [
    { width: 6 },
    { width: 12 },
    { width: 35 },
    { width: 14 },
    { width: 16 },
    { width: 22 },
    { width: 15 },
    { width: 20 },
  ];

  // --- SHEET 2: LOG AKTIVITAS HARIAN ---
  const ws2 = wb.addWorksheet("Log Aktivitas Harian");
  ws2.views = [{ showGridLines: true }];

  ws2.mergeCells("A1:I1");
  ws2.getCell("A1").value = `LOG SELURUH LAPORAN AKTIVITAS HARIAN — ${emp?.name.toUpperCase()} (${nip})`;
  ws2.getCell("A1").font = { name: "Arial", size: 12, bold: true, color: { argb: "FF12345A" } };

  ws2.mergeCells("A2:I2");
  ws2.getCell("A2").value = `Periode: ${p.name} | Tanggal Cetak: ${new Date().toLocaleString("id-ID")}`;
  ws2.getCell("A2").font = { name: "Arial", size: 9, italic: true, color: { argb: "FF64748B" } };

  ws2.addRow([]);
  const actHeader = ws2.addRow([
    "No",
    "ID Aktivitas",
    "Tanggal",
    "Jenis Kegiatan",
    "Deskripsi Rincian Pekerjaan",
    "Kuantitas / Nilai",
    "Mitra / Klien",
    "Status Verifikasi",
    "Catatan Evaluasi HRD",
  ]);

  actHeader.eachCell((cell) => {
    cell.fill = HEADER_FILL_BLUE;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  myActs.forEach((a, idx) => {
    const valText = a.qty
      ? `${num(a.qty)} eks`
      : a.value
      ? rupiah(a.value)
      : a.payload?.amount
      ? rupiah(Number(a.payload.amount))
      : "—";

    const clientText = a.payload?.clientName ?? a.payload?.sourceName ?? "—";
    const statusText = STATUS_LABEL[a.status] ?? a.status;

    const row = ws2.addRow([
      idx + 1,
      a.id,
      dateID(a.date),
      TYPE_LABEL[a.type] ?? a.type,
      a.description,
      valText,
      clientText,
      statusText,
      a.verificationNote ?? "—",
    ]);

    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(3).alignment = { horizontal: "center" };
    row.getCell(8).alignment = { horizontal: "center" };

    row.eachCell((c) => {
      c.border = BORDER_THIN;
      c.font = { name: "Arial", size: 9 };
    });
  });

  ws2.columns = [
    { width: 6 },
    { width: 14 },
    { width: 14 },
    { width: 20 },
    { width: 45 },
    { width: 18 },
    { width: 22 },
    { width: 18 },
    { width: 30 },
  ];

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/**
 * 2. EXCEL UNTUK ADMIN HRD (HRD)
 * Berisi Rekapitulasi Seluruh Karyawan, Verifikasi, & Hasil SPK Metode SAW
 */
export async function generateHrdExcel(periodId: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Admin HRD PT Kediri Intermedia Pers";
  wb.created = new Date();

  const p = db.periods.find((x) => x.id === periodId) ?? db.periods[0];
  const allEmps = db.employees.filter((e) => e.role === "employee");
  const criteria = db.criteria;
  const alts = sawAlternatives(p.id, criteria);
  const sawRes = computeSaw(criteria, alts);
  const rankings = sawRes.ranking;

  // --- SHEET 1: REKAP KINERJA KARYAWAN (ALL EMPLOYEES) ---
  const ws1 = wb.addWorksheet("Rekapitulasi Kinerja Karyawan");
  ws1.views = [{ showGridLines: true }];

  ws1.mergeCells("A1:J1");
  ws1.getCell("A1").value = "PT KEDIRI INTERMEDIA PERS — JAWA POS RADAR KEDIRI";
  ws1.getCell("A1").font = { name: "Arial", size: 14, bold: true, color: { argb: "FF12345A" } };

  ws1.mergeCells("A2:J2");
  ws1.getCell("A2").value = `REKAPITULASI KINERJA SELURUH KARYAWAN TIM MARKETING & SIRKULASI`;
  ws1.getCell("A2").font = { name: "Arial", size: 12, bold: true };

  ws1.mergeCells("A3:J3");
  ws1.getCell("A3").value = `Periode Evaluasi Bulanan: ${p.name} | Diekspor oleh Admin HRD pada: ${new Date().toLocaleString("id-ID")}`;
  ws1.getCell("A3").font = { name: "Arial", size: 9, italic: true, color: { argb: "FF64748B" } };

  ws1.addRow([]);
  const hrdHeader = ws1.addRow([
    "No",
    "NIP",
    "Nama Karyawan",
    "Divisi",
    "Jabatan",
    "Total Laporan",
    "Disetujui HRD",
    "Menunggu",
    "Perlu Revisi/Tolak",
    "Rata-rata Capaian KPI",
  ]);

  hrdHeader.eachCell((c) => {
    c.fill = HEADER_FILL_BLUE;
    c.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    c.alignment = { horizontal: "center", vertical: "middle" };
  });

  const allRows = achievements(p.id);

  allEmps.forEach((e, idx) => {
    const userActs = db.activities.filter((a) => a.periodId === p.id && a.ownerId === e.id);
    const approved = userActs.filter((a) => a.status === "approved").length;
    const pending = userActs.filter((a) => a.status === "pending").length;
    const revOrRej = userActs.filter((a) => a.status === "revision" || a.status === "rejected").length;

    const userTargets = allRows.filter((r) => r.target.employeeId === e.id && r.percent != null);
    const avg = userTargets.length
      ? Math.round(userTargets.reduce((s, r) => s + Math.min(r.percent!, 100), 0) / userTargets.length)
      : 0;

    const pos = positions.find((x) => x.id === e.positionId)?.name ?? "Eksekutif Marketing";
    const div = divisionName(e.divisionId) || "Pemasaran";

    const row = ws1.addRow([
      idx + 1,
      e.nip,
      e.name,
      div,
      pos,
      userActs.length,
      approved,
      pending,
      revOrRej,
      `${avg}%`,
    ]);

    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(6).alignment = { horizontal: "right" };
    row.getCell(7).alignment = { horizontal: "right" };
    row.getCell(8).alignment = { horizontal: "right" };
    row.getCell(9).alignment = { horizontal: "right" };
    row.getCell(10).alignment = { horizontal: "right" };

    row.eachCell((cell) => {
      cell.border = BORDER_THIN;
      cell.font = { name: "Arial", size: 10 };
    });
  });

  ws1.columns = [
    { width: 6 },
    { width: 14 },
    { width: 25 },
    { width: 25 },
    { width: 22 },
    { width: 14 },
    { width: 15 },
    { width: 14 },
    { width: 18 },
    { width: 22 },
  ];

  // --- SHEET 2: HASIL SPK SAW ---
  const ws2 = wb.addWorksheet("Hasil SPK Metode SAW");
  ws2.views = [{ showGridLines: true }];

  ws2.mergeCells("A1:H1");
  ws2.getCell("A1").value = `HASIL EVALUASI SPK METODE SIMPLE ADDITIVE WEIGHTING (SAW)`;
  ws2.getCell("A1").font = { name: "Arial", size: 12, bold: true, color: { argb: "FF12345A" } };

  ws2.mergeCells("A2:H2");
  ws2.getCell("A2").value = `Perangkingan obyektif berdasarkan bobot kriteria preferensi normalisasi matriks (R) dan nilai akhir (V)`;
  ws2.getCell("A2").font = { name: "Arial", size: 9, italic: true };

  ws2.addRow([]);
  const sawHeader = ws2.addRow([
    "Peringkat",
    "NIP",
    "Nama Karyawan",
    "Divisi",
    "Nilai Akhir SAW (V)",
    "Predikat Rekomendasi",
    "Capaian Tertinggi",
    "Catatan Evaluasi HRD",
  ]);

  sawHeader.eachCell((c) => {
    c.fill = HEADER_FILL_GOLD;
    c.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    c.alignment = { horizontal: "center", vertical: "middle" };
  });

  rankings.forEach((r, idx) => {
    const e = db.employees.find((x) => x.id === r.id);
    const scoreVal = Number(r.score.toFixed(4));
    const predicate = scoreVal >= 0.85 ? "Sangat Baik" : scoreVal >= 0.70 ? "Baik" : scoreVal >= 0.55 ? "Cukup" : "Kurang";
    const div = divisionName(e?.divisionId) || "Pemasaran";

    const row = ws2.addRow([
      `Rank #${r.rank || idx + 1}`,
      e?.nip ?? "—",
      e?.name ?? "—",
      div,
      scoreVal,
      predicate,
      "Performa Terverifikasi",
      scoreVal >= 0.75 ? "Rekomendasi Insentif & Apresiasi" : "Perlu Bimbingan & Peningkatan Target",
    ]);

    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(5).alignment = { horizontal: "right" };
    row.getCell(6).alignment = { horizontal: "center" };

    row.eachCell((cell) => {
      cell.border = BORDER_THIN;
      cell.font = { name: "Arial", size: 10 };
    });
  });

  ws2.columns = [
    { width: 12 },
    { width: 14 },
    { width: 25 },
    { width: 25 },
    { width: 20 },
    { width: 22 },
    { width: 22 },
    { width: 35 },
  ];

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/**
 * 3. EXCEL UNTUK SUPER ADMIN (ADMIN)
 * Berisi Laporan Eksekutif Bisnis Korporat, Omset Iklan, Sirkulasi Oplah, & Audit Log Sistem
 */
export async function generateAdminExcel(periodId: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Super Admin PT Kediri Intermedia Pers";
  wb.created = new Date();

  const p = db.periods.find((x) => x.id === periodId) ?? db.periods[0];

  // --- SHEET 1: RINGKASAN EKSEKUTIF BISNIS & OPERASIONAL ---
  const ws1 = wb.addWorksheet("Laporan Eksekutif Korporat");
  ws1.views = [{ showGridLines: true }];

  ws1.mergeCells("A1:F1");
  ws1.getCell("A1").value = "PT KEDIRI INTERMEDIA PERS — JAWA POS RADAR KEDIRI";
  ws1.getCell("A1").font = { name: "Arial", size: 14, bold: true, color: { argb: "FF12345A" } };

  ws1.mergeCells("A2:F2");
  ws1.getCell("A2").value = `LAPORAN EKSEKUTIF BISNIS & KINERJA OPERASIONAL KORPORAT BULANAN`;
  ws1.getCell("A2").font = { name: "Arial", size: 12, bold: true };

  ws1.mergeCells("A3:F3");
  ws1.getCell("A3").value = `Periode: ${p.name} | Waktu Ekspor: ${new Date().toLocaleString("id-ID")}`;
  ws1.getCell("A3").font = { name: "Arial", size: 9, italic: true, color: { argb: "FF64748B" } };

  // Hitung metrik bisnis periode ini
  const periodActs = db.activities.filter((a) => a.periodId === p.id && a.status === "approved");
  const oplahSum = periodActs.filter((a) => a.type === "oplah").reduce((s, a) => s + (Number(a.payload?.copies) || a.qty || 0), 0);
  const clientCount = periodActs.filter((a) => a.type === "client").length;
  const offerCount = periodActs.filter((a) => a.type === "offer").length;
  const dealActs = periodActs.filter((a) => a.type === "outcome" && a.outcome === "deal");
  const dealValueSum = dealActs.reduce((s, a) => s + (Number(a.payload?.amount) || a.value || 0), 0);
  const programCount = periodActs.filter((a) => a.type === "program").length;

  ws1.addRow([]);
  ws1.addRow(["METRIK INDIKATOR KORPORAT", "TOTAL REALISASI BULAN INI", "SATUAN", "KETERANGAN OPERASIONAL"]);
  ws1.getRow(5).eachCell((c) => {
    c.fill = HEADER_FILL_BLUE;
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
  });

  const kpiData = [
    ["Distribusi Sirkulasi Oplah Koran", oplahSum, "eksemplar", "Total koran terdistribusi via loper/agen terverifikasi"],
    ["Perolehan Mitra / Klien Iklan Baru", clientCount, "instansi/mitra", "Pendaftaran OPD pemda, swasta, dan UMKM baru"],
    ["Proposal Penawaran Iklan Terbit", offerCount, "proposal", "Penawaran display, advertorial, dan suplemen"],
    ["Total Transaksi Iklan Closing Deal", dealValueSum, "Rupiah (Rp)", "Nilai omset iklan yang berhasil closing dan disetujui"],
    ["Program Kemitraan & Event Barter", programCount, "kegiatan", "Event jalan sehat, pameran expo, dan kerjasama barter"],
  ];

  kpiData.forEach((row) => {
    const r = ws1.addRow([
      row[0],
      typeof row[1] === "number" && row[2].includes("Rp") ? rupiah(row[1]) : num(Number(row[1])),
      row[2],
      row[3],
    ]);
    r.eachCell((c) => (c.border = BORDER_THIN));
  });

  // Distribusi Wilayah Liputan
  ws1.addRow([]);
  ws1.addRow(["WILAYAH JANGKAUAN SIRKULASI", "STATUS LIPUTAN", "KANTOR BIRO", "KETERANGAN"]);
  ws1.getRow(12).eachCell((c) => {
    c.fill = HEADER_FILL_GRAY;
    c.font = { bold: true };
  });

  const regions = [
    ["Kota Kediri", "Aktif Penuh", "Kantor Pusat Jl. Brawijaya 27D", "Pusat pemerintahan & bisnis utama"],
    ["Kabupaten Kediri", "Aktif Penuh", "Biro Pare & Ngasem", "Pemerintahan kabupaten, sentra industri, Pare"],
    ["Kabupaten Nganjuk", "Aktif", "Biro Nganjuk Kota", "Sirkulasi harian dan advertorial OPD"],
    ["Kabupaten Tulungagung", "Aktif", "Biro Tulungagung", "Sirkulasi pesisir selatan dan kemitraan"],
    ["Kota & Kab. Blitar", "Aktif", "Biro Blitar", "Wilayah liputan terpadu Blitar raya"],
    ["Kabupaten Trenggalek", "Aktif", "Biro Trenggalek", "Sirkulasi distribusi ritel dan instansi"],
  ];

  regions.forEach((r) => {
    const row = ws1.addRow(r);
    row.eachCell((c) => (c.border = BORDER_THIN));
  });

  ws1.columns = [{ width: 38 }, { width: 28 }, { width: 30 }, { width: 45 }];

  // --- SHEET 2: AUDIT LOG KEAMANAN SISTEM ---
  const ws2 = wb.addWorksheet("Audit Log & Histori Sistem");
  ws2.views = [{ showGridLines: true }];

  ws2.mergeCells("A1:G1");
  ws2.getCell("A1").value = `HISTORI AUDIT KEAMANAN & AKTIVITAS SISTEM`;
  ws2.getCell("A1").font = { name: "Arial", size: 12, bold: true, color: { argb: "FF12345A" } };

  ws2.addRow([]);
  const auditHeader = ws2.addRow([
    "No",
    "Waktu Audit (WIB)",
    "Aktor Pelaksana",
    "Kategori Aksi",
    "Tipe Objek",
    "ID Objek",
    "Keterangan Lengkap",
  ]);

  auditHeader.eachCell((c) => {
    c.fill = HEADER_FILL_BLUE;
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.alignment = { horizontal: "center", vertical: "middle" };
  });

  db.auditLogs.slice(0, 100).forEach((l, idx) => {
    const actor = db.employees.find((e) => e.id === l.actorId);
    const row = ws2.addRow([
      idx + 1,
      new Date(l.timestamp).toLocaleString("id-ID"),
      actor ? `${actor.name} (${actor.nip})` : l.actorId,
      l.action,
      l.targetType,
      l.targetId,
      l.details,
    ]);

    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "center" };
    row.eachCell((c) => {
      c.border = BORDER_THIN;
      c.font = { name: "Arial", size: 9 };
    });
  });

  ws2.columns = [
    { width: 6 },
    { width: 22 },
    { width: 25 },
    { width: 18 },
    { width: 16 },
    { width: 18 },
    { width: 45 },
  ];

  return Buffer.from(await wb.xlsx.writeBuffer());
}
