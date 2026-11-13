import type { APIRoute } from "astro";
import { z } from "zod";
import { DEMO_COOKIE } from "../../../lib/auth/get-current-user";
import { db, addAudit } from "../../../lib/data/store";
import { createSupabaseServerClient, createSupabaseAdminClient, supabaseConfigured } from "../../../lib/supabase/server";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
    email: z.string().email("Format email tidak valid."),
    password: z.string().min(6, "Kata sandi minimal 6 karakter."),
    confirmPassword: z.string().min(6, "Konfirmasi kata sandi minimal 6 karakter."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok dengan kata sandi.",
    path: ["confirmPassword"],
  });

export const POST: APIRoute = async (ctx) => {
  const fd = await ctx.request.formData();
  const raw = {
    name: String(fd.get("name") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    password: String(fd.get("password") ?? ""),
    confirmPassword: String(fd.get("confirmPassword") ?? ""),
  };

  const back = (msg: string) =>
    ctx.redirect(
      `/register?error=${encodeURIComponent(msg)}&name=${encodeURIComponent(raw.name)}&email=${encodeURIComponent(raw.email)}`
    );

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid.";
    return back(firstIssue);
  }

  const { name, email, password } = parsed.data;
  // Semua pendaftaran otomatis memiliki peran default 'employee' (Pengguna Karyawan)
  // Peran admin & hrd ditentukan langsung melalui database oleh pengelola sistem
  const role = "employee" as const;

  if (!supabaseConfigured) {
    // Mode lokal / demo: simpan ke memory store dengan password
    const exists = db.employees.some((e) => e.email.toLowerCase() === email);
    if (exists) return back("Email tersebut sudah terdaftar. Silakan gunakan email lain atau masuk.");

    const newId = `E${String(db.employees.length + 1).padStart(2, "0")}`;
    const newEmployee = {
      id: newId,
      nip: `RK-${String(Date.now()).slice(-4)}`,
      name,
      email,
      role,
      password, // disimpan untuk verifikasi login lokal
      divisionId: "DIV-MKT",
      positionId: "POS-EXM",
      supervisorId: null,
      active: true,
      lastLogin: new Date().toISOString(),
    };
    db.employees.push(newEmployee);
    addAudit(newEmployee.id, "auth.daftar", "profiles", newEmployee.id, `Pendaftaran akun karyawan baru: ${name}`);

    // Otomatis login dengan sesi
    ctx.cookies.set(DEMO_COOKIE, newEmployee.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: ctx.url.protocol === "https:",
      maxAge: 60 * 60 * 8,
    });
    return ctx.redirect("/dashboard");
  }

  // Supabase Auth
  const supabase = createSupabaseServerClient(ctx);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, role: "employee" },
    },
  });

  if (error) {
    return back(error.message || "Gagal melakukan pendaftaran akun.");
  }

  if (data.user) {
    const adminClient = createSupabaseAdminClient();
    const dbClient = adminClient || supabase;

    // Auto-confirm user email so signInWithPassword works immediately without email verification gate
    if (adminClient) {
      try {
        await adminClient.auth.admin.updateUserById(data.user.id, {
          email_confirm: true,
        });
      } catch (err) {
        console.warn("Auto-confirm notice:", err);
      }
    }

    const nip = `RK-${Math.floor(1000 + Math.random() * 9000)}`;
    await dbClient.from("users").upsert({
      id: data.user.id,
      nip,
      name,
      email,
      role: "employee",
      division_id: "DIV-MKT",
      position_id: "POS-EXM",
      is_active: true,
    }, { onConflict: "id" });
  }

  // Jika session sudah didapat dari signUp, langsung ke Portal Landing Page Karyawan
  if (data.session) {
    return ctx.redirect("/");
  }

  // Jika session belum ada, otomatis lakukan sign in agar langsung masuk ke Portal Landing Page
  try {
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInData?.session) {
      return ctx.redirect("/");
    }
  } catch (err) {
    console.warn("Auto sign-in error after register:", err);
  }

  return ctx.redirect("/");
};
