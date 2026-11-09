import { achievements } from "../kpi/achievements";
import { db, employee } from "../../lib/data/store";
import type { SpkCriterion } from "../../lib/data/types";
import type { SawAlternative } from "./saw";

/** Alternatif: karyawan Marketing berjabatan Eksekutif Marketing (comparable antar alternatif). */
export const SPK_ALTERNATIVE_POSITION = "POS-EXM";

export function sawAlternatives(periodId: string, criteria: SpkCriterion[]): SawAlternative[] {
  const rows = achievements(periodId);
  const people = db.employees.filter((e) => e.divisionId === "DIV-MKT" && e.positionId === SPK_ALTERNATIVE_POSITION);
  return people.map((p) => ({
    id: p.id,
    values: criteria.map((c) => {
      if (c.indicatorId) return rows.find((r) => r.indicator.id === c.indicatorId && r.target.employeeId === p.id)?.actual ?? 0;
      return db.activities.filter((a) => a.periodId === periodId && a.ownerId === p.id && (a.status === "rejected" || a.status === "revision")).length;
    }),
  }));
}
export const altName = (id: string) => employee(id)?.name ?? id;
