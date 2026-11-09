import type { APIRoute } from "astro";
import { resubmitActivity } from "../../../lib/data/store";
import { requireRole } from "../../../lib/auth/require-auth";

/** POST /api/activities/:id — perbaiki aktivitas berstatus revision lalu ajukan kembali. */
export const POST: APIRoute = async ({ request, params, locals, redirect, cookies }) => {
  const auth = requireRole(locals, "employee", "supervisor");
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const fd = await request.formData();
  const qty = fd.get("qty") ? Number(fd.get("qty")) : undefined;
  const res = resubmitActivity(auth.user, params.id!, { description: String(fd.get("description") ?? ""), qty });
  if (!res.ok) { cookies.set("rk_form", JSON.stringify({ error: res.error, fields: res.fields ?? {}, values: Object.fromEntries(fd) }), { path: "/", maxAge: 60, httpOnly: true }); return redirect(`/employee/activities/${params.id}?retry=1`); }
  return redirect(`/employee/activities/${params.id}?resubmitted=1`);
};
