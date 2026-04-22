"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createAdmission } from "@/app/actions/guards";
import { usePatients, useDoctors } from "@/lib/hooks/useSupabase";
import { useToast } from "@/lib/toast-context";

interface Props {
  tenantId: string;
  beds: any[];
  onClose: () => void;
  onSaved: () => void;
}

export function NewAdmissionModal({ tenantId, beds, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const { patients } = usePatients(tenantId);
  const { doctors } = useDoctors(tenantId);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patientId: "", doctorId: "", bedId: "", reason: "", notes: "" });

  const handleSave = async () => {
    if (!form.patientId) { toast({ type: "error", title: "Error", message: "Seleccioná un paciente" }); return; }
    setSaving(true);
    const { error } = await createAdmission({
      patientId: form.patientId,
      doctorId: form.doctorId || null,
      bedId: form.bedId || null,
      reason: form.reason || undefined,
      notes: form.notes || undefined,
    });
    setSaving(false);
    if (error) toast({ type: "error", title: "Error al internar", message: error });
    else { toast({ type: "success", title: "Internación registrada", message: "Paciente admitido" }); onSaved(); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(11,29,53,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 20, width: 500, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Nueva Internación</div>
            <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>Admisión hospitalaria</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex" }}><X size={18} /></button>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Paciente *</label>
            <select value={form.patientId} onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
              <option value="">Seleccionar paciente...</option>
              {patients.map((pt: any) => <option key={pt.id} value={pt.id}>{pt.lastName}, {pt.firstName} — DNI {pt.dni}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Médico tratante</label>
              <select value={form.doctorId} onChange={e => setForm(p => ({ ...p, doctorId: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                <option value="">Sin asignar</option>
                {doctors.map((d: any) => <option key={d.id} value={d.id}>Dr/a. {d.lastName}, {d.firstName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Cama</label>
              <select value={form.bedId} onChange={e => setForm(p => ({ ...p, bedId: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                <option value="">Sin cama asignada</option>
                {beds.map((b: any) => <option key={b.id} value={b.id}>{b.code} — {b.ward ?? "General"} {b.room ? `(${b.room})` : ""}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Motivo de internación</label>
            <input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Diagnóstico / motivo de ingreso"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Notas adicionales</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Indicaciones, alergias conocidas, etc."
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "none" }} />
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, background: "#EF4444", color: "white", border: "none", cursor: saving ? "default" : "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Internando..." : "Confirmar internación"}
          </button>
        </div>
      </div>
    </div>
  );
}
