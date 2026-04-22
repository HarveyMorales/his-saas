"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";

export async function getPatients(search?: string) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { data: null, error: "No autenticado" };

  let query = supabase
    .from("patients")
    .select("*")
    .eq("tenantId", (profile as any).tenantId)
    .eq("isActive", true)
    .order("lastName");

  if (search) {
    query = query.or(`lastName.ilike.%${search}%,firstName.ilike.%${search}%,dni.ilike.%${search}%`);
  }

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

export async function getPatient(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createPatient(payload: {
  firstName: string;
  lastName: string;
  dni: string;
  cuil?: string | null;
  birthDate?: string | null;
  sex?: "M" | "F" | "X" | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  insurancePlanId?: string | null;
  affiliateNum?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
}) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("patients")
    .insert({
      ...payload,
      tenantId: (profile as any).tenantId,
      isActive: true,
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updatePatient(id: string, payload: Record<string, unknown>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .update({ ...payload, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
