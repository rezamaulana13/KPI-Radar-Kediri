import type { APIRoute } from "astro";
import { createSupabaseServerClient, supabaseConfigured } from "../../../lib/supabase/server";
import { DEMO_COOKIE } from "../../../lib/auth/get-current-user";
import { db, addAudit } from "../../../lib/data/store";

export const GET: APIRoute = async (ctx) => {
  const next = ctx.url.searchParams.get("next") ?? "/dashboard";

  if (!supabaseConfigured) {
    // Mode demo: Otomatis masuk sebagai Pengguna (Karyawan) contoh
    const demoUser = db.employees.find((e) => e.role === "employee" && e.active) ?? db.employees[1];
    ctx.cookies.set(DEMO_COOKIE, demoUser.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: ctx.url.protocol === "https:",
      maxAge: 60 * 60 * 8,
    });
    addAudit(demoUser.id, "auth.masuk_google", "profiles", demoUser.id, `Masuk dengan Google (mode demo sebagai ${demoUser.name}).`);
    return ctx.redirect(next);
  }

  const supabase = createSupabaseServerClient(ctx);
  const origin = ctx.url.origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    return ctx.redirect(`/login?error=${encodeURIComponent(error?.message ?? "Gagal menghubungkan ke Google.")}`);
  }

  return ctx.redirect(data.url);
};

