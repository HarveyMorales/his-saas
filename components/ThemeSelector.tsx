"use client";

import { useState } from "react";
import { THEMES, type ThemeId, useTheme } from "@/lib/theme-context";
import { CheckCircle } from "lucide-react";

interface ThemeSelectorProps {
  onDone: () => void;
}

function ThemePreview({ t, selected }: { t: typeof THEMES[ThemeId]; selected: boolean }) {
  return (
    <div style={{
      borderRadius: 16,
      overflow: "hidden",
      border: selected ? `2px solid ${t.preview.accent}` : "2px solid rgba(255,255,255,0.1)",
      boxShadow: selected ? `0 0 0 3px ${t.preview.accent}30, 0 12px 40px rgba(0,0,0,0.3)` : "0 4px 20px rgba(0,0,0,0.2)",
      transform: selected ? "scale(1.03)" : "scale(1)",
      transition: "all 0.2s ease",
      cursor: "pointer",
      background: t.preview.bg,
      width: "100%",
      aspectRatio: "4/3",
      position: "relative",
    }}>
      {/* Mini sidebar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "28%",
        background: t.preview.sidebar,
        display: "flex", flexDirection: "column", padding: "10px 8px", gap: 6,
      }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, background: t.preview.accent, marginBottom: 6 }} />
        {[80, 65, 75, 55, 70].map((w, i) => (
          <div key={i} style={{
            height: 5, borderRadius: 3,
            background: i === 0 ? t.preview.accent : "rgba(255,255,255,0.15)",
            width: `${w}%`,
          }} />
        ))}
      </div>

      {/* Content area */}
      <div style={{ position: "absolute", left: "30%", right: 0, top: 0, bottom: 0, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 7 }}>
        {/* Top bar */}
        <div style={{ height: 8, background: t.preview.text + "18", borderRadius: 4, width: "50%" }} />

        {/* Stats row */}
        <div style={{ display: "flex", gap: 6 }}>
          {[t.preview.accent, t.preview.text + "30", t.preview.text + "20"].map((bg, i) => (
            <div key={i} style={{ flex: 1, height: 22, borderRadius: 6, background: i === 0 ? bg + "25" : bg, borderTop: i === 0 ? `3px solid ${t.preview.accent}` : `3px solid ${t.preview.text}30` }} />
          ))}
        </div>

        {/* Table rows */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: t.preview.accent + (i === 1 ? "AA" : "44") }} />
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: t.preview.text + "18" }} />
            <div style={{ width: 22, height: 5, borderRadius: 3, background: t.preview.accent + "55" }} />
          </div>
        ))}

        {/* Bottom chart suggestion */}
        <div style={{ marginTop: "auto", display: "flex", gap: 3, alignItems: "flex-end", height: 24 }}>
          {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: "3px 3px 0 0",
              background: i === 5 ? t.preview.accent : t.preview.accent + "35",
              height: `${h}%`,
            }} />
          ))}
        </div>
      </div>

      {selected && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: t.preview.accent, borderRadius: "50%",
          width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckCircle size={14} color="white" />
        </div>
      )}
    </div>
  );
}

export function ThemeSelector({ onDone }: ThemeSelectorProps) {
  const { theme, setTheme, confirmTheme } = useTheme();
  const [hovered, setHovered] = useState<ThemeId | null>(null);

  const handleConfirm = () => {
    confirmTheme();
    onDone();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(135deg, #0A1628 0%, #0D2137 50%, #0A1628 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      backdropFilter: "blur(0)",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(0,191,166,0.06) 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 30%, rgba(37,99,235,0.06) 0%, transparent 50%)`,
      }} />

      <div style={{ width: "100%", maxWidth: 860, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
          <h1 style={{
            margin: 0, color: "white",
            fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, letterSpacing: -0.5,
          }}>
            Elegí tu estilo de trabajo
          </h1>
          <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Podés cambiarlo en cualquier momento desde Configuración
          </p>
        </div>

        {/* Theme cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 36 }}>
          {(Object.values(THEMES) as typeof THEMES[ThemeId][]).map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <ThemePreview t={t} selected={isSelected} />

                <div style={{ marginTop: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{t.emoji}</div>
                  <div style={{
                    fontSize: 15, fontWeight: 700,
                    color: isSelected ? t.preview.accent : "white",
                    fontFamily: "Georgia, serif",
                    transition: "color 0.15s",
                  }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                    {t.tagline}
                  </div>

                  {/* Color dots */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                    {[t.preview.sidebar, t.preview.accent, t.preview.bg].map((c, i) => (
                      <div key={i} style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: c,
                        border: "1.5px solid rgba(255,255,255,0.2)",
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleConfirm}
            style={{
              padding: "13px 48px",
              borderRadius: 10,
              background: THEMES[theme].preview.accent,
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              letterSpacing: 0.3,
              boxShadow: `0 4px 20px ${THEMES[theme].preview.accent}60`,
              transition: "all 0.2s",
            }}
          >
            Continuar con {THEMES[theme].name} →
          </button>
          <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            Esta preferencia se guarda en tu navegador
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThemePickerInline() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--slate-700)", marginBottom: 14 }}>
        Tema visual
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {(Object.values(THEMES) as typeof THEMES[ThemeId][]).map((t) => {
          const isSelected = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                border: isSelected ? `2px solid ${t.preview.accent}` : "2px solid var(--slate-200)",
                borderRadius: 12, padding: "12px 10px",
                background: isSelected ? t.preview.accent + "10" : "white",
                cursor: "pointer", textAlign: "center",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{t.emoji}</div>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: isSelected ? t.preview.accent : "var(--slate-700)",
              }}>
                {t.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--slate-400)", marginTop: 2 }}>
                {t.tagline}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
                {[t.preview.sidebar, t.preview.accent, t.preview.bg].map((c, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, border: "1px solid var(--slate-200)" }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
