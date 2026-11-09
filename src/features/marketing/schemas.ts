import { z } from "zod";
import { noReasonCategories, oplahSources, progressTypes } from "../../lib/data/mock";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal wajib diisi.");
const desc = z.string().trim().min(10, "Deskripsi minimal 10 karakter agar dapat diverifikasi.");
const base = { ownerId: z.string().min(1, "Pemilik aktivitas wajib dipilih."), date, description: desc };
const money = z.coerce.number({ error: "Isi dengan angka." }).positive("Nilai harus lebih dari 0.");

export const activitySchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("oplah"), source: z.enum(oplahSources as [string, ...string[]], { error: "Pilih sumber oplah." }), sourceName: z.string().trim().min(2, "Nama sumber wajib diisi."), qty: z.coerce.number({ error: "Isi dengan angka." }).int("Harus bilangan bulat.").positive("Jumlah harus lebih dari 0.") }),
  z.object({ ...base, type: z.literal("client"), clientName: z.string().trim().min(3, "Nama client wajib diisi."), sector: z.string().trim().min(2, "Sektor wajib diisi."), contact: z.string().trim().min(2, "Nama kontak wajib diisi."), phone: z.string().trim().min(6, "Nomor telepon wajib diisi."), city: z.string().trim().min(2, "Kota wajib diisi.") }),
  z.object({ ...base, type: z.literal("profiling"), clientId: z.string().min(1, "Pilih client."), potential: z.enum(["Tinggi", "Sedang", "Rendah"], { error: "Pilih potensi." }) }),
  z.object({ ...base, type: z.literal("offer"), clientId: z.string().min(1, "Pilih client."), programName: z.string().trim().min(3, "Nama paket/penawaran wajib diisi."), value: money }),
  z.object({ ...base, type: z.literal("progress"), offerId: z.string().min(1, "Pilih penawaran."), progressType: z.enum(progressTypes as [string, ...string[]], { error: "Pilih tipe progress." }) }),
  z.object({ ...base, type: z.literal("program"), programName: z.string().trim().min(3, "Nama program wajib diisi."), kind: z.enum(["program", "barter"], { error: "Pilih jenis." }), start: date, end: date, value: z.coerce.number().min(0, "Nilai tidak boleh negatif.").default(0), participants: z.array(z.string()).default([]) }),
  outcomeSchemaInner(),
]);

function outcomeSchemaInner() {
  return z.object({
    ...base, type: z.literal("outcome"), offerId: z.string().min(1, "Pilih penawaran."),
    outcome: z.enum(["deal", "no"], { error: "Pilih hasil akhir Deal atau NO." }),
    reasonCategory: z.string().optional(), reason: z.string().optional(),
  });
}

/** Alasan NO wajib (PRD FR-011): dipakai pada form aktivitas dan form hasil di halaman penawaran. */
export function refineOutcome<T extends { outcome?: string; reasonCategory?: string; reason?: string }>(v: T): Record<string, string> {
  const errs: Record<string, string> = {};
  if (v.outcome === "no") {
    if (!v.reasonCategory || !noReasonCategories.includes(v.reasonCategory)) errs.reasonCategory = "Kategori alasan NO wajib dipilih.";
    if (!v.reason || v.reason.trim().length < 10) errs.reason = "Penjelasan alasan NO wajib diisi (minimal 10 karakter).";
  }
  return errs;
}

export function formToObject(fd: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    const all = fd.getAll(key).map(String);
    o[key] = key === "participants" ? all : all[0];
  }
  return o;
}

export function zodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) { const k = String(i.path[0] ?? "form"); if (!out[k]) out[k] = i.message; }
  return out;
}
