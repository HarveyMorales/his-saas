"use server";

import { createEntityId } from "./_ids";
import { getAuthContext } from "./_helpers";

export async function getInsuranceProviders() {
  const ctx = await getAuthContext();
  if (!ctx) return { data: null, error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("insurance_providers")
    .select("*")
    .eq("tenantId", ctx.profile.tenantId)
    .order("name");
  return { data, error: error?.message ?? null };
}

export async function createInsuranceProvider(payload: {
  name: string; code?: string; description?: string;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("insurance_providers")
    .insert({ id: createEntityId(), ...payload, tenantId: ctx.profile.tenantId, updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}

export async function updateInsuranceProvider(id: string, payload: {
  name?: string; code?: string; description?: string; isActive?: boolean;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("insurance_providers")
    .update({ ...payload, updatedAt: new Date().toISOString() })
    .eq("id", id).select().single();
  return { data, error: error?.message ?? null };
}

export async function createNomenclator(payload: {
  insuranceProviderId: string; name: string; version?: string;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("nomenclators")
    .insert({ id: createEntityId(), ...payload, tenantId: ctx.profile.tenantId, updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}

export async function createMedicalPractice(payload: {
  nomenclatorId: string; code: string; name: string;
  description?: string; defaultValue?: number;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("medical_practices")
    .insert({ id: crypto.randomUUID(), ...payload, tenantId: ctx.profile.tenantId, updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}

export async function updateMedicalPractice(id: string, payload: {
  code?: string; name?: string; description?: string; defaultValue?: number; isActive?: boolean;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("medical_practices")
    .update({ ...payload, updatedAt: new Date().toISOString() })
    .eq("id", id).select().single();
  return { data, error: error?.message ?? null };
}

export async function createPatientCoverage(payload: {
  patientId: string; insuranceProviderId: string;
  affiliateNumber?: string; planName?: string; isPrimary?: boolean;
  validFrom?: string; validUntil?: string;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("patient_coverages")
    .insert({ id: crypto.randomUUID(), ...payload, tenantId: ctx.profile.tenantId, updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}
