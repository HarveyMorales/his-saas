"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PATIENTS, APPOINTMENTS } from "@/lib/data";
import type { NavId } from "@/lib/types";
import { Search, User, Calendar, FileText, LayoutDashboard, Users, Shield, Receipt, ChevronRight } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useSupabase";
import { fetchPatientSearch } from "@/app/actions/fetch";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNav: (id: NavId) => void;
  onSelectPatient: (patientId: string) => void;
}

type ResultType = "patient" | "appointment" | "nav" | "action";

interface Result {
  id: string;
  type: ResultType;
  label: string;
  sub: string;
  icon: React.ReactNode;
  action: () => void;
}

const NAV_SHORTCUTS: { id: NavId; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", sub: "Vista general", icon: <LayoutDashboard size={14} /> },
  { id: "patients", label: "Pacientes", sub: "Padrón de pacientes", icon: <User size={14} /> },
  { id: "appointments", label: "Agenda / Turnos", sub: "Turnos del día", icon: <Calendar size={14} /> },
  { id: "records", label: "Historia Clínica", sub: "Evoluciones y consultas", icon: <FileText size={14} /> },
  { id: "billing", label: "Facturación", sub: "Prestaciones y liquidaciones", icon: <Receipt size={14} /> },
  { id: "users", label: "Usuarios / RBAC", sub: "Gestión de roles", icon: <Users size={14} /> },
  { id: "audit", label: "Auditoría", sub: "Log de acciones", icon: <Shield size={14} /> },
];

export function CommandPalette({ open, onClose, onNav, onSelectPatient }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [dbPatients, setDbPatients] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;

  // Debounced live patient search via admin client
  useEffect(() => {
    if (!tenantId || !query.trim()) { setDbPatients([]); return; }
    const timer = setTimeout(async () => {
      const data = await fetchPatientSearch(query.trim());
      setDbPatients(data);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, tenantId]);

  const results: Result[] = (() => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return NAV_SHORTCUTS.map((n) => ({
        id: n.id,
        type: "nav" as ResultType,
        label: n.label,
        sub: n.sub,
        icon: n.icon,
        action: () => { onNav(n.id); onClose(); },
      }));
    }

    const patientResults: Result[] = tenantId
      ? dbPatients.map(p => {
          const birthYear = p.birthDate ? new Date(p.birthDate).getFullYear() : null;
          const age = birthYear ? new Date().getFullYear() - birthYear : null;
          return {
            id: p.id,
            type: "patient" as ResultType,
            label: `${p.lastName}, ${p.firstName}`,
            sub: `DNI ${p.dni}${age ? ` · ${age} años` : ""}`,
            icon: <User size={14} />,
            action: () => { onSelectPatient(p.id); onClose(); },
          };
        })
      : PATIENTS.filter(p => p.name.toLowerCase().includes(q) || p.dni.includes(q)).slice(0, 4).map(p => ({
          id: p.id,
          type: "patient" as ResultType,
          label: p.name,
          sub: `DNI ${p.dni} · ${p.age} años · ${p.obra}`,
          icon: <User size={14} />,
          action: () => { onSelectPatient(p.id); onClose(); },
        }));

    const apptResults: Result[] = APPOINTMENTS
      .filter(a => a.patient.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q))
      .slice(0, 3)
      .map(a => ({
        id: a.id,
        type: "appointment" as ResultType,
        label: `${a.time} — ${a.patient}`,
        sub: `${a.doctor} · ${a.specialty} · ${a.status}`,
        icon: <Calendar size={14} />,
        action: () => { onNav("appointments"); onClose(); },
      }));

    const navResults: Result[] = NAV_SHORTCUTS
      .filter(n => n.label.toLowerCase().includes(q))
      .map(n => ({
        id: n.id,
        type: "nav" as ResultType,
        label: n.label,
        sub: n.sub,
        icon: n.icon,
        action: () => { onNav(n.id); onClose(); },
      }));

    return [...patientResults, ...apptResults, ...navResults];
  })();

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelected(0);
    }
  }, [open]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      results[selected]?.action();
    }
  }, [open, results, selected, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!open) return null;

  const typeLabel: Record<ResultType, string> = {
    patient: "Paciente",
    appointment: "Turno",
    nav: "Ir a",
    action: "Acción",
  };

  const typeColor: Record<ResultType, string> = {
    patient: "#8B5CF6",
    appointment: "#2563EB",
    nav: "#00BFA6",
    action: "#F59E0B",
  };

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-box" onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          borderBottom: "1px solid #F1F5F9",
        }}>
          <Search size={18} color="#94A3B8" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar paciente, turno, módulo..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              color: "#0B1D35",
              background: "transparent",
            }}
          />
          <kbd style={{
            background: "#F1F5F9",
            color: "#94A3B8",
            border: "1px solid #E2E8F0",
            borderRadius: 6,
            padding: "2px 7px",
            fontSize: 11,
            fontFamily: "system-ui",
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 380, overflowY: "auto", padding: "8px 0" }}>
          {results.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              Sin resultados para "{query}"
            </div>
          ) : (
            results.map((r, i) => (
              <div
                key={r.id + i}
                onClick={r.action}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 18px",
                  cursor: "pointer",
                  background: i === selected ? "#F8FAFC" : "transparent",
                  borderLeft: i === selected ? "3px solid #00BFA6" : "3px solid transparent",
                  transition: "all 0.1s",
                }}
                onMouseEnter={() => setSelected(i)}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${typeColor[r.type]}15`,
                  color: typeColor[r.type],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0B1D35", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.sub}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: typeColor[r.type],
                    background: `${typeColor[r.type]}15`,
                    padding: "2px 6px",
                    borderRadius: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    {typeLabel[r.type]}
                  </span>
                  {i === selected && <ChevronRight size={12} color="#94A3B8" />}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 18px",
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}>
          {[
            { keys: ["↑", "↓"], label: "navegar" },
            { keys: ["↵"], label: "seleccionar" },
            { keys: ["ESC"], label: "cerrar" },
          ].map((hint, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {hint.keys.map(k => (
                <kbd key={k} style={{
                  background: "#F1F5F9",
                  color: "#64748B",
                  border: "1px solid #E2E8F0",
                  borderRadius: 4,
                  padding: "1px 5px",
                  fontSize: 10,
                  fontFamily: "system-ui",
                }}>{k}</kbd>
              ))}
              <span style={{ fontSize: 10, color: "#94A3B8" }}>{hint.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
