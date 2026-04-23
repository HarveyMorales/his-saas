"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import {
  fetchCurrentUserProfile,
  fetchPatients,
  fetchAppointments,
  fetchMedicalRecords,
  fetchTenantUsers,
  fetchAuditLogs,
  fetchShareRequests,
  fetchTenants,
  fetchPatientCoveragesByPatient,
  fetchBillingItems,
  fetchDoctors,
  fetchInsuranceProviders,
  fetchMedicalPractices,
  fetchPatientCoverages,
  fetchInvoices,
  fetchBeds,
  fetchAdmissions,
} from "@/app/actions/fetch";

const supabase = createClient();

// ── Auth hook ──────────────────────────────────────────────────
export function useCurrentUser() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchCurrentUserProfile().then((p) => {
      if (mounted) { setProfile(p); setLoading(false); }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { profile, loading };
}

// ── Patients hook ──────────────────────────────────────────────
export function usePatients(tenantId: string | null, search?: string) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const data = await fetchPatients(search);
    setPatients(data);
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
    const data = await fetchAppointments(date);
    setAppointments(data);
    setLoading(false);
  }, [tenantId, date]);

  useEffect(() => { fetch(); }, [fetch]);

  return { appointments, loading, refetch: fetch };
}

// ── Medical records hook ────────────────────────────────────────
export function useMedicalRecords(patientId: string | null) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const data = await fetchMedicalRecords(patientId);
    setRecords(data);
    setLoading(false);
  }, [patientId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { records, loading, refetch: fetch };
}

// ── Tenant users hook ──────────────────────────────────────────
export function useTenantUsers(tenantId: string | null) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const data = await fetchTenantUsers();
    setUsers(data);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { users, loading, refetch: fetch };
}

// ── Audit logs hook ─────────────────────────────────────────────
export function useAuditLogs(tenantId: string | null, limit = 50) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    fetchAuditLogs(limit).then((data) => {
      setLogs(data);
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
    const data = await fetchShareRequests();
    setRequests(data);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { requests, loading, refetch: fetch };
}

// ── Tenants hook ────────────────────────────────────────────────
export function useTenants(excludeTenantId?: string | null) {
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    fetchTenants().then((data) => {
      const filtered = excludeTenantId
        ? data.filter((t: any) => t.id !== excludeTenantId)
        : data;
      setTenants(filtered);
    });
  }, [excludeTenantId]);

  return { tenants };
}

// ── Patient coverages by patient hook ──────────────────────────
export function usePatientCoveragesByPatient(tenantId: string | null, patientId: string | null) {
  const [coverages, setCoverages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tenantId || !patientId) return;
    setLoading(true);
    const data = await fetchPatientCoveragesByPatient(patientId);
    setCoverages(data);
    setLoading(false);
  }, [tenantId, patientId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { coverages, loading, refetch: fetch };
}

// ── Billing items hook ──────────────────────────────────────────
export function useBillingItems(tenantId: string | null) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    fetchBillingItems().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [tenantId]);

  return { items, loading };
}

// ── Doctors hook ───────────────────────────────────────────────
export function useDoctors(tenantId: string | null) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    fetchDoctors().then((data) => {
      setDoctors(data);
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
    const data = await fetchInsuranceProviders();
    setProviders(data);
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
    const result = await fetchMedicalPractices(providerId);
    setPractices(result.practices);
    setNomenclators(result.nomenclators);
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
    const data = await fetchPatientCoverages(providerId);
    setCoverages(data);
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
    const data = await fetchInvoices();
    setInvoices(data);
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
    const data = await fetchBeds();
    setBeds(data);
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
    const data = await fetchAdmissions();
    setAdmissions(data);
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
