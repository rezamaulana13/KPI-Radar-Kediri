import type { Role } from "../data/types";

export const ROLES: Role[] = ["admin", "hrd", "employee"];

/** Default deny: route tanpa entri di sini hanya dapat diakses setelah login (halaman umum). */
export const ROUTE_ACCESS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/hrd", roles: ["hrd"] },
  { prefix: "/employee", roles: ["employee", "hrd", "admin"] },
  { prefix: "/marketing", roles: ["employee", "hrd", "admin"] },
  { prefix: "/api/activities", roles: ["employee", "hrd", "admin"] },
  { prefix: "/api/offers", roles: ["employee", "hrd", "admin"] },
  { prefix: "/api/verifications", roles: ["hrd", "admin"] },
  { prefix: "/api/spk", roles: ["hrd"] },
];
export const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/google",
  "/api/auth/callback",
  "/logout",
  "/favicon.svg",
];
export const HOME_BY_ROLE: Record<Role, string> = { admin: "/dashboard", hrd: "/dashboard", employee: "/dashboard" };
