"use client";

import { useState } from "react";
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, BookOpen, Users, ChevronRight } from "lucide-react";
import { INSURANCE, NOMENCLATURES } from "@/lib/data";
import { useCurrentUser, useInsuranceProviders, useMedicalPractices, usePatientCoverages } from "@/lib/hooks/useSupabase";
import { updateInsuranceProvider } from "@/app/actions/insurance";
import { NewInsuranceModal } from "@/components/modals/NewInsuranceModal";
import { NewPracticeModal } from "@/components/modals/NewPracticeModal";
import { NewCoverageModal } from "@/components/modals/NewCoverageModal";
import { useToast } from "@/lib/toast-context";

type DetailTab = "nomenclador" | "pacientes";

export function InsuranceView() {
  const { toast } = useToast();
  const { profile } = useCurrentUser();
  const tenantId = (profile as any)?.tenantId ?? null;
  const isLive = !!tenantId;

  const { providers: dbProviders, loading, refetch } = useInsuranceProviders(tenantId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("nomenclador");
  const [search, setSearch] = useState("");
  const [showNewInsurance, setShowNewInsurance] = useState(false);
  const [showNewPractice, setShowNewPractice] = useState(false);
  const [showNewCoverage, setShowNewCoverage] = useState(false);

  const { practices, nomenclators } = useMedicalPractices(tenantId, selectedId);
  const { coverages, refetch: refetchCoverages } = usePatientCoverages(tenantId, selectedId);

  // Unify mock + live
  const allProviders = isLive
    ? dbProviders.map((p: any) => ({
        id: p.id,
        name: p.name,
        code: p.code ?? "—",
        active: p.isActive,
        nomenclatures: 0,
        description: p.description ?? "",
        isLive: true,
      }))
    : INSURANCE.map(o => ({ id: o.id, name: o.name, code: o.code, active: o.active, nomenclatures: o.nomenclatures, description: "", isLive: false }));

  const filtered = allProviders.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProvider = allProviders.find(p => p.id === selectedId) ?? null;

  const livePractices = isLive ? practices : NOMENCLATURES.filter(n => n.obra === selectedProvider?.name).map(n => ({
    id: n.code, code: n.code, name: n.description, defaultValue: n.value, isActive: true,
  }));

  const handleToggle = async (id: string, current: boolean) => {
    if (!isLive) return;
    const { error } = await updateInsuranceProvider(id, { isActive: !current });
    if (error) toast({ type: "error", title: "Error", message: error });
    else { toast({ type: "success", title: current ? "Obra social desactivada" : "Obra social activada", message: "" }); refetch(); }
  };

  return (
    <div>
      {showNewInsurance && (
        <NewInsuranceModal
          onClose={() => setShowNewInsurance(false)}
          onSaved={() => { setShowNewInsurance(false); refetch(); }}
        />
      )}
      {showNewPractice && selectedId && (
        <NewPracticeModal
          tenantId={tenantId!}
          providerId={selectedId}
          nomenclators={nomenclators}
          onClose={() => setShowNewPractice(false)}
          onSaved={() => { setShowNewPractice(false); }}
        />
      )}
      {showNewCoverage && selectedId && selectedProvider && (
        <NewCoverageModal
          tenantId={tenantId!}
          providerId={selectedId}
          providerName={selectedProvider.name}
          onClose={() => setShowNewCoverage(false)}
          onSaved={() => { setShowNewCoverage(false); refetchCoverages(); }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
            Obras Sociales
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 8 }}>
            {allProviders.filter(o => o.active).length} activas · {allProviders.filter(o => !o.active).length} inactivas
            {isLive && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#059669" }}>LIVE DB</span>}
          </p>
        </div>
        <button
          onClick={() => isLive ? setShowNewInsurance(true) : undefined}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: isLive ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, opacity: isLive ? 1 : 0.6 }}>
          <Plus size={15} /> Agregar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        {/* ── Lista de obras sociales ── */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          {/* search */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--slate-100)" }}>
            <div style={{ position: "relative" }}>
              <Search size={13} color="var(--slate-400)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar obra social..."
                style={{ width: "100%", padding: "7px 10px 7px 30px", borderRadius: 8, border: "1px solid var(--slate-200)", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>Cargando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>Sin obras sociales</div>
          ) : filtered.map(os => (
            <div
              key={os.id}
              onClick={() => { setSelectedId(os.id); setDetailTab("nomenclador"); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                borderBottom: "1px solid var(--slate-100)",
                cursor: "pointer",
                background: selectedId === os.id ? "rgba(0,191,166,0.06)" : "transparent",
                borderLeft: selectedId === os.id ? "3px solid var(--teal)" : "3px solid transparent",
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: os.active ? "rgba(0,191,166,0.1)" : "var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                🏥
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{os.name}</div>
                <div style={{ fontSize: 11, color: "var(--slate-500)" }}>Cód. {os.code}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{
                  background: os.active ? "rgba(16,185,129,0.1)" : "var(--slate-100)",
                  color: os.active ? "var(--green)" : "var(--slate-500)",
                  fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                }}>
                  {os.active ? "ACTIVA" : "INACTIVA"}
                </span>
                {isLive && (
                  <button
                    onClick={e => { e.stopPropagation(); handleToggle(os.id, os.active); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: os.active ? "var(--teal)" : "var(--slate-400)", display: "flex", padding: 2 }}>
                    {os.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                )}
                <ChevronRight size={13} color="var(--slate-300)" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Panel derecho ── */}
        {selectedProvider ? (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Header del panel */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,191,166,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏥</div>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{selectedProvider.name}</div>
                    <div style={{ fontSize: 11, color: "var(--slate-500)" }}>Código: {selectedProvider.code}</div>
                  </div>
                </div>
              </div>
              <button
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, background: "var(--slate-50)", color: "var(--slate-600)", border: "1px solid var(--slate-200)", cursor: "pointer", fontSize: 12 }}>
                <Edit2 size={12} /> Editar
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--slate-100)", padding: "0 20px" }}>
              {([
                { id: "nomenclador" as DetailTab, label: "Nomenclador", icon: <BookOpen size={13} /> },
                { id: "pacientes" as DetailTab, label: `Pacientes (${coverages.length})`, icon: <Users size={13} /> },
              ]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "11px 16px", background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    color: detailTab === tab.id ? "var(--navy)" : "var(--slate-500)",
                    borderBottom: detailTab === tab.id ? "2px solid var(--teal)" : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}

              {detailTab === "nomenclador" && (
                <button
                  onClick={() => isLive ? setShowNewPractice(true) : undefined}
                  style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, background: "var(--teal)", color: "white", border: "none", cursor: isLive ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 700, alignSelf: "center", opacity: isLive ? 1 : 0.6 }}>
                  <Plus size={12} /> Agregar práctica
                </button>
              )}
              {detailTab === "pacientes" && isLive && (
                <button
                  onClick={() => setShowNewCoverage(true)}
                  style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, alignSelf: "center" }}>
                  <Plus size={12} /> Asignar paciente
                </button>
              )}
            </div>

            {/* Contenido de tab */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {detailTab === "nomenclador" && (
                livePractices.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>
                    Sin prácticas cargadas
                    {isLive && <div style={{ marginTop: 8, fontSize: 12 }}>Usá "Agregar práctica" para cargar el nomenclador</div>}
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "var(--slate-50)" }}>
                        {["Código", "Descripción", "Valor unitario", "Estado"].map(h => (
                          <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {livePractices.map((pr: any, i: number) => (
                        <tr key={pr.id ?? i} style={{ borderBottom: "1px solid var(--slate-100)" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--slate-50)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "11px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--blue)", fontWeight: 700 }}>{pr.code}</td>
                          <td style={{ padding: "11px 16px", color: "var(--slate-700)" }}>{pr.name}</td>
                          <td style={{ padding: "11px 16px", fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--navy)" }}>${Number(pr.defaultValue).toLocaleString()}</td>
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{ background: pr.isActive ? "rgba(16,185,129,0.1)" : "var(--slate-100)", color: pr.isActive ? "var(--green)" : "var(--slate-500)", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>
                              {pr.isActive ? "ACTIVA" : "INACTIVA"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {detailTab === "pacientes" && (
                coverages.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)", fontSize: 13 }}>
                    Sin pacientes afiliados en el sistema
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "var(--slate-50)" }}>
                        {["Paciente", "DNI", "N° Afiliado", "Plan", "Estado"].map(h => (
                          <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {coverages.map((c: any, i: number) => (
                        <tr key={c.id ?? i} style={{ borderBottom: "1px solid var(--slate-100)" }}>
                          <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--navy)" }}>
                            {c.patients ? `${c.patients.lastName}, ${c.patients.firstName}` : "—"}
                          </td>
                          <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--slate-500)" }}>{c.patients?.dni ?? "—"}</td>
                          <td style={{ padding: "11px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--blue)" }}>{c.affiliateNumber ?? "—"}</td>
                          <td style={{ padding: "11px 16px", color: "var(--slate-600)" }}>{c.planName ?? "—"}</td>
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{ background: c.status === "ACTIVE" ? "rgba(16,185,129,0.1)" : "var(--slate-100)", color: c.status === "ACTIVE" ? "var(--green)" : "var(--slate-500)", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>
                              {c.status === "ACTIVE" ? "ACTIVO" : c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 14, padding: 64, textAlign: "center", color: "var(--slate-400)", border: "1px solid var(--slate-200)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 14 }}>🏥</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--slate-600)", marginBottom: 4 }}>Seleccioná una obra social</div>
            <div style={{ fontSize: 12 }}>para ver su nomenclador y pacientes afiliados</div>
          </div>
        )}
      </div>
    </div>
  );
}
