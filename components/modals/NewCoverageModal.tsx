"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createPatientCoverage } from "@/app/actions/insurance";
import { usePatients } from "@/lib/hooks/useSupabase";
import { useToast } from "@/lib/toast-context";

interface Props {
  tenantId: string;
  providerId: string;
  providerName: string;
  onClose: () => void;
  onSaved: () => void;
}

export function NewCoverageModal({ tenantId, providerId, providerName, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const { patients } = usePatients(tenantId);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    affiliateNumber: "",
    planName: "",
    isPrimary: true,
    validFrom: "",
    validUntil: "",
  });

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.patientId) {
      toast({ type: "error", title: "Error", message: "Seleccioná un paciente" });
      return;
    }
    setSaving(true);
    const { error } = await createPatientCoverage({
      patientId: form.patientId,
      insuranceProviderId: providerId,
      affiliateNumber: form.affiliateNumber || undefined,
      planName: form.planName || undefined,
      isPrimary: form.isPrimary,
      validFrom: form.validFrom || undefined,
      validUntil: form.validUntil || undefined,
    });
    setSaving(false);
    if (error) toast({ type: "error", title: "Error al asignar cobertura", message: error });
    else { toast({ type: "success", title: "Cobertura asignada", message: providerName }); onSaved(); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(11,29,53,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 20, width: 480, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Asignar cobertura</div>
            <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>{providerName}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex" }}><X size={18} /></button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Paciente *</label>
            <select value={form.patientId} onChange={e => set("patientId", e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
              <option value="">Seleccionar paciente...</option>
              {patients.map((p: any) => <option key={p.id} value={p.id}>{p.lastName}, {p.firstName} — DNI {p.dni}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>N° Afiliado</label>
              <input value={form.affiliateNumber} onChange={e => set("affiliateNumber", e.target.value)} placeholder="12345678"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Plan</label>
              <input value={form.planName} onChange={e => set("planName", e.target.value)} placeholder="Plan 410, SMG Gold..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Válida desde</label>
              <input type="date" value={form.validFrom} onChange={e => set("validFrom", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Válida hasta</label>
              <input type="date" value={form.validUntil} onChange={e => set("validUntil", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
            <input type="checkbox" checked={form.isPrimary} onChange={e => set("isPrimary", e.target.checked)}
              style={{ width: 15, height: 15, cursor: "pointer" }} />
            <span style={{ color: "var(--slate-700)", fontWeight: 600 }}>Cobertura principal del paciente</span>
          </label>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: saving ? "default" : "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Asignando..." : "Asignar cobertura"}
          </button>
        </div>
      </div>
    </div>
  );
}
