"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createNomenclator, createMedicalPractice } from "@/app/actions/insurance";
import { useToast } from "@/lib/toast-context";

interface Props {
  tenantId: string;
  providerId: string;
  nomenclators: any[];
  onClose: () => void;
  onSaved: () => void;
}

export function NewPracticeModal({ tenantId, providerId, nomenclators, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [nomenclatorId, setNomenclatorId] = useState(nomenclators[0]?.id ?? "");
  const [newNomenclatorName, setNewNomenclatorName] = useState("");
  const [createNewNom, setCreateNewNom] = useState(nomenclators.length === 0);
  const [form, setForm] = useState({ code: "", name: "", description: "", defaultValue: "" });

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast({ type: "error", title: "Error", message: "Código y nombre son requeridos" }); return;
    }
    setSaving(true);
    let nomId = nomenclatorId;

    if (createNewNom) {
      if (!newNomenclatorName.trim()) {
        toast({ type: "error", title: "Error", message: "Nombre del nomenclador requerido" }); setSaving(false); return;
      }
      const { data, error } = await createNomenclator({ insuranceProviderId: providerId, name: newNomenclatorName, version: new Date().getFullYear().toString() });
      if (error) { toast({ type: "error", title: "Error", message: error }); setSaving(false); return; }
      nomId = data.id;
    }

    const { error } = await createMedicalPractice({
      nomenclatorId: nomId,
      code: form.code,
      name: form.name,
      description: form.description || undefined,
      defaultValue: Number(form.defaultValue) || 0,
    });
    setSaving(false);
    if (error) toast({ type: "error", title: "Error", message: error });
    else { toast({ type: "success", title: "Práctica agregada", message: `${form.code} — ${form.name}` }); onSaved(); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(11,29,53,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 20, width: 480, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Nueva Práctica</div>
            <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>Agregar código al nomenclador</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex" }}><X size={18} /></button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Nomenclador */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Nomenclador</label>
            {!createNewNom && nomenclators.length > 0 ? (
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={nomenclatorId}
                  onChange={e => setNomenclatorId(e.target.value)}
                  style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none" }}>
                  {nomenclators.map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
                <button onClick={() => setCreateNewNom(true)} style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", background: "white", cursor: "pointer", fontSize: 12, color: "var(--blue)" }}>+ Nuevo</button>
              </div>
            ) : (
              <input
                value={newNomenclatorName}
                onChange={e => setNewNomenclatorName(e.target.value)}
                placeholder="Nombre del nuevo nomenclador"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            )}
          </div>

          {/* Práctica fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Código *</label>
              <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="040201" style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Valor $</label>
              <input type="number" value={form.defaultValue} onChange={e => setForm(p => ({ ...p, defaultValue: e.target.value }))} placeholder="0" style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Descripción *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Consulta especialista" style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: saving ? "default" : "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Guardando..." : "Agregar práctica"}
          </button>
        </div>
      </div>
    </div>
  );
}
