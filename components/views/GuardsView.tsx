"use client";

import { useState } from "react";
import { Plus, BedDouble, Stethoscope, LogOut, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GUARDS } from "@/lib/data";
import { useCurrentUser, useBeds, useAdmissions, usePatients, useDoctors } from "@/lib/hooks/useSupabase";
import { dischargePatient, createAdmission, updateBedStatus } from "@/app/actions/guards";
import { useToast } from "@/lib/toast-context";
import { NewAdmissionModal } from "@/components/modals/NewAdmissionModal";

type GuardTab = "guardias" | "camas";

const BED_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE:   { label: "DISPONIBLE",  color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  OCCUPIED:    { label: "OCUPADA",     color: "#EF4444", bg: "rgba(239,68,68,0.1)"  },
  MAINTENANCE: { label: "MANTENIMIENTO", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  RESERVED:    { label: "RESERVADA",   color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
};

const WARD_COLORS: Record<string, string> = {
  "Clínica Médica": "#2563EB",
  "Cirugía": "#8B5CF6",
  "Pediatría": "#10B981",
  "UTI": "#EF4444",
  "UCI": "#EF4444",
  "Traumatología": "#F59E0B",
  "default": "#64748B",
};

export function GuardsView() {
  const { toast } = useToast();
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;

  const [tab, setTab] = useState<GuardTab>("guardias");
  const [showNewAdmission, setShowNewAdmission] = useState(false);
  const [discharging, setDischarging] = useState<string | null>(null);

  const { beds, loading: bedsLoading, refetch: refetchBeds } = useBeds(tenantId);
  const { admissions, loading: admLoading, refetch: refetchAdmissions } = useAdmissions(tenantId);

  // Stats
  const availableBeds = isLive ? beds.filter((b: any) => b.status === "AVAILABLE").length : 4;
  const occupiedBeds = isLive ? beds.filter((b: any) => b.status === "OCCUPIED").length : 3;
  const totalBeds = isLive ? beds.length : 8;
  const activeAdmissions = isLive ? admissions.filter((a: any) => a.status === "ACTIVE").length : 3;

  // Wards grouped
  const wardMap = isLive
    ? beds.reduce((acc: Record<string, any[]>, bed: any) => {
        const ward = bed.ward ?? "General";
        if (!acc[ward]) acc[ward] = [];
        acc[ward].push(bed);
        return acc;
      }, {} as Record<string, any[]>)
    : {};

  const handleDischarge = async (admissionId: string, bedId: string | null) => {
    setDischarging(admissionId);
    const { error } = await dischargePatient(admissionId, bedId);
    setDischarging(null);
    if (error) toast({ type: "error", title: "Error al dar alta", message: error });
    else { toast({ type: "success", title: "Alta médica registrada", message: "La cama quedó disponible" }); refetchAdmissions(); refetchBeds(); }
  };

  return (
    <div>
      {showNewAdmission && (
        <NewAdmissionModal
          tenantId={tenantId!}
          beds={beds.filter((b: any) => b.status === "AVAILABLE")}
          onClose={() => setShowNewAdmission(false)}
          onSaved={() => { setShowNewAdmission(false); refetchAdmissions(); refetchBeds(); }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
            Guardias & Internación
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 8 }}>
            {occupiedBeds}/{totalBeds} camas ocupadas · {activeAdmissions} internados activos
            {isLive && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>LIVE DB</span>}
          </p>
        </div>
        <button
          onClick={() => isLive ? setShowNewAdmission(true) : undefined}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: isLive ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, opacity: isLive ? 1 : 0.6 }}>
          <Plus size={15} /> Nueva internación
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total camas", value: totalBeds, color: "var(--navy)", icon: <BedDouble size={18} /> },
          { label: "Disponibles", value: availableBeds, color: "#10B981", icon: <BedDouble size={18} color="#10B981" /> },
          { label: "Ocupadas", value: occupiedBeds, color: "#EF4444", icon: <BedDouble size={18} color="#EF4444" /> },
          { label: "Internados", value: activeAdmissions, color: "#8B5CF6", icon: <Stethoscope size={18} color="#8B5CF6" /> },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--slate-200)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--slate-50)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.8, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid var(--slate-200)" }}>
        {([
          { id: "guardias" as GuardTab, label: "Guardias activas", icon: <Clock size={13} /> },
          { id: "camas" as GuardTab, label: `Mapa de camas (${totalBeds})`, icon: <BedDouble size={13} /> },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              color: tab === t.id ? "var(--navy)" : "var(--slate-500)",
              borderBottom: tab === t.id ? "2px solid var(--teal)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Guardias */}
      {tab === "guardias" && (
        <div>
          {/* Internaciones activas */}
          {isLive ? (
            admLoading ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--slate-400)" }}>Cargando...</div>
            ) : admissions.filter((a: any) => a.status === "ACTIVE").length === 0 ? (
              <div style={{ background: "white", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid var(--slate-200)", color: "var(--slate-400)" }}>
                Sin internaciones activas
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {admissions.filter((a: any) => a.status === "ACTIVE").map((adm: any) => {
                  const admittedAt = new Date(adm.admittedAt);
                  const hours = Math.round((Date.now() - admittedAt.getTime()) / 3600000);
                  return (
                    <div key={adm.id} style={{ background: "white", borderRadius: 14, padding: 20, border: "1px solid var(--slate-200)", borderTop: "3px solid #EF4444" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>
                            {adm.patients ? `${adm.patients.lastName}, ${adm.patients.firstName}` : "Paciente"}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--slate-500)", marginTop: 2 }}>
                            DNI: {adm.patients?.dni ?? "—"}
                          </div>
                        </div>
                        <span style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>INTERNADO</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
                        {[
                          { label: "Cama", value: adm.beds ? `${adm.beds.code}` : "—" },
                          { label: "Sector", value: adm.beds?.ward ?? "—" },
                          { label: "Horas", value: `${hours}h` },
                        ].map((s, i) => (
                          <div key={i} style={{ background: "var(--slate-50)", borderRadius: 8, padding: "8px 10px" }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--slate-400)", letterSpacing: 0.8, textTransform: "uppercase" }}>{s.label}</div>
                            <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: "var(--navy)", marginTop: 2 }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                      {adm.reason && (
                        <div style={{ background: "var(--slate-50)", borderRadius: 7, padding: "7px 10px", marginBottom: 12, fontSize: 12, color: "var(--slate-600)", fontStyle: "italic" }}>"{adm.reason}"</div>
                      )}
                      <div style={{ fontSize: 11, color: "var(--slate-500)", marginBottom: 10 }}>
                        Médico: {adm.users ? `${adm.users.firstName} ${adm.users.lastName}` : "—"}
                      </div>
                      <button
                        onClick={() => handleDischarge(adm.id, adm.bedId)}
                        disabled={discharging === adm.id}
                        style={{ width: "100%", padding: "8px 0", borderRadius: 7, background: "white", color: "var(--green)", border: "1px solid var(--green)", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <LogOut size={13} /> {discharging === adm.id ? "Procesando..." : "Dar de alta"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Mock guardias */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {GUARDS.map((g, i) => {
                const borderColor = g.status === "ACTIVA" ? "#10B981" : g.status === "POR TERMINAR" ? "#F59E0B" : "#94A3B8";
                return (
                  <div key={i} style={{ background: "white", borderRadius: 14, padding: 22, border: "1px solid var(--slate-200)", borderTop: `3px solid ${borderColor}` }}>
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
          )}
        </div>
      )}

      {/* Tab: Camas */}
      {tab === "camas" && (
        <div>
          {isLive ? (
            bedsLoading ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--slate-400)" }}>Cargando camas...</div>
            ) : beds.length === 0 ? (
              <div style={{ background: "white", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid var(--slate-200)", color: "var(--slate-400)" }}>
                Sin camas configuradas. Ejecutá la migración SQL para agregar camas de ejemplo.
              </div>
            ) : (
              Object.entries(wardMap).map(([ward, wardBeds]) => (
                <div key={ward} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: WARD_COLORS[ward] ?? WARD_COLORS.default }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{ward}</div>
                    <div style={{ fontSize: 11, color: "var(--slate-500)" }}>
                      {(wardBeds as any[]).filter(b => b.status === "AVAILABLE").length} disponibles de {(wardBeds as any[]).length}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                    {(wardBeds as any[]).map((bed: any) => {
                      const cfg = BED_STATUS_CFG[bed.status] ?? BED_STATUS_CFG.AVAILABLE;
                      return (
                        <div key={bed.id} style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: `1px solid var(--slate-200)`, borderTop: `3px solid ${cfg.color}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>{bed.code}</div>
                            <BedDouble size={15} color={cfg.color} />
                          </div>
                          <div style={{ fontSize: 10, color: "var(--slate-500)", marginBottom: 8 }}>{bed.room ?? "—"}</div>
                          <span style={{ background: cfg.bg, color: cfg.color, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>
                            {cfg.label}
                          </span>
                          {bed.status === "MAINTENANCE" && (
                            <button
                              onClick={() => updateBedStatus(bed.id, "AVAILABLE").then(() => refetchBeds())}
                              style={{ display: "block", width: "100%", marginTop: 8, padding: "5px 0", borderRadius: 6, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
                              Liberar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )
          ) : (
            /* Mock camas */
            <div style={{ background: "white", borderRadius: 14, padding: 24, border: "1px solid var(--slate-200)" }}>
              <div style={{ marginBottom: 14, fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Mapa de camas (demo)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                {[
                  { code: "A-01", ward: "Clínica Médica", room: "Hab 101", status: "OCCUPIED" },
                  { code: "A-02", ward: "Clínica Médica", room: "Hab 101", status: "AVAILABLE" },
                  { code: "A-03", ward: "Clínica Médica", room: "Hab 102", status: "AVAILABLE" },
                  { code: "B-01", ward: "Cirugía", room: "Hab 201", status: "OCCUPIED" },
                  { code: "B-02", ward: "Cirugía", room: "Hab 201", status: "MAINTENANCE" },
                  { code: "C-01", ward: "Pediatría", room: "Hab 301", status: "AVAILABLE" },
                  { code: "UCI-01", ward: "UTI", room: "UCI", status: "OCCUPIED" },
                  { code: "UCI-02", ward: "UTI", room: "UCI", status: "AVAILABLE" },
                ].map((bed, i) => {
                  const cfg = BED_STATUS_CFG[bed.status];
                  return (
                    <div key={i} style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--slate-200)", borderTop: `3px solid ${cfg.color}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>{bed.code}</div>
                        <BedDouble size={14} color={cfg.color} />
                      </div>
                      <div style={{ fontSize: 10, color: "var(--slate-500)", marginBottom: 8 }}>{bed.room}</div>
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
