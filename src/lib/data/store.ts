/**
 * Penyimpanan data MODE DEMO (memori proses server; reset saat server restart).
 * Semua halaman membaca lewat modul ini, sehingga saat beralih ke Supabase cukup
 * mengganti isi fungsi di sini dengan query repository (lihat database/README.md).
 */
import * as M from "./mock";
import type * as T from "./types";
import { canVerify, type Actor } from "../../features/verification/rules";

const clone = <X,>(v: X): X => structuredClone(v);
interface State {
  employees: T.Employee[]; activities: T.Activity[]; verifications: T.Verification[]; clients: T.Client[];
  offers: T.Offer[]; programs: T.Program[]; auditLogs: T.AuditLog[]; criteria: T.SpkCriterion[]; snapshots: T.SawSnapshot[];
  targets: T.KpiTarget[]; periods: T.Period[];
}
const g = globalThis as unknown as { __rk?: State };
export const db: State = (g.__rk ??= {
  employees: clone(M.employees), activities: clone(M.activities), verifications: clone(M.verifications), clients: clone(M.clients),
  offers: clone(M.offers), programs: clone(M.programs), auditLogs: clone(M.auditLogs), criteria: clone(M.spkCriteria), snapshots: [],
  targets: clone(M.kpiTargets), periods: clone(M.periods),
});

export const divisions = M.divisions;
export const positions = M.positions;
export const indicators = M.indicators;
export const categories = M.kpiCategories;
export const mappings = M.kpiMappings;

export const employee = (id?: string | null) => db.employees.find((x) => x.id === id);
export const employeeName = (id?: string | null) => employee(id)?.name ?? "—";
export const divisionName = (id?: string | null) => divisions.find((d) => d.id === id)?.name ?? "—";
export const positionName = (id?: string | null) => positions.find((p) => p.id === id)?.name ?? "—";
export const client = (id?: string | null) => db.clients.find((c) => c.id === id);
export const offer = (id?: string | null) => db.offers.find((o) => o.id === id);
export const indicator = (id: string) => indicators.find((i) => i.id === id);
export const period = (id?: string | null) => db.periods.find((p) => p.id === id);
export const activePeriod = () => db.periods.find((p) => p.status === "active") ?? db.periods[0];
export const periodForDate = (d: string) => db.periods.find((p) => d >= p.start && d <= p.end);

export type Viewer = { id: string; role: T.Role };
/** Cakupan data: Pengguna = diri sendiri, Admin/HRD = semua. */
export function visibleEmployeeIds(v: Viewer): string[] {
  if (v.role === "admin" || v.role === "hrd") return db.employees.map((e) => e.id);
  return [v.id];
}
export const teamOf = (supervisorId: string) => db.employees.filter((e) => e.supervisorId === supervisorId);
export const activitiesFor = (v: Viewer) => {
  const ids = visibleEmployeeIds(v);
  return db.activities.filter((a) => ids.includes(a.ownerId) || a.createdBy === v.id).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
};
export const activity = (id: string) => db.activities.find((a) => a.id === id);
export const historyOf = (activityId: string) => db.verifications.filter((v) => v.activityId === activityId).sort((a, b) => a.at.localeCompare(b.at));

export function offerOutcome(offerId: string): { status: "open" | "deal" | "no"; activity?: T.Activity } {
  const o = db.activities.filter((a) => a.type === "outcome" && a.offerId === offerId && (a.status === "approved" || a.status === "pending"))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return o ? { status: o.outcome!, activity: o } : { status: "open" };
}
export const progressOf = (offerId: string) => db.activities.filter((a) => a.type === "progress" && a.offerId === offerId).sort((a, b) => a.date.localeCompare(b.date));

let seq = 100;
const nextId = (prefix: string) => `${prefix}-${String(++seq).padStart(3, "0")}`;

export function addAudit(actorId: string, action: string, entity: string, entityId: string, detail: string) {
  db.auditLogs.unshift({ id: nextId("AUD"), at: new Date().toISOString(), actorId, action, entity, entityId, detail });
}

export type Result<R = unknown> = { ok: true; data: R } | { ok: false; error: string; fields?: Record<string, string> };

export function createActivity(actor: Viewer, input: Record<string, any>): Result<T.Activity> {
  const owner = employee(input.ownerId);
  if (!owner) return { ok: false, error: "Pemilik aktivitas tidak ditemukan.", fields: { ownerId: "Pemilik tidak valid." } };
  if (!visibleEmployeeIds(actor).includes(owner.id) || actor.role === "hrd" || actor.role === "admin")
    return { ok: false, error: "Anda tidak berhak mencatat aktivitas untuk pemilik ini.", fields: { ownerId: "Di luar kewenangan Anda." } };
  const p = periodForDate(input.date);
  if (!p) return { ok: false, error: "Tanggal tidak berada pada periode penilaian mana pun.", fields: { date: "Tidak ada periode untuk tanggal ini." } };
  if (p.status === "closed") return { ok: false, error: `Periode ${p.name} sudah ditutup dan tidak dapat diubah.`, fields: { date: "Periode sudah ditutup." } };

  const a: T.Activity = {
    id: nextId("ACT"), type: input.type, ownerId: owner.id, createdBy: actor.id, date: input.date, periodId: p.id,
    description: input.description, status: "pending",
  };
  const detail = `${a.id} (${a.type}) dibuat oleh ${employeeName(actor.id)} untuk ${owner.name}.`;
  switch (input.type) {
    case "oplah": Object.assign(a, { qty: input.qty, source: input.source, sourceName: input.sourceName }); break;
    case "client": {
      const c: T.Client = { id: nextId("CL"), name: input.clientName, sector: input.sector, contact: input.contact, phone: input.phone, city: input.city, ownerId: owner.id, createdAt: input.date };
      db.clients.push(c); a.clientId = c.id; break;
    }
    case "profiling": Object.assign(a, { clientId: input.clientId, potential: input.potential }); break;
    case "offer": {
      const o: T.Offer = { id: nextId("OFR"), clientId: input.clientId, programName: input.programName, ownerId: owner.id, date: input.date, value: input.value, periodId: p.id, note: "" };
      db.offers.push(o); Object.assign(a, { offerId: o.id, clientId: o.clientId, value: o.value }); break;
    }
    case "progress": Object.assign(a, { offerId: input.offerId, progressType: input.progressType }); break;
    case "program": {
      const pr: T.Program = { id: nextId("PRG"), name: input.programName, kind: input.kind, start: input.start, end: input.end, ownerId: owner.id, participantClientIds: input.participants ?? [], value: input.value ?? 0, status: "rencana" };
      db.programs.push(pr); a.programId = pr.id; break;
    }
    case "outcome": {
      const cur = offerOutcome(input.offerId);
      if (cur.status !== "open") return { ok: false, error: "Penawaran ini sudah memiliki hasil akhir aktif.", fields: { offerId: "Sudah ada hasil akhir." } };
      const o = offer(input.offerId);
      Object.assign(a, { offerId: input.offerId, outcome: input.outcome, value: input.outcome === "deal" ? o?.value : undefined });
      if (input.outcome === "no") Object.assign(a, { reasonCategory: input.reasonCategory, reason: input.reason });
      break;
    }
  }
  db.activities.push(a);
  addAudit(actor.id, "aktivitas.dibuat", "activities", a.id, detail);
  return { ok: true, data: a };
}

export function verifyActivity(actor: Actor, id: string, status: "approved" | "rejected" | "revision", note: string): Result<T.Activity> {
  const a = activity(id);
  if (!a) return { ok: false, error: "Aktivitas tidak ditemukan." };
  const check = canVerify(actor, a, db.employees);
  if (!check.ok) return { ok: false, error: check.reason };
  if (status !== "approved" && note.trim().length < 5) return { ok: false, error: "Catatan wajib diisi saat menolak atau meminta revisi.", fields: { note: "Isi alasan minimal 5 karakter." } };
  const p = period(a.periodId);
  if (p?.status === "closed") return { ok: false, error: "Periode sudah ditutup; verifikasi tidak dapat diubah." };
  a.status = status;
  db.verifications.push({ id: nextId("VER"), activityId: id, status, by: actor.id, at: new Date().toISOString(), note: note.trim() || "Data dan bukti sesuai." });
  const label = { approved: "disetujui", rejected: "ditolak", revision: "diminta revisi" }[status];
  addAudit(actor.id, `verifikasi.${status === "revision" ? "revisi" : label}`, "activities", id, `Aktivitas ${id} ${label}.${note ? " Catatan: " + note.trim() : ""}`);
  return { ok: true, data: a };
}

export function resubmitActivity(actor: Actor, id: string, patch: { description: string; qty?: number; value?: number }): Result<T.Activity> {
  const a = activity(id);
  if (!a) return { ok: false, error: "Aktivitas tidak ditemukan." };
  if (a.status !== "revision" || (a.ownerId !== actor.id && a.createdBy !== actor.id)) return { ok: false, error: "Aktivitas ini tidak dapat diperbaiki oleh Anda." };
  if (patch.description.trim().length < 10) return { ok: false, error: "Deskripsi minimal 10 karakter.", fields: { description: "Terlalu pendek." } };
  a.description = patch.description.trim();
  if (patch.qty != null && a.type === "oplah") a.qty = patch.qty;
  a.status = "pending";
  db.verifications.push({ id: nextId("VER"), activityId: id, status: "pending", by: actor.id, at: new Date().toISOString(), note: "Diajukan kembali setelah revisi." });
  addAudit(actor.id, "aktivitas.diajukan-ulang", "activities", id, `Aktivitas ${id} diperbaiki dan diajukan kembali.`);
  return { ok: true, data: a };
}

export function notificationsFor(v: Viewer) {
  const out: { id: string; tone: "info" | "warning" | "danger" | "success"; title: string; body: string; href: string; at: string }[] = [];
  if (v.role === "hrd" || v.role === "admin") {
    db.activities.filter((a) => a.status === "pending" && a.ownerId !== v.id).forEach((a) =>
      out.push({ id: a.id, tone: "warning", title: `${a.id} menunggu verifikasi`, body: `${employeeName(a.ownerId)}: ${a.description}`, href: `/hrd/verifications/${a.id}`, at: a.date }));
  }
  if (v.role === "employee") {
    db.activities.filter((a) => (a.ownerId === v.id || a.createdBy === v.id) && (a.status === "revision" || a.status === "rejected")).forEach((a) => {
      const last = historyOf(a.id).at(-1);
      out.push({ id: a.id, tone: a.status === "revision" ? "warning" : "danger", title: `${a.id} ${a.status === "revision" ? "perlu revisi" : "ditolak"}`, body: last?.note ?? "", href: `/employee/activities/${a.id}`, at: last?.at ?? a.date });
    });
  }
  if (v.role === "hrd") {
    const p = activePeriod();
    out.push({ id: "n-per", tone: "info", title: `Periode aktif: ${p.name}`, body: `Berakhir ${p.end}. Pastikan target dan mapping KPI sudah final.`, href: "/hrd/periods", at: p.start });
    const pend = db.activities.filter((a) => a.status === "pending").length;
    if (pend) out.push({ id: "n-pend", tone: "warning", title: `${pend} aktivitas belum diverifikasi`, body: "Aktivitas pending belum masuk realisasi KPI.", href: "/hrd/verifications", at: p.start });
  }
  if (v.role === "admin") out.push({ id: "n-adm", tone: "info", title: "Mode demo aktif", body: "Data berasal dari contoh di memori server. Hubungkan Supabase untuk data nyata.", href: "/admin/settings", at: "2026-11-08" });
  return out.sort((a, b) => b.at.localeCompare(a.at));
}
