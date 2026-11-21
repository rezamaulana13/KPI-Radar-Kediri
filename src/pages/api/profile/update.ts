import type { APIRoute } from "astro";
import { db } from "../../../lib/data/store";
import { syncUpdateUserProfile } from "../../../lib/supabase/sync";
import { clearSessionCache } from "../../../lib/auth/get-current-user";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user) {
    return redirect("/login?error=Silakan+masuk+terlebih+dahulu.");
  }

  const fd = await request.formData();
  const name = fd.get("name")?.toString().trim();
  const email = fd.get("email")?.toString().trim();
  const password = fd.get("password")?.toString()?.trim();
  const confirmPassword = fd.get("confirmPassword")?.toString()?.trim();

  // Validasi Nama Lengkap
  if (!name || name.length < 2) {
    return redirect("/profile?error=" + encodeURIComponent("Nama lengkap wajib diisi minimal 2 karakter."));
  }

  // Validasi Alamat Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return redirect("/profile?error=" + encodeURIComponent("Format alamat email tidak valid."));
  }

  // Cek keunikan email (jangan sampai bentrok dengan akun orang lain)
  const isDuplicate = db.employees.some((e) => e.email.toLowerCase() === email.toLowerCase() && e.id !== user.id);
  if (isDuplicate) {
    return redirect("/profile?error=" + encodeURIComponent("Alamat email tersebut sudah digunakan oleh akun lain."));
  }

  // Validasi Password jika diisi
  if (password) {
    if (password.length < 6) {
      return redirect("/profile?error=" + encodeURIComponent("Kata sandi baru minimal 6 karakter."));
    }
    if (password !== confirmPassword) {
      return redirect("/profile?error=" + encodeURIComponent("Konfirmasi kata sandi baru tidak cocok."));
    }
  }

  // 1. Update profil di memory store (db.employees) agar langsung terlihat oleh Admin, HRD, dan Karyawan
  const emp = db.employees.find((e) => e.id === user.id);
  if (!emp) {
    return redirect("/profile?error=" + encodeURIComponent("Data pegawai tidak ditemukan dalam sistem."));
  }

  const oldName = emp.name;
  const oldEmail = emp.email;

  emp.name = name;
  emp.email = email;

  // 2. Sinkronisasikan secara realtime ke database Supabase (tabel users dan Supabase Auth)
  const syncResult = await syncUpdateUserProfile(user.id, {
    name,
    email,
    password: password || undefined,
  });

  if (!syncResult.ok) {
    console.warn("[Profile Update] Database sync warning:", syncResult.error);
  }

  // 3. Hapus cache sesi pengguna agar data baru langsung terbaca di middleware / navbar / locals
  clearSessionCache(user.id);

  // 4. Catat riwayat perubahan ke Audit Trail Log sistem (ISO/IEC 25010)
  db.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    actorId: user.id,
    action: "UPDATE_PROFILE",
    entity: "employee",
    entityId: user.id,
    detail: `Memperbarui data profil mandiri: nama '${oldName}' -> '${name}', email '${oldEmail}' -> '${email}'${password ? ", serta memperbarui kata sandi" : ""}`,
    at: new Date().toISOString(),
  });

  return redirect("/profile?info=" + encodeURIComponent("Profil dan data akun Anda berhasil diperbarui!"));
};
