import type { APIRoute } from "astro";
import { activitySchema, formToObject, refineOutcome, zodErrors } from "../../../features/marketing/schemas";
import { createActivity } from "../../../lib/data/store";
import { requireRole } from "../../../lib/auth/require-auth";

const safe = (p: string) => (p.startsWith("/") && !p.startsWith("//") ? p : "/employee/activities");

/** POST /api/activities — validasi server, otorisasi, lalu simpan sebagai pending. */
export const POST: APIRoute = async ({ request, locals, redirect, cookies }) => {
  const auth = requireRole(locals, "employee", "supervisor");
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const raw = formToObject(await request.formData());
  const back = safe(String(raw.redirectTo ?? ""));
  const fail = (error: string, fields: Record<string, string> = {}) => {
    cookies.set("rk_form", JSON.stringify({ error, fields, values: raw }), { path: "/", maxAge: 60, httpOnly: true, sameSite: "lax" });
    return redirect(`${back.startsWith("/marketing/offers/") ? back : "/employee/activities/new"}?retry=1`);
  };
  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa isian yang ditandai.", zodErrors(parsed.error));
  if (parsed.data.type === "outcome") {
    const e = refineOutcome(parsed.data);
    if (Object.keys(e).length) return fail("Alasan NO wajib diisi.", e);
  }
  const res = createActivity(auth.user, parsed.data as Record<string, any>);
  if (!res.ok) return fail(res.error, res.fields);
  return redirect(`${back}?created=${res.data.id}`);
};
