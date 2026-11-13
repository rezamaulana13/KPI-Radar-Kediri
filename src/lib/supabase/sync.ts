import { createSupabaseAdminClient } from "./server";
import { db, employeeName } from "../data/store";
import type * as T from "../data/types";

/**
 * Modul Sinkronisasi Dua Arah: Memory State (db) <-> Supabase Database
 * Memastikan data yang diinput atau dihapus di aplikasi tersimpan permanen di Supabase.
 */

const isValidUUID = (id?: string | null) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

// 1. SINKRONISASI AKTIVITAS (SIMPAN & UPDATE)
export async function syncSaveActivity(a: T.Activity): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  try {
    let ownerId = a.ownerId;
    let createdBy = a.createdBy;

    // Pastikan UUID valid untuk relasi foreign key ke tabel users
    if (!isValidUUID(ownerId)) {
      const match = db.employees.find((e) => isValidUUID(e.id));
      if (match) ownerId = match.id;
    }
    if (!isValidUUID(createdBy)) {
      const match = db.employees.find((e) => isValidUUID(e.id));
      if (match) createdBy = match.id;
    }

    // Jika ada klien baru yang tercatat di aktivitas, upsert ke tabel clients dahulu
    if (a.clientId) {
      const c = db.clients.find((x) => x.id === a.clientId);
      if (c && isValidUUID(ownerId)) {
        await supabase.from("clients").upsert({
          id: c.id,
          name: c.name,
          sector: c.sector ?? null,
          contact: c.contact ?? null,
          phone: c.phone ?? null,
          city: c.city ?? null,
          owner_id: ownerId,
          created_at: c.createdAt || a.date,
        });
      }
    }

    // Jika ada proposal penawaran (offer), upsert ke tabel offers dahulu
    if (a.offerId) {
      const o = db.offers.find((x) => x.id === a.offerId);
      if (o && isValidUUID(ownerId)) {
        if (o.clientId) {
          const c = db.clients.find((x) => x.id === o.clientId);
          if (c) {
            await supabase.from("clients").upsert({
              id: c.id,
              name: c.name,
              sector: c.sector ?? null,
              contact: c.contact ?? null,
              phone: c.phone ?? null,
              city: c.city ?? null,
              owner_id: ownerId,
              created_at: c.createdAt || a.date,
            });
          }
        }
        await supabase.from("offers").upsert({
          id: o.id,
          client_id: o.clientId,
          program_name: o.programName,
          owner_id: ownerId,
          offer_date: o.date,
          value: o.value,
          period_id: o.periodId,
          note: o.note ?? "",
        });
      }
    }

    const payload = {
      id: a.id,
      type: a.type,
      owner_id: ownerId,
      created_by: createdBy,
      activity_date: a.date,
      period_id: a.periodId,
      description: a.description,
      status: a.status,
      client_id: a.clientId ?? null,
      offer_id: a.offerId ?? null,
      program_id: a.programId ?? null,
      qty: a.qty ?? null,
      value: a.value ?? null,
      source: a.source ?? null,
      source_name: a.sourceName ?? null,
      progress_type: a.progressType ?? null,
      potential: a.potential ?? null,
      outcome: a.outcome ?? null,
      reason_category: a.reasonCategory ?? null,
      reason: a.reason ?? null,
      created_at: a.createdAt ?? new Date().toISOString(),
    };

    const { error } = await supabase.from("marketing_activities").upsert(payload);
    if (error) {
      console.error("[Supabase Sync] Gagal menyimpan aktivitas:", error.message);
      return false;
    }
    console.log(`[Supabase Sync] Aktivitas ${a.id} berhasil tersimpan ke Supabase.`);
    return true;
  } catch (err) {
    console.error("[Supabase Sync] Exception saat simpan aktivitas:", err);
    return false;
  }
}

// 2. SINKRONISASI HAPUS AKTIVITAS OLEH HRD / KARYAWAN
export async function syncDeleteActivity(activityId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  try {
    // Hapus verifikasi terkait terlebih dahulu jika ada
    await supabase.from("activity_verifications").delete().eq("activity_id", activityId);

    // Hapus aktivitas dari tabel marketing_activities
    const { error } = await supabase.from("marketing_activities").delete().eq("id", activityId);
    if (error) {
      console.error("[Supabase Sync] Gagal menghapus aktivitas di database:", error.message);
      return false;
    }
    console.log(`[Supabase Sync] Aktivitas ${activityId} berhasil dihapus dari Supabase.`);
    return true;
  } catch (err) {
    console.error("[Supabase Sync] Exception saat hapus aktivitas:", err);
    return false;
  }
}

// 3. SINKRONISASI KEPUTUSAN VERIFIKASI AKTIVITAS
export async function syncVerifyActivity(
  activityId: string,
  status: "approved" | "rejected" | "revision",
  actorId: string,
  note: string
): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  try {
    let verifiedBy = actorId;
    if (!isValidUUID(verifiedBy)) {
      const match = db.employees.find((e) => (e.role === "hrd" || e.role === "admin") && isValidUUID(e.id));
      if (match) verifiedBy = match.id;
    }

    // Update status di tabel marketing_activities
    const { error: actError } = await supabase
      .from("marketing_activities")
      .update({ status })
      .eq("id", activityId);

    if (actError) {
      console.error("[Supabase Sync] Gagal update status aktivitas:", actError.message);
    }

    // Insert rekaman verifikasi ke activity_verifications jika verifiedBy valid
    if (isValidUUID(verifiedBy)) {
      const { error: verError } = await supabase.from("activity_verifications").insert({
        activity_id: activityId,
        status,
        verified_by: verifiedBy,
        note: note || "Data dan bukti sesuai.",
        created_at: new Date().toISOString(),
      });

      if (verError) {
        console.error("[Supabase Sync] Gagal mencatat verifikasi:", verError.message);
      }
    }

    console.log(`[Supabase Sync] Verifikasi ${activityId} (${status}) tersimpan ke Supabase.`);
    return true;
  } catch (err) {
    console.error("[Supabase Sync] Exception saat verifikasi:", err);
    return false;
  }
}

// 4. SINKRONISASI TARGET OPERASIONAL (SIMPAN & UPDATE)
export async function syncSaveTarget(t: T.KpiTarget): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  try {
    let empId = t.employeeId ?? null;
    if (empId && !isValidUUID(empId)) {
      const match = db.employees.find((e) => e.name.toLowerCase() === employeeName(empId).toLowerCase() && isValidUUID(e.id));
      if (match) empId = match.id;
      else empId = null;
    }

    const payload = {
      id: t.id,
      indicator_id: t.indicatorId,
      period_id: t.periodId,
      scope: t.scope,
      division_id: t.divisionId ?? (t.scope === "division" ? "DIV-MKT" : null),
      employee_id: empId,
      value: t.value,
    };

    const { error } = await supabase.from("kpi_targets").upsert(payload);
    if (error) {
      console.error("[Supabase Sync] Gagal menyimpan target di database:", error.message);
      return false;
    }
    console.log(`[Supabase Sync] Target ${t.id} berhasil tersimpan ke Supabase.`);
    return true;
  } catch (err) {
    console.error("[Supabase Sync] Exception saat simpan target:", err);
    return false;
  }
}

// 5. SINKRONISASI HAPUS TARGET OLEH HRD / ADMIN
export async function syncDeleteTarget(targetId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("kpi_targets").delete().eq("id", targetId);
    if (error) {
      console.error("[Supabase Sync] Gagal menghapus target di database:", error.message);
      return false;
    }
    console.log(`[Supabase Sync] Target ${targetId} berhasil dihapus dari Supabase.`);
    return true;
  } catch (err) {
    console.error("[Supabase Sync] Exception saat hapus target:", err);
    return false;
  }
}

// 6. SINKRONISASI HYDRATION (Pemuatan Awal Data dari Supabase ke Memory)
let hasHydrated = false;

export async function hydrateFromSupabase(): Promise<void> {
  if (hasHydrated) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  try {
    // a. Sinkronisasi Periode
    const { data: dbPeriods } = await supabase.from("assessment_periods").select("*");
    if (dbPeriods && dbPeriods.length > 0) {
      db.periods = dbPeriods.map((p: any) => ({
        id: p.id,
        name: p.name,
        start: p.start_date,
        end: p.end_date,
        status: p.status,
      }));
    }

    // b. Sinkronisasi Karyawan / Users
    const { data: dbUsers } = await supabase.from("users").select("*");
    if (dbUsers && dbUsers.length > 0) {
      db.employees = dbUsers.map((u: any) => ({
        id: u.id,
        nip: u.nip || `RK-${u.id.slice(0, 4).toUpperCase()}`,
        name: u.name,
        email: u.email,
        role: u.role,
        divisionId: u.division_id || "DIV-MKT",
        positionId: u.position_id || "POS-EXM",
        supervisorId: u.supervisor_id,
        active: u.is_active,
        lastLogin: u.created_at,
      }));
    }

    // c. Sinkronisasi Target
    const { data: dbTargets } = await supabase.from("kpi_targets").select("*");
    if (dbTargets && dbTargets.length > 0) {
      db.targets = dbTargets.map((t: any) => ({
        id: t.id,
        indicatorId: t.indicator_id,
        periodId: t.period_id,
        scope: t.scope,
        divisionId: t.division_id,
        employeeId: t.employee_id,
        value: Number(t.value),
      }));
    }

    // d. Sinkronisasi Aktivitas
    const { data: dbActs } = await supabase.from("marketing_activities").select("*");
    if (dbActs && dbActs.length > 0) {
      db.activities = dbActs.map((a: any) => ({
        id: a.id,
        type: a.type,
        ownerId: a.owner_id,
        createdBy: a.created_by,
        date: a.activity_date,
        periodId: a.period_id,
        description: a.description,
        status: a.status,
        clientId: a.client_id,
        offerId: a.offer_id,
        programId: a.program_id,
        qty: a.qty ? Number(a.qty) : undefined,
        value: a.value ? Number(a.value) : undefined,
        source: a.source,
        sourceName: a.source_name,
        progressType: a.progress_type,
        potential: a.potential,
        outcome: a.outcome,
        reasonCategory: a.reason_category,
        reason: a.reason,
        createdAt: a.created_at,
      }));
    }

    // e. Sinkronisasi Verifikasi
    const { data: dbVerifs } = await supabase.from("activity_verifications").select("*");
    if (dbVerifs && dbVerifs.length > 0) {
      db.verifications = dbVerifs.map((v: any) => ({
        id: `VER-${v.id}`,
        activityId: v.activity_id,
        status: v.status,
        by: v.verified_by,
        at: v.created_at,
        note: v.note || "Data dan bukti sesuai.",
      }));
    }

    hasHydrated = true;
    console.log("[Supabase Sync] Hydration selesai. Data tersinkron dengan database Supabase.");
  } catch (err) {
    console.error("[Supabase Sync] Exception saat hydration:", err);
  }
}
