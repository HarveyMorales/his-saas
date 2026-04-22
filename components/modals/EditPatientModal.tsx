"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { updatePatient } from "@/app/actions/patients";
import { useToast } from "@/lib/toast-context";
import type { Patient } from "@/lib/types";

interface Props {
  patient: Patient & { raw?: any };
  onClose: () => void;
  onSaved: () => void;
}

export function EditPatientModal({ patient, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const raw = (patient as any)._raw ?? (patient as any).raw ?? {};
  const nameParts = patient.name.split(", ");

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: raw.firstName ?? nameParts[1] ?? "",
    lastName: raw.lastName ?? nameParts[0] ?? "",
    dni: raw.dni ?? patient.dni ?? "",
    cuil: raw.cuil ?? "",
    birthDate: raw.birthDate ? String(raw.birthDate).slice(0, 10) : "",
    sex: raw.sex ?? patient.sex ?? "M",
    email: raw.email ?? patient.email ?? "",
    phone: raw.phone ?? patient.phone ?? "",
    address: raw.address ?? "",
    bloodType: raw.bloodType ?? patient.blood ?? "",
    allergies: raw.allergies ?? "",
    emergencyContact: raw.emergencyContact ?? "",
    emergencyPhone: raw.emergencyPhone ?? "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast({ type: "error", title: "Error", message: "Nombre y apellido son obligatorios" });
      return;
    }
    setSaving(true);
    const { error } = await updatePatient(patient.id as string, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      dni: form.dni.trim(),
      cuil: form.cuil || null,
      birthDate: form.birthDate || null,
      sex: form.sex,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      bloodType: form.bloodType || null,
      allergies: form.allergies || null,
      emergencyContact: form.emergencyContact || null,
      emergencyPhone: form.emergencyPhone || null,
    });
    setSaving(false);
    if (error) toast({ type: "error", title: "Error al guardar", message: error });
    else { toast({ type: "success", title: "Paciente actualizado", message: `${form.lastName}, ${form.firstName}` }); onSaved(); }
  };

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>{label}</label>
      <input
        type={type}
        value={(form as any)[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(11,29,53,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={{ background: "white", borderRadius: 20, width: 580, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Editar Paciente</div>
            <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>{patient.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex" }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("Apellido *", "lastName")}
            {field("Nombre *", "firstName")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("DNI", "dni")}
            {field("CUIL", "cuil", "text", "27-12345678-9")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("Fecha de nacimiento", "birthDate", "date")}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Sexo</label>
              <select value={form.sex} onChange={e => set("sex", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="X">Otro / No binario</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("Email", "email", "email")}
            {field("Teléfono", "phone", "tel")}
          </div>

          {field("Domicilio", "address")}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Grupo sanguíneo</label>
              <select value={form.bloodType} onChange={e => set("bloodType", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                <option value="">No especificado</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            {field("Alergias conocidas", "allergies", "text", "Penicilina, Polen...")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("Contacto de emergencia", "emergencyContact")}
            {field("Tel. de emergencia", "emergencyPhone", "tel")}
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: saving ? "default" : "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
