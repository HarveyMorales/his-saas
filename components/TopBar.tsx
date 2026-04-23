"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Bell } from "lucide-react";
import type { Institution } from "@/lib/types";

interface TopBarProps {
  institution: Institution | null;
  onToggleSidebar: () => void;
  onOpenCommand: () => void;
  onOpenNotifications: () => void;
  notificationCount?: number;
}

export function TopBar({ institution, onToggleSidebar, onOpenCommand, onOpenNotifications, notificationCount = 3 }: TopBarProps) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      height: 56,
      background: "var(--glass-topbar)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.18)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 14,
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <button
        onClick={onToggleSidebar}
        style={{
          border: "none", background: "rgba(255,255,255,0.15)", cursor: "pointer",
          padding: 6, borderRadius: 8, color: "var(--navy)", display: "flex",
          backdropFilter: "blur(8px)", transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
      >
        <Menu size={18} />
      </button>

      {/* Command trigger */}
      <button
        onClick={onOpenCommand}
        style={{
          flex: 1, maxWidth: 420,
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.30)",
          borderRadius: "12px 8px 14px 10px / 10px 14px 8px 12px",
          padding: "0 14px", height: 36,
          cursor: "pointer", textAlign: "left",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.50)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.35)")}
      >
        <Search size={14} color="var(--slate-500)" />
        <span style={{ fontSize: 13, color: "var(--slate-500)", flex: 1 }}>
          Buscar paciente, turno, módulo...
        </span>
        <kbd style={{
          background: "rgba(255,255,255,0.50)",
          color: "var(--slate-600)",
          border: "1px solid rgba(255,255,255,0.40)",
          borderRadius: 5, padding: "1px 6px",
          fontSize: 10, fontFamily: "system-ui", flexShrink: 0,
        }}>
          Ctrl K
        </kbd>
      </button>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {clock && (
          <div style={{
            fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700,
            color: "var(--navy)", letterSpacing: 0.5, opacity: 0.75,
            minWidth: 40, textAlign: "center",
          }}>
            {clock}
          </div>
        )}

        <button
          onClick={onOpenNotifications}
          style={{
            position: "relative", border: "none",
            background: "rgba(255,255,255,0.20)",
            backdropFilter: "blur(8px)",
            cursor: "pointer", padding: 7, borderRadius: 10,
            color: "var(--navy)", display: "flex",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.38)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
        >
          <Bell size={17} />
          {notificationCount > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--red)", border: "2px solid rgba(255,255,255,0.8)",
            }} />
          )}
        </button>

        <div style={{
          padding: "5px 12px", borderRadius: 99,
          background: "rgba(16,185,129,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(16,185,129,0.25)",
          color: "var(--green)",
          fontSize: 10, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
          SISTEMA ACTIVO
        </div>

        {institution && (
          <div style={{
            padding: "5px 12px", borderRadius: 99,
            background: `${institution.color}20`,
            backdropFilter: "blur(8px)",
            border: `1px solid ${institution.color}30`,
            color: institution.color,
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span>{institution.icon}</span>
            <span>{institution.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
