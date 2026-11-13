import type { AstroCookies } from "astro";
import { employee, db } from "../data/store";
import { createSupabaseServerClient, supabaseConfigured } from "../supabase/server";

export const DEMO_COOKIE = "rk_demo_user";
export type SessionUser = NonNullable<App.Locals["user"]>;

const toSession = (id: string, mode: SessionUser["mode"]): SessionUser | null => {
  const e = employee(id);
  return e && e.active ? { id: e.id, name: e.name, email: e.email, role: e.role, divisionId: e.divisionId, mode } : null;
};

/** Peran SELALU dibaca dari data server/database, tidak dari metadata browser (PRD §4.1). */
export async function getCurrentUser(ctx: { request: Request; cookies: AstroCookies }): Promise<SessionUser | null> {
  if (!supabaseConfigured) return toSession(ctx.cookies.get(DEMO_COOKIE)?.value ?? "", "demo");
  const supabase = createSupabaseServerClient(ctx);
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    const demoId = ctx.cookies.get(DEMO_COOKIE)?.value;
    if (demoId) return toSession(demoId, "demo");
    return null;
  }

  // Baca langsung dari SATU tabel users
  const { data: u } = await supabase
    .from("users")
    .select("id, nip, name, email, role, division_id, position_id, is_active")
    .eq("id", data.user.id)
    .single();

  if (!u || !u.is_active) return null;

  // Sinkronisasi data ke state memori agar pembantu nama/divisi tetap bekerja
  const existing = db.employees.find((x) => x.id === u.id);
  if (!existing) {
    db.employees.push({
      id: u.id,
      nip: u.nip,
      name: u.name,
      email: u.email,
      role: u.role,
      divisionId: u.division_id,
      positionId: u.position_id,
      supervisorId: null,
      active: true,
    });
  } else {
    existing.role = u.role;
    existing.name = u.name;
    existing.divisionId = u.division_id;
  }

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    divisionId: u.division_id,
    mode: "supabase",
  };
}
