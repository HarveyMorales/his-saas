"use client";

import { useState, useCallback } from "react";
import { Plus, Play, CheckCircle, XCircle, RefreshCw, LayoutGrid, List, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { NewAppointmentModal } from "@/components/modals/NewAppointmentModal";
import { APPOINTMENTS } from "@/lib/data";
import { useToast } from "@/lib/toast-context";
import { useCurrentUser, useAppointments, useRealtimeAppointments } from "@/lib/hooks/useSupabase";
import { updateAppointmentStatus } from "@/app/actions/appointments";
import type { Appointment } from "@/lib/types";

type ApptStatus = Appointment["status"];

const STATUS_MAP: Record<string, ApptStatus> = {
  SCHEDULED: "PENDIENTE",
  IN_PROGRESS: "EN CURSO",
  COMPLETED: "CONFIRMADO",
  CANCELLED: "CANCELADO",
};

const STATUS_NEXT: Record<string, string> = {
  SCHEDULED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

const STATUS_TRANSITIONS: Record<ApptStatus, { label: string; icon: React.ReactNode; color: string } | null> = {
  PENDIENTE:   { label: "Iniciar",    icon: <Play size={10} />,         color: "var(--blue)" },
  "EN CURSO":  { label: "Completar", icon: <CheckCircle size={10} />,  color: "var(--green)" },
  CONFIRMADO:  null,
  CANCELADO:   null,
};

function toAppointment(a: any): Appointment & { _dbStatus: string } {
  const dt = a.scheduledAt ? new Date(a.scheduledAt) : null;
  const time = dt ? dt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "—";
  const patientName = a.patients ? `${a.patients.lastName}, ${a.patients.firstName}` : "—";
  const doctorName = a.users ? `${a.users.firstName} ${a.users.lastName}` : "—";
  const specialty = a.users?.specialty ?? "—";
  return {
    id: a.id,
    time,
    patient: patientName,
    patientId: a.patientId,
    doctor: doctorName,
    specialty,
    status: STATUS_MAP[a.status] ?? "PENDIENTE",
    obra: "Particular",
    duration: a.durationMin ?? 30,
    _dbStatus: a.status,
  };
}

const DAY_NAMES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "#2563EB", CONFIRMED: "#059669", IN_PROGRESS: "#F59E0B",
  COMPLETED: "#10B981", CANCELLED: "#EF4444", PENDIENTE: "#2563EB",
  "EN CURSO": "#F59E0B", CONFIRMADO: "#10B981", CANCELADO: "#EF4444",
};

function WeekView({ appts, weekOffset, onWeekOffset }: { appts: any[]; weekOffset: number; onWeekOffset: (n: number) => void }) {
  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  startOfWeek.setDate(today.getDate() - dayOfWeek + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const weekLabel = `${days[1].toLocaleDateString("es-AR", { day: "numeric", month: "short" })} — ${days[5].toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`;

  const getAppts = (day: Date) => appts.filter((a: any) => {
    const d = a.scheduledAt ? new Date(a.scheduledAt) : null;
    return d && d.toDateString() === day.toDateString();
  });

  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Vista Semanal</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => onWeekOffset(weekOffset - 1)} style={{ border: "none", background: "var(--slate-100)", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--slate-600)", minWidth: 160, textAlign: "center" }}>{weekLabel}</span>
          <button onClick={() => onWeekOffset(weekOffset + 1)} style={{ border: "none", background: "var(--slate-100)", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}><ChevronRight size={14} /></button>
          {weekOffset !== 0 && <button onClick={() => onWeekOffset(0)} style={{ border: "none", background: "var(--teal)", color: "white", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Hoy</button>}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "50px repeat(7, 1fr)", minWidth: 700 }}>
          {/* Header */}
          <div style={{ borderBottom: "1px solid var(--slate-200)" }} />
          {days.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={i} style={{ padding: "10px 8px", textAlign: "center", borderBottom: "1px solid var(--slate-200)", borderLeft: "1px solid var(--slate-100)", background: isToday ? "rgba(37,99,235,0.04)" : undefined }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase" }}>{DAY_NAMES[d.getDay()]}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: isToday ? "#2563EB" : "var(--navy)", marginTop: 2 }}>{d.getDate()}</div>
                {getAppts(d).length > 0 && <div style={{ fontSize: 9, fontWeight: 700, color: "#2563EB", marginTop: 2 }}>{getAppts(d).length} turno{getAppts(d).length !== 1 ? "s" : ""}</div>}
              </div>
            );
          })}
          {/* Time rows */}
          {HOURS.map(h => (
            <>
              <div key={`h${h}`} style={{ padding: "0 6px", borderBottom: "1px solid var(--slate-50)", display: "flex", alignItems: "flex-start", paddingTop: 4 }}>
                <span style={{ fontSize: 10, color: "var(--slate-400)", fontWeight: 600 }}>{h}:00</span>
              </div>
              {days.map((d, di) => {
                const isToday = d.toDateString() === today.toDateString();
                const slotAppts = appts.filter((a: any) => {
                  const dt = a.scheduledAt ? new Date(a.scheduledAt) : null;
                  return dt && dt.toDateString() === d.toDateString() && dt.getHours() === h;
                });
                return (
                  <div key={`${h}-${di}`} style={{ minHeight: 44, borderBottom: "1px solid var(--slate-50)", borderLeft: "1px solid var(--slate-100)", background: isToday ? "rgba(37,99,235,0.02)" : undefined, padding: 2 }}>
                    {slotAppts.map((a: any, ai: number) => {
                      const name = a.patients ? `${a.patients.lastName}, ${a.patients.firstName}` : (a.patient ?? "Paciente");
                      const color = STATUS_COLOR[a.status] ?? "#2563EB";
                      return (
                        <div key={ai} style={{ background: `${color}15`, borderLeft: `3px solid ${color}`, borderRadius: 4, padding: "3px 6px", marginBottom: 2, fontSize: 10, lineHeight: 1.4 }}>
                          <div style={{ fontWeight: 700, color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                          <div style={{ color: "var(--slate-500)", fontSize: 9 }}>{a.users ? `Dr. ${a.users.lastName}` : (a.doctor ?? "")}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppointmentsView() {
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const today = new Date().toISOString().split("T")[0];
  const { appointments: dbAppts, loading: apptLoading, refetch } = useAppointments(tenantId, today);
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "week">("list");
  const [weekOffset, setWeekOffset] = useState(0);

  const isLive = !!tenantId;

  const appts: (Appointment & { _dbStatus?: string })[] = isLive
    ? dbAppts.map(toAppointment)
    : APPOINTMENTS;

  const loading = profileLoading || (isLive && apptLoading);

  useRealtimeAppointments(tenantId, useCallback(() => { refetch(); }, [refetch]));

  const advance = async (id: string) => {
    const appt = appts.find(a => a.id === id);
    if (!appt) return;
    if (isLive) {
      const dbStatus = (appt as any)._dbStatus ?? "SCHEDULED";
      const nextStatus = STATUS_NEXT[dbStatus];
      if (!nextStatus) return;
      const { error } = await updateAppointmentStatus(id, nextStatus as any);
      if (error) { toast({ type: "error", title: "Error", message: error }); return; }
      await refetch();
      const label = nextStatus === "IN_PROGRESS" ? "en curso" : "completado";
      toast({ type: "success", title: `Turno ${label}`, message: appt.patient });
    } else {
      const trans = STATUS_TRANSITIONS[appt.status];
      if (!trans) return;
      toast({ type: "success", title: `Turno ${trans.label.toLowerCase()}`, message: appt.patient });
    }
  };

  const cancel = async (id: string) => {
    const appt = appts.find(a => a.id === id);
    if (!appt) return;
    if (isLive) {
      const { error } = await updateAppointmentStatus(id, "CANCELLED");
      if (error) { toast({ type: "error", title: "Error", message: error }); return; }
      await refetch();
    }
    toast({ type: "warning", title: "Turno cancelado", message: appt.patient });
  };

  const confirmed = appts.filter(a => a.status === "CONFIRMADO").length;
  const pending = appts.filter(a => a.status === "PENDIENTE").length;
  const inProgress = appts.filter(a => a.status === "EN CURSO").length;
  const cancelled = appts.filter(a => a.status === "CANCELADO").length;

  const selected = appts.find(a => a.id === selectedId);

  return (
    <div>
      {newOpen && <NewAppointmentModal onClose={() => setNewOpen(false)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
            Agenda / Turnos
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 6 }}>
            {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
            {isLive && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                LIVE DB
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", background: "var(--slate-100)", borderRadius: 8, padding: 2 }}>
            <button onClick={() => setViewMode("list")} style={{ padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: viewMode === "list" ? "white" : "transparent", color: viewMode === "list" ? "var(--navy)" : "var(--slate-500)", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <List size={13} /> Lista
            </button>
            <button onClick={() => setViewMode("week")} style={{ padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: viewMode === "week" ? "white" : "transparent", color: viewMode === "week" ? "var(--navy)" : "var(--slate-500)", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <LayoutGrid size={13} /> Semana
            </button>
          </div>
          {isLive && (
            <button onClick={refetch} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "white", color: "var(--slate-600)", border: "1px solid var(--slate-200)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              <RefreshCw size={14} /> Actualizar
            </button>
          )}
          <button onClick={() => setNewOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            <Plus size={15} /> Nuevo turno
          </button>
        </div>
      </div>

      {/* Weekly view */}
      {viewMode === "week" && <WeekView appts={isLive ? dbAppts : APPOINTMENTS as any} weekOffset={weekOffset} onWeekOffset={setWeekOffset} />}

      <div style={{ display: viewMode === "week" ? "none" : "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
        {/* Table */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--slate-100)" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Turnos de Hoy</div>
            <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>
              {loading ? "Cargando..." : `${appts.length} programados`}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>
              Cargando turnos...
            </div>
          ) : appts.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
              <div>No hay turnos programados para hoy</div>
              <button onClick={() => setNewOpen(true)} style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                + Agregar turno
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--slate-50)" }}>
                  {["Hora", "Paciente", "Profesional", "Especialidad", "Obra Social", "Estado", "Acciones"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => {
                  const trans = STATUS_TRANSITIONS[a.status];
                  const isSelected = selectedId === a.id;
                  return (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom: "1px solid var(--slate-100)",
                        background: isSelected ? "rgba(0,191,166,0.04)" : a.status === "EN CURSO" ? "#EFF6FF" : "transparent",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedId(isSelected ? null : a.id)}
                    >
                      <td style={{ padding: "10px 12px", fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--navy)" }}>{a.time}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--slate-800)" }}>{a.patient}</td>
                      <td style={{ padding: "10px 12px", color: "var(--slate-600)", fontSize: 12 }}>{a.doctor}</td>
                      <td style={{ padding: "10px 12px", color: "var(--slate-500)", fontSize: 11 }}>{a.specialty}</td>
                      <td style={{ padding: "10px 12px", color: "var(--slate-500)", fontSize: 11 }}>{a.obra}</td>
                      <td style={{ padding: "10px 12px" }}><Badge status={a.status} /></td>
                      <td style={{ padding: "10px 12px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {trans && (
                            <button
                              onClick={() => advance(a.id)}
                              style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 8px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, background: `${trans.color}15`, color: trans.color }}
                            >
                              {trans.icon} {trans.label}
                            </button>
                          )}
                          {a.status !== "CANCELADO" && a.status !== "CONFIRMADO" && (
                            <button
                              onClick={() => cancel(a.id)}
                              style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 8px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, background: "rgba(239,68,68,0.1)", color: "var(--red)" }}
                            >
                              <XCircle size={10} /> Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedId(isSelected ? null : a.id)}
                            style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 8px", borderRadius: 5, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700 }}
                          >
                            <Eye size={10} /> Ver
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Inline detail */}
          {selected && (
            <div style={{ padding: "16px 20px", borderTop: "2px solid var(--teal)", background: "rgba(0,191,166,0.03)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
                {[
                  { label: "Paciente",     value: selected.patient },
                  { label: "Médico",       value: selected.doctor },
                  { label: "Especialidad", value: selected.specialty },
                  { label: "Duración",     value: `${selected.duration} min` },
                  { label: "Obra Social",  value: selected.obra },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid var(--slate-200)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>Resumen del día</div>
            {[
              { label: "Total turnos",  value: appts.length, color: "var(--teal)" },
              { label: "Confirmados",   value: confirmed,    color: "var(--green)" },
              { label: "Pendientes",    value: pending,      color: "var(--amber)" },
              { label: "En curso",      value: inProgress,   color: "var(--blue)" },
              { label: "Cancelados",    value: cancelled,    color: "var(--red)" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 4 ? "1px solid var(--slate-100)" : "none" }}>
                <span style={{ fontSize: 12, color: "var(--slate-600)" }}>{s.label}</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid var(--slate-200)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>Profesionales activos</div>
            {[
              { name: "Dra. Marta Vidal",    color: "#00BFA6" },
              { name: "Dr. Carlos Romero",   color: "#2563EB" },
              { name: "Dr. Luis Campos",     color: "#8B5CF6" },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 2 ? "1px solid var(--slate-100)" : "none" }}>
                <Avatar initials={d.name.split(" ").map(w => w[0]).slice(1, 3).join("")} color={d.color} size={28} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--slate-700)", flex: 1 }}>{d.name}</span>
                <span style={{ fontSize: 10, color: "var(--slate-400)" }}>activo</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setNewOpen(true)}
            style={{ padding: "12px", borderRadius: 12, border: "2px dashed var(--slate-300)", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--slate-400)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
          >
            <Plus size={14} /> Agregar turno
          </button>
        </div>
      </div>
    </div>
  );
}
