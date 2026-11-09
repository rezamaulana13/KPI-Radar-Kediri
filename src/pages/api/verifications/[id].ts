import type { APIRoute } from "astro";
import { z } from "zod";
import { verifyActivity } from "../../../lib/data/store";
import { requireRole } from "../../../lib/auth/require-auth";

const body = z.object({ status: z.enum(["approved", "rejected", "revision"]), note: z.string().max(1000).default("") });

/** POST /api/verifications/:id — hanya HRD dan Super Admin berwenang. */
export const POST: APIRoute = async ({ request, params, locals, redirect, cookies }) => {
  const auth = requireRole(locals, "hrd", "admin");
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const fd = await request.formData();
  const parsed = body.safeParse({ status: fd.get("status"), note: String(fd.get("note") ?? "") });
  const back = `/hrd/verifications/${params.id}`;
  const flash = (error: string, fields = {}) => { cookies.set("rk_form", JSON.stringify({ error, fields, values: { note: fd.get("note") } }), { path: "/", maxAge: 60, httpOnly: true }); return redirect(`${back}?retry=1`); };
  if (!parsed.success) return flash("Pilih salah satu keputusan verifikasi.");
  const res = verifyActivity(auth.user, params.id!, parsed.data.status, parsed.data.note);
  if (!res.ok) return flash(res.error, res.fields);
  return redirect(`/hrd/verifications?done=${params.id}&as=${parsed.data.status}`);
};
