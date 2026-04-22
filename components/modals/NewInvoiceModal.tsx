"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createInvoice } from "@/app/actions/invoices";
import { usePatients, useInsuranceProviders, useMedicalPractices } from "@/lib/hooks/useSupabase";
import { useToast } from "@/lib/toast-context";

interface InvoiceItem {
  medicalPracticeId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  tenantId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function NewInvoiceModal({ tenantId, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const { patients } = usePatients(tenantId);
  const { providers } = useInsuranceProviders(tenantId);
  const [saving, setSaving] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { medicalPracticeId: "", description: "", quantity: 1, unitPrice: 0 },
  ]);

  const { practices } = useMedicalPractices(tenantId, providerId || null);

  const addItem = () => setItems(prev => [...prev, { medicalPracticeId: "", description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof InvoiceItem, val: string | number) => {
    setItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: val };
      if (key === "medicalPracticeId") {
        const pr = practices.find((p: any) => p.id === val);
        if (pr) next[i] = { ...next[i], description: pr.name, unitPrice: Number(pr.defaultValue) };
      }
      return next;
    });
  };

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const handleSave = async () => {
    const validItems = items.filter(i => i.description.trim() && i.unitPrice > 0);
    if (!validItems.length) { toast({ type: "error", title: "Error", message: "Agregá al menos un ítem con descripción y precio" }); return; }
    setSaving(true);
    const { error } = await createInvoice({
      patientId: patientId || null,
      insuranceProviderId: providerId || null,
      notes: notes || undefined,
      items: validItems.map(i => ({ ...i, medicalPracticeId: i.medicalPracticeId || null })),
    });
    setSaving(false);
    if (error) toast({ type: "error", title: "Error al crear factura", message: error });
    else { toast({ type: "success", title: "Factura creada", message: `$${total.toLocaleString()}` }); onSaved(); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(11,29,53,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={{ background: "white", borderRadius: 20, width: 620, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Nueva Factura</div>
            <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>Registrar prestaciones a facturar</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex" }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {/* Paciente + Obra */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Paciente</label>
              <select value={patientId} onChange={e => setPatientId(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                <option value="">Particular / Sin asignar</option>
                {patients.map((p: any) => <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Obra Social</label>
              <select value={providerId} onChange={e => setProviderId(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                <option value="">Sin obra social</option>
                {providers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Ítems */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase" }}>Prestaciones</label>
              <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, background: "rgba(0,191,166,0.1)", color: "var(--teal)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                <Plus size={12} /> Agregar
              </button>
            </div>

            {items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 160px 80px 90px 32px", gap: 8, marginBottom: 8, alignItems: "end" }}>
                <div>
                  {i === 0 && <div style={{ fontSize: 10, color: "var(--slate-500)", marginBottom: 4, fontWeight: 600 }}>DESCRIPCIÓN</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {practices.length > 0 && (
                      <select value={item.medicalPracticeId} onChange={e => updateItem(i, "medicalPracticeId", e.target.value)}
                        style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid var(--slate-200)", fontSize: 11, outline: "none", color: "var(--slate-500)" }}>
                        <option value="">Seleccionar del nomenclador...</option>
                        {practices.map((p: any) => <option key={p.id} value={p.id}>{p.code} — {p.name} (${Number(p.defaultValue).toLocaleString()})</option>)}
                      </select>
                    )}
                    <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)}
                      placeholder="Descripción de la práctica"
                      style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid var(--slate-200)", fontSize: 12, outline: "none" }} />
                  </div>
                </div>
                <div>
                  {i === 0 && <div style={{ fontSize: 10, color: "var(--slate-500)", marginBottom: 4, fontWeight: 600 }}>PRECIO UNIT.</div>}
                  <input type="number" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", Number(e.target.value))}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid var(--slate-200)", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  {i === 0 && <div style={{ fontSize: 10, color: "var(--slate-500)", marginBottom: 4, fontWeight: 600 }}>CANT.</div>}
                  <input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, "quantity", Number(e.target.value))}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid var(--slate-200)", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  {i === 0 && <div style={{ fontSize: 10, color: "var(--slate-500)", marginBottom: 4, fontWeight: 600 }}>SUBTOTAL</div>}
                  <div style={{ padding: "7px 10px", fontFamily: "Georgia, serif", fontSize: 12, fontWeight: 700, color: "var(--navy)" }}>${(item.quantity * item.unitPrice).toLocaleString()}</div>
                </div>
                <div style={{ paddingTop: i === 0 ? 18 : 0 }}>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex", padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ background: "var(--slate-50)", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--slate-600)" }}>Total</span>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>${total.toLocaleString()}</span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-600)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Observaciones opcionales"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "none" }} />
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--slate-500)" }}>Se creará con estado <strong>PENDIENTE</strong></span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: saving ? "default" : "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Creando..." : `Crear factura · $${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
