"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";
import type { InsertTables, UpdateTables } from "@/lib/supabase/types";

export async function getPatients(search?: string) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { data: null, error: "No autenticado" };

  let query = supabase
    .from("patients")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .eq("is_active", true)
    .order("last_name");

  if (search) {
    query = query.or(`last_name.ilike.%${search}%,first_name.ilike.%${search}%,dni.ilike.%${search}%`);
  }

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

export async function getPatient(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select(`
      *,
      medical_records(*),
      appointments(*, users!appointments_doctor_id_fkey(first_name, last_name))
    `)
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createPatient(payload: InsertTables<"patients">) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("patients")
    .insert({ ...payload, tenant_id: profile.tenant_id })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updatePatient(id: string, payload: UpdateTables<"patients">) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
