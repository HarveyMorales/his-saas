"use client";

import { useState } from "react";
import { Plus, Play, CheckCircle, XCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { NewAppointmentModal } from "@/components/modals/NewAppointmentModal";
import { APPOINTMENTS } from "@/lib/data";
import { useToast } from "@/lib/toast-context";
import type { Appointment } from "@/lib/types";

type ApptStatus = Appointment["status"];

const STATUS_TRANSITIONS: Record<ApptStatus, { label: string; icon: React.ReactNode; next: ApptStatus; color: string } | null> = {
  PENDIENTE:   { label: "Iniciar",    icon: <Play size={10} />,         next: "EN CURSO",   color: "var(--blue)" },
  "EN CURSO":  { label: "Completar", icon: <CheckCircle size={10} />,  next: "CONFIRMADO", color: "var(--green)" },
  CONFIRMADO:  null,
  CANCELADO:   null,
};

export function AppointmentsView() {
  const { toast } = useToast();
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const confirmed = appts.filter(a => a.status === "CONFIRMADO").length;
  const pending = appts.filter(a => a.status === "PENDIENTE").length;
  const inProgress = appts.filter(a => a.status === "EN CURSO").length;
  const cancelled = appts.filter(a => a.status === "CANCELADO").length;

  const advance = (id: string) => {
    const appt = appts.find(a => a.id === id);
    const trans = appt ? STATUS_TRANSITIONS[appt.status] : null;
    if (!trans) return;
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status: trans.next } : a));
    toast({ type: "success", title: `Turno ${trans.next.toLowerCase()}`, message: appt!.patient });
  };

  const cancel = (id: string) => {
    const appt = appts.find(a => a.id === id);
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status: "CANCELADO" } : a));
    toast({ type: "warning", title: "Turno cancelado", message: appt?.patient ?? "" });
  };

  const selected = appts.find(a => a.id === selectedId);

  return (
    <div>
      {newOpen && <NewAppointmentModal onClose={() => setNewOpen(false)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
            Agenda / Turnos
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>
            {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button
          onClick={() => setNewOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
        >
          <Plus size={15} /> Nuevo turno
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
        {/* Table */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--slate-100)" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Turnos de Hoy</div>
            <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>{appts.length} programados</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--slate-50)" }}>
                {["Hora", "Paciente", "Profesional", "Especialidad", "Obra Social", "Estado", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appts.map((a, i) => {
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

          {/* Quick add */}
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
