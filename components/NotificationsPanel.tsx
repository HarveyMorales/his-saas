"use client";

import { X, Bell, Calendar, FlaskConical, AlertTriangle, Info } from "lucide-react";

interface Notification {
  id: string;
  type: "turno" | "lab" | "alert" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "turno", title: "Próximo turno en 10 min", body: "Paciente García, Laura — 09:30 con Dr. Rodríguez", time: "09:20", read: false },
  { id: "n2", type: "lab", title: "Resultado disponible", body: "Hemograma completo — Martínez, Carlos (DNI 31.458.900)", time: "09:15", read: false },
  { id: "n3", type: "alert", title: "Alerta medicamentosa", body: "Fernández presenta interacción Warfarina + Ibuprofeno", time: "09:00", read: false },
  { id: "n4", type: "turno", title: "Turno cancelado", body: "López, Ana canceló su turno de las 10:00", time: "08:45", read: true },
  { id: "n5", type: "system", title: "Backup completado", body: "Respaldo automático realizado exitosamente", time: "08:00", read: true },
  { id: "n6", type: "lab", title: "Resultado crítico", body: "Troponina elevada — Romero, Hugo — requiere atención inmediata", time: "07:50", read: true },
];

const TYPE_CFG = {
  turno:  { Icon: Calendar,       color: "#2563EB", bg: "#EFF6FF" },
  lab:    { Icon: FlaskConical,   color: "#7C3AED", bg: "#F5F3FF" },
  alert:  { Icon: AlertTriangle,  color: "#D97706", bg: "#FFFBEB" },
  system: { Icon: Info,           color: "#64748B", bg: "#F8FAFC" },
};

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <>
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(11,29,53,0.2)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 380, background: "white",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        zIndex: 201,
        display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={15} color="var(--navy)" />
            <h3 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
              Notificaciones
            </h3>
            {unread > 0 && (
              <span style={{ background: "var(--red)", color: "white", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 7px", lineHeight: 1.4 }}>
                {unread}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex", padding: 4, borderRadius: 6 }}>
            <X size={17} />
          </button>
        </div>

        {/* Filter chips */}
        <div style={{ padding: "10px 20px 0", display: "flex", gap: 6, borderBottom: "1px solid var(--slate-100)", paddingBottom: 12 }}>
          {(["Todas", "No leídas", "Alertas"] as const).map((tab, i) => (
            <button key={tab} style={{
              padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
              background: i === 0 ? "var(--navy)" : "var(--slate-100)",
              color: i === 0 ? "white" : "var(--slate-500)",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {MOCK_NOTIFICATIONS.map(n => {
            const { Icon, color, bg } = TYPE_CFG[n.type];
            return (
              <div key={n.id} style={{
                padding: "13px 20px",
                borderBottom: "1px solid var(--slate-50)",
                display: "flex", gap: 12, alignItems: "flex-start",
                background: n.read ? "white" : "rgba(37,99,235,0.025)",
                cursor: "pointer",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: bg, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={15} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: "var(--navy)", lineHeight: 1.3 }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--slate-400)", flexShrink: 0, fontFamily: "Georgia, serif" }}>
                      {n.time}
                    </span>
                  </div>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--slate-500)", lineHeight: 1.45 }}>
                    {n.body}
                  </p>
                </div>
                {!n.read && (
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563EB", flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button style={{ fontSize: 12, color: "var(--teal)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Marcar todas como leídas
          </button>
          <button style={{ fontSize: 12, color: "var(--slate-400)", background: "none", border: "none", cursor: "pointer" }}>
            Configurar alertas
          </button>
        </div>
      </div>
    </>
  );
}
