import type { APIRoute } from "astro";
import { activitySchema, formToObject, refineOutcome, zodErrors } from "../../../features/marketing/schemas";
import { createActivity } from "../../../lib/data/store";
import { requireRole } from "../../../lib/auth/require-auth";
import { syncSaveActivity } from "../../../lib/supabase/sync";

const safe = (p: string) => (p.startsWith("/") && !p.startsWith("//") ? p : "/employee/activities");

/** POST /api/activities — validasi server, otorisasi, lalu simpan sebagai pending. */
export const POST: APIRoute = async ({ request, locals, redirect, cookies }) => {
  const auth = requireRole(locals, "employee", "supervisor");
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const raw = formToObject(await request.formData());
  const back = safe(String(raw.redirectTo ?? ""));
  const fail = (error: string, fields: Record<string, string> = {}) => {
    cookies.set("rk_form", JSON.stringify({ error, fields, values: raw }), { path: "/", maxAge: 60, httpOnly: true, sameSite: "lax" });
    const failUrl = back.startsWith("/marketing/offers/")
      ? `${back}?retry=1`
      : (back === "/catat-aktivitas" || back === "/" || back.startsWith("/#") ? "/catat-aktivitas?retry=1" : `${back}?retry=1`);
    return redirect(failUrl);
  };
  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa isian yang ditandai.", zodErrors(parsed.error));
  if (parsed.data.type === "outcome") {
    const e = refineOutcome(parsed.data);
    if (Object.keys(e).length) return fail("Alasan NO wajib diisi.", e);
  }
  const res = createActivity(auth.user, parsed.data as Record<string, any>);
  if (!res.ok) return fail(res.error, res.fields);

  // Simpan ke Supabase Database
  await syncSaveActivity(res.data);

  const successUrl = back.includes("#")
    ? `${back.split("#")[0]}?created=${res.data.id}#${back.split("#")[1]}`
    : `${back}?created=${res.data.id}`;
  return redirect(successUrl);
};
