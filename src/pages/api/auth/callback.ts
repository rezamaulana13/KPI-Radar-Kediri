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
  // Periksa apakah profile sudah ada
  const { data: profile } = await supabase.from("profiles").select("id, employee_id, role, is_active").eq("id", user.id).maybeSingle();

  if (!profile) {
    // Pengguna mendaftar pertama kali lewat Google OAuth -> otomatis berikan role 'employee' (Pengguna Karyawan)
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Pengguna";
    const employeeId = `E-${user.id.slice(0, 8)}`;
    const nip = `RK-${Math.floor(1000 + Math.random() * 9000)}`;

    await supabase.from("employees").upsert({
      id: employeeId,
      nip,
      name: fullName,
      email: user.email ?? "",
      division_id: "DIV-MKT",
      position_id: "POS-EXM",
      is_active: true,
    }, { onConflict: "email" });

    await supabase.from("profiles").insert({
      id: user.id,
      employee_id: employeeId,
      role: "employee",
      is_active: true,
    });
  }

  return ctx.redirect(next);
};

