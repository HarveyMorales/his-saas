"use client";

import { Sparkline } from "@/components/ui/Sparkline";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { APPOINTMENTS, GUARDS, HC_SHARE_REQUESTS } from "@/lib/data";
import { useCurrentUser, useAppointments, usePatients, useAdmissions, useInvoices } from "@/lib/hooks/useSupabase";
import type { Institution, NavId } from "@/lib/types";
import { TrendingUp, Users, Calendar, Activity, DollarSign, AlertTriangle, ChevronRight, Plus } from "lucide-react";

interface DashboardViewProps {
  institution: Institution | null;
  onNav: (id: NavId) => void;
}

/* Wavy SVG line — the "lines that go in the wind" */
function WindLine({ color, opacity = 0.5 }: { color: string; opacity?: number }) {
  return (
    <svg width="100%" height="6" viewBox="0 0 400 6" preserveAspectRatio="none" style={{ display: "block", margin: "6px 0 14px" }}>
      <path
        d="M0,3 C50,0 50,6 100,3 C150,0 150,6 200,3 C250,0 250,6 300,3 C350,0 350,6 400,3"
        fill="none"
        style={{ stroke: color, strokeWidth: "1.5", strokeOpacity: opacity }}
      />
    </svg>
  );
}

/* Unique organic border-radius per stat card — the wind-blown frames */
const WIND_RADII = [
  "22px 30px 20px 16px / 16px 20px 30px 22px",
  "30px 18px 26px 22px / 22px 26px 18px 30px",
  "18px 24px 30px 20px / 30px 18px 24px 20px",
  "24px 20px 16px 28px / 18px 28px 22px 16px",
];

export function DashboardView({ institution, onNav }: DashboardViewProps) {
  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const todayISO = new Date().toISOString().split("T")[0];

  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;
  const firstName = (profile as any)?.firstName ?? null;

  const { appointments: dbAppts, loading: apptLoading } = useAppointments(tenantId, todayISO);
  const { patients: dbPatients, loading: patientsLoading } = usePatients(tenantId);
  const { admissions: dbAdmissions } = useAdmissions(tenantId);
  const { invoices: dbInvoices } = useInvoices(tenantId);

  const apptCount    = isLive ? dbAppts.length : APPOINTMENTS.length;
  const patientCount = isLive ? dbPatients.length : 1284;
  const pendingAppts = isLive
    ? dbAppts.filter((a: any) => a.status === "SCHEDULED").length
    : APPOINTMENTS.filter(a => a.status === "PENDIENTE").length;

  const STATS = [
    {
      label: "Pacientes activos",
      value: patientsLoading ? "…" : patientCount.toLocaleString(),
      delta: "registrados",
      icon: <Users size={20} />,
      color: "#00BFA6",
      data: [30,45,38,60,52,72,65,82,75,92],
    },
    {
      label: "Turnos hoy",
      value: apptLoading ? "…" : String(apptCount),
      delta: `${pendingAppts} pendientes`,
      icon: <Calendar size={20} />,
      color: "#2563EB",
      data: [20,35,25,50,40,65,55,75,68,85],
    },
    {
      label: "Guardias activas",
      value: isLive ? String(dbAdmissions.filter((a: any) => a.status === "ACTIVE").length) : "3",
      delta: isLive ? `${dbAdmissions.length} total` : "2 médicos en turno",
      icon: <Activity size={20} />,
      color: "#F59E0B",
      data: [1,2,1,3,2,3,2,4,3,3],
    },
    {
      label: "Facturación mes",
      value: isLive
        ? `$${(dbInvoices.reduce((s: number, i: any) => s + Number(i.total ?? 0), 0) / 1000).toFixed(1)}K`
        : "$284.5K",
      delta: isLive
        ? `${dbInvoices.filter((i: any) => i.status === "PENDING").length} pendientes`
        : "+18% vs ant.",
      icon: <DollarSign size={20} />,
      color: "#8B5CF6",
      data: [60,75,65,85,70,90,82,95,88,100],
    },
  ];

  const STATUS_LABEL: Record<string, string> = {
    SCHEDULED: "PENDIENTE", IN_PROGRESS: "EN CURSO", COMPLETED: "CONFIRMADO",
    CANCELLED: "CANCELADO", CONFIRMED: "CONFIRMADO", NO_SHOW: "CANCELADO", RESCHEDULED: "PENDIENTE",
  };

  const displayAppts = isLive
    ? dbAppts.slice(0, 8).map((a: any) => ({
        id: a.id,
        time: a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "—",
        patient: a.patients ? `${a.patients.lastName}, ${a.patients.firstName}` : "—",
        doctor: a.users ? `${a.users.firstName} ${a.users.lastName}` : "—",
        specialty: a.users?.specialty ?? "—",
        obra: "Particular",
        status: STATUS_LABEL[a.status] ?? "PENDIENTE",
      }))
    : APPOINTMENTS.slice(0, 8);

  const glassCard: React.CSSProperties = {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    boxShadow: "var(--glass-shadow)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <div style={{
        ...glassCard,
        borderRadius: "28px 22px 32px 18px / 18px 32px 22px 28px",
        padding: "22px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 20,
      }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--slate-500)", fontWeight: 600, textTransform: "capitalize" }}>
            {today}
          </p>
          <h1 style={{ margin: "0 0 6px", fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "var(--navy)", letterSpacing: -0.5 }}>
            Buen día{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {institution?.name ?? "Sistema HIS"} ·{" "}
            {apptLoading ? "cargando..." : `${apptCount} turnos hoy · ${pendingAppts} pendientes`}
            {isLive && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.20)" }}>
                LIVE DB
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => onNav("appointments")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: "14px 10px 16px 12px / 12px 16px 10px 14px",
              background: "var(--teal)", color: "white",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            <Plus size={14} /> Nuevo turno
          </button>
          <button
            onClick={() => onNav("patients")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: "10px 16px 12px 14px / 14px 12px 16px 10px",
              background: "rgba(255,255,255,0.45)",
              border: "1px solid var(--glass-border)",
              color: "var(--navy)", cursor: "pointer", fontSize: 13, fontWeight: 700,
              backdropFilter: "blur(8px)",
            }}
          >
            <Plus size={14} /> Paciente
          </button>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              ...glassCard,
              borderRadius: WIND_RADII[i],
              padding: "18px 20px",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--glass-shadow), 0 16px 40px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--glass-shadow)";
            }}
          >
            <WindLine color={s.color} opacity={0.55} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: "var(--slate-500)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 700, color: "var(--navy)", letterSpacing: -1.5, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginTop: 5, display: "flex", alignItems: "center", gap: 3 }}>
                  <TrendingUp size={10} /> {s.delta}
                </div>
              </div>
              <div style={{
                width: 46, height: 46, borderRadius: "50%",
                background: `${s.color}18`,
                border: `1.5px solid ${s.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: s.color,
              }}>
                {s.icon}
              </div>
            </div>
            <Sparkline color={s.color} data={s.data} width={80} height={26} />
          </div>
        ))}
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

        {/* Appointments panel */}
        <div style={{
          ...glassCard,
          borderRadius: "22px 16px 24px 20px / 20px 24px 16px 22px",
          overflow: "hidden",
        }}>
          <div style={{ padding: "18px 22px 10px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>
                Próximos turnos
              </div>
              <WindLine color="var(--teal)" opacity={0.45} />
              <div style={{ fontSize: 12, color: "var(--slate-500)" }}>
                {apptLoading ? "Cargando..." : `${apptCount} turnos programados hoy`}
              </div>
            </div>
            <button
              onClick={() => onNav("appointments")}
              style={{
                padding: "7px 16px",
                borderRadius: "10px 14px 10px 12px / 12px 10px 14px 10px",
                background: "var(--teal)", color: "white", border: "none",
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
              }}
            >
              + Nuevo
            </button>
          </div>

          {apptLoading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>
              Cargando...
            </div>
          ) : displayAppts.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>
              No hay turnos para hoy
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.30)" }}>
                  {["Hora", "Paciente", "Profesional", "Especialidad", "Obra Social", "Estado"].map(h => (
                    <th key={h} style={{
                      padding: "9px 14px", textAlign: "left",
                      fontSize: 10, fontWeight: 700, color: "var(--slate-500)",
                      letterSpacing: 0.7, textTransform: "uppercase",
                      borderBottom: "1px solid rgba(255,255,255,0.30)",
                    }}>
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
                      borderBottom: "1px solid rgba(255,255,255,0.25)",
                      background: a.status === "EN CURSO" ? "rgba(37,99,235,0.06)" : "transparent",
                      cursor: "pointer",
                      transition: "background 0.12s",
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

          {/* Guards card */}
          <div style={{
            ...glassCard,
            borderRadius: "24px 16px 20px 28px / 28px 20px 16px 24px",
            overflow: "hidden",
          }}>
            <div style={{ padding: "14px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>
                  Guardias
                </div>
                <WindLine color="var(--amber)" opacity={0.50} />
              </div>
              <button
                onClick={() => onNav("guards")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}
              >
                Ver todas <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ paddingBottom: 4 }}>
              {GUARDS.filter(g => g.status !== "PROGRAMADA").map((g, i, arr) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 16px",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.25)" : "none",
                }}>
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

          {/* HC Share alerts */}
          {HC_SHARE_REQUESTS.filter(r => r.status === "PENDIENTE").map((req, i) => (
            <div key={i} style={{
              ...glassCard,
              borderRadius: "16px 24px 18px 22px / 22px 18px 24px 16px",
              padding: "14px 16px",
              borderLeft: "3px solid var(--amber)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <AlertTriangle size={13} color="var(--amber)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)" }}>
                  SOLICITUD HC PENDIENTE
                </span>
              </div>
              <WindLine color="var(--amber)" opacity={0.35} />
              <div style={{ fontSize: 12, color: "var(--slate-700)", marginBottom: 2, fontWeight: 600 }}>
                {req.patient}
              </div>
              <div style={{ fontSize: 11, color: "var(--slate-500)", marginBottom: 4 }}>
                {req.fromInst} → {req.toInst}
              </div>
              <div style={{ fontSize: 11, color: "var(--slate-400)", fontStyle: "italic", marginBottom: 12 }}>
                "{req.reason}"
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => onNav("sharing")}
                  style={{
                    flex: 1, padding: "7px 0",
                    borderRadius: "10px 8px 12px 8px / 8px 12px 8px 10px",
                    background: "var(--teal)", color: "white",
                    border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                  }}
                >
                  Revisar
                </button>
                <button style={{
                  flex: 1, padding: "7px 0",
                  borderRadius: "8px 12px 8px 10px / 10px 8px 12px 8px",
                  background: "rgba(255,255,255,0.40)",
                  color: "var(--red)", border: "1px solid var(--red-dim)",
                  cursor: "pointer", fontSize: 11, fontWeight: 700,
                }}>
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
