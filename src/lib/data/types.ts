export type Role = "admin" | "hrd" | "employee";
export type ActivityStatus = "pending" | "approved" | "rejected" | "revision";
export type ActivityType = "oplah" | "client" | "program" | "profiling" | "offer" | "progress" | "outcome";
export type KpiScope = "company" | "division" | "individual";
export type Measure = "sum" | "count";
export type Direction = "benefit" | "cost";

export interface Division { id: string; name: string; code: string; active: boolean }
export interface Position { id: string; name: string; level: string }
export interface Employee {
  id: string; nip: string; name: string; email: string; role: Role;
  divisionId: string; positionId: string; supervisorId: string | null; active: boolean; lastLogin: string;
}
export interface Period { id: string; name: string; start: string; end: string; status: "draft" | "active" | "closed" }
export interface KpiCategory { id: string; name: string; scope: KpiScope; description: string }
export interface KpiIndicator {
  id: string; code: string; name: string; categoryId: string; unit: string;
  measure: Measure; direction: Direction; definition: string; active: boolean;
}
export interface KpiTarget {
  id: string; indicatorId: string; periodId: string; scope: KpiScope;
  divisionId?: string; employeeId?: string; value: number;
}
export interface KpiMapping { id: string; activityType: ActivityType; outcome?: "deal" | "no"; indicatorId: string; field: "count" | "qty" | "value"; note: string }
export interface Client { id: string; name: string; sector: string; contact: string; phone: string; city: string; ownerId: string; createdAt: string }
export interface Activity {
  id: string; type: ActivityType; ownerId: string; createdBy: string; date: string; periodId: string;
  description: string; status: ActivityStatus; clientId?: string; offerId?: string; programId?: string;
  qty?: number; value?: number; source?: string; sourceName?: string; progressType?: string;
  outcome?: "deal" | "no"; reasonCategory?: string; reason?: string; potential?: string; evidence?: string;
}
export interface Verification { id: string; activityId: string; status: ActivityStatus; by: string; at: string; note: string }
export interface Offer { id: string; clientId: string; programName: string; ownerId: string; date: string; value: number; periodId: string; note: string }
export interface Program { id: string; name: string; kind: "program" | "barter"; start: string; end: string; ownerId: string; participantClientIds: string[]; value: number; status: "rencana" | "berjalan" | "selesai" }
export interface AuditLog { id: string; at: string; actorId: string; action: string; entity: string; entityId: string; detail: string }
export interface SpkCriterion { id: string; indicatorId?: string; code: string; name: string; direction: Direction; weight: number; source: string }
export interface SawSnapshot {
  id: string; periodId: string; createdAt: string; createdBy: string; version: number;
  criteria: SpkCriterion[]; alternatives: { employeeId: string; values: number[] }[];
}
