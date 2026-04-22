"use client";

import { X } from "lucide-react";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {
    group: "Navegación",
    color: "#00BFA6",
    items: [
      { keys: ["Ctrl", "K"], desc: "Abrir buscador / Command Palette" },
      { keys: ["G", "D"], desc: "Ir al Dashboard" },
      { keys: ["G", "P"], desc: "Ir a Pacientes" },
      { keys: ["G", "A"], desc: "Ir a Agenda / Turnos" },
      { keys: ["G", "H"], desc: "Ir a Historia Clínica" },
      { keys: ["G", "F"], desc: "Ir a Facturación" },
    ],
  },
  {
    group: "Acciones rápidas",
    color: "#2563EB",
    items: [
      { keys: ["N", "C"], desc: "Nueva consulta / evolución" },
      { keys: ["N", "P"], desc: "Nuevo paciente" },
      { keys: ["N", "T"], desc: "Nuevo turno" },
      { keys: ["?"], desc: "Mostrar atajos de teclado" },
    ],
  },
  {
    group: "General",
    color: "#8B5CF6",
    items: [
      { keys: ["ESC"], desc: "Cerrar modal / panel activo" },
      { keys: ["↑", "↓"], desc: "Navegar en listas / paleta" },
      { keys: ["↵"], desc: "Confirmar selección" },
      { keys: ["Ctrl", "Z"], desc: "Deshacer (próximamente)" },
    ],
  },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd style={{
      background: "var(--slate-100)",
      color: "var(--slate-700)",
      border: "1px solid var(--slate-300)",
      borderBottom: "2px solid var(--slate-300)",
      borderRadius: 5,
      padding: "3px 8px",
      fontSize: 11,
      fontFamily: "system-ui",
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}>
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(11,29,53,0.55)", backdropFilter: "blur(4px)",
        zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.15s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: 18,
          width: "100%", maxWidth: 560,
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          animation: "slideUp 0.18s ease-out", overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>Atajos de teclado</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>Workflow keyboard-first para máxima velocidad</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", display: "flex" }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {SHORTCUTS.map(group => (
            <div key={group.group}>
              <div style={{ fontSize: 10, fontWeight: 700, color: group.color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                {group.group}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {group.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 7, background: "var(--slate-50)" }}>
                    <span style={{ fontSize: 13, color: "var(--slate-700)" }}>{item.desc}</span>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {item.keys.map((k, j) => (
                        <span key={j} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          {j > 0 && <span style={{ color: "var(--slate-400)", fontSize: 10 }}>+</span>}
                          <Kbd>{k}</Kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 24px", borderTop: "1px solid var(--slate-100)", background: "var(--slate-50)", fontSize: 11, color: "var(--slate-400)", textAlign: "center" }}>
          Presioná <Kbd>?</Kbd> en cualquier momento para ver esta pantalla · <Kbd>ESC</Kbd> para cerrar
        </div>
      </div>
    </div>
  );
}
