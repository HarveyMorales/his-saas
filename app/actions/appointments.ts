"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";
import type { AppointmentStatus } from "@/lib/supabase/types";

export async function getAppointments(date?: string) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { data: null, error: "No autenticado" };

  let query = supabase
    .from("appointments")
    .select("*")
    .eq("tenantId", (profile as any).tenantId)
    .order("scheduledAt");

  if (date) {
    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59`;
    query = query.gte("scheduledAt", start).lte("scheduledAt", end);
  }

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

export async function createAppointment(payload: {
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMin?: number;
  specialtyId?: string | null;
  chiefComplaint?: string | null;
  notes?: string | null;
  insurancePlanId?: string | null;
}) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      ...payload,
      tenantId: (profile as any).tenantId,
      status: "SCHEDULED",
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, cancelReason?: string) {
  const supabase = await createClient();

  const update: any = { status, updatedAt: new Date().toISOString() };
  if (status === "CANCELLED") {
    update.cancelledAt = new Date().toISOString();
    if (cancelReason) update.cancelReason = cancelReason;
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(update as any)
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
