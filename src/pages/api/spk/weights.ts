import type { APIRoute } from "astro";
import { db, addAudit } from "../../../lib/data/store";
import { validateWeights } from "../../../features/spk/saw";
import { requireRole } from "../../../lib/auth/require-auth";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const a = requireRole(locals, "hrd");
  if (!a.ok) return Response.json({ error: a.message }, { status: a.status });
  const fd = await request.formData();
  const next = db.criteria.map((c) => ({ id: c.id, weight: Number(fd.get(`w_${c.id}`)) / 100 }));
  const v = validateWeights(next.map((n) => n.weight));
  if (!v.ok) return redirect(`/hrd/spk/weights?error=${encodeURIComponent(v.message!)}`);
  const before = db.criteria.map((c) => `${c.code}=${Math.round(c.weight * 1000) / 10}`).join(", ");
  next.forEach((n) => { db.criteria.find((c) => c.id === n.id)!.weight = n.weight; });
  addAudit(a.user.id, "bobot.diubah", "spk_weights", "weights", `Bobot diubah dari [${before}] ke [${next.map((n) => `${n.id}=${Math.round(n.weight * 1000) / 10}`).join(", ")}].`);
  return redirect("/hrd/spk/weights?saved=1");
};
