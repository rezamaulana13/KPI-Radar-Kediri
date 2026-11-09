import type { AstroCookies } from "astro";
import { employee } from "../data/store";
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
  if (!data.user) return null;
  const { data: profile } = await supabase.from("profiles").select("employee_id, role, is_active").eq("id", data.user.id).single();
  if (!profile || !profile.is_active) return null;
  const s = toSession(profile.employee_id, "supabase");
  return s ? { ...s, role: profile.role } : null;
}
