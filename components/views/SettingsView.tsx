"use client";

import { ThemePickerInline } from "@/components/ThemeSelector";

export function SettingsView() {
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "Georgia, serif", color: "var(--slate-800)" }}>
          Configuración
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--slate-500)" }}>
          Preferencias de la aplicación
        </p>
      </div>

      <div style={{
        background: "white", borderRadius: 12, padding: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid var(--slate-200)",
      }}>
        <ThemePickerInline />
      </div>
    </div>
  );
}
