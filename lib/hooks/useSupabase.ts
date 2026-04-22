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

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    supabase
      .from("medical_records")
      .select("*")
      .eq("patientId", patientId)
      .order("createdAt", { ascending: false })
      .then(({ data }) => {
        setRecords((data as any) ?? []);
        setLoading(false);
      });
  }, [patientId]);

  return { records, loading };
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
