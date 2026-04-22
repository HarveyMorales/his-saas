"use client";

import { useState } from "react";
import { Plus, FileText, CheckCircle, Clock, XCircle, MoreVertical } from "lucide-react";
import { BILLING } from "@/lib/data";
import { useCurrentUser, useBillingItems, useInvoices } from "@/lib/hooks/useSupabase";
import { updateInvoiceStatus } from "@/app/actions/invoices";
import { NewInvoiceModal } from "@/components/modals/NewInvoiceModal";
import { useToast } from "@/lib/toast-context";

type BillTab = "prestaciones" | "facturas";

const BILLING_STATUS_MAP: Record<string, string> = {
  DRAFT: "BORRADOR", PENDING: "PENDIENTE", SUBMITTED: "PRESENTADO",
  APPROVED: "LIQUIDADO", PAID: "COBRADO", REJECTED: "OBSERVADO",
};

const INVOICE_STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT:     { label: "BORRADOR",   color: "#94A3B8", bg: "#F8FAFC",              icon: FileText },
  PENDING:   { label: "PENDIENTE",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: Clock },
  SUBMITTED: { label: "PRESENTADO", color: "#2563EB", bg: "rgba(37,99,235,0.1)",  icon: FileText },
  APPROVED:  { label: "LIQUIDADO",  color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
  PAID:      { label: "COBRADO",    color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
  REJECTED:  { label: "OBSERVADO",  color: "#EF4444", bg: "rgba(239,68,68,0.1)",  icon: XCircle },
};

export function BillingView() {
  const { toast } = useToast();
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;

  const [tab, setTab] = useState<BillTab>("prestaciones");
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { items: dbItems, loading: itemsLoading } = useBillingItems(tenantId);
  const { invoices: dbInvoices, loading: invLoading, refetch: refetchInvoices } = useInvoices(tenantId);

  // Prestaciones (billing_items)
  const displayItems = isLive
    ? dbItems.map((b: any) => ({
        id: b.id, date: b.serviceDate ? new Date(b.serviceDate).toLocaleDateString("es-AR") : "—",
        patient: b.patients ? `${b.patients.lastName}, ${b.patients.firstName}` : "—",
        obra: "Particular", practice: b.description, amount: b.totalValue,
        status: BILLING_STATUS_MAP[b.status] ?? "PENDIENTE", invoice: b.invoiceId ?? null,
      }))
    : BILLING;

  // Facturas
  const displayInvoices = isLive
    ? dbInvoices.map((inv: any) => ({
        id: inv.id,
        number: inv.number ?? "—",
        date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("es-AR") : "—",
        issuedAt: inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString("es-AR") : null,
        patient: inv.patients ? `${inv.patients.lastName}, ${inv.patients.firstName}` : "Particular",
        obra: inv.insurance_providers?.name ?? "Sin obra social",
        total: Number(inv.total),
        status: inv.status,
        items: inv.invoice_items ?? [],
      }))
    : [];

  // Stats from active data source
  const activeData = tab === "prestaciones" ? displayItems : displayInvoices;
  const totalAmount = activeData.reduce((s: number, b: any) => s + (b.amount ?? b.total ?? 0), 0);
  const pendingAmount = activeData.filter((b: any) => b.status === "PENDIENTE" || b.status === "PENDING").reduce((s: number, b: any) => s + (b.amount ?? b.total ?? 0), 0);
  const billedAmount = activeData.filter((b: any) => ["LIQUIDADO", "COBRADO", "APPROVED", "PAID"].includes(b.status)).reduce((s: number, b: any) => s + (b.amount ?? b.total ?? 0), 0);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await updateInvoiceStatus(id, status);
    setUpdatingId(null);
    if (error) toast({ type: "error", title: "Error", message: error });
    else { toast({ type: "success", title: "Estado actualizado", message: BILLING_STATUS_MAP[status] ?? status }); refetchInvoices(); }
  };

  return (
    <div>
      {showNewInvoice && (
        <NewInvoiceModal
          tenantId={tenantId!}
          onClose={() => setShowNewInvoice(false)}
          onSaved={() => { setShowNewInvoice(false); refetchInvoices(); }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>Facturación</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 8 }}>
            {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            {isLive && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>LIVE DB</span>}
          </p>
        </div>
        <button
          onClick={() => isLive ? setShowNewInvoice(true) : undefined}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: isLive ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, opacity: isLive ? 1 : 0.6 }}>
          <Plus size={15} /> Nueva factura
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total período", value: `$${totalAmount.toLocaleString()}`, color: "var(--teal)", icon: "💰" },
          { label: "Pendiente cobro", value: `$${pendingAmount.toLocaleString()}`, color: "var(--amber)", icon: "⏳" },
          { label: "Liquidado", value: `$${billedAmount.toLocaleString()}`, color: "var(--green)", icon: "✅" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid var(--slate-200)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.8, textTransform: "uppercase" }}>{s.label}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "var(--navy)", marginTop: 4 }}>{s.value}</div>
              </div>
              <div style={{ fontSize: 26 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--slate-200)", marginBottom: 16 }}>
        {[
          { id: "prestaciones" as BillTab, label: "Prestaciones" },
          { id: "facturas" as BillTab, label: `Facturas (${isLive ? dbInvoices.length : 0})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
            color: tab === t.id ? "var(--navy)" : "var(--slate-500)",
            borderBottom: tab === t.id ? "2px solid var(--teal)" : "2px solid transparent", marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Prestaciones table */}
      {tab === "prestaciones" && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--slate-100)" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Prestaciones del período</div>
          </div>
          {itemsLoading ? (
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
                {displayItems.map((b: any, i: number) => (
                  <tr key={b.id ?? i} style={{ borderBottom: "1px solid var(--slate-100)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--slate-50)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "11px 14px", color: "var(--slate-500)", fontSize: 12 }}>{b.date}</td>
                    <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--navy)" }}>{b.patient}</td>
                    <td style={{ padding: "11px 14px", color: "var(--slate-600)" }}>{b.obra}</td>
                    <td style={{ padding: "11px 14px", color: "var(--slate-600)" }}>{b.practice}</td>
                    <td style={{ padding: "11px 14px", fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--navy)" }}>${Number(b.amount).toLocaleString()}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                        background: b.status === "LIQUIDADO" || b.status === "COBRADO" ? "rgba(16,185,129,0.1)" : b.status === "OBSERVADO" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                        color: b.status === "LIQUIDADO" || b.status === "COBRADO" ? "var(--green)" : b.status === "OBSERVADO" ? "var(--red)" : "var(--amber)",
                      }}>{b.status}</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 11, color: "var(--slate-400)", fontFamily: "monospace" }}>{b.invoice ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Facturas */}
      {tab === "facturas" && (
        <div>
          {!isLive ? (
            <div style={{ background: "white", borderRadius: 14, padding: 48, textAlign: "center", border: "1px solid var(--slate-200)", color: "var(--slate-400)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Módulo de facturas disponible con cuenta real</div>
              <div style={{ fontSize: 12 }}>Ejecutá la migración SQL y accedé con un usuario de Supabase</div>
            </div>
          ) : invLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>Cargando facturas...</div>
          ) : displayInvoices.length === 0 ? (
            <div style={{ background: "white", borderRadius: 14, padding: 48, textAlign: "center", border: "1px solid var(--slate-200)", color: "var(--slate-400)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Sin facturas creadas</div>
              <div style={{ fontSize: 12 }}>Usá "Nueva factura" para empezar a facturar</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {displayInvoices.map((inv: any) => {
                const cfg = INVOICE_STATUS_CFG[inv.status] ?? INVOICE_STATUS_CFG.DRAFT;
                const Icon = cfg.icon;
                return (
                  <div key={inv.id} style={{ background: "white", borderRadius: 14, padding: "16px 20px", border: "1px solid var(--slate-200)", borderLeft: `4px solid ${cfg.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={18} color={cfg.color} />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Factura #{inv.number}</div>
                            <span style={{ background: cfg.bg, color: cfg.color, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{cfg.label}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--slate-600)", marginTop: 2 }}>
                            {inv.patient} · {inv.obra}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--slate-400)", marginTop: 2 }}>
                            Creada: {inv.date} {inv.issuedAt ? `· Emitida: ${inv.issuedAt}` : ""}
                            · {inv.items.length} ítem{inv.items.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "var(--navy)" }}>${inv.total.toLocaleString()}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                          {inv.status === "PENDING" && (
                            <>
                              <button onClick={() => handleStatusChange(inv.id, "APPROVED")} disabled={updatingId === inv.id}
                                style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(16,185,129,0.1)", color: "var(--green)", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                                Liquidar
                              </button>
                              <button onClick={() => handleStatusChange(inv.id, "REJECTED")} disabled={updatingId === inv.id}
                                style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(239,68,68,0.05)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                                Observar
                              </button>
                            </>
                          )}
                          {inv.status === "APPROVED" && (
                            <button onClick={() => handleStatusChange(inv.id, "PAID")} disabled={updatingId === inv.id}
                              style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(16,185,129,0.15)", color: "var(--green)", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                              Marcar cobrado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
