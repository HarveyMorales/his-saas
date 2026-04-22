"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Building2, ClipboardList, Settings, LogOut,
  UserPlus, Edit2, ToggleLeft, ToggleRight, Check, X, Activity,
  Database, Shield, Clock, Server, AlertTriangle, Eye, Share2, Edit3,
  Wifi, HardDrive, Save, RefreshCw,
} from "lucide-react";
import { LOGIN_USERS, INSTITUTIONS, PATIENTS, RECORDS, AUDIT_LOG } from "@/lib/data";
import { useToast } from "@/lib/toast-context";
import type { LoginUser } from "@/lib/types";
import { getSystemStats, getAllUsers, getAllTenants, toggleUserActive } from "@/app/actions/admin";

type AdminTab = "dashboard" | "usuarios" | "instituciones" | "auditoria" | "configuracion";

interface AdminViewProps {
  currentUser: LoginUser | null;
  onLogout: () => void;
}

const ROLE_CFG: Record<LoginUser["role"], { label: string; color: string; bg: string }> = {
  MEDICO:      { label: "Médico",       color: "#00BFA6", bg: "rgba(0,191,166,0.12)" },
  RECEPCION:   { label: "Recepción",    color: "#2563EB", bg: "rgba(37,99,235,0.12)" },
  FACTURACION: { label: "Facturación",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  ADMIN_INST:  { label: "Admin Inst.",  color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  ADMIN_IT:    { label: "IT Admin",     color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};

function RoleBadge({ role }: { role: LoginUser["role"] }) {
  const cfg = ROLE_CFG[role];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

const INST_TYPE_LABELS = {
  CONSULTORIO: { label: "Consultorio", icon: "🩺" },
  CLINICA:     { label: "Clínica",     icon: "🏥" },
  HOSPITAL:    { label: "Hospital",    icon: "🏨" },
};

// ─── Dashboard tab ─────────────────────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState({ tenants: 0, users: 0, patients: 0, records: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    getSystemStats()
      .then(s => { setStats(s); setStatsLoading(false); })
      .catch(() => setStatsLoading(false));
  }, []);

  const KPIS = [
    { label: "Instituciones activas", value: statsLoading ? "…" : stats.tenants, icon: <Building2 size={18} />, color: "#00BFA6" },
    { label: "Usuarios registrados", value: statsLoading ? "…" : stats.users, icon: <Users size={18} />, color: "#2563EB" },
    { label: "Pacientes en sistema", value: statsLoading ? "…" : stats.patients, icon: <Activity size={18} />, color: "#8B5CF6" },
    { label: "Registros de HC", value: statsLoading ? "…" : stats.records, icon: <Database size={18} />, color: "#F59E0B" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>
          Panel de Administración Global
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--slate-500)" }}>
          Vista de sistema completo · {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {KPIS.map((k, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 14, padding: "20px 22px",
            border: "1px solid var(--slate-200)", borderTop: `3px solid ${k.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--slate-500)", textTransform: "uppercase", letterSpacing: 0.8 }}>{k.label}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 700, color: "var(--navy)", marginTop: 4, letterSpacing: -1 }}>{k.value}</div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: k.color }}>
                {k.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health + Institutions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* System health */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--slate-100)" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Estado del sistema</div>
          </div>
          <div style={{ padding: "8px 0" }}>
            {[
              { label: "API Gateway", status: "OK", latency: "42ms", color: "#10B981" },
              { label: "Base de datos PostgreSQL", status: "OK", latency: "8ms", color: "#10B981" },
              { label: "Storage S3", status: "OK", latency: "120ms", color: "#10B981" },
              { label: "Backup Service", status: "OK", latency: "—", color: "#10B981" },
              { label: "Email (SMTP)", status: "WARN", latency: "—", color: "#F59E0B" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: i < 4 ? "1px solid var(--slate-50)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                  <span style={{ fontSize: 13, color: "var(--slate-700)", fontWeight: 500 }}>{s.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {s.latency !== "—" && <span style={{ fontSize: 11, color: "var(--slate-400)", fontFamily: "monospace" }}>{s.latency}</span>}
                  <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutions */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--slate-100)" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Instituciones</div>
          </div>
          <div style={{ padding: "8px 0" }}>
            {INSTITUTIONS.map((inst, i) => {
              const userCount = Object.values(LOGIN_USERS).filter(u => u.institution === inst.id).length;
              const patientCount = PATIENTS.filter(p => p.institution === inst.id).length;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < INSTITUTIONS.length - 1 ? "1px solid var(--slate-50)" : "none" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${inst.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {inst.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{inst.name}</div>
                    <div style={{ fontSize: 11, color: "var(--slate-500)", marginTop: 2 }}>
                      {INST_TYPE_LABELS[inst.type].label} · {userCount} usuarios · {patientCount} pacientes
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--slate-100)" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Actividad reciente del sistema</div>
        </div>
        <div>
          {AUDIT_LOG.slice(0, 5).map((log, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "12px 20px", borderBottom: i < 4 ? "1px solid var(--slate-50)" : "none", alignItems: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", flexShrink: 0 }}>
                {log.action.includes("VIEW") ? <Eye size={14} /> : log.action.includes("SHARE") ? <Share2 size={14} /> : <Edit3 size={14} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{log.user}</span>
                <span style={{ fontSize: 12, color: "var(--slate-500)", marginLeft: 8 }}>{log.resource}</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--slate-400)", fontFamily: "monospace", flexShrink: 0 }}>{log.time} · {log.ip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Users tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllUsers().then(({ data }) => {
      if (data) setUsers(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = async (u: any) => {
    const { error } = await toggleUserActive(u.id, !u.isActive);
    if (error) { toast({ type: "error", title: "Error", message: error }); return; }
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: !u.isActive } : x));
    toast({ type: u.isActive ? "warning" : "success", title: u.isActive ? "Usuario desactivado" : "Usuario activado", message: `${u.firstName} ${u.lastName}` });
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>Gestión de Usuarios</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>{users.length} usuarios en el sistema</p>
        </div>
        <button
          onClick={() => toast({ type: "info", title: "Próximamente", message: "Formulario de nuevo usuario en desarrollo" })}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
        >
          <UserPlus size={15} /> Nuevo usuario
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--slate-100)" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            style={{ width: 280, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--slate-200)", fontSize: 13, outline: "none", background: "var(--slate-50)", color: "var(--navy)" }}
          />
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>Cargando usuarios...</div>
        ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--slate-50)" }}>
              {["Usuario", "Email", "Rol", "Institución", "Estado", "Acciones"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const initials = `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`;
              const roleCfg = ROLE_CFG[u.role as LoginUser["role"]] ?? { color: "#64748B", bg: "rgba(100,116,139,0.1)" };
              return (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--slate-100)" : "none", opacity: u.isActive ? 1 : 0.45 }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: `${roleCfg.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: roleCfg.color }}>
                        {initials}
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--navy)" }}>{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--slate-600)" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: roleCfg.bg, color: roleCfg.color }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--slate-500)" }}>
                    {u.tenants?.name ?? <span style={{ color: "var(--slate-300)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: u.isActive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: u.isActive ? "#059669" : "#DC2626" }}>
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => toast({ type: "info", title: "Próximamente", message: "Modal de edición en desarrollo" })}
                        style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--slate-200)", background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "var(--slate-600)", display: "flex", alignItems: "center", gap: 4 }}
                      ><Edit2 size={11} /> Editar</button>
                      <button
                        onClick={() => toggle(u)}
                        style={{ padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, background: u.isActive ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", color: u.isActive ? "#DC2626" : "#059669" }}
                      >
                        {u.isActive ? <><ToggleRight size={12} /> Desactivar</> : <><ToggleLeft size={12} /> Activar</>}
                      </button>
                    </div>
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

// ─── Institutions tab ───────────────────────────────────────────────────────────
function InstitutionsTab() {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTenants().then(({ data }) => {
      if (data) setTenants(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const TYPE_ICONS: Record<string, string> = { CONSULTORIO: "🩺", CLINICA: "🏥", SANATORIO: "🏨", HOSPITAL: "🏨" };
  const TYPE_COLORS: Record<string, string> = { CONSULTORIO: "#00BFA6", CLINICA: "#2563EB", SANATORIO: "#8B5CF6", HOSPITAL: "#EF4444" };
  const STATUS_COLORS: Record<string, string> = { ACTIVE: "#10B981", TRIAL: "#F59E0B", SUSPENDED: "#EF4444", CANCELLED: "#6B7280" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>Instituciones</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>{tenants.length} instituciones en el sistema</p>
        </div>
        <button
          onClick={() => toast({ type: "info", title: "Próximamente", message: "Alta de nueva institución en desarrollo" })}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
        ><Building2 size={15} /> Nueva institución</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--slate-400)", fontSize: 13 }}>Cargando instituciones...</div>
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {tenants.map(inst => {
          const color = inst.primaryColor ?? TYPE_COLORS[inst.type] ?? "#00BFA6";
          const icon = TYPE_ICONS[inst.type] ?? "🏥";
          const statusColor = STATUS_COLORS[inst.status] ?? "#6B7280";
          return (
            <div key={inst.id} style={{ background: "white", borderRadius: 16, border: "1px solid var(--slate-200)", overflow: "hidden", borderTop: `4px solid ${color}` }}>
              <div style={{ padding: "22px 22px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{inst.name}</div>
                    <div style={{ fontSize: 11, color: "var(--slate-500)", marginTop: 3 }}>
                      {inst.type} · slug: {inst.slug}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, boxShadow: `0 0 5px ${statusColor}` }} />
                  <span style={{ fontSize: 12, color: "var(--slate-500)", fontWeight: 600 }}>{inst.status}</span>
                  {inst.city && <span style={{ fontSize: 11, color: "var(--slate-400)", marginLeft: "auto" }}>📍 {inst.city}</span>}
                </div>

                <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--slate-400)", padding: "6px 8px", background: "var(--slate-50)", borderRadius: 6 }}>
                  {inst.id}
                </div>
              </div>
              <div style={{ padding: "12px 22px", borderTop: "1px solid var(--slate-100)", display: "flex", gap: 8 }}>
                <button
                  onClick={() => toast({ type: "info", title: "Editar", message: inst.name })}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 7, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                ><Edit2 size={12} /> Editar</button>
                <button
                  onClick={() => toast({ type: "info", title: "Configurar", message: `Módulos de ${inst.name}` })}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 7, background: `${color}18`, color: color, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                ><Settings size={12} /> Configurar</button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

// ─── Audit tab ──────────────────────────────────────────────────────────────────
function AuditTab() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>Log de Auditoría Global</h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>Todas las acciones registradas en el sistema</p>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--slate-100)", display: "flex", gap: 8 }}>
          {["Todas", "Registros HC", "Usuarios", "Facturación", "Sistema"].map((f, i) => (
            <button key={f} style={{
              padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
              background: i === 0 ? "var(--navy)" : "var(--slate-100)",
              color: i === 0 ? "white" : "var(--slate-500)",
            }}>{f}</button>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--slate-50)" }}>
              {["Hora", "Usuario", "Acción", "Recurso", "IP"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.7, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AUDIT_LOG.map((log, i) => (
              <tr key={log.id} style={{ borderBottom: i < AUDIT_LOG.length - 1 ? "1px solid var(--slate-100)" : "none" }}>
                <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--navy)", fontSize: 12 }}>{log.time}</td>
                <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--slate-800)" }}>{log.user}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: log.action.includes("VIEW") ? "rgba(37,99,235,0.1)" : log.action.includes("WRITE") || log.action.includes("CREATE") ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                    color: log.action.includes("VIEW") ? "#1D4ED8" : log.action.includes("WRITE") || log.action.includes("CREATE") ? "#059669" : "#92400E",
                    fontFamily: "monospace",
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: "11px 16px", color: "var(--slate-600)", fontSize: 12 }}>{log.resource}</td>
                <td style={{ padding: "11px 16px", fontFamily: "monospace", fontSize: 11, color: "var(--slate-400)" }}>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Config tab ─────────────────────────────────────────────────────────────────
function ConfigTab() {
  const { toast } = useToast();
  const [backup, setBackup] = useState("04:00");
  const [sessionTimeout, setSessionTimeout] = useState("480");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const save = () => toast({ type: "success", title: "Configuración guardada", message: "Los cambios serán aplicados en el próximo deploy" });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>Configuración del Sistema</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>Parámetros globales · Cambios requieren aprobación</p>
        </div>
        <button
          onClick={save}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
        >
          <Save size={14} /> Guardar cambios
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Backup */}
        <ConfigSection title="Backup y Recuperación" icon={<HardDrive size={16} />} color="#2563EB">
          <ConfigField label="Hora de backup automático">
            <input type="time" value={backup} onChange={e => setBackup(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-200)", fontSize: 13, color: "var(--navy)", background: "var(--slate-50)", outline: "none" }} />
          </ConfigField>
          <ConfigField label="Retención de backups">
            <select style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-200)", fontSize: 13, color: "var(--navy)", background: "var(--slate-50)", outline: "none" }}>
              <option>30 días</option>
              <option>60 días</option>
              <option>90 días</option>
            </select>
          </ConfigField>
          <button onClick={() => toast({ type: "info", title: "Backup manual iniciado", message: "El proceso puede tardar varios minutos" })}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--blue)", background: "rgba(37,99,235,0.08)", color: "var(--blue)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            Ejecutar backup ahora
          </button>
        </ConfigSection>

        {/* Security */}
        <ConfigSection title="Seguridad" icon={<Shield size={16} />} color="#8B5CF6">
          <ConfigField label="Timeout de sesión (min)">
            <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
              style={{ width: 100, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-200)", fontSize: 13, color: "var(--navy)", background: "var(--slate-50)", outline: "none" }} />
          </ConfigField>
          <ToggleField label="Autenticación MFA" value={mfaEnabled} onChange={setMfaEnabled} color="#8B5CF6" />
          <ToggleField label="Auditoría de accesos" value={auditEnabled} onChange={setAuditEnabled} color="#8B5CF6" />
        </ConfigSection>

        {/* Notifications */}
        <ConfigSection title="Notificaciones" icon={<Wifi size={16} />} color="#00BFA6">
          <ConfigField label="Email SMTP servidor">
            <input defaultValue="smtp.his-saas.com" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-200)", fontSize: 13, color: "var(--navy)", background: "var(--slate-50)", outline: "none", boxSizing: "border-box" }} />
          </ConfigField>
          <ConfigField label="Email remitente">
            <input defaultValue="noreply@his-saas.com" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-200)", fontSize: 13, color: "var(--navy)", background: "var(--slate-50)", outline: "none", boxSizing: "border-box" }} />
          </ConfigField>
        </ConfigSection>

        {/* Maintenance */}
        <ConfigSection title="Mantenimiento" icon={<Server size={16} />} color="#F59E0B">
          <ToggleField label="Modo mantenimiento" value={maintenanceMode} onChange={(v) => { setMaintenanceMode(v); toast({ type: v ? "warning" : "success", title: v ? "Modo mantenimiento activado" : "Sistema en línea", message: v ? "Los usuarios verán una página de mantenimiento" : "El sistema volvió al modo normal" }); }} color="#F59E0B" />
          <ConfigField label="Versión del sistema">
            <span style={{ fontSize: 13, color: "var(--slate-500)", fontFamily: "monospace" }}>v1.0.0-sprint0</span>
          </ConfigField>
          <ConfigField label="Última actualización">
            <span style={{ fontSize: 13, color: "var(--slate-500)" }}>{new Date().toLocaleDateString("es-AR")}</span>
          </ConfigField>
          <button onClick={() => toast({ type: "info", title: "Limpieza de caché", message: "Caché del sistema limpiada exitosamente" })}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--amber)", background: "rgba(245,158,11,0.08)", color: "var(--amber)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            Limpiar caché
          </button>
        </ConfigSection>
      </div>
    </div>
  );
}

function ConfigSection({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{title}</span>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function ConfigField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 13, color: "var(--slate-600)", fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}

function ToggleField({ label, value, onChange, color }: { label: string; value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "var(--slate-600)", fontWeight: 500 }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
          background: value ? color : "var(--slate-200)",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
          background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          left: value ? 23 : 3, transition: "left 0.2s",
        }} />
      </button>
    </div>
  );
}

// ─── Admin Sidebar ──────────────────────────────────────────────────────────────
const ADMIN_NAV: { id: AdminTab; icon: React.ReactNode; label: string }[] = [
  { id: "dashboard",     icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  { id: "usuarios",      icon: <Users size={16} />,           label: "Usuarios" },
  { id: "instituciones", icon: <Building2 size={16} />,       label: "Instituciones" },
  { id: "auditoria",     icon: <ClipboardList size={16} />,   label: "Auditoría" },
  { id: "configuracion", icon: <Settings size={16} />,        label: "Configuración" },
];

// ─── Main AdminView ─────────────────────────────────────────────────────────────
export function AdminView({ currentUser, onLogout }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: 220, background: "var(--navy)", display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #EF4444, #DC2626)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              🔧
            </div>
            <div>
              <div style={{ color: "white", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 15, letterSpacing: -0.5 }}>HIS Admin</div>
              <div style={{ color: "#EF4444", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Panel Global IT</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {ADMIN_NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 8, border: "none",
                cursor: "pointer", fontSize: 13,
                background: activeTab === item.id ? "rgba(239,68,68,0.15)" : "transparent",
                color: activeTab === item.id ? "#FCA5A5" : "var(--slate-500)",
                fontWeight: activeTab === item.id ? 700 : 400,
                borderLeft: activeTab === item.id ? "3px solid #EF4444" : "3px solid transparent",
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Current user + logout */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(239,68,68,0.2)", border: "1.5px solid rgba(239,68,68,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#EF4444", flexShrink: 0 }}>
              {currentUser?.avatar ?? "SA"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "white", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser?.name ?? "Super Admin"}</div>
              <div style={{ fontSize: 10, color: "var(--slate-500)" }}>IT Admin · Global</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{ width: "100%", padding: "11px 14px", background: "rgba(239,68,68,0.08)", border: "none", borderTop: "1px solid rgba(239,68,68,0.15)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#FCA5A5", fontSize: 12, fontWeight: 600 }}
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#F8FAFC" }}>
        {/* TopBar */}
        <div style={{
          height: 52, background: "white", borderBottom: "1px solid var(--slate-200)",
          display: "flex", alignItems: "center", padding: "0 24px",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ fontSize: 12, color: "var(--slate-500)" }}>
            <span style={{ color: "#EF4444", fontWeight: 700 }}>ADMIN_IT</span>
            {" · "}Panel de administración global
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: "#10B981" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
              SISTEMA ACTIVO
            </div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "var(--navy)", opacity: 0.6 }}>
              {new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        <main style={{ flex: 1, padding: 24, overflow: "auto" }}>
          {activeTab === "dashboard"     && <DashboardTab />}
          {activeTab === "usuarios"      && <UsersTab />}
          {activeTab === "instituciones" && <InstitutionsTab />}
          {activeTab === "auditoria"     && <AuditTab />}
          {activeTab === "configuracion" && <ConfigTab />}
        </main>
      </div>
    </div>
  );
}
