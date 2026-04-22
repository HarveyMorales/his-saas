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
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      setClock(`${hh}:${mm}`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      height: 56,
      background: "white",
      borderBottom: "1px solid var(--slate-200)",
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
        style={{ border: "none", background: "none", cursor: "pointer", padding: 6, borderRadius: 6, color: "var(--slate-400)", display: "flex" }}
      >
        <Menu size={18} />
      </button>

      {/* Command Palette trigger */}
      <button
        onClick={onOpenCommand}
        style={{
          flex: 1, maxWidth: 400,
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--slate-50)", border: "1px solid var(--slate-200)",
          borderRadius: 8, padding: "0 12px", height: 36,
          cursor: "pointer", textAlign: "left",
        }}
      >
        <Search size={14} color="var(--slate-400)" />
        <span style={{ fontSize: 13, color: "var(--slate-400)", flex: 1 }}>
          Buscar paciente, turno, módulo...
        </span>
        <kbd style={{
          background: "var(--slate-200)", color: "var(--slate-500)",
          border: "1px solid var(--slate-300)", borderRadius: 5,
          padding: "1px 6px", fontSize: 10, fontFamily: "system-ui", flexShrink: 0,
        }}>
          Ctrl K
        </kbd>
      </button>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {/* Live clock */}
        {clock && (
          <div style={{
            fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700,
            color: "var(--navy)", letterSpacing: 0.5, opacity: 0.7,
            minWidth: 40, textAlign: "center",
          }}>
            {clock}
          </div>
        )}

        {/* Notification bell */}
        <button
          onClick={onOpenNotifications}
          style={{
            position: "relative", border: "none", background: "none",
            cursor: "pointer", padding: 6, borderRadius: 6,
            color: "var(--slate-400)", display: "flex",
          }}
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span style={{
              position: "absolute", top: 3, right: 3,
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--red)", border: "2px solid white",
            }} />
          )}
        </button>

        {/* System status */}
        <div style={{
          padding: "4px 10px", borderRadius: 99,
          background: "rgba(16,185,129,0.1)", color: "var(--green)",
          fontSize: 10, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
          SISTEMA ACTIVO
        </div>

        {/* Institution badge */}
        {institution && (
          <div style={{
            padding: "4px 10px", borderRadius: 99,
            background: `${institution.color}18`, color: institution.color,
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
