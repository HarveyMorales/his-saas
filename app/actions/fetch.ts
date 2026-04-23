"use server";

import { getAuthContext } from "./_helpers";

export async function fetchPatients(search?: string) {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  let q = ctx.db
    .from("patients")
    .select("*")
    .eq("tenantId", ctx.profile.tenantId)
    .eq("isActive", true)
    .order("lastName");
  if (search) {
    q = (q as any).or(`lastName.ilike.%${search}%,firstName.ilike.%${search}%,dni.ilike.%${search}%`);
  }
  const { data } = await q;
  return data ?? [];
}

export async function fetchAppointments(date?: string) {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  let q = (ctx.db as any)
    .from("appointments")
    .select("*, patients(firstName, lastName), users(firstName, lastName, specialty)")
    .eq("tenantId", ctx.profile.tenantId)
    .order("scheduledAt");
  if (date) {
    q = q.gte("scheduledAt", `${date}T00:00:00`).lte("scheduledAt", `${date}T23:59:59`);
  }
  const { data } = await q;
  return data ?? [];
}

export async function fetchMedicalRecords(patientId: string) {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await ctx.db
    .from("medical_records")
    .select("*")
    .eq("patientId", patientId)
    .order("createdAt", { ascending: false });
  return data ?? [];
}

export async function fetchTenantUsers() {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await ctx.db
    .from("users")
    .select("*")
    .eq("tenantId", ctx.profile.tenantId)
    .order("lastName");
  return data ?? [];
}

export async function fetchAuditLogs(limit = 100) {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await (ctx.db as any)
    .from("audit_logs")
    .select("*, users(firstName, lastName, email)")
    .eq("tenantId", ctx.profile.tenantId)
    .order("createdAt", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function fetchShareRequests() {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await (ctx.db as any)
    .from("share_requests")
    .select("*, patients(firstName, lastName, dni), fromTenant:tenants!fromTenantId(name), toTenant:tenants!toTenantId(name), requester:users!requestedById(firstName, lastName)")
    .or(`fromTenantId.eq.${ctx.profile.tenantId},toTenantId.eq.${ctx.profile.tenantId}`)
    .order("createdAt", { ascending: false });
  return data ?? [];
}

export async function fetchTenants() {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await (ctx.db as any)
    .from("tenants")
    .select("id, name, type, slug, primaryColor")
    .eq("isActive", true)
    .order("name");
  return data ?? [];
}

export async function fetchPatientCoveragesByPatient(patientId: string) {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await (ctx.db as any)
    .from("patient_coverages")
    .select("*, insurance_providers(name, code)")
    .eq("tenantId", ctx.profile.tenantId)
    .eq("patientId", patientId)
    .order("isPrimary", { ascending: false });
  return data ?? [];
}

export async function fetchBillingItems() {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await (ctx.db as any)
    .from("billing_items")
    .select("*, patients(firstName, lastName)")
    .eq("tenantId", ctx.profile.tenantId)
    .order("serviceDate", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function fetchDoctors() {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await ctx.db
    .from("users")
    .select("*")
    .eq("tenantId", ctx.profile.tenantId)
    .eq("role", "MEDICO" as any)
    .eq("isActive", true)
    .order("lastName");
  return data ?? [];
}

export async function fetchInsuranceProviders() {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await (ctx.db as any)
    .from("insurance_providers")
    .select("*")
    .eq("tenantId", ctx.profile.tenantId)
    .order("name");
  return data ?? [];
}

export async function fetchMedicalPractices(providerId?: string | null) {
  const ctx = await getAuthContext();
  if (!ctx) return { practices: [], nomenclators: [] };
  let q = (ctx.db as any)
    .from("medical_practices")
    .select("*, nomenclators(name, insuranceProviderId)")
    .eq("tenantId", ctx.profile.tenantId)
    .eq("isActive", true)
    .order("code");
  if (providerId) {
    const { data: noms } = await (ctx.db as any)
      .from("nomenclators").select("id").eq("insuranceProviderId", providerId);
    const ids = (noms ?? []).map((n: any) => n.id);
    if (ids.length === 0) return { practices: [], nomenclators: [] };
    q = q.in("nomenclatorId", ids);
  }
  const { data: practices } = await q;
  const { data: nomenclators } = await (ctx.db as any)
    .from("nomenclators").select("*").eq("tenantId", ctx.profile.tenantId);
  return { practices: practices ?? [], nomenclators: nomenclators ?? [] };
}

export async function fetchPatientCoverages(providerId?: string | null) {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  let q = (ctx.db as any)
    .from("patient_coverages")
    .select("*, patients(firstName, lastName, dni), insurance_providers(name, code)")
    .eq("tenantId", ctx.profile.tenantId)
    .order("createdAt", { ascending: false });
  if (providerId) q = q.eq("insuranceProviderId", providerId);
  const { data } = await q;
  return data ?? [];
}

export async function fetchInvoices() {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await (ctx.db as any)
    .from("invoices")
    .select("*, patients(firstName, lastName), insurance_providers(name, code), invoice_items(*)")
    .eq("tenantId", ctx.profile.tenantId)
    .order("createdAt", { ascending: false });
  return data ?? [];
}

export async function fetchBeds() {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await (ctx.db as any)
    .from("beds")
    .select("*")
    .eq("tenantId", ctx.profile.tenantId)
    .order("ward").order("code");
  return data ?? [];
}

export async function fetchAdmissions() {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { data } = await (ctx.db as any)
    .from("admissions")
    .select("*, patients(firstName, lastName, dni), users(firstName, lastName, specialty), beds(code, room, ward)")
    .eq("tenantId", ctx.profile.tenantId)
    .order("admittedAt", { ascending: false });
  return data ?? [];
}

export async function fetchCurrentUserProfile() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  return ctx.profile;
}
