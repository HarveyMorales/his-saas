"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";

async function assertSuperAdmin() {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile as any).role !== "SUPER_ADMIN") {
    throw new Error("Acceso denegado: se requiere SUPER_ADMIN");
  }
  return profile;
}

// ── Tenants ──────────────────────────────────────────────────────

export async function getAllTenants() {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tenants")
    .select("*")
    .order("createdAt", { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function updateTenantStatus(tenantId: string, status: string) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tenants")
    .update({ status, updatedAt: new Date().toISOString() } as any)
    .eq("id", tenantId)
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function createTenant(payload: {
  slug: string;
  name: string;
  type: string;
  city?: string;
  province?: string;
}) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tenants")
    .insert({
      ...payload,
      status: "TRIAL",
      country: "AR",
      updatedAt: new Date().toISOString(),
    } as any)
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

// ── Users (global) ───────────────────────────────────────────────

export async function getAllUsers() {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("*, tenants(id, name, slug)")
    .order("createdAt", { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .update({ isActive, updatedAt: new Date().toISOString() } as any)
    .eq("id", userId)
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function deleteUser(userId: string, authId: string) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from("users").delete().eq("id", userId);
  await admin.auth.admin.deleteUser(authId);
  return { success: true };
}

// ── Audit logs ───────────────────────────────────────────────────

export async function getAuditLogs(tenantId?: string, limit = 100) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  let q = admin
    .from("audit_logs")
    .select("*, users(firstName, lastName, email)")
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (tenantId) q = q.eq("tenantId", tenantId);

  const { data, error } = await q;
  return { data, error: error?.message ?? null };
}

// ── Stats ────────────────────────────────────────────────────────

export async function getSystemStats() {
  await assertSuperAdmin();
  const admin = createAdminClient();

  const [tenants, users, patients, records] = await Promise.all([
    admin.from("tenants").select("id", { count: "exact", head: true }),
    admin.from("users").select("id", { count: "exact", head: true }),
    admin.from("patients").select("id", { count: "exact", head: true }),
    admin.from("medical_records").select("id", { count: "exact", head: true }),
  ]);

  return {
    tenants: tenants.count ?? 0,
    users: users.count ?? 0,
    patients: patients.count ?? 0,
    records: records.count ?? 0,
  };
}
