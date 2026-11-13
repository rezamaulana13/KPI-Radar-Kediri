import type { APIRoute } from "astro";
import { notificationsFor } from "../../../lib/data/store";

export const ALL_METHOD: APIRoute = async ({ cookies, redirect, url, locals }) => {
  const user = locals.user;
  const back = url.searchParams.get("back") || "/notifications";

  if (user) {
    const list = notificationsFor({ id: user.id, role: user.role });
    const allIds = list.map((n) => n.id);

    // 1. Simpan daftar ID notifikasi yang sudah dibaca (airtight, tidak terpengaruh jam/timezone)
    const existingCookie = cookies.get(`rk_read_ids_${user.id}`)?.value;
    let readIds: string[] = [];
    try {
      readIds = existingCookie ? JSON.parse(existingCookie) : [];
    } catch {
      readIds = [];
    }
    const combined = Array.from(new Set([...readIds, ...allIds]));
    cookies.set(`rk_read_ids_${user.id}`, JSON.stringify(combined), {
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
      httpOnly: false,
      sameSite: "lax",
    });

    // 2. Simpan timestamp
    const now = Date.now();
    cookies.set(`rk_notif_read_${user.id}`, now.toString(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
      httpOnly: true,
      sameSite: "lax",
    });
    cookies.set("rk_notif_read", now.toString(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return redirect(`${back}?marked=1`);
};

export const POST = ALL_METHOD;
export const GET = ALL_METHOD;
