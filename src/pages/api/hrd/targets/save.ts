import type { APIRoute } from "astro";
import { db, indicator, employeeName } from "../../../../lib/data/store";
import type { KpiScope } from "../../../../lib/data/types";
import { syncSaveTarget } from "../../../../lib/supabase/sync";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user || (user.role !== "hrd" && user.role !== "admin")) {
    return new Response("Akses ditolak: Hanya HRD atau Super Admin yang berhak mengatur target pemasaran.", { status: 403 });
  }

  const fd = await request.formData();
  const targetId = fd.get("targetId")?.toString() || undefined;
  const periodId = fd.get("periodId")?.toString();
  const indicatorId = fd.get("indicatorId")?.toString();
  const targetValue = Number(fd.get("value"));
  const scope = (fd.get("scope")?.toString() || "division") as KpiScope;
  const employeeId = fd.get("employeeId")?.toString() || undefined;

  if (!periodId || !indicatorId || isNaN(targetValue) || targetValue <= 0) {
    return redirect(`/hrd/kpi/targets?error=invalid_input`);
  }

  if (scope === "individual" && !employeeId) {
    return redirect(`/hrd/kpi/targets?error=missing_employee`);
  }

  // Cari target yang cocok: utamakan berdasarkan targetId yang dikirim saat tombol Ubah diklik
  let existingIndex = -1;
  if (targetId) {
    existingIndex = db.targets.findIndex((t) => t.id === targetId);
  }

  // Jika tidak ada targetId, cari berdasarkan kombinasi (indikator + periode + scope + subjek)
  if (existingIndex === -1) {
    existingIndex = db.targets.findIndex((t) => {
      if (t.periodId !== periodId || t.indicatorId !== indicatorId) return false;
      if (scope === "individual") return t.scope === "individual" && t.employeeId === employeeId;
      return t.scope === "division" || t.scope === "company";
    });
  }

  const ind = indicator(indicatorId);
  const indName = ind?.name ?? indicatorId;
  const subjectName = scope === "individual" ? employeeName(employeeId) : "Divisi Pemasaran & Sirkulasi";

  if (existingIndex >= 0) {
    // Update target yang sudah ada
    const targetObj = db.targets[existingIndex];
    const oldVal = targetObj.value;
    targetObj.value = targetValue;

    // Simpan ke Supabase Database
    await syncSaveTarget(targetObj);

    // Catat log audit
    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      actorId: user.id,
      action: "UPDATE_TARGET",
      entity: "target",
      entityId: targetObj.id,
      detail: `Mengubah target ${indName} (${scope === "individual" ? `Individu: ${subjectName}` : "Target Bersama Divisi"}) periode ${periodId} dari ${oldVal} menjadi ${targetValue}`,
      at: new Date().toISOString(),
    });
  } else {
    // Tambah target baru
    const newTargetId = `TG-${scope === "individual" ? "IND" : "DIV"}-${Date.now().toString().slice(-4)}`;
    const newTarget = {
      id: newTargetId,
      indicatorId,
      periodId,
      scope,
      divisionId: scope === "division" ? "DIV-MKT" : undefined,
      employeeId: scope === "individual" ? employeeId : undefined,
      value: targetValue,
    };
    db.targets.push(newTarget);

    // Simpan ke Supabase Database
    await syncSaveTarget(newTarget);

    // Catat log audit
    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      actorId: user.id,
      action: "CREATE_TARGET",
      entity: "target",
      entityId: newTargetId,
      detail: `Menetapkan target baru ${indName} (${scope === "individual" ? `Individu: ${subjectName}` : "Target Bersama Divisi"}) periode ${periodId} sebesar ${targetValue}`,
      at: new Date().toISOString(),
    });
  }

  return redirect(`/hrd/kpi/targets?period=${periodId}&saved=${encodeURIComponent(indName)}&val=${targetValue}&for=${encodeURIComponent(subjectName)}`);
};
