import type { APIRoute } from "astro";
import { db, employeeName } from "../../../lib/data/store";
import { hydrateFromSupabase } from "../../../lib/supabase/sync";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return Response.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
  }

  // Paksa sinkronisasi cepat dari Supabase jika ada selisih waktu
  await hydrateFromSupabase(false);

  // Ambil data aktivitas pending
  const pendingActs = db.activities.filter((a) => a.status === "pending");
  const approvedActs = db.activities.filter((a) => a.status === "approved");
  const revisionActs = db.activities.filter((a) => a.status === "revision");

  // Ambil aktivitas paling terakhir yang diajukan
  const sortedActs = db.activities.slice().sort((a, b) => {
    const tA = new Date(a.createdAt || a.date).getTime();
    const tB = new Date(b.createdAt || b.date).getTime();
    return tB - tA;
  });
  const latestAct = sortedActs[0];

  // Ambil verifikasi paling terakhir
  const sortedVerifs = db.verifications.slice().sort((a, b) => {
    return new Date(b.at).getTime() - new Date(a.at).getTime();
  });
  const latestVerif = sortedVerifs[0];

  return Response.json(
    {
      ok: true,
      pendingCount: pendingActs.length,
      approvedCount: approvedActs.length,
      revisionCount: revisionActs.length,
      totalCount: db.activities.length,
      latestActivity: latestAct
        ? {
            id: latestAct.id,
            type: latestAct.type,
            ownerId: latestAct.ownerId,
            ownerName: employeeName(latestAct.ownerId),
            createdBy: latestAct.createdBy,
            createdByName: employeeName(latestAct.createdBy),
            status: latestAct.status,
            date: latestAct.date,
            createdAt: latestAct.createdAt || latestAct.date,
          }
        : null,
      latestVerification: latestVerif
        ? {
            id: latestVerif.id,
            activityId: latestVerif.activityId,
            status: latestVerif.status,
            by: latestVerif.by,
            byName: employeeName(latestVerif.by),
            note: latestVerif.note,
            at: latestVerif.at,
          }
        : null,
      serverTime: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
};
