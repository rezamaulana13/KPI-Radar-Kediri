import type { APIRoute } from "astro";
import { createSupabaseServerClient, supabaseConfigured } from "../../../lib/supabase/server";

export const GET: APIRoute = async (ctx) => {
  if (!ctx.locals.user) {
    return ctx.redirect("/login");
  }

  if (!supabaseConfigured) {
    return ctx.redirect("/profile?info=" + encodeURIComponent("Mode demo: Simulasi akun Google berhasil ditautkan ke akun Anda."));
  }

  const supabase = createSupabaseServerClient(ctx);
  const origin = ctx.url.origin;
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=/profile`,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    return ctx.redirect(`/profile?error=${encodeURIComponent(error?.message ?? "Gagal menautkan akun Google.")}`);
  }

  return ctx.redirect(data.url);
};

