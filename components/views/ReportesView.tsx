"use client";

import { Download, Users, Calendar, DollarSign, Activity, TrendingUp } from "lucide-react";
import { useCurrentUser, usePatients, useAppointments, useInvoices, useAdmissions } from "@/lib/hooks/useSupabase";

function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", border: "1px solid var(--slate-200)", borderTop: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: "var(--slate-500)", marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SimpleBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ background: "var(--slate-100)", borderRadius: 4, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
  );
}

export function ReportesView() {
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;
  const todayISO = new Date().toISOString().split("T")[0];

  const { patients: dbPatients } = usePatients(tenantId);
  const { appointments: dbAppts } = useAppointments(tenantId);
  const { invoices: dbInvoices } = useInvoices(tenantId);
  const { admissions: dbAdmissions } = useAdmissions(tenantId);

  const totalPatients = isLive ? dbPatients.length : 1284;
  const totalAppts = isLive ? dbAppts.length : 842;
  const activeAdmissions = isLive ? dbAdmissions.filter((a: any) => a.status === "ACTIVE").length : 3;
  const totalBilled = isLive ? dbInvoices.reduce((s: number, i: any) => s + Number(i.total ?? 0), 0) : 284500;
  const pendingInvoices = isLive ? dbInvoices.filter((i: any) => i.status === "PENDING").length : 12;
  const paidInvoices = isLive ? dbInvoices.filter((i: any) => ["APPROVED", "PAID"].includes(i.status)).length : 30;

  const apptByStatus = isLive
    ? [
        { label: "Pendientes",  value: dbAppts.filter((a: any) => a.status === "SCHEDULED").length,  color: "#F59E0B" },
        { label: "Confirmados", value: dbAppts.filter((a: any) => a.status === "CONFIRMED").length,   color: "#2563EB" },
        { label: "Completados", value: dbAppts.filter((a: any) => a.status === "COMPLETED").length,   color: "#10B981" },
        { label: "Cancelados",  value: dbAppts.filter((a: any) => a.status === "CANCELLED").length,   color: "#EF4444" },
      ]
    : [
        { label: "Pendientes",  value: 45,  color: "#F59E0B" },
        { label: "Confirmados", value: 32,  color: "#2563EB" },
        { label: "Completados", value: 180, color: "#10B981" },
        { label: "Cancelados",  value: 28,  color: "#EF4444" },
      ];

  const invByStatus = isLive
    ? [
        { label: "Pendientes", value: pendingInvoices, color: "#F59E0B" },
        { label: "Liquidadas", value: paidInvoices,    color: "#10B981" },
        { label: "Observadas", value: dbInvoices.filter((i: any) => i.status === "REJECTED").length, color: "#EF4444" },
      ]
    : [
        { label: "Pendientes", value: 12, color: "#F59E0B" },
        { label: "Liquidadas", value: 30, color: "#10B981" },
        { label: "Observadas", value: 4,  color: "#EF4444" },
      ];

  const maleCount   = isLive ? dbPatients.filter((p: any) => p.sex === "M").length : 612;
  const femaleCount = isLive ? dbPatients.filter((p: any) => p.sex === "F").length : 588;
  const otherCount  = isLive ? dbPatients.filter((p: any) => !["M","F"].includes(p.sex)).length : 84;

  const apptMax = Math.max(...apptByStatus.map(s => s.value), 1);
  const invMax  = Math.max(...invByStatus.map(s => s.value), 1);
  const sexMax  = Math.max(maleCount, femaleCount, otherCount, 1);

  const completedRate = totalAppts > 0
    ? Math.round((dbAppts.filter((a: any) => a.status === "COMPLETED").length / Math.max(totalAppts, 1)) * 100)
    : (isLive ? 0 : 68);

  const paidRate = isLive
    ? (dbInvoices.length > 0 ? Math.round((paidInvoices / dbInvoices.length) * 100) : 0)
    : 71;

  const noCoverage = isLive
    ? dbPatients.filter((p: any) => !p.insurancePlanId).length
    : 312;

  const exportCSV = () => {
    const rows = [
      ["Metrica", "Valor"],
      ["Total pacientes", totalPatients],
      ["Total turnos", totalAppts],
      ["Internaciones activas", activeAdmissions],
      ["Facturacion total", totalBilled],
      ["Facturas pendientes", pendingInvoices],
      ["Facturas liquidadas", paidInvoices],
      ["Tasa completados %", completedRate],
      ["Tasa liquidadas %", paidRate],
      ["Pacientes sin cobertura", noCoverage],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `reporte_${todayISO}.csv`;
    a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
            Reportes y Estadísticas
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 8 }}>
            Resumen general de la institución
            {isLive && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                LIVE DB
              </span>
            )}
          </p>
        </div>
        <button
          onClick={exportCSV}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--navy)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          <Download size={13} /> Exportar CSV
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Pacientes activos" value={totalPatients.toLocaleString()} sub="registrados en el sistema" color="#00BFA6" icon={<Users size={18} />} />
        <StatCard label="Total turnos" value={totalAppts.toLocaleString()} sub="todos los estados" color="#2563EB" icon={<Calendar size={18} />} />
        <StatCard label="Facturación total" value={`$${(totalBilled / 1000).toFixed(1)}K`} sub={`${pendingInvoices} pendientes`} color="#8B5CF6" icon={<DollarSign size={18} />} />
        <StatCard label="Internaciones activas" value={activeAdmissions} sub="pacientes internados" color="#F59E0B" icon={<Activity size={18} />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div style={{ background: "white", borderRadius: 14, padding: 20, border: "1px solid var(--slate-200)" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>Turnos por estado</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {apptByStatus.map(s => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--slate-600)", fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
                <SimpleBar value={s.value} max={apptMax} color={s.color} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 14, padding: 20, border: "1px solid var(--slate-200)" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>Facturas por estado</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {invByStatus.map(s => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--slate-600)", fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
                <SimpleBar value={s.value} max={invMax} color={s.color} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--slate-500)" }}>Total facturado</span>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--navy)", fontSize: 16 }}>
              ${totalBilled.toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 14, padding: 20, border: "1px solid var(--slate-200)" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>Pacientes por sexo</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Masculino",  value: maleCount,   color: "#2563EB" },
              { label: "Femenino",   value: femaleCount,  color: "#EC4899" },
              { label: "Otro / N/A", value: otherCount,   color: "#94A3B8" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--slate-600)", fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
                <SimpleBar value={s.value} max={sexMax} color={s.color} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--slate-500)" }}>Total</span>
            <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: 13 }}>{totalPatients}</span>
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 14, padding: 20, border: "1px solid var(--slate-200)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <TrendingUp size={15} color="var(--teal)" />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Indicadores clave</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Tasa de completados", value: `${completedRate}%`, color: "#10B981" },
            { label: "Facturas liquidadas", value: `${paidRate}%`,       color: "#8B5CF6" },
            { label: "Sin cobertura",        value: noCoverage,          color: "#F59E0B" },
          ].map(item => (
            <div key={item.label} style={{ padding: "14px 16px", background: "var(--slate-50)", borderRadius: 10, borderLeft: `3px solid ${item.color}` }}>
              <div style={{ fontSize: 11, color: "var(--slate-500)", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
