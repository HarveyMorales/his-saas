"use server";

import { createEntityId } from "./_ids";
import { getAuthContext } from "./_helpers";
import type { AppointmentStatus } from "@/lib/supabase/types";

export async function getAppointments(date?: string) {
  const ctx = await getAuthContext();
  if (!ctx) return { data: null, error: "No autenticado" };

  let query = ctx.db
    .from("appointments")
    .select("*")
    .eq("tenantId", ctx.profile.tenantId)
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
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const { data, error } = await ctx.db
    .from("appointments")
    .insert({
      id: createEntityId(),
      ...payload,
      tenantId: ctx.profile.tenantId,
      status: "SCHEDULED",
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, cancelReason?: string) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const update: any = { status, updatedAt: new Date().toISOString() };
  if (status === "CANCELLED") {
    update.cancelledAt = new Date().toISOString();
    if (cancelReason) update.cancelReason = cancelReason;
  }

  const { data, error } = await ctx.db
    .from("appointments")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
