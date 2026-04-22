"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";
import type { InsertTables } from "@/lib/supabase/types";

export async function getMedicalRecords(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("medical_records")
    .select(`
      *,
      users!medical_records_author_id_fkey(first_name, last_name, specialty)
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function createMedicalRecord(payload: Omit<InsertTables<"medical_records">, "tenant_id" | "author_id">) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };

  if (profile.role !== "MEDICO" && profile.role !== "TENANT_ADMIN" && profile.role !== "SUPER_ADMIN") {
    return { error: "Sin permisos para crear registros médicos" };
  }

  const { data, error } = await supabase
    .from("medical_records")
    .insert({
      ...payload,
      tenant_id: profile.tenant_id,
      author_id: profile.id,
      version: 1,
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateMedicalRecord(
  id: string,
  payload: Partial<InsertTables<"medical_records">>
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("medical_records")
    .select("version")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("medical_records")
    .update({ ...payload, version: (existing?.version ?? 1) + 1 })
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
