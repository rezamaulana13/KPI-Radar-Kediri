import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

// Kredensial default Supabase resmi proyek Radar Kediri (menjamin Vercel & lokal selalu terhubung)
const DEFAULT_SUPABASE_URL = "https://dipxfcvbbolqqavctyvd.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcHhmY3ZiYm9scXFhdmN0eXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NjUwMjAsImV4cCI6MjEwOTM0MTAyMH0.d4czf9Ift3cX6bGGfdA_Dhhe0VsHESqDyr4osiPwz5c";
const DEFAULT_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcHhmY3ZiYm9scXFhdmN0eXZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzc2NTAyMCwiZXhwIjoyMTA5MzQxMDIwfQ.oLJPcKkU5trTms09mV2lF6Nzx_hN1y0V3SI5lLmuxos";

const getUrl = () => import.meta.env.PUBLIC_SUPABASE_URL || (typeof process !== "undefined" ? process.env.PUBLIC_SUPABASE_URL : undefined) || DEFAULT_SUPABASE_URL;
const getAnonKey = () => import.meta.env.PUBLIC_SUPABASE_ANON_KEY || (typeof process !== "undefined" ? process.env.PUBLIC_SUPABASE_ANON_KEY : undefined) || DEFAULT_ANON_KEY;
const getServiceKey = () => import.meta.env.SUPABASE_SERVICE_ROLE_KEY || (typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined) || DEFAULT_SERVICE_ROLE_KEY;

export const supabaseConfigured = Boolean(getUrl() && getAnonKey());

/** Pembuat client server dengan cookie sesi pengguna sehingga RLS tetap berlaku. */
export function createSupabaseServerClient(ctx: { request: Request; cookies: AstroCookies }) {
  const url = getUrl();
  const key = getAnonKey();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => parseCookieHeader(ctx.request.headers.get("Cookie") ?? "").map((c) => ({ name: c.name, value: c.value ?? "" })),
      setAll: (list) => list.forEach(({ name, value, options }) => ctx.cookies.set(name, value, options)),
    },
  });
}

/** Client admin untuk operasi server terpercaya (bypass RLS saat pendaftaran pengguna baru). */
export function createSupabaseAdminClient() {
  const url = getUrl();
  const key = getServiceKey();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
