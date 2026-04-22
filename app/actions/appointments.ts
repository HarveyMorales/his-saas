"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";
import type { InsertTables, UpdateTables } from "@/lib/supabase/types";
import type { AppointmentStatus } from "@/lib/supabase/types";

export async function getAppointments(date?: string) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { data: null, error: "No autenticado" };

  let query = supabase
    .from("appointments")
    .select(`
      *,
      patients(first_name, last_name, dni),
      users!appointments_doctor_id_fkey(first_name, last_name, specialty)
    `)
    .eq("tenant_id", profile.tenant_id)
    .order("scheduled_at");

  if (date) {
    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59`;
    query = query.gte("scheduled_at", start).lte("scheduled_at", end);
  }

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

export async function createAppointment(payload: InsertTables<"appointments">) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("appointments")
    .insert({ ...payload, tenant_id: profile.tenant_id })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, cancelReason?: string) {
  const supabase = await createClient();

  const update: UpdateTables<"appointments"> = { status };
  if (status === "CANCELLED") {
    update.cancelled_at = new Date().toISOString();
    if (cancelReason) update.cancel_reason = cancelReason;
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
