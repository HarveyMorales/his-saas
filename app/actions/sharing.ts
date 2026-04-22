"use server";

import { getAuthContext } from "./_helpers";

export async function getShareRequests() {
  const ctx = await getAuthContext();
  if (!ctx) return { data: null, error: "No autenticado" };

  const { data, error } = await ctx.db
    .from("share_requests")
    .select("*, patients(firstName, lastName, dni), fromTenant:tenants!fromTenantId(name), toTenant:tenants!toTenantId(name)")
    .or(`fromTenantId.eq.${ctx.profile.tenantId},toTenantId.eq.${ctx.profile.tenantId}`)
    .order("createdAt", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function approveShareRequest(id: string) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await ctx.db
    .from("share_requests")
    .update({
      status: "APPROVED",
      approvedAt: new Date().toISOString(),
      approvedById: ctx.profile.id,
      expiresAt,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function rejectShareRequest(id: string) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const { data, error } = await ctx.db
    .from("share_requests")
    .update({ status: "REJECTED", updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function revokeShareRequest(id: string) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const { data, error } = await ctx.db
    .from("share_requests")
    .update({ status: "REVOKED", updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function createShareRequest(payload: {
  toTenantId: string;
  patientId: string;
  reason: string;
  recordId?: string | null;
  expiresAt?: string | null;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const { data, error } = await ctx.db
    .from("share_requests")
    .insert({
      ...payload,
      fromTenantId: ctx.profile.tenantId,
      requestedById: ctx.profile.id,
      status: "PENDING",
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
