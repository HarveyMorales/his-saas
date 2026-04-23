"use server";

import { getAuthContext } from "./_helpers";

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
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };

  const total = payload.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const number = `${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}-${String(Date.now()).slice(-8)}`;

  const { data: inv, error: invErr } = await ctx.db
    .from("invoices")
    .insert({
      id: crypto.randomUUID(),
      tenantId: ctx.profile.tenantId,
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
    id: crypto.randomUUID(),
    tenantId: ctx.profile.tenantId,
    invoiceId: inv.id,
    medicalPracticeId: i.medicalPracticeId ?? null,
    description: i.description,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    totalPrice: i.quantity * i.unitPrice,
  }));

  const { error: itemsErr } = await ctx.db.from("invoice_items").insert(items);
  if (itemsErr) return { error: itemsErr.message };

  return { data: inv, error: null };
}

export async function updateInvoiceStatus(id: string, status: string) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { data, error } = await ctx.db
    .from("invoices")
    .update({ status, updatedAt: new Date().toISOString(), ...(status === "APPROVED" ? { issuedAt: new Date().toISOString() } : {}) })
    .eq("id", id).select().single();
  return { data, error: error?.message ?? null };
}

export async function deleteInvoice(id: string) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "No autenticado" };
  const { error } = await ctx.db.from("invoices").delete().eq("id", id);
  return { error: error?.message ?? null };
}
