import type { APIRoute } from "astro";
import { db, employeeName } from "../../../lib/data/store";
import { syncDeleteActivity } from "../../../lib/supabase/sync";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const fd = await request.formData();
  const activityId = fd.get("activityId")?.toString();
  const back = fd.get("back")?.toString() || "/hrd/verifications";

  if (!activityId) {
    return redirect(`${back}?error=missing_id`);
  }

  const actIndex = db.activities.findIndex((a) => a.id === activityId);
  if (actIndex === -1) {
    return redirect(`${back}?error=activity_not_found`);
  }

  const act = db.activities[actIndex];

  // Hanya HRD, Super Admin, atau pemilik aktivitas yang berhak menghapus
  const isHRDOrAdmin = user.role === "hrd" || user.role === "admin";
  const isOwner = act.ownerId === user.id && act.status === "pending";

  if (!isHRDOrAdmin && !isOwner) {
    return new Response("Akses ditolak: Anda tidak memiliki wewenang menghapus laporan aktivitas ini.", { status: 403 });
  }

  // 1. Hapus dari memori store
  db.activities.splice(actIndex, 1);

  // 2. Hapus juga dari riwayat verifikasi di memori
  db.verifications = db.verifications.filter((v) => v.activityId !== activityId);

  // 3. Hapus permanen dari database Supabase
  await syncDeleteActivity(activityId);

  // 4. Catat ke Audit Log
  db.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    actorId: user.id,
    action: "DELETE_ACTIVITY",
    entity: "activity",
    entityId: activityId,
    detail: `Menghapus laporan ${activityId} (${act.type}) milik ${employeeName(act.ownerId)}`,
    at: new Date().toISOString(),
  });

  return redirect(`/hrd/verifications?deleted=${activityId}`);
};

