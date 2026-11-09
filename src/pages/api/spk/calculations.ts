import type { APIRoute } from "astro";
import { db, addAudit } from "../../../lib/data/store";
import { validateWeights } from "../../../features/spk/saw";
import { createSnapshot } from "../../../features/spk/snapshots";
import { requireRole } from "../../../lib/auth/require-auth";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const a = requireRole(locals, "hrd");
  if (!a.ok) return Response.json({ error: a.message }, { status: a.status });
  const periodId = String((await request.formData()).get("period") ?? "");
  const p = db.periods.find((x) => x.id === periodId);
  if (!p) return Response.json({ error: "Periode tidak ditemukan." }, { status: 400 });
  if (!validateWeights(db.criteria.map((c) => c.weight)).ok) return Response.json({ error: "Total bobot harus 100%." }, { status: 422 });
  const s = createSnapshot(p.id, a.user.id);
  addAudit(a.user.id, "spk.disimpan", "sawsnapshots", s.id, `Hasil SAW ${s.id} disimpan.`);
  return redirect(`/hrd/spk/calculations?period=${p.id}&saved=1`);
};
