"use client";

import { useState } from "react";
import { Sparkline } from "@/components/ui/Sparkline";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { APPOINTMENTS, GUARDS, HC_SHARE_REQUESTS } from "@/lib/data";
import { useCurrentUser, useAppointments, usePatients, useAdmissions, useInvoices } from "@/lib/hooks/useSupabase";
import { getDashboardType, canSeeBilling, ROLE_LABELS } from "@/lib/permissions";
import type { Institution, NavId } from "@/lib/types";
import { TrendingUp, Users, Calendar, Activity, DollarSign, AlertTriangle, ChevronRight, Plus, FileText, Stethoscope, Receipt } from "lucide-react";

interface DashboardViewProps {
  institution: Institution | null;
  onNav: (id: NavId) => void;
}

/* ─── Dashboard background themes ────────────────────────────────── */

type BgKey = "mar" | "atardecer" | "luna" | "natural";

const DASH_BG: Record<BgKey, { name: string; emoji: string; swatch: string; dark: boolean; css: string }> = {
  mar: {
    name: "Mar", emoji: "🌊", swatch: "#5AAEE0", dark: false,
    css: `
      radial-gradient(ellipse 120% 70% at 50% -5%, rgba(100,200,255,0.50) 0%, transparent 60%),
      radial-gradient(ellipse 80% 60% at 85% 95%, rgba(0,100,200,0.35) 0%, transparent 55%),
      linear-gradient(168deg, #D8EEFF 0%, #A4D0F0 22%, #64ACEA 50%, #2886C8 78%, #0C5CA0 100%)
    `,
  },
  atardecer: {
    name: "Atardecer", emoji: "🌅", swatch: "#F5933A", dark: false,
    css: `
      radial-gradient(ellipse 110% 65% at 65% 0%, rgba(255,210,80,0.55) 0%, transparent 55%),
      radial-gradient(ellipse 70% 55% at 15% 95%, rgba(240,70,10,0.30) 0%, transparent 55%),
      linear-gradient(168deg, #FFF6DE 0%, #FFDA90 22%, #FFA848 50%, #FF6C18 78%, #E03A08 100%)
    `,
  },
  luna: {
    name: "Luna", emoji: "🌙", swatch: "#2030A0", dark: true,
    css: `
      radial-gradient(circle 280px at 78% 15%, rgba(200,220,255,0.20) 0%, transparent 50%),
      radial-gradient(ellipse 100% 55% at 50% 0%, rgba(60,90,200,0.28) 0%, transparent 55%),
      linear-gradient(168deg, #06091A 0%, #080F2C 22%, #0C1A50 50%, #0A1870 78%, #060E60 100%)
    `,
  },
  natural: {
    name: "Natural", emoji: "🌿", swatch: "#74B840", dark: false,
    css: `
      radial-gradient(ellipse 110% 65% at 50% -5%, rgba(160,220,80,0.42) 0%, transparent 60%),
      radial-gradient(ellipse 70% 55% at 15% 90%, rgba(80,155,40,0.30) 0%, transparent 55%),
      linear-gradient(168deg, #F2F0E4 0%, #E2EDD0 22%, #C0D890 50%, #92C055 78%, #60A028 100%)
    `,
  },
};

/* ─── Wind-line SVG accent ────────────────────────────────────────── */
function WindLine({ color, opacity = 0.50 }: { color: string; opacity?: number }) {
  return (
    <svg width="100%" height="6" viewBox="0 0 400 6" preserveAspectRatio="none" style={{ display: "block", margin: "6px 0 12px" }}>
      <path
        d="M0,3 C50,0 50,6 100,3 C150,0 150,6 200,3 C250,0 250,6 300,3 C350,0 350,6 400,3"
        fill="none"
        style={{ stroke: color, strokeWidth: "1.5", strokeOpacity: opacity }}
      />
    </svg>
  );
}

/* ─── Organic border-radius set ───────────────────────────────────── */
const WIND_RADII = [
  "22px 30px 20px 16px / 16px 20px 30px 22px",
  "30px 18px 26px 22px / 22px 26px 18px 30px",
  "18px 24px 30px 20px / 30px 18px 24px 20px",
  "24px 20px 16px 28px / 18px 28px 22px 16px",
];

/* ─── Background selector pill ────────────────────────────────────── */
function BgSelector({ current, onChange }: { current: BgKey; onChange: (k: BgKey) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 10, color: "var(--slate-500)", fontWeight: 600, letterSpacing: 0.5 }}>FONDO</span>
      <div style={{ display: "flex", gap: 6 }}>
        {(Object.keys(DASH_BG) as BgKey[]).map(k => (
          <button
            key={k}
            title={DASH_BG[k].name}
            onClick={() => onChange(k)}
            style={{
              width: 20, height: 20, borderRadius: "50%",
              background: DASH_BG[k].swatch,
              border: current === k ? "2.5px solid white" : "2px solid rgba(255,255,255,0.30)",
              cursor: "pointer", padding: 0,
              boxShadow: current === k ? `0 0 0 2px ${DASH_BG[k].swatch}` : "none",
              transition: "all 0.15s",
              transform: current === k ? "scale(1.15)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ══════════════════════════════════════════════ */
export function DashboardView({ institution, onNav }: DashboardViewProps) {
  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const todayISO = new Date().toISOString().split("T")[0];

  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;
  const firstName = (profile as any)?.firstName ?? null;
  const role = (profile as any)?.role ?? null;

  const dashType = getDashboardType(role);
  const showBilling = canSeeBilling(role);

  const [dashBg, setDashBg] = useState<BgKey>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("his-dashboard-bg") as BgKey) ?? "mar";
    }
    return "mar";
  });

  const handleBgChange = (k: BgKey) => {
    setDashBg(k);
    localStorage.setItem("his-dashboard-bg", k);
  };

  const { appointments: dbAppts, loading: apptLoading } = useAppointments(tenantId, todayISO);
  const { patients: dbPatients, loading: patientsLoading } = usePatients(tenantId);
  const { admissions: dbAdmissions } = useAdmissions(tenantId);
  const { invoices: dbInvoices } = useInvoices(tenantId);

  const apptCount    = isLive ? dbAppts.length : APPOINTMENTS.length;
  const patientCount = isLive ? dbPatients.length : 1284;
  const pendingAppts = isLive
    ? dbAppts.filter((a: any) => a.status === "SCHEDULED").length
    : APPOINTMENTS.filter(a => a.status === "PENDIENTE").length;

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

  const displayInvoices = isLive
    ? dbInvoices.slice(0, 8).map((inv: any) => ({
        id: inv.id,
        patient: inv.patients ? `${inv.patients.lastName}, ${inv.patients.firstName}` : "—",
        obra: inv.insuranceProviders?.name ?? "Particular",
        amount: Number(inv.total ?? 0),
        status: inv.status === "APPROVED" || inv.status === "PAID" ? "LIQUIDADO"
               : inv.status === "REJECTED" ? "OBSERVADO" : "PENDIENTE",
        date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("es-AR") : "—",
      }))
    : [];

  /* ── Stat configs per role ──────────────────────────────────── */
  type StatCfg = { label: string; value: string; delta: string; icon: React.ReactNode; color: string; data: number[] };

  const statsAdmin: StatCfg[] = [
    { label: "Pacientes activos",  value: patientsLoading ? "…" : patientCount.toLocaleString(), delta: "registrados",                icon: <Users size={20} />,     color: "#00BFA6", data: [30,45,38,60,52,72,65,82,75,92] },
    { label: "Turnos hoy",         value: apptLoading     ? "…" : String(apptCount),             delta: `${pendingAppts} pendientes`, icon: <Calendar size={20} />,  color: "#2563EB", data: [20,35,25,50,40,65,55,75,68,85] },
    { label: "Guardias activas",   value: isLive ? String(dbAdmissions.filter((a: any) => a.status === "ACTIVE").length) : "3", delta: isLive ? `${dbAdmissions.length} total` : "2 en turno", icon: <Activity size={20} />, color: "#F59E0B", data: [1,2,1,3,2,3,2,4,3,3] },
    { label: "Facturación mes",    value: isLive ? `$${(dbInvoices.reduce((s: number, i: any) => s + Number(i.total ?? 0), 0) / 1000).toFixed(1)}K` : "$284.5K", delta: isLive ? `${dbInvoices.filter((i: any) => i.status === "PENDING").length} pendientes` : "+18% vs ant.", icon: <DollarSign size={20} />, color: "#8B5CF6", data: [60,75,65,85,70,90,82,95,88,100] },
  ];

  const statsMedico: StatCfg[] = [
    { label: "Mis pacientes",      value: patientsLoading ? "…" : patientCount.toLocaleString(), delta: "registrados",                icon: <Users size={20} />,        color: "#00BFA6", data: [30,45,38,60,52,72,65,82,75,92] },
    { label: "Turnos hoy",         value: apptLoading     ? "…" : String(apptCount),             delta: `${pendingAppts} pendientes`, icon: <Calendar size={20} />,     color: "#2563EB", data: [20,35,25,50,40,65,55,75,68,85] },
    { label: "Guardias activas",   value: isLive ? String(dbAdmissions.filter((a: any) => a.status === "ACTIVE").length) : "3", delta: "en turno", icon: <Activity size={20} />, color: "#10B981", data: [1,2,1,3,2,3,2,4,3,3] },
    { label: "Historias clínicas", value: isLive ? String(dbPatients.length) : "284", delta: "evoluciones activas",       icon: <FileText size={20} />,     color: "#0EA5E9", data: [50,65,55,75,70,88,80,92,88,95] },
  ];

  const statsFacturacion: StatCfg[] = [
    { label: "Ingresos del mes",   value: isLive ? `$${(dbInvoices.reduce((s: number, i: any) => s + Number(i.total ?? 0), 0) / 1000).toFixed(1)}K` : "$284.5K", delta: "+18% vs mes ant.", icon: <DollarSign size={20} />, color: "#10B981", data: [60,75,65,85,70,90,82,95,88,100] },
    { label: "Facturas pendientes",value: isLive ? String(dbInvoices.filter((i: any) => ["PENDING","DRAFT","SUBMITTED"].includes(i.status)).length) : "42", delta: "por liquidar", icon: <Receipt size={20} />, color: "#F59E0B", data: [30,40,35,50,45,60,52,68,60,72] },
    { label: "Obras sociales",     value: "18", delta: "planes activos",                          icon: <Stethoscope size={20} />,   color: "#2563EB", data: [14,15,16,16,17,17,18,18,18,18] },
    { label: "Por cobrar",         value: isLive ? `$${(dbInvoices.filter((i: any) => i.status === "APPROVED").reduce((s: number, i: any) => s + Number(i.total ?? 0), 0) / 1000).toFixed(1)}K` : "$48.2K", delta: "aprobadas", icon: <TrendingUp size={20} />, color: "#8B5CF6", data: [20,25,30,35,28,40,38,44,42,50] },
  ];

  const STATS = dashType === "facturacion" ? statsFacturacion
              : dashType === "medico"      ? statsMedico
              : statsAdmin;

  const bgInfo = DASH_BG[dashBg];

  const glassCard: React.CSSProperties = {
    background: bgInfo.dark
      ? "rgba(20, 30, 70, 0.70)"
      : "var(--glass-bg)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: bgInfo.dark
      ? "1px solid rgba(255,255,255,0.12)"
      : "1px solid var(--glass-border)",
    boxShadow: bgInfo.dark
      ? "0 8px 32px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.20)"
      : "var(--glass-shadow)",
  };

  const textPrimary   = bgInfo.dark ? "rgba(255,255,255,0.92)" : "var(--navy)";
  const textSecondary = bgInfo.dark ? "rgba(255,255,255,0.55)" : "var(--slate-500)";
  const textMuted     = bgInfo.dark ? "rgba(255,255,255,0.35)" : "var(--slate-400)";

  return (
    <div style={{
      margin: -24,
      padding: 24,
      minHeight: "calc(100vh - 56px)",
      background: bgInfo.css,
      transition: "background 0.9s ease",
      position: "relative",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Welcome banner ─────────────────────────────────────── */}
        <div style={{
          ...glassCard,
          borderRadius: "28px 22px 32px 18px / 18px 32px 22px 28px",
          padding: "22px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <p style={{ margin: 0, fontSize: 12, color: textSecondary, fontWeight: 600, textTransform: "capitalize" }}>
                {today}
              </p>
              {role && (
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(255,255,255,0.18)", color: textSecondary, fontWeight: 700, letterSpacing: 0.5 }}>
                  {ROLE_LABELS[role] ?? role}
                </span>
              )}
            </div>
            <h1 style={{ margin: "0 0 6px", fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: textPrimary, letterSpacing: -0.5 }}>
              Buen día{firstName ? `, ${firstName}` : ""} 👋
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: textSecondary, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {institution?.name ?? "Sistema HIS"} ·{" "}
              {apptLoading ? "cargando..." : `${apptCount} turnos hoy · ${pendingAppts} pendientes`}
              {isLive && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(16,185,129,0.15)", color: "#34D399", border: "1px solid rgba(16,185,129,0.25)" }}>
                  LIVE DB
                </span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
            <BgSelector current={dashBg} onChange={handleBgChange} />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => onNav("appointments")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: "14px 10px 16px 12px / 12px 16px 10px 14px", background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}
              >
                <Plus size={14} /> Nuevo turno
              </button>
              <button
                onClick={() => onNav("patients")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: "10px 16px 12px 14px / 14px 12px 16px 10px", background: bgInfo.dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.45)", border: `1px solid ${bgInfo.dark ? "rgba(255,255,255,0.18)" : "var(--glass-border)"}`, color: textPrimary, cursor: "pointer", fontSize: 13, fontWeight: 700, backdropFilter: "blur(8px)" }}
              >
                <Plus size={14} /> Paciente
              </button>
            </div>
          </div>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {STATS.map((s, i) => (
            <div
              key={i}
              style={{ ...glassCard, borderRadius: WIND_RADII[i], padding: "18px 20px", cursor: "pointer", transition: "transform 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <WindLine color={s.color} opacity={0.55} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 700, color: textPrimary, letterSpacing: -1.5, lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginTop: 5, display: "flex", alignItems: "center", gap: 3 }}>
                    <TrendingUp size={10} /> {s.delta}
                  </div>
                </div>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: `${s.color}18`, border: `1.5px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <Sparkline color={s.color} data={s.data} width={80} height={26} />
            </div>
          ))}
        </div>

        {/* ── Main grid ───────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

          {/* Left: appointments or invoices depending on role */}
          {dashType === "facturacion" ? (
            /* FACTURACIÓN: invoice table */
            <div style={{ ...glassCard, borderRadius: "22px 16px 24px 20px / 20px 24px 16px 22px", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px 10px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: textPrimary }}>Facturas pendientes</div>
                  <WindLine color="var(--teal)" opacity={0.45} />
                  <div style={{ fontSize: 12, color: textSecondary }}>
                    {isLive ? `${displayInvoices.length} registros` : "Sin datos DB — conectar para ver"}
                  </div>
                </div>
                <button onClick={() => onNav("billing")} style={{ padding: "7px 16px", borderRadius: "10px 14px 10px 12px / 12px 10px 14px 10px", background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  Ver todo
                </button>
              </div>
              {displayInvoices.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: textMuted, fontSize: 13 }}>
                  {isLive ? "No hay facturas pendientes" : "Conectá la DB para ver facturas reales"}
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: bgInfo.dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.30)" }}>
                      {["Paciente", "Obra Social", "Monto", "Estado", "Fecha"].map(h => (
                        <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: textMuted, letterSpacing: 0.7, textTransform: "uppercase", borderBottom: `1px solid ${bgInfo.dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.30)"}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayInvoices.map((inv, i) => (
                      <tr key={inv.id ?? i} className="tbl-row" onClick={() => onNav("billing")} style={{ cursor: "pointer", borderBottom: `1px solid ${bgInfo.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.25)"}` }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: textPrimary }}>{inv.patient}</td>
                        <td style={{ padding: "10px 14px", color: textSecondary }}>{inv.obra}</td>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--teal)", fontFamily: "Georgia, serif" }}>${inv.amount.toLocaleString()}</td>
                        <td style={{ padding: "10px 14px" }}><Badge status={inv.status as any} /></td>
                        <td style={{ padding: "10px 14px", color: textMuted, fontSize: 11 }}>{inv.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            /* MÉDICO / ADMIN: appointments table */
            <div style={{ ...glassCard, borderRadius: "22px 16px 24px 20px / 20px 24px 16px 22px", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px 10px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: textPrimary }}>Próximos turnos</div>
                  <WindLine color="var(--teal)" opacity={0.45} />
                  <div style={{ fontSize: 12, color: textSecondary }}>
                    {apptLoading ? "Cargando..." : `${apptCount} turnos programados hoy`}
                  </div>
                </div>
                <button onClick={() => onNav("appointments")} style={{ padding: "7px 16px", borderRadius: "10px 14px 10px 12px / 12px 10px 14px 10px", background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  + Nuevo
                </button>
              </div>
              {apptLoading ? (
                <div style={{ padding: "30px", textAlign: "center", color: textMuted, fontSize: 13 }}>Cargando...</div>
              ) : displayAppts.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: textMuted, fontSize: 13 }}>No hay turnos para hoy</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: bgInfo.dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.30)" }}>
                      {["Hora", "Paciente", "Profesional", "Especialidad", "Obra Social", "Estado"].map(h => (
                        <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: textMuted, letterSpacing: 0.7, textTransform: "uppercase", borderBottom: `1px solid ${bgInfo.dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.30)"}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayAppts.map((a, i) => (
                      <tr key={a.id ?? i} className="tbl-row" onClick={() => onNav("appointments")} style={{ cursor: "pointer", borderBottom: `1px solid ${bgInfo.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.25)"}`, background: a.status === "EN CURSO" ? "rgba(37,99,235,0.08)" : "transparent" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: textPrimary, fontFamily: "Georgia, serif" }}>{a.time}</td>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: textPrimary }}>{a.patient}</td>
                        <td style={{ padding: "10px 14px", color: textSecondary }}>{a.doctor}</td>
                        <td style={{ padding: "10px 14px", color: textSecondary, fontSize: 12 }}>{a.specialty}</td>
                        <td style={{ padding: "10px 14px", color: textMuted, fontSize: 11 }}>{a.obra}</td>
                        <td style={{ padding: "10px 14px" }}><Badge status={a.status as any} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Guards card */}
            <div style={{ ...glassCard, borderRadius: "24px 16px 20px 28px / 28px 20px 16px 24px", overflow: "hidden" }}>
              <div style={{ padding: "14px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: textPrimary }}>Guardias</div>
                  <WindLine color="var(--amber)" opacity={0.50} />
                </div>
                <button onClick={() => onNav("guards")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
                  Ver todas <ChevronRight size={12} />
                </button>
              </div>
              {GUARDS.filter(g => g.status !== "PROGRAMADA").map((g, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: i < arr.length - 1 ? `1px solid ${bgInfo.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.25)"}` : "none" }}>
                  <Avatar initials={g.doctor.split(" ").slice(1).map(w => w[0]).join("").slice(0, 2)} color={g.status === "ACTIVA" ? "#10B981" : "#F59E0B"} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.doctor}</div>
                    <div style={{ fontSize: 11, color: textSecondary }}>{g.specialty} · {g.from}–{g.to}</div>
                  </div>
                  <Badge status={g.status} />
                </div>
              ))}
            </div>

            {/* HC Share alerts (not for FACTURACION) */}
            {dashType !== "facturacion" && HC_SHARE_REQUESTS.filter(r => r.status === "PENDIENTE").map((req, i) => (
              <div key={i} style={{ ...glassCard, borderRadius: "16px 24px 18px 22px / 22px 18px 24px 16px", padding: "14px 16px", borderLeft: "3px solid var(--amber)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <AlertTriangle size={13} color="var(--amber)" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)" }}>SOLICITUD HC PENDIENTE</span>
                </div>
                <WindLine color="var(--amber)" opacity={0.35} />
                <div style={{ fontSize: 12, color: textPrimary, marginBottom: 2, fontWeight: 600 }}>{req.patient}</div>
                <div style={{ fontSize: 11, color: textSecondary, marginBottom: 4 }}>{req.fromInst} → {req.toInst}</div>
                <div style={{ fontSize: 11, color: textMuted, fontStyle: "italic", marginBottom: 12 }}>"{req.reason}"</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onNav("sharing")} style={{ flex: 1, padding: "7px 0", borderRadius: "10px 8px 12px 8px / 8px 12px 8px 10px", background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                    Revisar
                  </button>
                  <button style={{ flex: 1, padding: "7px 0", borderRadius: "8px 12px 8px 10px / 10px 8px 12px 8px", background: bgInfo.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.40)", color: "var(--red)", border: "1px solid var(--red-dim)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}

            {/* FACTURACION: quick billing summary */}
            {dashType === "facturacion" && showBilling && (
              <div style={{ ...glassCard, borderRadius: "16px 24px 18px 22px / 22px 18px 24px 16px", padding: "16px" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>
                  Resumen financiero
                </div>
                <WindLine color="var(--green)" opacity={0.45} />
                {[
                  { label: "Liquidado este mes", value: `$${(dbInvoices.filter((i: any) => ["APPROVED","PAID"].includes(i.status)).reduce((s: number, i: any) => s + Number(i.total ?? 0), 0) / 1000).toFixed(1)}K`, color: "var(--green)" },
                  { label: "Pendiente cobro",    value: `$${(dbInvoices.filter((i: any) => ["PENDING","DRAFT"].includes(i.status)).reduce((s: number, i: any) => s + Number(i.total ?? 0), 0) / 1000).toFixed(1)}K`, color: "var(--amber)" },
                  { label: "Observadas",         value: String(dbInvoices.filter((i: any) => i.status === "REJECTED").length),       color: "var(--red)" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${bgInfo.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.25)"}` : "none" }}>
                    <span style={{ fontSize: 12, color: textSecondary }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: row.color, fontFamily: "Georgia, serif" }}>{row.value}</span>
                  </div>
                ))}
                <button onClick={() => onNav("billing")} style={{ width: "100%", marginTop: 12, padding: "8px", borderRadius: 10, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  Ver facturación completa →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
