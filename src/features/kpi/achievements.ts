import { db, indicators, mappings, activePeriod } from "../../lib/data/store";
import type { Activity, KpiIndicator, KpiTarget } from "../../lib/data/types";

export interface AchievementRow {
  target: KpiTarget; indicator: KpiIndicator; actual: number | null; percent: number | null;
  sources: Activity[]; mapped: boolean; subject: string;
}

/** Aktivitas yang boleh dihitung: approved + periode sama + mapping valid (PRD §6.3). */
export function contribution(a: Activity, indicatorId: string): number | null {
  const m = mappings.find((x) => x.indicatorId === indicatorId && x.activityType === a.type && (!x.outcome || x.outcome === a.outcome));
  if (!m) return null;
  if (m.field === "count") return 1;
  return (m.field === "qty" ? a.qty : a.value) ?? 0;
}

function inScope(a: Activity, t: KpiTarget): boolean {
  if (t.scope === "company") return true;
  if (t.scope === "division") return db.employees.find((e) => e.id === a.ownerId)?.divisionId === t.divisionId;
  return a.ownerId === t.employeeId;
}

/** Agregasi on-demand (DESIGN §13.2): dapat diaudit sampai ke aktivitas sumber. */
export function achievements(periodId = activePeriod().id): AchievementRow[] {
  const approved = db.activities.filter((a) => a.status === "approved" && a.periodId === periodId);
  return db.targets.filter((t) => t.periodId === periodId).map((t) => {
    const indicator = indicators.find((i) => i.id === t.indicatorId)!;
    const mapped = mappings.some((m) => m.indicatorId === t.indicatorId);
    const sources = mapped ? approved.filter((a) => inScope(a, t) && contribution(a, t.indicatorId) !== null) : [];
    const actual = mapped ? sources.reduce((s, a) => s + (contribution(a, t.indicatorId) ?? 0), 0) : null;
    const percent = actual == null || !t.value ? null : indicator.direction === "benefit" ? (actual / t.value) * 100 : actual === 0 ? 100 : (t.value / actual) * 100;
    const subject = t.scope === "company" ? "Seluruh perusahaan" : t.scope === "division" ? (t.divisionId ?? "") : (t.employeeId ?? "");
    return { target: t, indicator, actual, percent, sources, mapped, subject };
  });
}

export function achievementSummary(periodId = activePeriod().id) {
  const acts = db.activities.filter((a) => a.periodId === periodId);
  const count = (s: string) => acts.filter((a) => a.status === s).length;
  const rows = achievements(periodId);
  const measurable = rows.filter((r) => r.percent != null);
  return {
    total: acts.length, pending: count("pending"), approved: count("approved"), rejected: count("rejected"), revision: count("revision"),
    avgPercent: measurable.length ? measurable.reduce((s, r) => s + Math.min(r.percent!, 100), 0) / measurable.length : null,
    unmapped: rows.filter((r) => !r.mapped).length, targets: rows.length,
  };
}
