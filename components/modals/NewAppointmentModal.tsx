"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { PATIENTS } from "@/lib/data";
import { useCurrentUser, usePatients, useDoctors } from "@/lib/hooks/useSupabase";
import { createAppointment } from "@/app/actions/appointments";

const SPECIALTIES = [
  "Clínica Médica", "Cardiología", "Ginecología", "Pediatría",
  "Traumatología", "Neurología", "Diabetología", "Dermatología",
  "Gastroenterología", "Neumología", "Laboratorio", "Control",
];

const MOCK_DOCTORS = [
  "Dr. Juan Rodríguez", "Dra. Marta Vidal", "Dr. Luis Campos",
  "Dra. Ana Fernández", "Dr. Carlos Romero",
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid var(--slate-200)", fontSize: 13, color: "var(--navy)",
  outline: "none", background: "var(--slate-50)", boxSizing: "border-box",
};

interface NewAppointmentModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

export function NewAppointmentModal({ onClose, onSaved }: NewAppointmentModalProps) {
  const { toast } = useToast();
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;

  const { patients: dbPatients } = usePatients(tenantId);
  const { doctors: dbDoctors } = useDoctors(tenantId);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    specialty: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    duration: "30",
    notes: "",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const canSave = form.patientId && form.doctorId && form.specialty && form.time;

  const selectedPatient = isLive
    ? dbPatients.find((p: any) => p.id === form.patientId)
    : PATIENTS.find(p => p.id === form.patientId);

  const selectedDoctor = isLive
    ? dbDoctors.find((d: any) => d.id === form.doctorId)
    : null;

  const patientLabel = isLive && selectedPatient
    ? `${(selectedPatient as any).lastName}, ${(selectedPatient as any).firstName}`
    : (selectedPatient as any)?.name ?? "";

  const handleSave = async () => {
    setSaving(true);
    if (isLive) {
      const scheduledAt = `${form.date}T${form.time}:00`;
      const { error } = await createAppointment({
        patientId: form.patientId,
        doctorId: form.doctorId,
        scheduledAt,
        durationMin: Number(form.duration),
        notes: form.notes || null,
      });
      setSaving(false);
      if (error) {
        toast({ type: "error", title: "Error al guardar", message: error });
      } else {
        const docName = selectedDoctor ? `${(selectedDoctor as any).firstName} ${(selectedDoctor as any).lastName}` : form.doctorId;
        toast({ type: "success", title: "Turno creado", message: `${patientLabel} — ${form.time} con ${docName}` });
        onSaved?.();
        onClose();
      }
    } else {
      setTimeout(() => {
        setSaving(false);
        toast({ type: "success", title: "Turno creado", message: `${patientLabel} — ${form.time}` });
        onSaved?.();
        onClose();
      }, 600);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(11,29,53,0.6)", backdropFilter: "blur(5px)",
        zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.15s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: 18,
          width: "100%", maxWidth: 520,
          boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
          animation: "slideUp 0.18s ease-out", overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Nuevo Turno</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>
              Agendar consulta médica{isLive && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>LIVE DB</span>}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", fontSize: 20 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
              Paciente <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <select value={form.patientId} onChange={e => set("patientId", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Seleccionar paciente...</option>
              {isLive
                ? dbPatients.map((p: any) => <option key={p.id} value={p.id}>{p.lastName}, {p.firstName} — DNI {p.dni}</option>)
                : PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} — DNI {p.dni}</option>)
              }
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
                Profesional <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <select value={form.doctorId} onChange={e => set("doctorId", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Seleccionar...</option>
                {isLive
                  ? dbDoctors.map((d: any) => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}{d.specialty ? ` — ${d.specialty}` : ""}</option>)
                  : MOCK_DOCTORS.map(d => <option key={d} value={d}>{d}</option>)
                }
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
                Especialidad <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <select value={form.specialty} onChange={e => set("specialty", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Seleccionar...</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>Fecha</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>Hora</label>
              <input type="time" value={form.time} onChange={e => set("time", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>Duración</label>
              <select value={form.duration} onChange={e => set("duration", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {["15", "20", "30", "45", "60"].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>Notas</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Motivo o indicaciones..." rows={2}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 22px", borderRadius: 8,
              background: canSave && !saving ? "var(--teal)" : "var(--slate-200)",
              color: canSave && !saving ? "white" : "var(--slate-400)",
              border: "none", cursor: canSave && !saving ? "pointer" : "default",
              fontSize: 13, fontWeight: 700,
            }}
          >
            {saving ? "Guardando..." : <><Check size={14} /> Crear turno</>}
          </button>
        </div>
      </div>
    </div>
  );
}
