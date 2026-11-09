import type { Role } from "../data/types";
import { ROUTE_ACCESS } from "./roles";

export function canAccessPath(role: Role, pathname: string): boolean {
  const rule = ROUTE_ACCESS.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"));
  return rule ? rule.roles.includes(role) : true;
}
