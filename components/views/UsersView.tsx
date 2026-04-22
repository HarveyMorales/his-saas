"use client";

import { Plus, Edit2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { INSTITUTIONS, USERS } from "@/lib/data";

const ROLE_LABELS: Record<string, string> = {
  MEDICO: "Médico",
  RECEPCION: "Recepción",
  FACTURACION: "Facturación",
  ADMIN_IT: "Admin IT",
  ADMIN_INST: "Admin Institución",
};

export function UsersView() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
            Gestión de Usuarios
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>
            RBAC — Roles y permisos por institución
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> Invitar usuario
        </button>
      </div>

      {INSTITUTIONS.map((inst, ii) => (
        <div key={ii} style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${inst.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {inst.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: 14 }}>{inst.name}</div>
              <div style={{ fontSize: 11, color: "var(--slate-500)" }}>{inst.type} · Tenant: {inst.tenant}</div>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--slate-50)" }}>
                {["Usuario", "Rol", "Permisos", ""].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(USERS[inst.id] ?? []).map((u, i) => (
                <tr key={i} className="tbl-row" style={{ borderBottom: "1px solid var(--slate-100)" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar initials={u.avatar} color={inst.color} size={28} />
                      <span style={{ fontWeight: 600, color: "var(--navy)" }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{
                      background: `${inst.color}18`,
                      color: inst.color,
                      fontSize: 10, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 99,
                    }}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {u.perms.map((p, j) => (
                        <span key={j} style={{ background: "var(--slate-100)", color: "var(--slate-600)", fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 5, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
                      <Edit2 size={10} /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
