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
      return_qty: a.returnQty ?? null,
      sold_qty: a.soldQty ?? null,
      return_condition: a.returnCondition ?? null,
      edition_name: a.editionName ?? null,
      partnership_type: a.partnershipType ?? null,
      barter_type: a.barterType ?? null,
      cash_value: a.cashValue ?? null,
      barter_value: a.barterValue ?? null,
      barter_desc: a.barterDesc ?? null,
      realization_status: a.realizationStatus ?? null,
      proof_url: a.proofUrl ?? null,
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
const gState = globalThis as unknown as { __rk_hydrated?: boolean; __rk_hydrating?: Promise<void> | null };

export async function hydrateFromSupabase(): Promise<void> {
  if (gState.__rk_hydrated) return;
  if (gState.__rk_hydrating) return gState.__rk_hydrating;

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    gState.__rk_hydrated = true;
    return;
  }

  gState.__rk_hydrating = (async () => {
    try {
      // Ambil seluruh data tabel Supabase secara PARALEL (jauh lebih cepat daripada sequential)
      const [
        { data: dbPeriods },
        { data: dbUsers },
        { data: dbTargets },
        { data: dbActs },
        { data: dbVerifs },
      ] = await Promise.all([
        supabase.from("assessment_periods").select("*"),
        supabase.from("users").select("*"),
        supabase.from("kpi_targets").select("*"),
        supabase.from("marketing_activities").select("*"),
        supabase.from("activity_verifications").select("*"),
      ]);

      // a. Sinkronisasi Periode (Hanya periode bulanan resmi, tanpa triwulan)
      if (dbPeriods && dbPeriods.length > 0) {
        db.periods = dbPeriods
          .filter((p: any) => !p.name?.toLowerCase().includes("triwulan") && !p.id?.includes("-Q"))
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            start: p.start_date,
            end: p.end_date,
            status: p.status,
          }));
      }

      // b. Sinkronisasi Karyawan / Users
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
          returnQty: a.return_qty != null ? Number(a.return_qty) : undefined,
          soldQty: a.sold_qty != null ? Number(a.sold_qty) : undefined,
          returnCondition: a.return_condition,
          editionName: a.edition_name,
          partnershipType: a.partnership_type,
          barterType: a.barter_type,
          cashValue: a.cash_value != null ? Number(a.cash_value) : undefined,
          barterValue: a.barter_value != null ? Number(a.barter_value) : undefined,
          barterDesc: a.barter_desc,
          realizationStatus: a.realization_status,
          proofUrl: a.proof_url,
          createdAt: a.created_at,
        }));
      }

      // e. Sinkronisasi Verifikasi
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

      gState.__rk_hydrated = true;
      console.log("[Supabase Sync] Hydration selesai secara paralel. Data tersinkron.");
    } catch (err) {
      console.error("[Supabase Sync] Exception saat hydration:", err);
    } finally {
      gState.__rk_hydrating = null;
    }
  })();

  return gState.__rk_hydrating;
}

// 7. SINKRONISASI UPDATE USER (STATUS / PERAN) OLEH SUPER ADMIN
export async function syncUpdateUser(
  userId: string,
  data: { role?: T.Role; active?: boolean }
): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !isValidUUID(userId)) return false;

  try {
    const patch: Record<string, any> = {};
    if (data.role) patch.role = data.role;
    if (data.active !== undefined) patch.is_active = data.active;

    const { error } = await supabase.from("users").update(patch).eq("id", userId);
    if (error) {
      console.error("[Supabase Sync] Gagal update pengguna di Supabase:", error.message);
      return false;
    }
    console.log(`[Supabase Sync] Pengguna ${userId} berhasil diperbarui di Supabase.`);
    return true;
  } catch (err) {
    console.error("[Supabase Sync] Exception saat update user:", err);
    return false;
  }
}

// 8. SINKRONISASI UPDATE JABATAN / ATASAN KARYAWAN OLEH HRD / ADMIN
export async function syncUpdateEmployee(
  employeeId: string,
  data: { positionId?: string; supervisorId?: string | null }
): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !isValidUUID(employeeId)) return false;

  try {
    const patch: Record<string, any> = {};
    if (data.positionId) patch.position_id = data.positionId;
    if (data.supervisorId !== undefined) patch.supervisor_id = data.supervisorId;

    const { error } = await supabase.from("users").update(patch).eq("id", employeeId);
    if (error) {
      console.error("[Supabase Sync] Gagal update posisi karyawan di Supabase:", error.message);
      return false;
    }
    console.log(`[Supabase Sync] Posisi/atasan karyawan ${employeeId} berhasil diperbarui di Supabase.`);
    return true;
  } catch (err) {
    console.error("[Supabase Sync] Exception saat update karyawan:", err);
    return false;
  }
}

// 9. SINKRONISASI UPDATE PROFIL USER (NAMA, EMAIL, PASSWORD) REALTIME
export async function syncUpdateUserProfile(
  userId: string,
  data: { name: string; email: string; password?: string }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !isValidUUID(userId)) {
    return { ok: true };
  }

  try {
    // 1. Update tabel public.users
    const { error: dbError } = await supabase
      .from("users")
      .update({ name: data.name, email: data.email })
      .eq("id", userId);

    if (dbError) {
      console.error("[Supabase Sync] Gagal update tabel users:", dbError.message);
      return { ok: false, error: dbError.message };
    }

    // 2. Update akun auth Supabase (email, password baru, user_metadata)
    const authPatch: Record<string, any> = {
      email: data.email,
      user_metadata: { name: data.name, full_name: data.name },
    };
    if (data.password && data.password.trim().length >= 6) {
      authPatch.password = data.password.trim();
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(userId, authPatch);
    if (authError) {
      console.warn("[Supabase Sync] Catatan auth update:", authError.message);
    }

    console.log(`[Supabase Sync] Profil pengguna ${userId} (${data.name}) berhasil disinkronkan ke Supabase.`);
    return { ok: true };
  } catch (err: any) {
    console.error("[Supabase Sync] Exception saat update user profile:", err);
    return { ok: false, error: err.message };
  }
}

// 10. PAKSA MUAT ULANG DATA DARI SUPABASE (RE-HYDRATE)
export async function forceRehydrate(): Promise<void> {
  hasHydrated = false;
  await hydrateFromSupabase();
}
