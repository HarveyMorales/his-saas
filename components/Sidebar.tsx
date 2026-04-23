"use client";

import { LayoutDashboard, Users, FileText, Calendar, Shield, Receipt, Share2, UserCog, ClipboardList, Stethoscope, BarChart2 } from "lucide-react";
import type { Institution, NavId, LoginUser } from "@/lib/types";

const NAV_ITEMS: { id: NavId; icon: React.ReactNode; label: string; badge?: number }[] = [
  { id: "dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  { id: "patients", icon: <Users size={16} />, label: "Pacientes" },
  { id: "records", icon: <FileText size={16} />, label: "Historia Clínica" },
  { id: "appointments", icon: <Calendar size={16} />, label: "Agenda / Turnos" },
  { id: "guards", icon: <Shield size={16} />, label: "Guardias" },
  { id: "insurance", icon: <ClipboardList size={16} />, label: "Obras Sociales" },
  { id: "billing", icon: <Receipt size={16} />, label: "Facturación" },
  { id: "sharing", icon: <Share2 size={16} />, label: "Compartir HC", badge: 1 },
  { id: "users", icon: <UserCog size={16} />, label: "Usuarios / RBAC" },
  { id: "audit", icon: <Stethoscope size={16} />, label: "Auditoría" },
  { id: "reportes", icon: <BarChart2 size={16} />, label: "Reportes" },
];

interface SidebarProps {
  open: boolean;
  activeNav: NavId;
  institution: Institution | null;
  currentUser?: LoginUser | null;
  onNav: (id: NavId) => void;
  onChangeInstitution: () => void;
  onLogout?: () => void;
}

export function Sidebar({ open, activeNav, institution, currentUser, onNav, onChangeInstitution, onLogout }: SidebarProps) {
  return (
    <aside style={{
      width: open ? 224 : 60,
      minHeight: "100vh",
      background: "var(--navy)",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg, #00BFA6, #2563EB)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>
            🏥
          </div>
          {open && (
            <div>
              <div style={{ color: "white", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 17, letterSpacing: -0.5 }}>HIS SaaS</div>
              <div style={{ color: "var(--teal)", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>v1.0 · Sprint 0</div>
            </div>
          )}
        </div>
      </div>

      {/* Institution */}
      {open && institution && (
        <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={onChangeInstitution}
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)",
              border: "none",
              borderLeft: `3px solid ${institution.color}`,
              borderRadius: 8, padding: "8px 10px",
              cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ fontSize: 9, color: "var(--slate-500)", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>
              Institución activa
            </div>
            <div style={{ fontSize: 12, color: "white", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
              <span>{institution.icon}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {institution.name}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className="nav-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: open ? "9px 10px" : "9px 0",
              justifyContent: open ? "flex-start" : "center",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: activeNav === item.id ? "rgba(0,191,166,0.13)" : "transparent",
              color: activeNav === item.id ? "var(--teal)" : "var(--slate-500)",
              fontWeight: activeNav === item.id ? 700 : 400,
              fontSize: 13,
              width: "100%",
              borderLeft: activeNav === item.id ? "3px solid var(--teal)" : "3px solid transparent",
              transition: "none",
            }}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {open && (
              <>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, textAlign: "left" }}>
                  {item.label}
                </span>
                {item.badge ? (
                  <span style={{
                    background: "var(--amber)",
                    color: "white",
                    fontSize: 9,
                    fontWeight: 700,
                    borderRadius: 99,
                    padding: "1px 6px",
                    flexShrink: 0,
                  }}>
                    {item.badge}
                  </span>
                ) : null}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{
        padding: "12px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: "rgba(0,191,166,0.2)",
          border: "1.5px solid rgba(0,191,166,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 11, color: "var(--teal)",
        }}>HS</div>
        {open && currentUser && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 12, color: "white", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: 10, color: "var(--slate-500)" }}>
              {currentUser.role} {currentUser.institutionName ? `· ${currentUser.institutionName}` : ""}
            </div>
          </div>
        )}
        {open && onLogout && (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--slate-600)", padding: 4, borderRadius: 6,
              display: "flex", alignItems: "center",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--slate-600)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
