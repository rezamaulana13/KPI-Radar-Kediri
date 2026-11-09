import type { APIRoute } from "astro";
import { db, divisionName, employeeName, period } from "../../../lib/data/store";
import { selectedPeriod } from "../../../lib/utils/period";
import { TYPE_LABEL } from "../../../lib/formatters";

const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
export const GET: APIRoute = ({ url, locals }) => {
  if (locals.user?.role !== "hrd") return new Response("Akses ditolak", { status: 403 });
  const p = selectedPeriod(url) ?? period("");
  const head = ["ID", "Tanggal", "Jenis", "Pemilik", "Divisi", "Pencatat", "Status", "Deskripsi"];
  const lines = db.activities.filter((a) => a.periodId === p!.id).map((a) => [a.id, a.date, TYPE_LABEL[a.type], employeeName(a.ownerId), divisionName(db.employees.find((e) => e.id === a.ownerId)?.divisionId), employeeName(a.createdBy), a.status, a.description].map(cell).join(","));
  return new Response("\uFEFF" + [head.map(cell).join(","), ...lines].join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="laporan-aktivitas-${p!.id}.csv"` } });
};
