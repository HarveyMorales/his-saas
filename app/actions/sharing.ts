"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";

export async function getShareRequests() {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { data: null, error: "No autenticado" };

  const p = profile as any;
  const { data, error } = await (supabase as any)
    .from("share_requests")
    .select("*, patients(firstName, lastName, dni), fromTenant:tenants!fromTenantId(name), toTenant:tenants!toTenantId(name)")
    .or(`fromTenantId.eq.${p.tenantId},toTenantId.eq.${p.tenantId}`)
    .order("createdAt", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function approveShareRequest(id: string) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };

  const p = profile as any;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  const { data, error } = await (supabase as any)
    .from("share_requests")
    .update({
      status: "APPROVED",
      approvedAt: new Date().toISOString(),
      approvedById: p.id,
      expiresAt,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function rejectShareRequest(id: string) {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("share_requests")
    .update({
      status: "REJECTED",
      updatedAt: new Date().toISOString(),
    })
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
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };

  const p = profile as any;
  const { data, error } = await (supabase as any)
    .from("share_requests")
    .insert({
      ...payload,
      fromTenantId: p.tenantId,
      requestedById: p.id,
      status: "PENDING",
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
