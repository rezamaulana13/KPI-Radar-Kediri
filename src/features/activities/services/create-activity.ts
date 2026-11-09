import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityInput } from "../schemas/activity";

export async function createActivity(db: SupabaseClient, actorId: string | null, role: string | null, i: ActivityInput) {
  if (!actorId || (role !== "employee" && role !== "supervisor")) return { error: "Anda tidak berwenang mencatat aktivitas." };
  if (role === "employee" && i.owner_id !== actorId) return { error: "Karyawan hanya dapat mencatat aktivitas sendiri." };
  const { data: period } = await db.from("assessment_periods").select("id")
    .eq("status", "open").lte("start_date", i.activity_date).gte("end_date", i.activity_date).maybeSingle();
  if (!period) return { error: "Tanggal ini berada di luar periode aktif atau periodenya sudah ditutup." };
  const { error } = await db.from("marketing_activities").insert({
    period_id: period.id, owner_id: i.owner_id, created_by: actorId, activity_type: i.activity_type,
    activity_date: i.activity_date, description: i.description,
    quantity: i.activity_type === "oplah" ? i.quantity : null,
    detail: { client: i.client, result: i.result, no_reason: i.no_reason }, status: "pending",
  });
  // Pembatasan lintas tim ditegakkan oleh RLS; pesan database tidak diteruskan ke pengguna.
  return { error: error ? "Aktivitas tidak dapat disimpan. Periksa hak akses Anda." : null };
}
