import type { Activity, Employee } from "../../lib/data/types";

export interface Actor { id: string; role: string }
export type Check = { ok: true } | { ok: false; reason: string; code: "role" | "status" | "scope" | "self" };

/** Aturan verifikasi: hanya HRD atau Admin yang berwenang, tidak boleh memverifikasi aktivitas sendiri. */
export function canVerify(actor: Actor, activity: Activity, employees: Employee[]): Check {
  if (actor.role !== "hrd" && actor.role !== "admin")
    return { ok: false, code: "role", reason: "Hanya Admin (HRD) atau Super Admin yang dapat memverifikasi aktivitas." };
  if (activity.status !== "pending")
    return { ok: false, code: "status", reason: "Aktivitas ini tidak sedang menunggu verifikasi." };
  if (activity.ownerId === actor.id || activity.createdBy === actor.id)
    return { ok: false, code: "self", reason: "Anda tidak dapat memverifikasi aktivitas yang Anda input atau miliki sendiri." };
  return { ok: true };
}

export function canEditAfterRevision(actor: Actor, activity: Activity): boolean {
  return activity.status === "revision" && (activity.ownerId === actor.id || activity.createdBy === actor.id);
}
