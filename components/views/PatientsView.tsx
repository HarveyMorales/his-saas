"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Plus, Filter, RefreshCw } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useCurrentUser, usePatients } from "@/lib/hooks/useSupabase";
import { PATIENTS } from "@/lib/data";
import type { Patient } from "@/lib/types";

interface PatientsViewProps {
  onSelectPatient: (p: Patient) => void;
  onNewPatient?: () => void;
  refreshKey?: number;
}

// Maps Supabase patient row → mock Patient type for compatibility
function toMockPatient(p: any): Patient {
  const birthYear = p.birthDate ? new Date(p.birthDate).getFullYear() : null;
  const age = birthYear ? new Date().getFullYear() - birthYear : null;
  return {
    id: p.id,
    dni: p.dni,
    name: `${p.lastName}, ${p.firstName}`,
    age: age ?? 0,
    sex: (p.sex as "M" | "F") ?? "M",
    obra: "Sin obra social",
    blood: p.bloodType ?? "—",
    phone: p.phone ?? "",
    email: p.email ?? "",
    alert: p.allergies ? `🔴 Alergia: ${p.allergies}` : null,
    lastVisit: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("es-AR") : "—",
    institution: p.tenantId,
  };
}

export function PatientsView({ onSelectPatient, onNewPatient, refreshKey }: PatientsViewProps) {
  const [search, setSearch] = useState("");
  const { profile, loading: profileLoading } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const { patients: dbPatients, loading: patientsLoading, refetch } = usePatients(tenantId, search);

  // Refetch when parent signals a new patient was created
  const prevRefreshKey = useRef(refreshKey);
  useEffect(() => {
    if (refreshKey !== prevRefreshKey.current) {
      prevRefreshKey.current = refreshKey;
      refetch();
    }
  }, [refreshKey, refetch]);

  // Use real data if connected, fallback to mock
  const allPatients: Patient[] = useMemo(() => {
    if (tenantId && !patientsLoading && dbPatients.length > 0) {
      return dbPatients.map(toMockPatient);
    }
    if (!tenantId && !profileLoading) {
      return PATIENTS.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.dni.includes(search)
      );
    }
    return [];
  }, [tenantId, dbPatients, patientsLoading, profileLoading, search]);

  const loading = profileLoading || (!!tenantId && patientsLoading);
  const isLive = !!tenantId;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
            Pacientes
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 6 }}>
            {loading ? "Cargando..." : `${allPatients.length} registros`}
            {isLive && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                LIVE DB
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {isLive && (
            <button
              onClick={refetch}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "white", color: "var(--slate-600)", border: "1px solid var(--slate-200)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              <RefreshCw size={14} /> Actualizar
            </button>
          )}
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

      {/* Table */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--slate-100)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--slate-50)", borderRadius: 8, border: "1px solid var(--slate-200)", padding: "0 12px", maxWidth: 400 }}>
            <Search size={14} color="var(--slate-400)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, DNI u obra social..."
              style={{ border: "none", background: "none", outline: "none", fontSize: 13, padding: "9px 0", width: "100%", color: "var(--slate-800)" }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>
            Cargando pacientes...
          </div>
        ) : (
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
            {allPatients.map((p, i) => (
              <tr
                key={p.id ?? i}
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
                <td style={{ padding: "12px 14px", color: "var(--slate-600)", fontFamily: "monospace", fontSize: 12 }}>{p.dni}</td>
                <td style={{ padding: "12px 14px", color: "var(--slate-600)" }}>
                  {p.age > 0 ? `${p.age} años` : "—"} · {p.sex === "F" ? "♀" : "♂"}
                </td>
                <td style={{ padding: "12px 14px", color: "var(--slate-600)" }}>{p.obra}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ background: "rgba(239,68,68,0.1)", color: "var(--red)", fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 6 }}>
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
        )}

        {!loading && allPatients.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--slate-400)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div>{search ? `Sin pacientes para "${search}"` : "No hay pacientes registrados aún"}</div>
            {!search && onNewPatient && (
              <button onClick={onNewPatient} style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                + Agregar primer paciente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
