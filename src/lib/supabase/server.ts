import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

export const supabaseConfigured = Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);

/** Pembuat client server dengan cookie sesi pengguna sehingga RLS tetap berlaku. */
export function createSupabaseServerClient(ctx: { request: Request; cookies: AstroCookies }) {
  return createServerClient(import.meta.env.PUBLIC_SUPABASE_URL!, import.meta.env.PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => parseCookieHeader(ctx.request.headers.get("Cookie") ?? "").map((c) => ({ name: c.name, value: c.value ?? "" })),
      setAll: (list) => list.forEach(({ name, value, options }) => ctx.cookies.set(name, value, options)),
    },
  });
}

/** Client admin untuk operasi server terpercaya (bypass RLS saat pendaftaran pengguna baru). */
export function createSupabaseAdminClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || (typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined);
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
