import type { APIRoute } from "astro";
import { z } from "zod";
import { DEMO_COOKIE } from "../../../lib/auth/get-current-user";
import { db, addAudit } from "../../../lib/data/store";
import { createSupabaseServerClient, supabaseConfigured } from "../../../lib/supabase/server";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");

export const POST: APIRoute = async (ctx) => {
  const fd = await ctx.request.formData();
  const next = safeNext(String(fd.get("next") ?? ""));
  const back = (msg: string) => ctx.redirect(`/login?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}`);

  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (!email || !password) {
    return back("Email dan kata sandi wajib diisi.");
  }

  if (!supabaseConfigured) {
    if (db.employees.length === 0) {
      return back("Belum ada akun di sistem. Silakan daftar akun baru terlebih dahulu.");
    }
    const e = db.employees.find((x) => x.email.toLowerCase() === email);
    if (!e || !e.active) {
      return back("Email belum terdaftar atau akun tidak aktif.");
    }
    if (e.password && e.password !== password) {
      return back("Kata sandi yang Anda masukkan salah.");
    }

    ctx.cookies.set(DEMO_COOKIE, e.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: ctx.url.protocol === "https:",
      maxAge: 60 * 60 * 8,
    });
    e.lastLogin = new Date().toISOString();
    addAudit(e.id, "auth.masuk", "profiles", e.id, `Masuk ke aplikasi sebagai ${e.name}.`);
    const dest = (next && next !== "/" && next !== "/dashboard")
      ? next
      : (e.role === "employee" ? "/" : "/dashboard");
    return ctx.redirect(dest);
  }

  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(6) })
    .safeParse({ email, password });
  if (!parsed.success) return back("Format email atau kata sandi belum benar.");

  const supabase = createSupabaseServerClient(ctx);
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return back("Email atau kata sandi tidak cocok.");

  // Arahkan tujuan sesuai peran pengguna
  if (data?.user) {
    const { data: u } = await supabase.from("users").select("role").eq("id", data.user.id).single();
    if (u?.role === "employee") {
      const dest = (next && next !== "/dashboard" && next !== "/") ? next : "/";
      return ctx.redirect(dest);
    } else {
      // HRD dan Super Admin selalu diarahkan ke Dashboard Manajemen
      const dest = (next && next !== "/") ? next : "/dashboard";
      return ctx.redirect(dest);
    }
  }

  return ctx.redirect(next);
};
