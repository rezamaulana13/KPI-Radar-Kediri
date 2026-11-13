import type { APIRoute } from "astro";
import { db, employeeName } from "../../../../lib/data/store";
import type { Role } from "../../../../lib/data/types";

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  const currentAdmin = locals.user;
  if (!currentAdmin || currentAdmin.role !== "admin") {
    return new Response("Akses ditolak: Hanya Super Admin yang berhak mengelola akun pengguna.", { status: 403 });
  }

  const targetUserId = params.id;
  if (!targetUserId) {
    return new Response("ID Pengguna tidak valid.", { status: 400 });
  }

  // ATURAN PENTING: Admin dilarang keras mengubah status atau role akunnya sendiri
  if (targetUserId === currentAdmin.id) {
    return redirect("/admin/users?error=self_edit_forbidden");
  }

  const targetEmp = db.employees.find((e) => e.id === targetUserId);
  if (!targetEmp) {
    return new Response("Pengguna tidak ditemukan.", { status: 404 });
  }

  const formData = await request.formData();
  const action = formData.get("action")?.toString();

  if (action === "toggle_status") {
    // Balik status: jika aktif jadi nonaktif, jika nonaktif jadi aktif
    targetEmp.active = !targetEmp.active;

    // Catat ke Audit Log
    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      actorId: currentAdmin.id,
      action: "UPDATE_STATUS",
      entity: "user",
      entityId: targetEmp.id,
      detail: `Mengubah status akun ${targetEmp.name} (${targetEmp.id}) menjadi ${targetEmp.active ? "Aktif" : "Nonaktif"}`,
      at: new Date().toISOString(),
    });

    return redirect(`/admin/users?updated=${encodeURIComponent(targetEmp.name)}&status=${targetEmp.active ? "aktif" : "nonaktif"}`);
  }

  if (action === "update_role") {
    const newRole = formData.get("role")?.toString() as Role;
    // Super Admin tidak dapat diberikan ke pengguna lain lewat antarmuka, hanya HRD atau Karyawan
    if (!newRole || !["hrd", "employee"].includes(newRole)) {
      return new Response("Peran tidak valid. Pilihan hanya Admin (HRD) atau Pengguna (Karyawan).", { status: 400 });
    }

    const oldRole = targetEmp.role;
    targetEmp.role = newRole;

    // Catat ke Audit Log
    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      actorId: currentAdmin.id,
      action: "UPDATE_ROLE",
      entity: "user",
      entityId: targetEmp.id,
      detail: `Mengubah peran ${targetEmp.name} (${targetEmp.id}) dari ${oldRole} menjadi ${newRole}`,
      at: new Date().toISOString(),
    });

    return redirect(`/admin/users?updated=${encodeURIComponent(targetEmp.name)}&role=${newRole}`);
  }

  return new Response("Aksi tidak dikenal.", { status: 400 });
};
