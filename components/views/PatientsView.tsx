"use client";

import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { PATIENTS } from "@/lib/data";
import type { Patient } from "@/lib/types";

interface PatientsViewProps {
  onSelectPatient: (p: Patient) => void;
  onNewPatient?: () => void;
}

export function PatientsView({ onSelectPatient, onNewPatient }: PatientsViewProps) {
  const [search, setSearch] = useState("");

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.dni.includes(search) ||
    p.obra.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
            Pacientes
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>
            {PATIENTS.length} registros · {filtered.length} mostrados
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "white", color: "var(--slate-600)", border: "1px solid var(--slate-200)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <Filter size={14} /> Filtrar
          </button>
          <button
            onClick={onNewPatient}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
          >
            <Plus size={15} /> Nuevo paciente
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--slate-100)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--slate-50)", borderRadius: 8, border: "1px solid var(--slate-200)",
            padding: "0 12px", maxWidth: 400,
          }}>
            <Search size={14} color="var(--slate-400)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, DNI u obra social..."
              style={{ border: "none", background: "none", outline: "none", fontSize: 13, padding: "9px 0", width: "100%", color: "var(--slate-800)" }}
            />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--slate-50)" }}>
              {["Paciente", "DNI", "Edad / Sexo", "Obra Social", "Grupo", "Alerta", "Última visita", ""].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={i}
                className="tbl-row"
                style={{ borderBottom: "1px solid var(--slate-100)", cursor: "pointer" }}
                onClick={() => onSelectPatient(p)}
              >
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar
                      initials={(p.name[0] + (p.name.split(", ")[1]?.[0] ?? "")).toUpperCase()}
                      color={p.sex === "F" ? "#8B5CF6" : "#2563EB"}
                      size={30}
                    />
                    <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: 13 }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 14px", color: "var(--slate-600)", fontFamily: "monospace", fontSize: 12 }}>
                  {p.dni}
                </td>
                <td style={{ padding: "12px 14px", color: "var(--slate-600)" }}>
                  {p.age} años · {p.sex === "F" ? "♀" : "♂"}
                </td>
                <td style={{ padding: "12px 14px", color: "var(--slate-600)" }}>{p.obra}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{
                    background: "rgba(239,68,68,0.1)", color: "var(--red)",
                    fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 6,
                  }}>
                    {p.blood}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12 }}>
                  {p.alert ?? <span style={{ color: "var(--slate-300)" }}>—</span>}
                </td>
                <td style={{ padding: "12px 14px", color: "var(--slate-500)", fontSize: 12 }}>{p.lastVisit}</td>
                <td style={{ padding: "12px 14px" }}>
                  <button
                    onClick={e => { e.stopPropagation(); onSelectPatient(p); }}
                    style={{ padding: "4px 12px", borderRadius: 6, background: "rgba(0,191,166,0.1)", color: "var(--teal)", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                  >
                    Ver HC
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--slate-400)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div>Sin pacientes para "{search}"</div>
          </div>
        )}
      </div>
    </div>
  );
}
