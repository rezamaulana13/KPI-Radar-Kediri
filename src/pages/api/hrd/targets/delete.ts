import type { APIRoute } from "astro";
import { db, indicator, employeeName } from "../../../../lib/data/store";
import { syncDeleteTarget } from "../../../../lib/supabase/sync";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user || (user.role !== "hrd" && user.role !== "admin")) {
    return new Response("Akses ditolak: Hanya HRD atau Super Admin yang berhak menghapus target pemasaran.", { status: 403 });
  }

  const fd = await request.formData();
  const targetId = fd.get("targetId")?.toString();
  const periodId = fd.get("periodId")?.toString();

  if (!targetId || !periodId) {
    return redirect("/hrd/kpi/targets?error=invalid_delete");
  }

  const targetIndex = db.targets.findIndex((t) => t.id === targetId);
  if (targetIndex === -1) {
    return redirect(`/hrd/kpi/targets?period=${periodId}&error=target_not_found`);
  }

  const deletedTarget = db.targets[targetIndex];
  const ind = indicator(deletedTarget.indicatorId);
  const indName = ind?.name ?? deletedTarget.indicatorId;
  const targetSubject = deletedTarget.scope === "individual"
    ? `Individu: ${employeeName(deletedTarget.employeeId)}`
    : "Target Bersama Divisi Pemasaran";

  // Hapus dari database store memori
  db.targets.splice(targetIndex, 1);

  // Hapus dari Supabase Database
  await syncDeleteTarget(targetId);

  // Catat ke Audit Log
  db.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    actorId: user.id,
    action: "DELETE_TARGET",
    entity: "target",
    entityId: targetId,
    detail: `Menghapus target ${indName} (${targetSubject}) pada periode ${periodId}`,
    at: new Date().toISOString(),
  });

  return redirect(`/hrd/kpi/targets?period=${periodId}&deleted=${encodeURIComponent(indName)}`);
};

