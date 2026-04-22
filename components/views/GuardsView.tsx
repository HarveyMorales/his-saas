"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GUARDS } from "@/lib/data";

export function GuardsView() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
            Guardias Médicas
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>
            {GUARDS.filter(g => g.status === "ACTIVA").length} activas · {GUARDS.filter(g => g.status === "PROGRAMADA").length} programadas
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> Asignar guardia
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {GUARDS.map((g, i) => {
          const borderColor = g.status === "ACTIVA" ? "#10B981" : g.status === "POR TERMINAR" ? "#F59E0B" : "#94A3B8";
          return (
            <div key={i} style={{
              background: "white", borderRadius: 14, padding: 22,
              border: "1px solid var(--slate-200)",
              borderTop: `3px solid ${borderColor}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>{g.doctor}</div>
                  <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 3 }}>{g.specialty}</div>
                </div>
                <Badge status={g.status} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { label: "Inicio", value: g.from },
                  { label: "Fin", value: g.to },
                  { label: "Pacientes", value: String(g.patients) },
                ].map((s, j) => (
                  <div key={j} style={{ background: "var(--slate-50)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "var(--slate-400)", letterSpacing: 0.8, textTransform: "uppercase" }}>{s.label}</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)", marginTop: 2 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
