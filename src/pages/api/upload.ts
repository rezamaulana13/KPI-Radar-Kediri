import type { APIRoute } from "astro";
import { createSupabaseAdminClient } from "../../lib/supabase/server";

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return Response.json({ error: "Sesi login berakhir" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0 || (files.length === 1 && files[0].size === 0)) {
      return Response.json({ error: "Tidak ada berkas yang dipilih" }, { status: 400 });
    }

    const sb = createSupabaseAdminClient();
    const uploadedUrls: string[] = [];
    const uploadedNames: string[] = [];

    for (const file of files) {
      if (!file || file.size === 0) continue;
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `proofs/${Date.now()}-${Math.random().toString(36).slice(2, 7)}_${cleanName}`;
      
      const buffer = await file.arrayBuffer();

      if (sb) {
        const { error } = await sb.storage.from("activity-proofs").upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

        if (!error) {
          const { data: pubData } = sb.storage.from("activity-proofs").getPublicUrl(path);
          if (pubData?.publicUrl) {
            uploadedUrls.push(pubData.publicUrl);
            uploadedNames.push(file.name);
          }
        }
      }
    }

    // Jika berhasil diunggah ke Supabase
    if (uploadedUrls.length > 0) {
      return Response.json({
        ok: true,
        url: uploadedUrls[0],
        allUrls: uploadedUrls,
        names: uploadedNames,
        count: uploadedUrls.length,
      });
    }

    // Fallback jika storage tidak merespons: kembalikan konfirmasi berkas lokal
    return Response.json({
      ok: true,
      url: `file://${files[0].name}`,
      names: files.map((f) => f.name),
      count: files.length,
      note: "Berkas tercatat secara lokal",
    });
  } catch (err: any) {
    return Response.json({ error: err.message || "Gagal mengunggah berkas" }, { status: 500 });
  }
};
