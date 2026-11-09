import { db } from "../../lib/data/store";
import type { SawSnapshot } from "../../lib/data/types";
import { sawAlternatives } from "./build-input";

/** Snapshot menyimpan kriteria + nilai input, sehingga hasil periode lampau dapat direproduksi (DESIGN §10.8). */
export function createSnapshot(periodId: string, actorId: string): SawSnapshot {
  const version = db.snapshots.filter((s) => s.periodId === periodId).length + 1;
  const snap: SawSnapshot = {
    id: `RES-${periodId.replace("PRD-", "")}-v${version}`, periodId, createdAt: new Date().toISOString(), createdBy: actorId, version,
    criteria: structuredClone(db.criteria), alternatives: sawAlternatives(periodId, db.criteria).map((a) => ({ employeeId: a.id, values: a.values })),
  };
  db.snapshots.push(snap);
  return snap;
}
export function listSnapshots(): SawSnapshot[] {
  if (db.snapshots.length === 0) { createSnapshot("PRD-2026-Q3", "E06"); db.snapshots[0].createdAt = "2026-10-02T09:00:00+07:00"; }
  return [...db.snapshots].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export const getSnapshot = (id: string) => listSnapshots().find((s) => s.id === id);
