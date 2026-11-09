import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { AstroCookies } from "astro";

export const supabaseConfigured = Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);

/** Satu-satunya pembuat client server; sesi pengguna dibawa lewat cookie sehingga RLS tetap berlaku. */
export function createSupabaseServerClient(ctx: { request: Request; cookies: AstroCookies }) {
  return createServerClient(import.meta.env.PUBLIC_SUPABASE_URL!, import.meta.env.PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => parseCookieHeader(ctx.request.headers.get("Cookie") ?? "").map((c) => ({ name: c.name, value: c.value ?? "" })),
      setAll: (list) => list.forEach(({ name, value, options }) => ctx.cookies.set(name, value, options)),
    },
  });
}
