import type { APIRoute } from "astro";
import { DEMO_COOKIE } from "../lib/auth/get-current-user";
import { createSupabaseServerClient, supabaseConfigured } from "../lib/supabase/server";

export const POST: APIRoute = async (ctx) => {
  if (supabaseConfigured) await createSupabaseServerClient(ctx).auth.signOut();
  ctx.cookies.delete(DEMO_COOKIE, { path: "/" });
  return ctx.redirect("/login");
};
export const GET: APIRoute = ({ redirect }) => redirect("/login");
