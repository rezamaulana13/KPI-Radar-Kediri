import type { APIContext } from "astro";
import type { Role } from "../data/types";

/** Pemeriksaan kedua di dalam endpoint/halaman; middleware bukan satu-satunya lapisan (DESIGN §7.4). */
export function requireRole(locals: APIContext["locals"], ...roles: Role[]) {
  const u = locals.user;
  if (!u) return { ok: false as const, status: 401, message: "Sesi berakhir. Silakan masuk kembali." };
  if (roles.length && !roles.includes(u.role)) return { ok: false as const, status: 403, message: "Anda tidak memiliki akses untuk aksi ini." };
  return { ok: true as const, user: u };
}
