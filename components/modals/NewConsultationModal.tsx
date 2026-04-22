"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Check, Activity, Stethoscope, ClipboardList } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { createMedicalRecord } from "@/app/actions/medical-records";
import type { Patient } from "@/lib/types";

interface NewConsultationModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSaved?: () => void;
}

const SPECIALTIES = [
  "Clínica Médica", "Cardiología", "Ginecología", "Pediatría",
  "Traumatología", "Neurología", "Diabetología", "Dermatología",
  "Gastroenterología", "Neumología", "Urología", "Oftalmología",
  "Psiquiatría", "Oncología", "Endocrinología", "Control / Seguimiento",
];

type Step = 1 | 2 | 3;

interface FormData {
  specialty: string;
  doctor: string;
  date: string;
  chiefComplaint: string;
  bp_sys: string;
  bp_dia: string;
  hr: string;
  temp: string;
  weight: string;
  height: string;
  spo2: string;
  subjective: string;
  objective: string;
  diagnosis: string;
  plan: string;
  confidential: boolean;
}

const STEP_INFO: Record<Step, { label: string; icon: React.ReactNode; desc: string }> = {
  1: { label: "Consulta", icon: <Stethoscope size={14} />, desc: "Datos generales" },
  2: { label: "Examen", icon: <Activity size={14} />, desc: "Signos vitales" },
  3: { label: "Evolución", icon: <ClipboardList size={14} />, desc: "Nota SOAP" },
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--slate-200)",
  fontSize: 13,
  color: "var(--navy)",
  outline: "none",
  background: "var(--slate-50)",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 80,
  fontFamily: "system-ui",
  lineHeight: 1.5,
};

export function NewConsultationModal({ patient, onClose, onSaved }: NewConsultationModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<FormData>({
    specialty: "",
    doctor: "Dr. Carlos Romero",
    date: today,
    chiefComplaint: "",
    bp_sys: "",
    bp_dia: "",
    hr: "",
    temp: "",
    weight: "",
    height: "",
    spo2: "",
    subjective: "",
    objective: "",
    diagnosis: "",
    plan: "",
    confidential: false,
  });

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const canProceed = () => {
    if (step === 1) return form.specialty && form.chiefComplaint.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return form.diagnosis.trim().length > 0 && form.plan.trim().length > 0;
    return false;
  };

  const handleSave = async () => {
    if (!patient) return;
    setSaving(true);
    const { error } = await createMedicalRecord({
      patientId: patient.id,
      entryType: form.specialty || "CONSULTA",
      subjective: form.subjective || null,
      objective: form.objective || null,
      assessment: form.diagnosis || null,
      plan: form.plan || null,
      diagnosisFreeText: form.diagnosis || null,
      vitalsBpSystolic: form.bp_sys ? Number(form.bp_sys) : null,
      vitalsBpDiastolic: form.bp_dia ? Number(form.bp_dia) : null,
      vitalsHrBpm: form.hr ? Number(form.hr) : null,
      vitalsTempC: form.temp ? Number(form.temp) : null,
      vitalsWeightKg: form.weight ? Number(form.weight) : null,
      vitalsHeightCm: form.height ? Number(form.height) : null,
      isConfidential: form.confidential,
    });
    setSaving(false);
    if (error) {
      toast({ type: "error", title: "Error al guardar", message: error });
    } else {
      toast({ type: "success", title: "Evolución guardada", message: `HC de ${patient.name} actualizada correctamente.` });
      onSaved?.();
      onClose();
    }
  };

  if (!patient) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(11,29,53,0.6)",
        backdropFilter: "blur(5px)",
        zIndex: 998,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 18,
          width: "100%",
          maxWidth: 620,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
          animation: "slideUp 0.18s ease-out",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-lt) 100%)",
          color: "white",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "white" }}>
                Nueva Evolución
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {patient.name} · DNI {patient.dni} · {patient.age} años
              </p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, cursor: "pointer", color: "white", padding: "6px 10px", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", gap: 4 }}>
            {([1, 2, 3] as Step[]).map((s) => {
              const active = s === step;
              const done = s < step;
              const info = STEP_INFO[s];
              return (
                <div
                  key={s}
                  onClick={() => done && setStep(s)}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: active ? "rgba(255,255,255,0.18)" : done ? "rgba(0,191,166,0.2)" : "rgba(255,255,255,0.06)",
                    border: active ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                    cursor: done ? "pointer" : "default",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: done ? "var(--teal)" : active ? "white" : "rgba(255,255,255,0.15)",
                      color: done ? "white" : active ? "var(--navy)" : "rgba(255,255,255,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: done ? 11 : 10, fontWeight: 700, flexShrink: 0,
                    }}>
                      {done ? <Check size={10} /> : s}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? "white" : "rgba(255,255,255,0.65)" }}>
                      {info.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", paddingLeft: 26 }}>{info.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* Step 1: Datos generales */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Especialidad" required>
                  <select
                    value={form.specialty}
                    onChange={e => set("specialty", e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">Seleccionar...</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Profesional">
                  <input value={form.doctor} onChange={e => set("doctor", e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Fecha de consulta">
                <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Motivo de consulta" required>
                <textarea
                  value={form.chiefComplaint}
                  onChange={e => set("chiefComplaint", e.target.value)}
                  placeholder="Describe el motivo principal de la consulta..."
                  style={{ ...textareaStyle, minHeight: 100 }}
                />
              </Field>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.confidential}
                  onChange={e => set("confidential", e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--red)", cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: "var(--slate-600)" }}>
                  Marcar como <strong style={{ color: "var(--red)" }}>confidencial</strong> (solo médico tratante)
                </span>
              </label>
            </div>
          )}

          {/* Step 2: Signos vitales */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                background: "var(--slate-50)",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 12,
                color: "var(--slate-500)",
                borderLeft: "3px solid var(--teal)",
              }}>
                Los signos vitales son opcionales pero mejoran el seguimiento clínico. Completá los que correspondan.
              </div>

              {/* TA */}
              <Field label="Tensión Arterial (mmHg)">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="number"
                    value={form.bp_sys}
                    onChange={e => set("bp_sys", e.target.value)}
                    placeholder="Sistólica"
                    style={{ ...inputStyle, textAlign: "center" }}
                  />
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "var(--slate-400)", flexShrink: 0 }}>/</span>
                  <input
                    type="number"
                    value={form.bp_dia}
                    onChange={e => set("bp_dia", e.target.value)}
                    placeholder="Diastólica"
                    style={{ ...inputStyle, textAlign: "center" }}
                  />
                  <span style={{ fontSize: 11, color: "var(--slate-400)", flexShrink: 0 }}>mmHg</span>
                </div>
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="FC (lpm)">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" value={form.hr} onChange={e => set("hr", e.target.value)} placeholder="72" style={inputStyle} />
                    <span style={{ fontSize: 11, color: "var(--slate-400)", flexShrink: 0 }}>lpm</span>
                  </div>
                </Field>
                <Field label="Temperatura">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" step="0.1" value={form.temp} onChange={e => set("temp", e.target.value)} placeholder="36.6" style={inputStyle} />
                    <span style={{ fontSize: 11, color: "var(--slate-400)", flexShrink: 0 }}>°C</span>
                  </div>
                </Field>
                <Field label="Peso">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" step="0.1" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="70" style={inputStyle} />
                    <span style={{ fontSize: 11, color: "var(--slate-400)", flexShrink: 0 }}>kg</span>
                  </div>
                </Field>
                <Field label="Talla">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" value={form.height} onChange={e => set("height", e.target.value)} placeholder="168" style={inputStyle} />
                    <span style={{ fontSize: 11, color: "var(--slate-400)", flexShrink: 0 }}>cm</span>
                  </div>
                </Field>
              </div>

              <Field label="SpO₂ (saturación)">
                <div style={{ display: "flex", gap: 8, alignItems: "center", maxWidth: 180 }}>
                  <input type="number" value={form.spo2} onChange={e => set("spo2", e.target.value)} placeholder="98" style={inputStyle} />
                  <span style={{ fontSize: 11, color: "var(--slate-400)", flexShrink: 0 }}>%</span>
                </div>
              </Field>

              {/* IMC preview */}
              {form.weight && form.height && (
                <div style={{ background: "rgba(0,191,166,0.08)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: "var(--slate-600)" }}>IMC calculado:</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
                    {(Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1)}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--slate-400)" }}>kg/m²</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: SOAP */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "subjective" as keyof FormData, label: "S — Subjetivo", placeholder: "Descripción de los síntomas en palabras del paciente...", color: "#8B5CF6" },
                { key: "objective" as keyof FormData, label: "O — Objetivo", placeholder: "Hallazgos del examen físico, laboratorio, estudios...", color: "#2563EB" },
                { key: "diagnosis" as keyof FormData, label: "A — Diagnóstico / Evaluación", placeholder: "Diagnóstico principal y diferencial...", color: "#EF4444", required: true },
                { key: "plan" as keyof FormData, label: "P — Plan / Tratamiento", placeholder: "Indicaciones terapéuticas, medicamentos, derivaciones...", color: "#10B981", required: true },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6, color: f.color }}>
                    {f.label} {f.required && <span style={{ color: "var(--red)" }}>*</span>}
                  </label>
                  <textarea
                    value={form[f.key] as string}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={{ ...textareaStyle, borderLeft: `3px solid ${f.color}`, background: `${f.color}06` }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--slate-100)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ fontSize: 11, color: "var(--slate-400)" }}>
            Paso {step} de 3
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && (
              <button
                onClick={() => setStep(s => (s - 1) as Step)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                <ChevronLeft size={14} /> Anterior
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => (s + 1) as Step)}
                disabled={!canProceed()}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 20px", borderRadius: 8,
                  background: canProceed() ? "var(--teal)" : "var(--slate-200)",
                  color: canProceed() ? "white" : "var(--slate-400)",
                  border: "none", cursor: canProceed() ? "pointer" : "default",
                  fontSize: 13, fontWeight: 700,
                }}
              >
                Siguiente <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canProceed() || saving}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 22px", borderRadius: 8,
                  background: canProceed() && !saving ? "linear-gradient(135deg, var(--teal), #00D4B8)" : "var(--slate-200)",
                  color: canProceed() && !saving ? "white" : "var(--slate-400)",
                  border: "none", cursor: canProceed() && !saving ? "pointer" : "default",
                  fontSize: 13, fontWeight: 700,
                  boxShadow: canProceed() && !saving ? "0 4px 16px rgba(0,191,166,0.3)" : "none",
                }}
              >
                {saving ? "Guardando..." : <><Check size={14} /> Guardar evolución</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
