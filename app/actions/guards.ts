"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";

export async function createBed(payload: {
  code: string; room?: string; ward?: string;
}) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };
  const p = profile as any;
  const { data, error } = await (supabase as any)
    .from("beds")
    .insert({ ...payload, tenantId: p.tenantId, status: "AVAILABLE", updatedAt: new Date().toISOString() })
    .select().single();
  return { data, error: error?.message ?? null };
}

export async function updateBedStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
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
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };
  const p = profile as any;

  const { data, error } = await (supabase as any)
    .from("admissions")
    .insert({
      ...payload,
      tenantId: p.tenantId,
      admittedAt: new Date().toISOString(),
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    })
    .select().single();

  // Mark bed as OCCUPIED
  if (!error && payload.bedId) {
    await (supabase as any)
      .from("beds")
      .update({ status: "OCCUPIED", updatedAt: new Date().toISOString() })
      .eq("id", payload.bedId);
  }

  return { data, error: error?.message ?? null };
}

export async function dischargePatient(admissionId: string, bedId?: string | null) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("admissions")
    .update({ status: "DISCHARGED", dischargedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .eq("id", admissionId).select().single();

  if (!error && bedId) {
    await (supabase as any)
      .from("beds")
      .update({ status: "AVAILABLE", updatedAt: new Date().toISOString() })
      .eq("id", bedId);
  }

  return { data, error: error?.message ?? null };
}
