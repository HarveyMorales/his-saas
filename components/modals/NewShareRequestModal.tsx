"use client";

import { useState } from "react";
import { X, Share2 } from "lucide-react";
import { createShareRequest } from "@/app/actions/sharing";
import { useTenants } from "@/lib/hooks/useSupabase";
import { useToast } from "@/lib/toast-context";
import type { Patient } from "@/lib/types";

interface Props {
  patient: Patient;
  tenantId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function NewShareRequestModal({ patient, tenantId, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const { tenants } = useTenants(tenantId);
  const [saving, setSaving] = useState(false);
  const [toTenantId, setToTenantId] = useState("");
  const [reason, setReason] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");

  const handleSave = async () => {
    if (!toTenantId) {
      toast({ type: "error", title: "Error", message: "Seleccioná una institución destino" });
      return;
    }
    if (!reason.trim()) {
      toast({ type: "error", title: "Error", message: "El motivo de la solicitud es obligatorio" });
      return;
    }
    setSaving(true);
    const days = parseInt(expiresInDays) || 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await createShareRequest({
      toTenantId,
      patientId: patient.id as string,
      reason: reason.trim(),
      expiresAt,
    });
    setSaving(false);
    if (error) toast({ type: "error", title: "Error al crear solicitud", message: error });
    else {
      toast({ type: "success", title: "Solicitud enviada", message: `Acceso solicitado para ${patient.name}` });
      onSaved();
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(11,29,53,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 20, width: 500, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Share2 size={16} color="var(--amber)" />
            </div>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Solicitar acceso a HC</div>
              <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 1 }}>{patient.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex" }}><X size={18} /></button>
        </div>

        {/* Policy notice */}
        <div style={{ margin: "16px 24px 0", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#3730A3", lineHeight: 1.5 }}>
          La solicitud será enviada para aprobación. El acceso se otorga solo si la institución destino lo aprueba, con una ventana de tiempo limitada.
        </div>

        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Paciente */}
          <div style={{ background: "var(--slate-50)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--slate-500)", fontWeight: 600 }}>Paciente</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{patient.name} — DNI {patient.dni}</span>
          </div>

          {/* Institución destino */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Institución destino *</label>
            <select value={toTenantId} onChange={e => setToTenantId(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
              <option value="">Seleccionar institución...</option>
              {tenants.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name} {t.type ? `(${t.type})` : ""}</option>
              ))}
            </select>
            {tenants.length === 0 && (
              <div style={{ fontSize: 11, color: "var(--slate-400)", marginTop: 4 }}>No hay otras instituciones registradas en el sistema</div>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Motivo de la solicitud *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Ej: Interconsulta por derivación, continuidad de tratamiento oncológico..."
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "none" }} />
          </div>

          {/* Vencimiento */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Acceso válido por</label>
            <select value={expiresInDays} onChange={e => setExpiresInDays(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
              <option value="7">7 días</option>
              <option value="15">15 días</option>
              <option value="30">30 días (recomendado)</option>
              <option value="60">60 días</option>
              <option value="90">90 días</option>
            </select>
          </div>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--amber)", color: "white", border: "none", cursor: saving ? "default" : "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Enviando..." : "Enviar solicitud"}
          </button>
        </div>
      </div>
    </div>
  );
}
