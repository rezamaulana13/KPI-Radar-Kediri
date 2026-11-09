import type { SupabaseClient } from "@supabase/supabase-js";

const MSG: Record<string, string> = {
  "self verification": "Anda tidak dapat memverifikasi aktivitas yang Anda buat atau miliki sendiri.",
  "outside scope": "Aktivitas ini di luar cakupan tim Anda.",
  "note required": "Catatan wajib diisi untuk menolak atau meminta revisi.",
  "not pending": "Aktivitas ini sudah tidak berstatus menunggu.",
};

export async function verifyActivity(db: SupabaseClient, id: string, status: string, note: string) {
  if (!["approved", "rejected", "revision"].includes(status)) return { error: "Status tidak valid." };
  // Aturan inti ada di fungsi database verify_activity agar tidak bisa dilewati.
  const { error } = await db.rpc("verify_activity", { p_activity: id, p_status: status, p_note: note });
  if (!error) return { error: null };
  return { error: Object.entries(MSG).find(([k]) => error.message.includes(k))?.[1] ?? "Verifikasi gagal." };
}
