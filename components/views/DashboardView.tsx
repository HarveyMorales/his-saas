"use client";

import { useEffect, useState } from "react";
import { Sparkline } from "@/components/ui/Sparkline";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { APPOINTMENTS, GUARDS, HC_SHARE_REQUESTS } from "@/lib/data";
import { useCurrentUser, useAppointments, usePatients, useAdmissions, useInvoices } from "@/lib/hooks/useSupabase";
import type { Institution, NavId } from "@/lib/types";
import { TrendingUp, Users, Calendar, Activity, DollarSign, AlertTriangle, ChevronRight } from "lucide-react";

interface DashboardViewProps {
  institution: Institution | null;
  onNav: (id: NavId) => void;
}

export function DashboardView({ institution, onNav }: DashboardViewProps) {
  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const todayISO = new Date().toISOString().split("T")[0];

  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;

  const { appointments: dbAppts, loading: apptLoading } = useAppointments(tenantId, todayISO);
  const { patients: dbPatients, loading: patientsLoading } = usePatients(tenantId);
  const { admissions: dbAdmissions } = useAdmissions(tenantId);
  const { invoices: dbInvoices } = useInvoices(tenantId);

  const apptCount = isLive ? dbAppts.length : APPOINTMENTS.length;
  const patientCount = isLive ? dbPatients.length : 1284;
  const pendingAppts = isLive
    ? dbAppts.filter((a: any) => a.status === "SCHEDULED").length
    : APPOINTMENTS.filter(a => a.status === "PENDIENTE").length;

  const STATS = [
    { label: "Pacientes activos", value: patientsLoading ? "…" : patientCount.toLocaleString(), delta: "registrados", icon: <Users size={18} />, color: "#00BFA6", data: [30,45,38,60,52,72,65,82,75,92] },
    { label: "Turnos hoy", value: apptLoading ? "…" : String(apptCount), delta: `${pendingAppts} pendientes`, icon: <Calendar size={18} />, color: "#2563EB", data: [20,35,25,50,40,65,55,75,68,85] },
    { label: "Guardias activas", value: isLive ? String(dbAdmissions.filter((a: any) => a.status === "ACTIVE").length) : "3", delta: isLive ? `${dbAdmissions.length} total` : "2 médicos en turno", icon: <Activity size={18} />, color: "#F59E0B", data: [1,2,1,3,2,3,2,4,3,3] },
    { label: "Facturación mes", value: isLive ? `$${(dbInvoices.reduce((s: number, i: any) => s + Number(i.total ?? 0), 0) / 1000).toFixed(1)}K` : "$284.5K", delta: isLive ? `${dbInvoices.filter((i: any) => i.status === "PENDING").length} pendientes` : "+18% vs ant.", icon: <DollarSign size={18} />, color: "#8B5CF6", data: [60,75,65,85,70,90,82,95,88,100] },
  ];

  // For appointments table: show real data when live
  const STATUS_LABEL: Record<string, string> = {
    SCHEDULED: "PENDIENTE",
    IN_PROGRESS: "EN CURSO",
    COMPLETED: "CONFIRMADO",
    CANCELLED: "CANCELADO",
    CONFIRMED: "CONFIRMADO",
    NO_SHOW: "CANCELADO",
    RESCHEDULED: "PENDIENTE",
  };

  const displayAppts = isLive
    ? dbAppts.slice(0, 7).map((a: any) => ({
        id: a.id,
        time: a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "—",
        patient: a.patients ? `${a.patients.lastName}, ${a.patients.firstName}` : "—",
        doctor: a.users ? `${a.users.firstName} ${a.users.lastName}` : "—",
        specialty: a.users?.specialty ?? "—",
        obra: "Particular",
        status: STATUS_LABEL[a.status] ?? "PENDIENTE",
      }))
    : APPOINTMENTS.slice(0, 7);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "var(--navy)", letterSpacing: -0.5 }}>
          Dashboard General
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--slate-500)", textTransform: "capitalize", display: "flex", alignItems: "center", gap: 8 }}>
          {today} · {institution?.name ?? "Seleccioná institución"}
          {isLive && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>
              LIVE DB
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: 14,
              padding: "18px 20px",
              border: "1px solid var(--slate-200)",
              borderTop: `3px solid ${s.color}`,
              cursor: "pointer",
              transition: "box-shadow 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--slate-500)", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: "var(--navy)", letterSpacing: -1, marginTop: 3, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600, marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
                  <TrendingUp size={10} />
                  {s.delta}
                </div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${s.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: s.color,
              }}>
                {s.icon}
              </div>
            </div>
            <Sparkline color={s.color} data={s.data} width={80} height={28} />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        {/* Appointments table */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
                Próximos turnos
              </div>
              <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>
                {apptLoading ? "Cargando..." : `${apptCount} turnos programados hoy`}
              </div>
            </div>
            <button
              onClick={() => onNav("appointments")}
              style={{ padding: "7px 16px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
            >
              + Nuevo
            </button>
          </div>
          {apptLoading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>Cargando...</div>
          ) : displayAppts.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>
              No hay turnos para hoy
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "var(--slate-50)" }}>
                  {["Hora", "Paciente", "Profesional", "Especialidad", "Obra Social", "Estado"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayAppts.map((a, i) => (
                  <tr
                    key={a.id ?? i}
                    className="tbl-row"
                    style={{
                      borderBottom: "1px solid var(--slate-100)",
                      background: a.status === "EN CURSO" ? "#EFF6FF" : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => onNav("appointments")}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--navy)", fontFamily: "Georgia, serif" }}>{a.time}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--slate-800)" }}>{a.patient}</td>
                    <td style={{ padding: "10px 14px", color: "var(--slate-600)" }}>{a.doctor}</td>
                    <td style={{ padding: "10px 14px", color: "var(--slate-500)", fontSize: 12 }}>{a.specialty}</td>
                    <td style={{ padding: "10px 14px", color: "var(--slate-500)", fontSize: 11 }}>{a.obra}</td>
                    <td style={{ padding: "10px 14px" }}><Badge status={a.status as any} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Guards */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Guardias</div>
              <button onClick={() => onNav("guards")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
                Ver todas <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ padding: "8px 0" }}>
              {GUARDS.filter(g => g.status !== "PROGRAMADA").map((g, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--slate-100)" : "none" }}>
                  <Avatar
                    initials={g.doctor.split(" ").slice(1).map(w => w[0]).join("").slice(0, 2)}
                    color={g.status === "ACTIVA" ? "#10B981" : "#F59E0B"}
                    size={32}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {g.doctor}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--slate-500)" }}>
                      {g.specialty} · {g.from}–{g.to}
                    </div>
                  </div>
                  <Badge status={g.status} />
                </div>
              ))}
            </div>
          </div>

          {/* HC Share Alert */}
          {HC_SHARE_REQUESTS.filter(r => r.status === "PENDIENTE").map((req, i) => (
            <div key={i} style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderLeft: "4px solid var(--amber)",
              borderRadius: 12,
              padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <AlertTriangle size={13} color="#92400E" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>SOLICITUD HC PENDIENTE</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--slate-700)", marginBottom: 2, fontWeight: 600 }}>
                {req.patient}
              </div>
              <div style={{ fontSize: 11, color: "var(--slate-500)", marginBottom: 6 }}>
                {req.fromInst} → {req.toInst}
              </div>
              <div style={{ fontSize: 11, color: "var(--slate-500)", fontStyle: "italic", marginBottom: 10 }}>
                "{req.reason}"
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => onNav("sharing")}
                  style={{ flex: 1, padding: "6px 0", borderRadius: 7, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                >
                  Revisar
                </button>
                <button style={{ flex: 1, padding: "6px 0", borderRadius: 7, background: "white", color: "var(--red)", border: "1px solid var(--red)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
