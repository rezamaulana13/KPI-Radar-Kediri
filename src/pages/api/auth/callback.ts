import type { APIRoute } from "astro";
import { createSupabaseServerClient, supabaseConfigured } from "../../../lib/supabase/server";

export const GET: APIRoute = async (ctx) => {
  const code = ctx.url.searchParams.get("code");
  const next = ctx.url.searchParams.get("next") ?? "/dashboard";
  const error = ctx.url.searchParams.get("error_description") || ctx.url.searchParams.get("error");

  if (error) {
    return ctx.redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  if (!code || !supabaseConfigured) {
    return ctx.redirect("/login?error=" + encodeURIComponent("Kode otentikasi tidak valid atau sesi telah berakhir."));
  }

  const supabase = createSupabaseServerClient(ctx);
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError || !data.user) {
    return ctx.redirect(`/login?error=${encodeURIComponent(exchangeError?.message ?? "Gagal memproses sesi login.")}`);
  }

  const user = data.user;
  // Periksa apakah user sudah ada di tabel users
  const { data: userRow } = await supabase.from("users").select("id, role, is_active").eq("id", user.id).maybeSingle();

  if (!userRow) {
    // Pengguna mendaftar pertama kali lewat Google OAuth -> simpan ke tabel users dengan role 'employee'
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Pengguna";
    const nip = `RK-${Math.floor(1000 + Math.random() * 9000)}`;

    await supabase.from("users").upsert({
      id: user.id,
      nip,
      name: fullName,
      email: user.email ?? "",
      role: "employee",
      division_id: "DIV-MKT",
      position_id: "POS-EXM",
      is_active: true,
    }, { onConflict: "id" });
  }

  // Arahkan tujuan sesuai peran pengguna
  const isEmployee = (userRow?.role ?? "employee") === "employee";
  const dest = isEmployee
    ? (next && next !== "/dashboard" ? next : "/")
    : (next && next !== "/" ? next : "/dashboard");

  return ctx.redirect(dest);
};

