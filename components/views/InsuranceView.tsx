"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { INSURANCE, NOMENCLATURES } from "@/lib/data";
import type { InsuranceCompany } from "@/lib/types";

export function InsuranceView() {
  const [selected, setSelected] = useState<InsuranceCompany | null>(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>Obras Sociales</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>
            {INSURANCE.filter(o => o.active).length} activas · {INSURANCE.filter(o => !o.active).length} inactivas
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> Agregar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* List */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--slate-100)" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Obras sociales registradas</div>
          </div>
          {INSURANCE.map((os, i) => (
            <div
              key={i}
              onClick={() => setSelected(os)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                borderBottom: "1px solid var(--slate-100)",
                cursor: "pointer",
                background: selected?.id === os.id ? "rgba(0,191,166,0.05)" : "transparent",
                borderLeft: selected?.id === os.id ? "3px solid var(--teal)" : "3px solid transparent",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: os.active ? "rgba(0,191,166,0.1)" : "var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                🏥
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--navy)" }}>{os.name}</div>
                <div style={{ fontSize: 11, color: "var(--slate-500)" }}>Cód. {os.code} · {os.nomenclatures} nomencladores</div>
              </div>
              <span style={{
                background: os.active ? "rgba(16,185,129,0.1)" : "var(--slate-100)",
                color: os.active ? "var(--green)" : "var(--slate-500)",
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
              }}>
                {os.active ? "ACTIVA" : "INACTIVA"}
              </span>
            </div>
          ))}
        </div>

        {/* Nomenclature */}
        <div>
          {selected ? (
            <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--slate-100)" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>
                  Nomenclador — {selected.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>
                  {selected.nomenclatures} prácticas
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--slate-50)" }}>
                    {["Código", "Descripción", "Valor"].map(h => (
                      <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NOMENCLATURES.filter(n => n.obra === selected.name).map((n, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--slate-100)" }}>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "var(--blue)", fontWeight: 700 }}>{n.code}</td>
                      <td style={{ padding: "10px 14px", color: "var(--slate-700)" }}>{n.description}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--navy)" }}>${n.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {NOMENCLATURES.filter(n => n.obra === selected.name).length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "var(--slate-400)" }}>
                  Sin nomencladores cargados para {selected.name}
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "white", borderRadius: 14, padding: 48, textAlign: "center", color: "var(--slate-400)", border: "1px solid var(--slate-200)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
              <div style={{ fontSize: 14 }}>Seleccioná una obra social para ver su nomenclador</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
