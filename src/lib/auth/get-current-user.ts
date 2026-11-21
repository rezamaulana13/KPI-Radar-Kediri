import type { AstroCookies } from "astro";
import { employee, db } from "../data/store";
import { createSupabaseServerClient, supabaseConfigured } from "../supabase/server";

export const DEMO_COOKIE = "rk_demo_user";
export type SessionUser = NonNullable<App.Locals["user"]>;

const toSession = (id: string, mode: SessionUser["mode"]): SessionUser | null => {
  const e = employee(id);
  return e && e.active ? { id: e.id, name: e.name, email: e.email, role: e.role, divisionId: e.divisionId, mode } : null;
};

// In-memory cache untuk sesi pengguna agar navigasi halaman instan (<1ms) tanpa roundtrip Supabase berulang
interface CachedSession {
  user: SessionUser | null;
  expiresAt: number;
}
const sessionCache = new Map<string, CachedSession>();

/** Peran SELALU dibaca dari data server/database, tidak dari metadata browser (PRD §4.1). */
export async function getCurrentUser(ctx: { request: Request; cookies: AstroCookies }): Promise<SessionUser | null> {
  // 1. Cek mode demo terlebih dahulu (sangat cepat, 0ms)
  const demoId = ctx.cookies.get(DEMO_COOKIE)?.value;
  if (demoId) {
    const s = toSession(demoId, "demo");
    if (s) return s;
  }

  if (!supabaseConfigured) return null;

  // 2. Ambil token/header cookie untuk key cache
  const cookieHeader = ctx.request.headers.get("Cookie") || "";
  const authCookieMatch = cookieHeader.match(/sb-[a-z0-9]+-auth-token=([^;]+)/i);
  const cacheKey = authCookieMatch ? authCookieMatch[1] : cookieHeader;

  if (cacheKey) {
    const cached = sessionCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.user;
    }
  }

  const supabase = createSupabaseServerClient(ctx);
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    if (cacheKey) sessionCache.set(cacheKey, { user: null, expiresAt: Date.now() + 15000 });
    return null;
  }

  // 3. Cek apakah profil pengguna sudah ada di memori store (hemat 1 query Supabase)
  const existingEmp = db.employees.find((x) => x.id === data.user.id);
  if (existingEmp && existingEmp.active) {
    const sessionUser: SessionUser = {
      id: existingEmp.id,
      name: existingEmp.name,
      email: existingEmp.email,
      role: existingEmp.role,
      divisionId: existingEmp.divisionId,
      mode: "supabase",
    };
    if (cacheKey) sessionCache.set(cacheKey, { user: sessionUser, expiresAt: Date.now() + 60000 });
    return sessionUser;
  }

  // 4. Fallback baca langsung dari tabel users jika belum ada di memori
  const { data: u } = await supabase
    .from("users")
    .select("id, nip, name, email, role, division_id, position_id, is_active")
    .eq("id", data.user.id)
    .single();

  if (!u || !u.is_active) {
    if (cacheKey) sessionCache.set(cacheKey, { user: null, expiresAt: Date.now() + 15000 });
    return null;
  }

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

  const sessionUser: SessionUser = {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    divisionId: u.division_id,
    mode: "supabase",
  };

  if (cacheKey) sessionCache.set(cacheKey, { user: sessionUser, expiresAt: Date.now() + 60000 });
  return sessionUser;
}
