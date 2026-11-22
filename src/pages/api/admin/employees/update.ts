import type { APIRoute } from "astro";
import { db } from "../../../../lib/data/store";
import { syncUpdateEmployee } from "../../../../lib/supabase/sync";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const currentAdmin = locals.user;
  if (!currentAdmin || (currentAdmin.role !== "admin" && currentAdmin.role !== "hrd")) {
    return new Response("Akses ditolak.", { status: 403 });
  }

  const fd = await request.formData();
  const employeeId = fd.get("employeeId")?.toString();
  const positionId = fd.get("positionId")?.toString();
  const supervisorId = fd.get("supervisorId")?.toString() || null;

  if (!employeeId || !positionId) {
    return redirect("/admin/employees?error=invalid_input");
  }

  const emp = db.employees.find((e) => e.id === employeeId);
  if (!emp) {
    return new Response("Karyawan tidak ditemukan.", { status: 404 });
  }

  // KEAMANAN HIERARKI AKSES: Super Admin tidak boleh diubah oleh peran HRD
  if (emp.role === "admin") {
    return redirect("/admin/employees?error=admin_protected");
  }

  // HRD hanya memiliki wewenang untuk mengatur personel staf pemasaran
  if (currentAdmin.role === "hrd" && emp.role !== "employee") {
    return redirect("/admin/employees?error=hrd_unauthorized");
  }

  const oldPos = emp.positionId;
  emp.positionId = positionId;
  emp.supervisorId = supervisorId;

  // Sinkronkan ke database Supabase
  await syncUpdateEmployee(emp.id, { positionId, supervisorId });

  // Catat Audit Log
  db.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    actorId: currentAdmin.id,
    action: "UPDATE_EMPLOYEE_POSITION",
    entity: "employee",
    entityId: emp.id,
    detail: `Mengubah jabatan personel ${emp.name} (${emp.nip}) menjadi jabatan ID ${positionId}`,
    at: new Date().toISOString(),
  });

  return redirect(`/admin/employees?saved=${encodeURIComponent(emp.name)}`);
};
