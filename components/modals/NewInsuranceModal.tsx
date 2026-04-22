"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createInsuranceProvider } from "@/app/actions/insurance";
import { useToast } from "@/lib/toast-context";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export function NewInsuranceModal({ onClose, onSaved }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ type: "error", title: "Error", message: "El nombre es requerido" }); return; }
    setSaving(true);
    const { error } = await createInsuranceProvider({ name: form.name, code: form.code || undefined, description: form.description || undefined });
    setSaving(false);
    if (error) toast({ type: "error", title: "Error", message: error });
    else { toast({ type: "success", title: "Obra social creada", message: form.name }); onSaved(); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(11,29,53,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 20, width: 460, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Nueva Obra Social</div>
            <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>Agregar prestadora al sistema</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex" }}><X size={18} /></button>
        </div>

        <div style={{ padding: "24px" }}>
          {[
            { label: "Nombre *", key: "name", placeholder: "Ej: OSDE 410" },
            { label: "Código", key: "code", placeholder: "Ej: OS01" },
            { label: "Descripción", key: "description", placeholder: "Descripción opcional" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{f.label}</label>
              <input
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: "100%", padding: "10px 13px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: saving ? "default" : "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Guardando..." : "Crear obra social"}
          </button>
        </div>
      </div>
    </div>
  );
}
