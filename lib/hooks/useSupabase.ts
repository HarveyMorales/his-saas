"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

const supabase = createClient();

// ── Auth hook ──────────────────────────────────────────────────
export function useCurrentUser() {
  const [profile, setProfile] = useState<(Tables<"users"> & { tenants: Tables<"tenants"> | null }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || !mounted) { setLoading(false); return; }
      const { data } = await supabase
        .from("users")
        .select("*, tenants(id, name, type, slug, primaryColor)")
        .eq("authId", user.id)
        .single();
      if (mounted) { setProfile(data as any); setLoading(false); }
    });
    return () => { mounted = false; };
  }, []);

  return { profile, loading };
}

// ── Patients hook ──────────────────────────────────────────────
export function usePatients(tenantId: string | null, search?: string) {
  const [patients, setPatients] = useState<Tables<"patients">[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    let q = supabase
      .from("patients")
      .select("*")
      .eq("tenantId", tenantId)
      .eq("isActive", true)
      .order("lastName");

    if (search) {
      q = q.or(`lastName.ilike.%${search}%,firstName.ilike.%${search}%,dni.ilike.%${search}%`);
    }

    const { data } = await q;
    setPatients((data as any) ?? []);
    setLoading(false);
  }, [tenantId, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return { patients, loading, refetch: fetch };
}

// ── Appointments hook ──────────────────────────────────────────
export function useAppointments(tenantId: string | null, date?: string) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    let q = (supabase as any)
      .from("appointments")
      .select("*, patients(firstName, lastName), users(firstName, lastName, specialty)")
      .eq("tenantId", tenantId)
      .order("scheduledAt");

    if (date) {
      q = q.gte("scheduledAt", `${date}T00:00:00`).lte("scheduledAt", `${date}T23:59:59`);
    }

    const { data } = await q;
    setAppointments(data ?? []);
    setLoading(false);
  }, [tenantId, date]);

  useEffect(() => { fetch(); }, [fetch]);

  return { appointments, loading, refetch: fetch };
}

// ── Medical records hook ────────────────────────────────────────
export function useMedicalRecords(patientId: string | null) {
  const [records, setRecords] = useState<Tables<"medical_records">[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const { data } = await supabase
      .from("medical_records")
      .select("*")
      .eq("patientId", patientId)
      .order("createdAt", { ascending: false });
    setRecords((data as any) ?? []);
    setLoading(false);
  }, [patientId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { records, loading, refetch: fetch };
}

// ── Tenant users hook ──────────────────────────────────────────
export function useTenantUsers(tenantId: string | null) {
  const [users, setUsers] = useState<Tables<"users">[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("tenantId", tenantId)
      .order("lastName");
    setUsers((data as any) ?? []);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { users, loading, refetch: fetch };
}

// ── Audit logs hook ─────────────────────────────────────────────
export function useAuditLogs(tenantId: string | null, limit = 50) {
  const [logs, setLogs] = useState<Tables<"audit_logs">[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    (supabase as any)
      .from("audit_logs")
      .select("*, users(firstName, lastName, email)")
      .eq("tenantId", tenantId)
      .order("createdAt", { ascending: false })
      .limit(limit)
      .then(({ data }: any) => {
        setLogs(data ?? []);
        setLoading(false);
      });
  }, [tenantId, limit]);

  return { logs, loading };
}

// ── Share requests hook ─────────────────────────────────────────
export function useShareRequests(tenantId: string | null) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("share_requests")
      .select("*, patients(firstName, lastName, dni), fromTenant:tenants!fromTenantId(name), toTenant:tenants!toTenantId(name)")
      .or(`fromTenantId.eq.${tenantId},toTenantId.eq.${tenantId}`)
      .order("createdAt", { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { requests, loading, refetch: fetch };
}

// ── Billing items hook ──────────────────────────────────────────
export function useBillingItems(tenantId: string | null) {
  const [items, setItems] = useState<Tables<"billing_items">[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    (supabase as any)
      .from("billing_items")
      .select("*, patients(firstName, lastName)")
      .eq("tenantId", tenantId)
      .order("serviceDate", { ascending: false })
      .limit(100)
      .then(({ data }: any) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, [tenantId]);

  return { items, loading };
}

// ── Doctors hook ───────────────────────────────────────────────
export function useDoctors(tenantId: string | null) {
  const [doctors, setDoctors] = useState<Tables<"users">[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    supabase
      .from("users")
      .select("*")
      .eq("tenantId", tenantId)
      .eq("role", "MEDICO" as any)
      .eq("isActive", true)
      .order("lastName")
      .then(({ data }) => {
        setDoctors((data as any) ?? []);
        setLoading(false);
      });
  }, [tenantId]);

  return { doctors, loading };
}

// ── Insurance providers hook ────────────────────────────────────
export function useInsuranceProviders(tenantId: string | null) {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("insurance_providers")
      .select("*")
      .eq("tenantId", tenantId)
      .order("name");
    setProviders(data ?? []);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { providers, loading, refetch: fetch };
}

// ── Medical practices hook ──────────────────────────────────────
export function useMedicalPractices(tenantId: string | null, providerId?: string | null) {
  const [practices, setPractices] = useState<any[]>([]);
  const [nomenclators, setNomenclators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    let q = (supabase as any)
      .from("medical_practices")
      .select("*, nomenclators(name, insuranceProviderId)")
      .eq("tenantId", tenantId)
      .eq("isActive", true)
      .order("code");
    if (providerId) {
      const { data: noms } = await (supabase as any)
        .from("nomenclators")
        .select("id")
        .eq("insuranceProviderId", providerId);
      const nomIds = (noms ?? []).map((n: any) => n.id);
      if (nomIds.length > 0) {
        q = q.in("nomenclatorId", nomIds);
      } else {
        setPractices([]);
        setLoading(false);
        return;
      }
    }
    const { data } = await q;
    setPractices(data ?? []);

    if (tenantId) {
      const { data: nomData } = await (supabase as any)
        .from("nomenclators")
        .select("*")
        .eq("tenantId", tenantId);
      setNomenclators(nomData ?? []);
    }
    setLoading(false);
  }, [tenantId, providerId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { practices, nomenclators, loading, refetch: fetch };
}

// ── Patient coverages hook ──────────────────────────────────────
export function usePatientCoverages(tenantId: string | null, providerId?: string | null) {
  const [coverages, setCoverages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    let q = (supabase as any)
      .from("patient_coverages")
      .select("*, patients(firstName, lastName, dni), insurance_providers(name, code)")
      .eq("tenantId", tenantId)
      .order("createdAt", { ascending: false });
    if (providerId) q = q.eq("insuranceProviderId", providerId);
    const { data } = await q;
    setCoverages(data ?? []);
    setLoading(false);
  }, [tenantId, providerId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { coverages, loading, refetch: fetch };
}

// ── Invoices hook ───────────────────────────────────────────────
export function useInvoices(tenantId: string | null) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("invoices")
      .select("*, patients(firstName, lastName), insurance_providers(name, code), invoice_items(*)")
      .eq("tenantId", tenantId)
      .order("createdAt", { ascending: false });
    setInvoices(data ?? []);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { invoices, loading, refetch: fetch };
}

// ── Beds hook ───────────────────────────────────────────────────
export function useBeds(tenantId: string | null) {
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("beds")
      .select("*")
      .eq("tenantId", tenantId)
      .order("ward")
      .order("code");
    setBeds(data ?? []);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { beds, loading, refetch: fetch };
}

// ── Admissions hook ─────────────────────────────────────────────
export function useAdmissions(tenantId: string | null) {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("admissions")
      .select("*, patients(firstName, lastName, dni), users(firstName, lastName, specialty), beds(code, room, ward)")
      .eq("tenantId", tenantId)
      .order("admittedAt", { ascending: false });
    setAdmissions(data ?? []);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { admissions, loading, refetch: fetch };
}

// ── Realtime appointments subscription ─────────────────────────
export function useRealtimeAppointments(tenantId: string | null, onUpdate: () => void) {
  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`appointments:${tenantId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "appointments",
        filter: `tenantId=eq.${tenantId}`,
      }, onUpdate)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tenantId, onUpdate]);
}
