"use server";

import { createEntityId } from "./_ids";
import { getAuthContext } from "./_helpers";

export async function getMedicalRecords(patientId: string) {
  const ctx = await getAuthContext();
  if (!ctx) return { data: null, error: "No autenticado" };

  const { data, error } = await ctx.db
    .from("medical_records")
    .select("*")
    .eq("patientId", patientId)
    .order("createdAt", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function createMedicalRecord(payload: {
  patientId: string;
  appointmentId?: string | null;
  specialtyId?: string | null;
  entryType?: string;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  diagnosisCie10?: string | null;
  diagnosisFreeText?: string | null;
  treatment?: string | null;
  vitalsBpSystolic?: number | null;
  vitalsBpDiastolic?: number | null;
  vitalsHrBpm?: number | null;
  vitalsTempC?: number | null;
  vitalsWeightKg?: number | null;
  vitalsHeightCm?: number | null;
  isConfidential?: boolean;
}) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const p = ctx.profile as any;
  if (p.role !== "MEDICO" && p.role !== "TENANT_ADMIN" && p.role !== "SUPER_ADMIN") {
    return { error: "Sin permisos para crear registros médicos" };
  }

  const { data, error } = await ctx.db
    .from("medical_records")
    .insert({
      id: createEntityId(),
      ...payload,
      tenantId: p.tenantId,
      authorId: p.id,
      version: 1,
      isConfidential: payload.isConfidential ?? false,
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateMedicalRecord(id: string, payload: Record<string, unknown>) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const { data: existing } = await ctx.db
    .from("medical_records")
    .select("version")
    .eq("id", id)
    .single();

  const { data, error } = await ctx.db
    .from("medical_records")
    .update({
      ...payload,
      version: ((existing as any)?.version ?? 1) + 1,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
