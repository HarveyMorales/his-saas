"use client";

import { ChevronRight } from "lucide-react";
import { useCurrentUser, useTenants } from "@/lib/hooks/useSupabase";
import { INSTITUTIONS } from "@/lib/data";
import type { Institution } from "@/lib/types";

interface InstitutionViewProps {
  onSelect: (inst: Institution) => void;
}

const TYPE_LABEL: Record<string, string> = {
  CONSULTORIO: "Consultorio privado",
  CLINICA: "Clínica / Sanatorio",
  HOSPITAL: "Hospital",
};

const TYPE_ICON: Record<string,string> = { HOSPITAL:"🏥",CLINICA:"🏨",CONSULTORIO:"🩺",ESTETICA:"✨",ESTETICO:"✨" };
const COLORS = ["#00BFA6","#2563EB","#8B5CF6","#F59E0B","#EF4444","#06B6D4"];

export function InstitutionView({ onSelect }: InstitutionViewProps) {
  const { profile } = useCurrentUser();
  const isLive = !!(profile as any)?.tenantId;
  const { tenants: dbTenants } = useTenants();
  const userName = (profile as any) ? ((profile as any).firstName??"")+" "+((profile as any).lastName??"") : "Usuario";
  const displayInstitutions: Institution[] = isLive && dbTenants.length > 0
    ? dbTenants.map((t:any,i:number)=>({ id:t.id, name:t.name, type:t.type??"CLINICA", tenant:t.slug??t.id.slice(0,8), color:t.primaryColor??COLORS[i%COLORS.length], icon:TYPE_ICON[t.type??"CLINICA"]??"🏥" }))
    : INSTITUTIONS;
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--navy)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(circle at 30% 60%, rgba(0,191,166,0.07) 0%, transparent 50%),
                          radial-gradient(circle at 70% 30%, rgba(37,99,235,0.07) 0%, transparent 40%)`,
        pointerEvents: "none",
      }} />

      <div style={{ width: 520, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: "var(--teal)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Bienvenido{userName?.trim() ? `, ${userName.trim()}` : ""}
          </div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "white", letterSpacing: -0.5 }}>
            ¿Desde qué institución trabajás hoy?
          </h1>
          <p style={{ margin: "8px 0 0", color: "var(--slate-400)", fontSize: 13 }}>
            {displayInstitutions.length} institución{displayInstitutions.length !== 1 ? "es" : ""} disponible{displayInstitutions.length !== 1 ? "s" : ""}
            {isLive && <span style={{ color: "#059669", fontWeight: 600, marginLeft: 6 }}>· LIVE DB</span>}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {displayInstitutions.map((inst) => (
            <button
              key={inst.id}
              onClick={() => onSelect(inst)}
              style={{
                background: "var(--navy-mid)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderLeft: `4px solid ${inst.color}`,
                borderRadius: 14,
                padding: "20px 22px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 16,
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLElement).style.transform = "translateX(3px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--navy-mid)";
                (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: `${inst.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
              }}>
                {inst.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: "white" }}>
                  {inst.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 3 }}>
                  {TYPE_LABEL[inst.type]} · Tenant: {inst.tenant}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: inst.color,
                  background: `${inst.color}18`, padding: "3px 10px", borderRadius: 99,
                }}>
                  ACTIVO
                </span>
                <ChevronRight size={16} color="var(--slate-500)" />
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "var(--slate-600)" }}>
          Cada institución opera en su propio schema aislado (schema-per-tenant)
        </div>
      </div>
    </div>
  );
}
