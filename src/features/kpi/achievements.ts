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
  if (m.field === "qty") {
    const rawQty = a.soldQty != null ? a.soldQty : a.qty;
    return Number(rawQty) || 0;
  }
  if (indicatorId === "IND-05") {
    // Omzet Kas Tunai dari penawaran Deal
    const cash = a.cashValue != null ? a.cashValue : a.value;
    return Number(cash) || 0;
  }
  if (indicatorId === "IND-07") {
    // Nilai Realisasi Barter
    const barter = a.barterValue != null ? a.barterValue : a.value;
    return Number(barter) || 0;
  }
  return Number(a.value) || 0;
}

function inScope(a: Activity, t: KpiTarget): boolean {
  if (t.scope === "company") return true;
  if (t.scope === "division") return db.employees.find((e) => e.id === a.ownerId)?.divisionId === t.divisionId;
  return a.ownerId === t.employeeId;
}

/** Memastikan target individual standar terpasang untuk karyawan jika belum di-set manual oleh HRD */
export function ensureEmployeeTargets(userId: string, periodId = activePeriod().id) {
  const existingUserTargets = db.targets.filter((t) => t.employeeId === userId && t.periodId === periodId);
  const userActs = db.activities.filter((a) => a.ownerId === userId && a.periodId === periodId);
  const emp = db.employees.find((e) => e.id === userId);
  const posId = emp?.positionId || "";
  const hasOplah = posId === "POS-OPL" || userActs.some((a) => a.type === "oplah");
  const hasMarketing = posId === "POS-EXM" || userActs.some((a) => a.type === "offer" || a.type === "client" || a.type === "outcome");

  if (existingUserTargets.length === 0) {
    if (hasOplah && !hasMarketing) {
      db.targets.push(
        { id: `TG-IND-${userId.slice(0, 4)}-1`, indicatorId: "IND-01", periodId, scope: "individual", employeeId: userId, value: 500 },
        { id: `TG-IND-${userId.slice(0, 4)}-4`, indicatorId: "IND-08", periodId, scope: "individual", employeeId: userId, value: 15 }
      );
    } else if (hasOplah && hasMarketing) {
      db.targets.push(
        { id: `TG-IND-${userId.slice(0, 4)}-1`, indicatorId: "IND-01", periodId, scope: "individual", employeeId: userId, value: 500 },
        { id: `TG-IND-${userId.slice(0, 4)}-2`, indicatorId: "IND-03", periodId, scope: "individual", employeeId: userId, value: 10 },
        { id: `TG-IND-${userId.slice(0, 4)}-3`, indicatorId: "IND-04", periodId, scope: "individual", employeeId: userId, value: 3 },
        { id: `TG-IND-${userId.slice(0, 4)}-4`, indicatorId: "IND-08", periodId, scope: "individual", employeeId: userId, value: 15 }
      );
    } else {
      db.targets.push(
        { id: `TG-IND-${userId.slice(0, 4)}-1`, indicatorId: "IND-02", periodId, scope: "individual", employeeId: userId, value: 10 },
        { id: `TG-IND-${userId.slice(0, 4)}-2`, indicatorId: "IND-03", periodId, scope: "individual", employeeId: userId, value: 15 },
        { id: `TG-IND-${userId.slice(0, 4)}-3`, indicatorId: "IND-04", periodId, scope: "individual", employeeId: userId, value: 5 },
        { id: `TG-IND-${userId.slice(0, 4)}-4`, indicatorId: "IND-08", periodId, scope: "individual", employeeId: userId, value: 20 }
      );
    }
  } else {
    if (hasOplah && !existingUserTargets.some((t) => t.indicatorId === "IND-01")) {
      db.targets.push({
        id: `TG-IND-${userId.slice(0, 4)}-OPL`,
        indicatorId: "IND-01",
        periodId,
        scope: "individual",
        employeeId: userId,
        value: 500,
      });
    }
  }
}

/** Agregasi on-demand (DESIGN §13.2): dapat diaudit sampai ke aktivitas sumber. */
export function achievements(periodId = activePeriod().id): AchievementRow[] {
  const approved = db.activities.filter((a) => a.status === "approved" && a.periodId === periodId);
  return db.targets.filter((t) => t.periodId === periodId).map((t) => {
    const indicator = indicators.find((i) => i.id === t.indicatorId)!;
    const mapped = mappings.some((m) => m.indicatorId === t.indicatorId);
    const sources = mapped ? approved.filter((a) => inScope(a, t) && contribution(a, t.indicatorId) !== null) : [];
    const actual = mapped ? sources.reduce((s, a) => s + (contribution(a, t.indicatorId) ?? 0), 0) : null;
    const rawPercent = actual == null || !t.value ? null : indicator.direction === "benefit" ? (actual / t.value) * 100 : actual === 0 ? 100 : (t.value / actual) * 100;
    // Capaian dibatasi maksimal 100% sesuai standar evaluasi operasional Radar Kediri
    const percent = rawPercent == null ? null : Math.min(100, Math.round(rawPercent));
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
