"use client";

import { AUDIT_LOG } from "@/lib/data";
import { useCurrentUser, useAuditLogs } from "@/lib/hooks/useSupabase";

const ACTION_COLORS: Record<string, string> = {
  RECORD_VIEW: "#2563EB",
  RECORD_WRITE: "#10B981",
  RECORD_SHARE_REQUEST: "#F59E0B",
  APPOINTMENT_UPDATE: "#8B5CF6",
  BILLING_CREATE: "#F97316",
  USER_PERMISSION_UPDATE: "#EF4444",
  PATIENT_CREATE: "#06B6D4",
  CREATE: "#10B981",
  UPDATE: "#8B5CF6",
  DELETE: "#EF4444",
  LOGIN: "#2563EB",
};

export function AuditView() {
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;
  const { logs: dbLogs, loading } = useAuditLogs(tenantId, 100);

  const displayLogs = isLive
    ? dbLogs.map((l: any) => ({
        id: l.id,
        time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—",
        user: l.users ? `${l.users.firstName} ${l.users.lastName}` : "Sistema",
        action: l.action,
        resource: `${l.resource}${l.resourceId ? ` #${l.resourceId.slice(0, 8)}` : ""}`,
        ip: l.ipAddress ?? "—",
      }))
    : AUDIT_LOG.map(l => ({ ...l, id: l.id }));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
          Auditoría del Sistema
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 8 }}>
          Log de todas las acciones — Inmutable · {loading ? "…" : `${displayLogs.length} eventos`}
          {isLive && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>
              LIVE DB
            </span>
          )}
        </p>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>
            Log de eventos
          </div>
          <button style={{ padding: "6px 12px", borderRadius: 7, background: "var(--slate-50)", border: "1px solid var(--slate-200)", color: "var(--slate-600)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
            Exportar CSV
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>Cargando...</div>
        ) : displayLogs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>Sin eventos registrados</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--slate-50)" }}>
                {["Hora", "Usuario", "Acción", "Recurso", "IP"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayLogs.map((l, i) => {
                const color = ACTION_COLORS[l.action] ?? "#94A3B8";
                return (
                  <tr key={(l as any).id ?? i} className="tbl-row" style={{ borderBottom: "1px solid var(--slate-100)" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "var(--slate-600)", fontSize: 12 }}>{l.time}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--navy)" }}>{l.user}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: `${color}15`, color, fontFamily: "monospace", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>
                        {l.action}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--slate-600)" }}>{l.resource}</td>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "var(--slate-400)", fontSize: 11 }}>{l.ip}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
