"use server";

import { getAuthContext } from "./_helpers";

export async function createBed(payload: {
  code: string; room?: string; ward?: string;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("beds")
    .insert({ ...payload, tenantId: ctx.profile.tenantId, status: "AVAILABLE", updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}

export async function updateBedStatus(id: string, status: string) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("beds")
    .update({ status, updatedAt: new Date().toISOString() })
    .eq("id", id).select().single();
  return { data, error: error?.message ?? null };
}

export async function createAdmission(payload: {
  patientId: string;
  doctorId?: string | null;
  bedId?: string | null;
  reason?: string;
  notes?: string;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const { data, error } = await ctx.db
    .from("admissions")
    .insert({
      ...payload,
      tenantId: ctx.profile.tenantId,
      admittedAt: new Date().toISOString(),
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    })
    .select().single();

  if (!error && payload.bedId) {
    await ctx.db
      .from("beds")
      .update({ status: "OCCUPIED", updatedAt: new Date().toISOString() })
      .eq("id", payload.bedId);
  }

  return { data, error: error?.message ?? null };
}

export async function dischargePatient(admissionId: string, bedId?: string | null) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const { data, error } = await ctx.db
    .from("admissions")
    .update({ status: "DISCHARGED", dischargedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .eq("id", admissionId).select().single();

  if (!error && bedId) {
    await ctx.db
      .from("beds")
      .update({ status: "AVAILABLE", updatedAt: new Date().toISOString() })
      .eq("id", bedId);
  }

  return { data, error: error?.message ?? null };
}
