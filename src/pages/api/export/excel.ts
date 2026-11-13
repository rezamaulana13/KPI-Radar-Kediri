import type { APIRoute } from "astro";
import { generateEmployeeExcel, generateHrdExcel, generateAdminExcel } from "../../../lib/export/excel-generator";
import { activePeriod } from "../../../lib/data/store";

export const GET: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user) {
    return new Response("Silakan masuk terlebih dahulu untuk mengunduh rekapan.", { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || (user.role === "employee" ? "employee" : user.role === "hrd" ? "hrd" : "admin");
  const periodId = url.searchParams.get("period") || activePeriod().id;
  const targetUserId = url.searchParams.get("userId") || user.id;

  try {
    let buffer: Buffer;
    let filename: string;

    if (type === "employee") {
      // Karyawan hanya boleh mengunduh miliknya sendiri, kecuali jika admin/hrd
      const uid = (user.role === "employee") ? user.id : targetUserId;
      buffer = await generateEmployeeExcel(uid, periodId);
      filename = `Rekap_Kinerja_Karyawan_${periodId}_${uid.slice(0, 6)}.xlsx`;
    } else if (type === "hrd") {
      if (user.role !== "hrd" && user.role !== "admin") {
        return new Response("Akses ditolak: Hanya Admin HRD yang berhak mengunduh rekap ini.", { status: 403 });
      }
      buffer = await generateHrdExcel(periodId);
      filename = `Rekapitulasi_Operasional_HRD_${periodId}.xlsx`;
    } else if (type === "admin") {
      if (user.role !== "admin") {
        return new Response("Akses ditolak: Hanya Super Admin yang berhak mengunduh laporan eksekutif korporat.", { status: 403 });
      }
      buffer = await generateAdminExcel(periodId);
      filename = `Laporan_Eksekutif_Korporat_Audit_${periodId}.xlsx`;
    } else {
      return new Response("Tipe rekapan tidak valid.", { status: 400 });
    }

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("Gagal membuat berkas Excel:", err);
    return new Response(`Terjadi kesalahan sistem saat mengekspor Excel: ${err?.message ?? err}`, { status: 500 });
  }
};

