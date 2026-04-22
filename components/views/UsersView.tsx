"use client";

import { Plus, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { INSTITUTIONS, USERS } from "@/lib/data";
import { useCurrentUser, useTenantUsers } from "@/lib/hooks/useSupabase";
import { toggleUserActive } from "@/app/actions/admin";
import { useToast } from "@/lib/toast-context";

const ROLE_LABELS: Record<string, string> = {
  MEDICO: "Médico",
  RECEPCION: "Recepción",
  FACTURACION: "Facturación",
  TENANT_ADMIN: "Admin Institución",
  SUPER_ADMIN: "Super Admin",
  ADMIN_IT: "Admin IT",
  ADMIN_INST: "Admin Institución",
};

const ROLE_COLORS: Record<string, string> = {
  MEDICO: "#00BFA6",
  RECEPCION: "#2563EB",
  FACTURACION: "#8B5CF6",
  TENANT_ADMIN: "#F59E0B",
  SUPER_ADMIN: "#EF4444",
};

export function UsersView() {
  const { toast } = useToast();
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;
  const { users: dbUsers, loading, refetch } = useTenantUsers(tenantId);

  const handleToggle = async (userId: string, currentActive: boolean) => {
    const { error } = await toggleUserActive(userId, !currentActive);
    if (error) {
      toast({ type: "error", title: "Error", message: error });
    } else {
      toast({ type: "success", title: !currentActive ? "Usuario activado" : "Usuario desactivado", message: "" });
      refetch();
    }
  };

  if (isLive) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
              Gestión de Usuarios
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 8 }}>
              RBAC — {loading ? "…" : `${dbUsers.length} usuarios`}
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>LIVE DB</span>
            </p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            <Plus size={15} /> Invitar usuario
          </button>
        </div>

        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>Cargando...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--slate-50)" }}>
                  {["Usuario", "Email", "Rol", "Especialidad", "Estado", ""].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dbUsers.map((u: any) => {
                  const color = ROLE_COLORS[u.role] ?? "#94A3B8";
                  return (
                    <tr key={u.id} className="tbl-row" style={{ borderBottom: "1px solid var(--slate-100)" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar
                            initials={`${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase()}
                            color={color}
                            size={30}
                          />
                          <span style={{ fontWeight: 700, color: "var(--navy)" }}>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--slate-500)", fontSize: 12 }}>{u.email}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: `${color}18`, color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--slate-500)", fontSize: 12 }}>{u.specialty ?? "—"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                          background: u.isActive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                          color: u.isActive ? "#059669" : "#DC2626",
                        }}>
                          {u.isActive ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          onClick={() => handleToggle(u.id, u.isActive)}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700 }}
                        >
                          {u.isActive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                          {u.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Mock fallback
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
                    <span style={{ background: `${inst.color}18`, color: inst.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
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
