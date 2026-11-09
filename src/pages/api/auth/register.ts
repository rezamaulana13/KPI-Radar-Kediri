import type { APIRoute } from "astro";
import { z } from "zod";
import { DEMO_COOKIE } from "../../../lib/auth/get-current-user";
import { db, addAudit } from "../../../lib/data/store";
import { createSupabaseServerClient, supabaseConfigured } from "../../../lib/supabase/server";

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
    ctx.redirect(`/register?error=${encodeURIComponent(msg)}&name=${encodeURIComponent(raw.name)}&email=${encodeURIComponent(raw.email)}`);

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid.";
    return back(firstIssue);
  }

  const { name, email, password } = parsed.data;

  if (!supabaseConfigured) {
    // Mode demo: simpan ke memori dan otomatis masuk
    const exists = db.employees.some((e) => e.email.toLowerCase() === email);
    if (exists) return back("Email tersebut sudah terdaftar. Silakan masuk.");

    const newId = `E${String(db.employees.length + 1).padStart(2, "0")}`;
    const newEmployee = {
      id: newId,
      nip: `RK-${String(Date.now()).slice(-4)}`,
      name,
      email,
      role: "employee" as const, // Otomatis role Pengguna (Karyawan)
      divisionId: "DIV-MKT",
      positionId: "POS-EXM",
      supervisorId: null,
      active: true,
      lastLogin: new Date().toISOString(),
    };
    db.employees.push(newEmployee);
    addAudit(newEmployee.id, "auth.daftar", "profiles", newEmployee.id, `Pendaftaran akun karyawan baru: ${name}`);
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
      data: { full_name: name },
    },
  });

  if (error) {
    return back(error.message || "Gagal melakukan pendaftaran akun.");
  }

  if (data.user) {
    const employeeId = `E-${data.user.id.slice(0, 8)}`;
    const nip = `RK-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from("employees").upsert(
      {
        id: employeeId,
        nip,
        name,
        email,
        division_id: "DIV-MKT",
        position_id: "POS-EXM",
        is_active: true,
      },
      { onConflict: "email" }
    );

    await supabase.from("profiles").upsert({
      id: data.user.id,
      employee_id: employeeId,
      role: "employee",
      is_active: true,
    });
  }

  if (data.session) {
    return ctx.redirect("/dashboard");
  }

  return ctx.redirect("/login?success=" + encodeURIComponent("Pendaftaran berhasil! Akun Anda telah dibuat sebagai Pengguna (Karyawan). Silakan masuk."));
};

