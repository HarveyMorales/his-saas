"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { inviteUser } from "@/app/actions/auth";

interface InviteUserModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

const ROLES = [
  { value: "MEDICO", label: "Médico" },
  { value: "RECEPCION", label: "Recepción" },
  { value: "FACTURACION", label: "Facturación" },
  { value: "TENANT_ADMIN", label: "Admin Institución" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid var(--slate-200)", fontSize: 13, color: "var(--navy)",
  outline: "none", background: "var(--slate-50)", boxSizing: "border-box",
};

export function InviteUserModal({ onClose, onSaved }: InviteUserModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    role: "MEDICO", specialty: "", licenseNum: "", phone: "",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const canSave = form.firstName && form.lastName && form.email && form.role;

  const handleSave = async () => {
    setSaving(true);
    const { error, tempPassword: pwd } = await inviteUser({
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      role: form.role,
      specialty: form.specialty || null,
      licenseNum: form.licenseNum || null,
      phone: form.phone || null,
    });
    setSaving(false);
    if (error) {
      toast({ type: "error", title: "Error al invitar", message: error });
    } else {
      setTempPassword(pwd ?? null);
      toast({ type: "success", title: "Usuario creado", message: `${form.lastName}, ${form.firstName}` });
      onSaved?.();
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(11,29,53,0.6)", backdropFilter: "blur(5px)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.15s ease-out" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: 18, width: "100%", maxWidth: 520, boxShadow: "0 30px 80px rgba(0,0,0,0.28)", animation: "slideUp 0.18s ease-out", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Invitar Usuario</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>Crear acceso al sistema para un nuevo colaborador</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", fontSize: 20 }}>×</button>
        </div>

        {tempPassword ? (
          <div style={{ padding: "24px" }}>
            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
                Usuario creado exitosamente
              </div>
              <div style={{ fontSize: 13, color: "var(--slate-600)", marginBottom: 16 }}>
                {form.firstName} {form.lastName} puede ingresar con:
              </div>
              <div style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)", fontFamily: "monospace" }}>{form.email}</div>
              </div>
              <div style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 }}>Contraseña temporal</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", fontFamily: "monospace", letterSpacing: 1 }}>{tempPassword}</div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(tempPassword); toast({ type: "success", title: "Copiado", message: "" }); }}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                  >
                    <Copy size={11} /> Copiar
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "var(--slate-400)", margin: 0 }}>
                Compartí estas credenciales de forma segura. El usuario deberá cambiar la contraseña en su primer ingreso.
              </p>
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
                    Apellido <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="García" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
                    Nombre <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Carlos" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
                  Email <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="dr.garcia@clinica.com" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
                    Rol <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>Teléfono</label>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="351-555-0101" style={inputStyle} />
                </div>
              </div>
              {form.role === "MEDICO" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>Especialidad</label>
                    <input value={form.specialty} onChange={e => set("specialty", e.target.value)} placeholder="Cardiología" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 }}>N° Matrícula</label>
                    <input value={form.licenseNum} onChange={e => set("licenseNum", e.target.value)} placeholder="MN 12345" style={inputStyle} />
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--slate-100)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 8, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave || saving}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", borderRadius: 8,
                  background: canSave && !saving ? "var(--teal)" : "var(--slate-200)",
                  color: canSave && !saving ? "white" : "var(--slate-400)",
                  border: "none", cursor: canSave && !saving ? "pointer" : "default",
                  fontSize: 13, fontWeight: 700,
                  boxShadow: canSave && !saving ? "0 4px 14px rgba(0,191,166,0.3)" : "none",
                }}
              >
                {saving ? "Creando..." : <><Check size={14} /> Crear usuario</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
