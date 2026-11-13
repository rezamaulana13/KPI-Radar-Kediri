import type { APIRoute } from "astro";
import { createSupabaseServerClient, supabaseConfigured } from "../../../lib/supabase/server";

export const GET: APIRoute = async (ctx) => {
  const next = ctx.url.searchParams.get("next") ?? "/dashboard";

  if (!supabaseConfigured) {
    return ctx.redirect(
      `/login?error=${encodeURIComponent("Login dengan Google memerlukan integrasi Supabase pada file .env. Saat ini silakan gunakan pendaftaran dan login melalui formulir email & kata sandi.")}`
    );
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
