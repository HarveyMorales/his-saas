"use client";

import { useState } from "react";
import { Info, Eye, Share2, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { HC_SHARE_REQUESTS, AUDIT_LOG } from "@/lib/data";
import type { ShareRequest } from "@/lib/types";

export function SharingView() {
  const [requests, setRequests] = useState<ShareRequest[]>(HC_SHARE_REQUESTS);

  const approve = (id: string) =>
    setRequests(r => r.map(x => x.id === id ? { ...x, status: "APROBADO" as const, expiresAt: "21/05/2026" } : x));
  const reject = (id: string) =>
    setRequests(r => r.map(x => x.id === id ? { ...x, status: "RECHAZADO" as const } : x));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
          Compartir Historia Clínica
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>
          Accesos controlados y auditados entre instituciones
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>Solicitudes activas</div>
          {requests.map((req, i) => {
            const borderColor = req.status === "PENDIENTE" ? "var(--amber)" : req.status === "APROBADO" ? "var(--green)" : "var(--red)";
            return (
              <div key={i} style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 12, border: "1px solid var(--slate-200)", borderLeft: `4px solid ${borderColor}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{req.patient}</div>
                  <Badge status={req.status} />
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
                    <button onClick={() => approve(req.id)} style={{ flex: 1, padding: "8px 0", borderRadius: 7, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      ✓ Aprobar (30 días)
                    </button>
                    <button onClick={() => reject(req.id)} style={{ flex: 1, padding: "8px 0", borderRadius: 7, background: "white", color: "var(--red)", border: "1px solid var(--red)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      ✕ Rechazar
                    </button>
                  </div>
                )}
                {req.status === "APROBADO" && (
                  <button style={{ width: "100%", padding: "8px 0", borderRadius: 7, background: "white", color: "var(--amber)", border: "1px solid var(--amber)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
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
            {AUDIT_LOG.filter(l => l.action.includes("RECORD")).map((log, i, arr) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--slate-100)" : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--blue)" }}>
                  {log.action.includes("VIEW") ? <Eye size={15} /> : log.action.includes("SHARE") ? <Share2 size={15} /> : <Edit3 size={15} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)" }}>{log.user}</div>
                  <div style={{ fontSize: 11, color: "var(--slate-500)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.resource}</div>
                  <div style={{ fontSize: 10, color: "var(--slate-400)", marginTop: 2 }}>{log.time} · {log.ip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
