"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { createPatient } from "@/app/actions/patients";

interface NewPatientModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const INSURANCE_LIST = ["OSDE 410", "OSDE 210", "PAMI", "Swiss Medical", "IOMA", "Galeno", "Medifé", "OSPAM", "Sin obra social"];

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

export function NewPatientModal({ onClose, onSaved }: NewPatientModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", dni: "", cuil: "",
    birthDate: "", sex: "F",
    email: "", phone: "",
    blood: "", obra: "",
    address: "",
    allergies: "", emergencyContact: "", emergencyPhone: "",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const canSave = form.firstName && form.lastName && form.dni;

  const handleSave = async () => {
    setSaving(true);
    const { error } = await createPatient({
      firstName: form.firstName,
      lastName: form.lastName,
      dni: form.dni,
      cuil: form.cuil || null,
      birthDate: form.birthDate || null,
      sex: (form.sex as "M" | "F") || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      bloodType: form.blood || null,
      allergies: form.allergies || null,
      emergencyContact: form.emergencyContact || null,
      emergencyPhone: form.emergencyPhone || null,
    });
    setSaving(false);
    if (error) {
      toast({ type: "error", title: "Error al guardar", message: error });
    } else {
      toast({ type: "success", title: "Paciente creado", message: `${form.lastName}, ${form.firstName} registrado exitosamente.` });
      onSaved?.();
      onClose();
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
          width: "100%", maxWidth: 640, maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
          animation: "slideUp 0.18s ease-out", overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Nuevo Paciente</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>Registro en el padrón de la institución</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Personal */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
              Datos personales
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Apellido" required>
                <input value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="García" style={inputStyle} />
              </Field>
              <Field label="Nombre" required>
                <input value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Laura" style={inputStyle} />
              </Field>
              <Field label="DNI" required>
                <input value={form.dni} onChange={e => set("dni", e.target.value)} placeholder="27.381.445" style={inputStyle} />
              </Field>
              <Field label="CUIL">
                <input value={form.cuil} onChange={e => set("cuil", e.target.value)} placeholder="27-27381445-8" style={inputStyle} />
              </Field>
              <Field label="Fecha de nacimiento">
                <input type="date" value={form.birthDate} onChange={e => set("birthDate", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Sexo biológico">
                <select value={form.sex} onChange={e => set("sex", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
              Contacto
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Email">
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="paciente@email.com" style={inputStyle} />
              </Field>
              <Field label="Teléfono">
                <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="351-555-0101" style={inputStyle} />
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Dirección">
                  <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Av. Colón 1234, Córdoba" style={inputStyle} />
                </Field>
              </div>
            </div>
          </div>

          {/* Medical */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--purple)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
              Datos clínicos
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Grupo sanguíneo">
                <select value={form.blood} onChange={e => set("blood", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Desconocido</option>
                  {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Obra social">
                <select value={form.obra} onChange={e => set("obra", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Seleccionar...</option>
                  {INSURANCE_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Alergias conocidas">
                  <input value={form.allergies} onChange={e => set("allergies", e.target.value)} placeholder="Penicilina, AINE, látex..." style={inputStyle} />
                </Field>
              </div>
            </div>
          </div>

          {/* Emergency */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
              Contacto de emergencia
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Nombre y relación">
                <input value={form.emergencyContact} onChange={e => set("emergencyContact", e.target.value)} placeholder="Juan García (hijo)" style={inputStyle} />
              </Field>
              <Field label="Teléfono">
                <input value={form.emergencyPhone} onChange={e => set("emergencyPhone", e.target.value)} placeholder="351-555-9999" style={inputStyle} />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "var(--slate-400)" }}>
            Los campos marcados con <span style={{ color: "var(--red)" }}>*</span> son obligatorios
          </div>
          <div style={{ display: "flex", gap: 10 }}>
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
                boxShadow: canSave && !saving ? "0 4px 14px rgba(0,191,166,0.3)" : "none",
              }}
            >
              {saving ? "Guardando..." : <><Check size={14} /> Crear paciente</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
