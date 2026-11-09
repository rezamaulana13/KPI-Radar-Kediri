import type { APIRoute } from "astro";
import { z } from "zod";
import { DEMO_COOKIE } from "../../../lib/auth/get-current-user";
import { employee, addAudit } from "../../../lib/data/store";
import { createSupabaseServerClient, supabaseConfigured } from "../../../lib/supabase/server";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");

export const POST: APIRoute = async (ctx) => {
  const fd = await ctx.request.formData();
  const next = safeNext(String(fd.get("next") ?? ""));
  const back = (msg: string) => ctx.redirect(`/login?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}`);

  if (!supabaseConfigured) {
    const e = employee(String(fd.get("employeeId") ?? ""));
    if (!e || !e.active) return back("Akun demo tidak ditemukan.");
    ctx.cookies.set(DEMO_COOKIE, e.id, { path: "/", httpOnly: true, sameSite: "lax", secure: ctx.url.protocol === "https:", maxAge: 60 * 60 * 8 });
    addAudit(e.id, "auth.masuk", "profiles", e.id, "Masuk (mode demo).");
    return ctx.redirect(next);
  }
  const parsed = z.object({ email: z.email(), password: z.string().min(6) }).safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return back("Email atau kata sandi belum benar.");
  const { error } = await createSupabaseServerClient(ctx).auth.signInWithPassword(parsed.data);
  if (error) return back("Email atau kata sandi belum benar."); // pesan sengaja generik
  return ctx.redirect(next);
};
