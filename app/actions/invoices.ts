"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";

export async function createInvoice(payload: {
  patientId?: string | null;
  insuranceProviderId?: string | null;
  notes?: string;
  items: Array<{
    medicalPracticeId?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };
  const p = profile as any;

  const total = payload.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const number = `${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}-${String(Date.now()).slice(-8)}`;

  const { data: inv, error: invErr } = await (supabase as any)
    .from("invoices")
    .insert({
      tenantId: p.tenantId,
      patientId: payload.patientId ?? null,
      insuranceProviderId: payload.insuranceProviderId ?? null,
      number,
      status: "PENDING",
      subtotal: total,
      total,
      notes: payload.notes ?? null,
      updatedAt: new Date().toISOString(),
    })
    .select().single();

  if (invErr) return { error: invErr.message };

  const items = payload.items.map(i => ({
    tenantId: p.tenantId,
    invoiceId: inv.id,
    medicalPracticeId: i.medicalPracticeId ?? null,
    description: i.description,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    totalPrice: i.quantity * i.unitPrice,
  }));

  const { error: itemsErr } = await (supabase as any).from("invoice_items").insert(items);
  if (itemsErr) return { error: itemsErr.message };

  return { data: inv, error: null };
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("invoices")
    .update({ status, updatedAt: new Date().toISOString(), ...(status === "APPROVED" ? { issuedAt: new Date().toISOString() } : {}) })
    .eq("id", id).select().single();
  return { data, error: error?.message ?? null };
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any).from("invoices").delete().eq("id", id);
  return { error: error?.message ?? null };
}
