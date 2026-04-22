"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";

export async function getInsuranceProviders() {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { data: null, error: "No autenticado" };
  const p = profile as any;
  const { data, error } = await (supabase as any)
    .from("insurance_providers")
    .select("*")
    .eq("tenantId", p.tenantId)
    .order("name");
  return { data, error: error?.message ?? null };
}

export async function createInsuranceProvider(payload: {
  name: string; code?: string; description?: string;
}) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };
  const p = profile as any;
  const { data, error } = await (supabase as any)
    .from("insurance_providers")
    .insert({ ...payload, tenantId: p.tenantId, updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}

export async function updateInsuranceProvider(id: string, payload: {
  name?: string; code?: string; description?: string; isActive?: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("insurance_providers")
    .update({ ...payload, updatedAt: new Date().toISOString() })
    .eq("id", id).select().single();
  return { data, error: error?.message ?? null };
}

export async function createNomenclator(payload: {
  insuranceProviderId: string; name: string; version?: string;
}) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };
  const p = profile as any;
  const { data, error } = await (supabase as any)
    .from("nomenclators")
    .insert({ ...payload, tenantId: p.tenantId, updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}

export async function createMedicalPractice(payload: {
  nomenclatorId: string; code: string; name: string; description?: string; defaultValue: number;
}) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };
  const p = profile as any;
  const { data, error } = await (supabase as any)
    .from("medical_practices")
    .insert({ ...payload, tenantId: p.tenantId, updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}

export async function updateMedicalPractice(id: string, payload: {
  code?: string; name?: string; description?: string; defaultValue?: number; isActive?: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("medical_practices")
    .update({ ...payload, updatedAt: new Date().toISOString() })
    .eq("id", id).select().single();
  return { data, error: error?.message ?? null };
}

export async function createPatientCoverage(payload: {
  patientId: string; insuranceProviderId: string;
  affiliateNumber?: string; planName?: string; isPrimary?: boolean;
}) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };
  const p = profile as any;
  const { data, error } = await (supabase as any)
    .from("patient_coverages")
    .insert({ ...payload, tenantId: p.tenantId, updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}
