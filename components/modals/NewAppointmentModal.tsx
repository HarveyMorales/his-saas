"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { PATIENTS } from "@/lib/data";

const SPECIALTIES = [
  "Clínica Médica", "Cardiología", "Ginecología", "Pediatría",
  "Traumatología", "Neurología", "Diabetología", "Dermatología",
  "Gastroenterología", "Neumología", "Laboratorio", "Control",
];

const DOCTORS = [
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
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    doctor: "",
    specialty: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    duration: "30",
    obra: "",
    notes: "",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const selectedPatient = PATIENTS.find(p => p.id === form.patientId);
  const canSave = form.patientId && form.doctor && form.specialty && form.time;

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        type: "success",
        title: "Turno creado",
        message: `${selectedPatient?.name} — ${form.time} con ${form.doctor}`,
      });
      onSaved?.();
      onClose();
    }, 600);
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
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>Agendar consulta médica</p>
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
              {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} — DNI {p.dni}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
                Profesional <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <select value={form.doctor} onChange={e => set("doctor", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Seleccionar...</option>
                {DOCTORS.map(d => <option key={d} value={d}>{d}</option>)}
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

          {selectedPatient && (
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>Obra Social</label>
              <input value={selectedPatient.obra} readOnly style={{ ...inputStyle, background: "var(--slate-100)", color: "var(--slate-500)", cursor: "default" }} />
            </div>
          )}

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
