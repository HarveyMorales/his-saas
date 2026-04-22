"use client";

import { Info, Eye, Share2, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { HC_SHARE_REQUESTS, AUDIT_LOG } from "@/lib/data";
import { useCurrentUser, useShareRequests, useAuditLogs } from "@/lib/hooks/useSupabase";
import { approveShareRequest, rejectShareRequest, revokeShareRequest } from "@/app/actions/sharing";
import { useToast } from "@/lib/toast-context";

const STATUS_MAP: Record<string, string> = {
  PENDING: "PENDIENTE",
  APPROVED: "APROBADO",
  REJECTED: "RECHAZADO",
  EXPIRED: "CANCELADO",
  REVOKED: "CANCELADO",
};

export function SharingView() {
  const { toast } = useToast();
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;
  const { requests: dbRequests, loading, refetch } = useShareRequests(tenantId);
  const { logs: dbLogs } = useAuditLogs(tenantId, 20);

  const handleApprove = async (id: string) => {
    const { error } = await approveShareRequest(id);
    if (error) toast({ type: "error", title: "Error", message: error });
    else { toast({ type: "success", title: "Solicitud aprobada", message: "Acceso válido por 30 días" }); refetch(); }
  };

  const handleReject = async (id: string) => {
    const { error } = await rejectShareRequest(id);
    if (error) toast({ type: "error", title: "Error", message: error });
    else { toast({ type: "warning", title: "Solicitud rechazada", message: "" }); refetch(); }
  };

  const handleRevoke = async (id: string) => {
    const { error } = await revokeShareRequest(id);
    if (error) toast({ type: "error", title: "Error", message: error });
    else { toast({ type: "warning", title: "Acceso revocado", message: "El acceso fue cancelado" }); refetch(); }
  };

  const displayRequests = isLive
    ? dbRequests.map((r: any) => ({
        id: r.id,
        patient: r.patients ? `${r.patients.lastName}, ${r.patients.firstName}` : "—",
        fromInst: r.fromTenant?.name ?? r.fromTenantId,
        toInst: r.toTenant?.name ?? r.toTenantId,
        requestedBy: r.requester
          ? `${r.requester.firstName ?? ""} ${r.requester.lastName ?? ""}`.trim()
          : r.requestedById,
        reason: r.reason,
        status: STATUS_MAP[r.status] ?? "PENDIENTE",
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-AR") : "—",
        expiresAt: r.expiresAt ? new Date(r.expiresAt).toLocaleDateString("es-AR") : null,
        dbStatus: r.status,
      }))
    : HC_SHARE_REQUESTS.map(r => ({ ...r, dbStatus: r.status }));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
          Compartir Historia Clínica
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 8 }}>
          Accesos controlados y auditados entre instituciones
          {isLive && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>LIVE DB</span>}
        </p>
      </div>

      {/* Policy */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderLeft: "4px solid var(--blue)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Info size={16} color="var(--blue)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1E40AF", marginBottom: 3 }}>Política de Aislamiento de HC</div>
          <div style={{ fontSize: 12, color: "#3730A3", lineHeight: 1.5 }}>
            Las historias clínicas <strong>no se comparten automáticamente</strong> entre instituciones. Todo acceso requiere: (1) solicitud explícita, (2) aprobación del médico tratante, (3) ventana de tiempo limitada, (4) registro en audit log.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Requests */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
            Solicitudes activas {loading && <span style={{ color: "var(--slate-400)", fontWeight: 400 }}>(cargando...)</span>}
          </div>
          {displayRequests.length === 0 ? (
            <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", border: "1px solid var(--slate-200)", color: "var(--slate-400)", fontSize: 13 }}>
              Sin solicitudes activas
            </div>
          ) : displayRequests.map((req, i) => {
            const borderColor = req.status === "PENDIENTE" ? "var(--amber)" : req.status === "APROBADO" ? "var(--green)" : "var(--red)";
            return (
              <div key={req.id ?? i} style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 12, border: "1px solid var(--slate-200)", borderLeft: `4px solid ${borderColor}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{req.patient}</div>
                  <Badge status={req.status as any} />
                </div>
                <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 3 }}>
                  <strong>De:</strong> {req.fromInst}
                </div>
                <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 3 }}>
                  <strong>Para:</strong> {req.toInst}
                </div>
                <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 8 }}>
                  <strong>Solicitado por:</strong> {req.requestedBy}
                </div>
                <div style={{ background: "var(--slate-50)", borderRadius: 7, padding: "8px 10px", marginBottom: 10, fontSize: 12, color: "var(--slate-600)", fontStyle: "italic" }}>
                  "{req.reason}"
                </div>
                <div style={{ fontSize: 11, color: "var(--slate-400)", marginBottom: req.status === "PENDIENTE" ? 12 : 0 }}>
                  Fecha: {req.date} {req.expiresAt ? `· Vence: ${req.expiresAt}` : ""}
                </div>
                {req.status === "PENDIENTE" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => isLive ? handleApprove(req.id) : undefined} style={{ flex: 1, padding: "8px 0", borderRadius: 7, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      ✓ Aprobar (30 días)
                    </button>
                    <button onClick={() => isLive ? handleReject(req.id) : undefined} style={{ flex: 1, padding: "8px 0", borderRadius: 7, background: "white", color: "var(--red)", border: "1px solid var(--red)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      ✕ Rechazar
                    </button>
                  </div>
                )}
                {req.status === "APROBADO" && (
                  <button onClick={() => isLive ? handleRevoke(req.id) : undefined} style={{ width: "100%", padding: "8px 0", borderRadius: 7, background: "white", color: "var(--amber)", border: "1px solid var(--amber)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                    Revocar acceso
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Audit log */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>Log de accesos HC</div>
          <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
            {(isLive ? dbLogs : AUDIT_LOG.filter(l => l.action.includes("RECORD"))).map((log: any, i: number, arr: any[]) => (
              <div key={log.id ?? i} style={{ padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--slate-100)" : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--blue)" }}>
                  {(log.action ?? "").includes("VIEW") ? <Eye size={15} /> : (log.action ?? "").includes("SHARE") ? <Share2 size={15} /> : <Edit3 size={15} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)" }}>
                    {isLive ? (log.users ? `${log.users.firstName} ${log.users.lastName}` : "Sistema") : log.user}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--slate-500)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {isLive ? `${log.resource}${log.resourceId ? ` #${log.resourceId.slice(0, 8)}` : ""}` : log.resource}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--slate-400)", marginTop: 2 }}>
                    {isLive ? (log.createdAt ? new Date(log.createdAt).toLocaleString("es-AR") : "—") : `${log.time} · ${log.ip}`}
                  </div>
                </div>
              </div>
            ))}
            {isLive && dbLogs.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--slate-400)", fontSize: 12 }}>Sin accesos registrados</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
