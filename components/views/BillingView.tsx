"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BILLING } from "@/lib/data";
import { useCurrentUser, useBillingItems } from "@/lib/hooks/useSupabase";

const BILLING_STATUS_MAP: Record<string, string> = {
  DRAFT: "PENDIENTE",
  PENDING: "PENDIENTE",
  SUBMITTED: "PENDIENTE",
  APPROVED: "LIQUIDADO",
  PAID: "LIQUIDADO",
  REJECTED: "OBSERVADO",
};

export function BillingView() {
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;
  const { items: dbItems, loading } = useBillingItems(tenantId);

  const displayItems = isLive
    ? dbItems.map((b: any) => ({
        id: b.id,
        date: b.serviceDate ? new Date(b.serviceDate).toLocaleDateString("es-AR") : "—",
        patient: b.patients ? `${b.patients.lastName}, ${b.patients.firstName}` : "—",
        obra: "Particular",
        practice: b.description,
        amount: b.totalValue,
        status: BILLING_STATUS_MAP[b.status] ?? "PENDIENTE",
        invoice: b.invoiceId ?? null,
      }))
    : BILLING;

  const total = displayItems.reduce((s, b) => s + b.amount, 0);
  const pending = displayItems.filter(b => b.status === "PENDIENTE").reduce((s, b) => s + b.amount, 0);
  const billed = displayItems.filter(b => b.status === "LIQUIDADO").reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>Facturación</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 8 }}>
            {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            {isLive && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>LIVE DB</span>
            )}
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> Nueva prestación
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total mes", value: loading ? "…" : `$${total.toLocaleString()}`, color: "var(--teal)", icon: "💰" },
          { label: "Pendiente cobro", value: loading ? "…" : `$${pending.toLocaleString()}`, color: "var(--amber)", icon: "⏳" },
          { label: "Liquidado", value: loading ? "…" : `$${billed.toLocaleString()}`, color: "var(--green)", icon: "✅" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid var(--slate-200)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.8, textTransform: "uppercase" }}>{s.label}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "var(--navy)", marginTop: 4, letterSpacing: -1 }}>{s.value}</div>
              </div>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--slate-100)" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>
            Prestaciones del mes
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>Cargando...</div>
        ) : displayItems.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>Sin prestaciones registradas</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--slate-50)" }}>
                {["Fecha", "Paciente", "Obra Social", "Práctica", "Monto", "Estado", "Comprobante"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayItems.map((b, i) => (
                <tr key={(b as any).id ?? i} className="tbl-row" style={{ borderBottom: "1px solid var(--slate-100)" }}>
                  <td style={{ padding: "11px 14px", color: "var(--slate-500)", fontSize: 12 }}>{b.date}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--navy)" }}>{b.patient}</td>
                  <td style={{ padding: "11px 14px", color: "var(--slate-600)" }}>{b.obra}</td>
                  <td style={{ padding: "11px 14px", color: "var(--slate-600)" }}>{b.practice}</td>
                  <td style={{ padding: "11px 14px", fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--navy)" }}>${b.amount.toLocaleString()}</td>
                  <td style={{ padding: "11px 14px" }}><Badge status={b.status as any} /></td>
                  <td style={{ padding: "11px 14px", fontSize: 11, color: "var(--slate-400)", fontFamily: "monospace" }}>{b.invoice ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
