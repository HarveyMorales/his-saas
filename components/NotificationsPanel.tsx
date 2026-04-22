"use client";

import { useState, useMemo } from "react";
import { X, Bell, Calendar, Share2, AlertTriangle, Info } from "lucide-react";
import { useCurrentUser, useAppointments, useShareRequests } from "@/lib/hooks/useSupabase";

interface Notification {
  id: string;
  type: "turno" | "solicitud" | "alert" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "turno", title: "Próximo turno en 10 min", body: "Paciente García, Laura — 09:30 con Dr. Rodríguez", time: "09:20", read: false },
  { id: "n2", type: "solicitud", title: "Solicitud de HC pendiente", body: "Clínica San Martín solicita acceso a HC de Martínez, Carlos", time: "09:15", read: false },
  { id: "n3", type: "alert", title: "Alerta medicamentosa", body: "Fernández presenta interacción Warfarina + Ibuprofeno", time: "09:00", read: false },
  { id: "n4", type: "turno", title: "Turno cancelado", body: "López, Ana canceló su turno de las 10:00", time: "08:45", read: true },
  { id: "n5", type: "system", title: "Backup completado", body: "Respaldo automático realizado exitosamente", time: "08:00", read: true },
];

const TYPE_CFG = {
  turno:    { Icon: Calendar,      color: "#2563EB", bg: "#EFF6FF" },
  solicitud:{ Icon: Share2,        color: "#7C3AED", bg: "#F5F3FF" },
  alert:    { Icon: AlertTriangle, color: "#D97706", bg: "#FFFBEB" },
  system:   { Icon: Info,          color: "#64748B", bg: "#F8FAFC" },
};

type FilterTab = "Todas" | "No leídas" | "Alertas";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("Todas");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;

  const today = new Date().toISOString().slice(0, 10);
  const { appointments: dbAppts } = useAppointments(tenantId, today);
  const { requests: dbRequests } = useShareRequests(tenantId);

  const liveNotifications = useMemo<Notification[]>(() => {
    const now = new Date();
    const nowMs = now.getTime();
    const notifs: Notification[] = [];

    // Upcoming appointments in next 60 min
    for (const a of dbAppts) {
      const scheduled = new Date((a as any).scheduledAt);
      const diffMin = (scheduled.getTime() - nowMs) / 60000;
      if (diffMin > 0 && diffMin <= 60) {
        const patientName = (a as any).patients
          ? `${(a as any).patients.lastName}, ${(a as any).patients.firstName}`
          : "Paciente";
        const doctorName = (a as any).users
          ? `Dr. ${(a as any).users.lastName}`
          : "Médico";
        notifs.push({
          id: `appt-${(a as any).id}`,
          type: "turno",
          title: `Turno en ${Math.round(diffMin)} min`,
          body: `${patientName} — ${scheduled.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} con ${doctorName}`,
          time: scheduled.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
          read: false,
        });
      }
    }

    // Pending share requests
    for (const r of dbRequests) {
      if ((r as any).status !== "PENDING") continue;
      const patientName = (r as any).patients
        ? `${(r as any).patients.lastName}, ${(r as any).patients.firstName}`
        : "Paciente";
      notifs.push({
        id: `req-${(r as any).id}`,
        type: "solicitud",
        title: "Solicitud de HC pendiente",
        body: `Acceso solicitado para ${patientName}`,
        time: (r as any).createdAt
          ? new Date((r as any).createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
          : "—",
        read: false,
      });
    }

    return notifs;
  }, [dbAppts, dbRequests]);

  const allNotifications = isLive ? liveNotifications : MOCK_NOTIFICATIONS;

  const displayNotifications = useMemo(() => {
    return allNotifications
      .map(n => ({ ...n, read: n.read || readIds.has(n.id) }))
      .filter(n => {
        if (activeTab === "No leídas") return !n.read;
        if (activeTab === "Alertas") return n.type === "alert" || n.type === "solicitud";
        return true;
      });
  }, [allNotifications, readIds, activeTab]);

  const unread = allNotifications.filter(n => !n.read && !readIds.has(n.id)).length;

  const markAllRead = () => {
    setReadIds(new Set(allNotifications.map(n => n.id)));
  };

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
            {isLive && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>LIVE</span>
            )}
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex", padding: 4, borderRadius: 6 }}>
            <X size={17} />
          </button>
        </div>

        {/* Filter chips */}
        <div style={{ padding: "10px 20px 12px", display: "flex", gap: 6, borderBottom: "1px solid var(--slate-100)" }}>
          {(["Todas", "No leídas", "Alertas"] as FilterTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
              background: activeTab === tab ? "var(--navy)" : "var(--slate-100)",
              color: activeTab === tab ? "white" : "var(--slate-500)",
              transition: "background 0.15s",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {displayNotifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>
              Sin notificaciones
            </div>
          ) : displayNotifications.map(n => {
            const cfg = TYPE_CFG[n.type];
            const { Icon, color, bg } = cfg;
            return (
              <div
                key={n.id}
                onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
                style={{
                  padding: "13px 20px",
                  borderBottom: "1px solid var(--slate-50)",
                  display: "flex", gap: 12, alignItems: "flex-start",
                  background: n.read ? "white" : "rgba(37,99,235,0.025)",
                  cursor: "pointer",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <button onClick={markAllRead} style={{ fontSize: 12, color: "var(--teal)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
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
