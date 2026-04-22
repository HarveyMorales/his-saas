"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Share2, Plus, ChevronDown, ChevronUp, Lock, FileText, Calendar, CreditCard, Paperclip, Activity, Pill, AlertTriangle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { VitalsTrendChart } from "@/components/ui/VitalsTrendChart";
import { RECORDS, APPOINTMENTS, BILLING } from "@/lib/data";
import { getSpecialtyColor } from "@/lib/utils";
import { useMedicalRecords } from "@/lib/hooks/useSupabase";
import type { Patient, NavId, MedicalRecord } from "@/lib/types";

interface PatientDetailViewProps {
  patient: Patient;
  onBack: () => void;
  onNav: (id: NavId) => void;
  onNewConsultation?: () => void;
  consultationRefreshKey?: number;
}

type Tab = "hc" | "turnos" | "facturacion" | "adjuntos";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "hc", label: "Historia Clínica", icon: <FileText size={14} /> },
  { id: "turnos", label: "Turnos", icon: <Calendar size={14} /> },
  { id: "facturacion", label: "Facturación", icon: <CreditCard size={14} /> },
  { id: "adjuntos", label: "Adjuntos", icon: <Paperclip size={14} /> },
];

function VitalPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: "var(--slate-50)", borderRadius: 8, padding: "8px 12px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      border: "1px solid var(--slate-200)", minWidth: 64,
    }}>
      <div style={{ fontSize: 9, color: "var(--slate-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{value}</div>
    </div>
  );
}

function toMedicalRecord(r: any): MedicalRecord {
  const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-AR") : "—";
  const bp = r.vitalsBpSystolic && r.vitalsBpDiastolic ? `${r.vitalsBpSystolic}/${r.vitalsBpDiastolic}` : undefined;
  return {
    id: r.id,
    date,
    doctor: r.authorName ?? "—",
    specialty: r.specialtyName ?? r.entryType ?? "Consulta",
    diagnosis: r.diagnosisFreeText ?? r.assessment ?? "—",
    treatment: r.plan ?? r.treatment ?? "—",
    notes: r.subjective ?? r.objective ?? undefined,
    version: r.version ?? 1,
    confidential: r.isConfidential ?? false,
    vitals: {
      bp,
      hr: r.vitalsHrBpm ? `${r.vitalsHrBpm} bpm` : undefined,
      temp: r.vitalsTempC ? `${r.vitalsTempC}°C` : undefined,
      weight: r.vitalsWeightKg ? `${r.vitalsWeightKg} kg` : undefined,
    },
  };
}

export function PatientDetailView({ patient, onBack, onNav, onNewConsultation, consultationRefreshKey }: PatientDetailViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("hc");
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});

  const { records: dbRecords, loading: recordsLoading, refetch: refetchRecords } = useMedicalRecords(patient.id);

  const prevRefreshKey = useRef(consultationRefreshKey);
  useEffect(() => {
    if (consultationRefreshKey !== prevRefreshKey.current) {
      prevRefreshKey.current = consultationRefreshKey;
      refetchRecords();
    }
  }, [consultationRefreshKey, refetchRecords]);
  const mockRecords = RECORDS[patient.id] ?? [];
  const records: MedicalRecord[] = dbRecords.length > 0
    ? dbRecords.map(toMedicalRecord)
    : mockRecords;

  const appts = APPOINTMENTS.filter(a => a.patientId === patient.id);
  const bills = BILLING.filter(b => b.patient === patient.name);

  const toggleRecord = (id: string) => {
    setExpandedRecords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Group records by year for timeline
  const recordsByYear: Record<string, typeof records> = {};
  records.forEach(r => {
    const year = r.date.split("/")[2];
    if (!recordsByYear[year]) recordsByYear[year] = [];
    recordsByYear[year].push(r);
  });
  const years = Object.keys(recordsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: "var(--teal)", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={15} /> Volver a pacientes
      </button>

      {/* Patient card */}
      <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", marginBottom: 16, border: "1px solid var(--slate-200)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Avatar
            initials={(patient.name[0] + (patient.name.split(", ")[1]?.[0] ?? "")).toUpperCase()}
            color={patient.sex === "F" ? "#8B5CF6" : "#2563EB"}
            size={56}
          />
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>
              {patient.name}
            </h1>
            <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
              {[
                { label: "DNI", value: patient.dni },
                { label: "Edad", value: `${patient.age} años` },
                { label: "Grupo", value: patient.blood },
                { label: "Obra Social", value: patient.obra },
                { label: "Tel.", value: patient.phone },
              ].map(item => (
                <span key={item.label} style={{ fontSize: 12, color: "var(--slate-500)" }}>
                  <strong style={{ color: "var(--slate-700)" }}>{item.label}:</strong> {item.value}
                </span>
              ))}
            </div>
            {patient.alert && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                <AlertTriangle size={13} color="var(--amber)" />
                <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 600 }}>{patient.alert}</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onNewConsultation}
              style={{ padding: "8px 16px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={14} /> Nueva evolución
            </button>
            <button
              onClick={() => onNav("sharing")}
              style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(245,158,11,0.1)", color: "var(--amber)", border: "1px solid rgba(245,158,11,0.3)", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
            >
              <Share2 size={14} /> Compartir HC
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: "2px solid var(--slate-200)" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: "none",
              borderBottom: activeTab === t.id ? "2px solid var(--teal)" : "2px solid transparent",
              color: activeTab === t.id ? "var(--teal)" : "var(--slate-500)",
              marginBottom: -2,
            }}
          >
            {t.icon} {t.label}
            {t.id === "hc" && records.length > 0 && (
              <span style={{ background: "var(--teal)", color: "white", fontSize: 9, fontWeight: 700, borderRadius: 99, padding: "1px 6px" }}>
                {records.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* === HC TIMELINE (Revolutionary View) === */}
      {activeTab === "hc" && (
        <div>
          {/* Quick stats */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { icon: <Activity size={13} />, label: "Total consultas", value: records.length, color: "var(--blue)" },
              { icon: <Pill size={13} />, label: "Especialidades", value: [...new Set(records.map(r => r.specialty))].length, color: "var(--teal)" },
              { icon: <Calendar size={13} />, label: "Última visita", value: records[0]?.date ?? "—", color: "var(--purple)" },
            ].map((s, i) => (
              <div key={i} style={{ background: "white", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--slate-200)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--slate-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <VitalsTrendChart records={records} />

          {records.length === 0 ? (
            <div style={{ background: "white", borderRadius: 14, padding: 40, textAlign: "center", color: "var(--slate-400)", border: "1px solid var(--slate-200)" }}>
              <FileText size={40} style={{ marginBottom: 10, opacity: 0.3 }} />
              <div style={{ fontSize: 14 }}>Sin evoluciones registradas</div>
              <button
                onClick={onNewConsultation}
                style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
              >
                Registrar primera consulta
              </button>
            </div>
          ) : (
            <div>
              {years.map(year => (
                <div key={year} style={{ marginBottom: 32 }}>
                  {/* Year header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)", letterSpacing: -1 }}>
                      {year}
                    </div>
                    <div style={{ flex: 1, height: 1, background: "var(--slate-200)" }} />
                    <div style={{ fontSize: 11, color: "var(--slate-400)", fontWeight: 600 }}>
                      {recordsByYear[year].length} {recordsByYear[year].length === 1 ? "consulta" : "consultas"}
                    </div>
                  </div>

                  {/* Timeline items */}
                  <div style={{ position: "relative", paddingLeft: 32 }}>
                    {/* Vertical line */}
                    <div style={{
                      position: "absolute", left: 5, top: 8,
                      width: 2, background: "var(--slate-200)",
                      bottom: 0, borderRadius: 1,
                    }} />

                    {recordsByYear[year].map((r, i) => {
                      const specColor = getSpecialtyColor(r.specialty);
                      const expanded = !!expandedRecords[r.id];
                      const dayMonth = r.date.split("/").slice(0, 2).join("/");

                      return (
                        <div key={r.id} style={{ position: "relative", marginBottom: 16 }}>
                          {/* Dot */}
                          <div style={{
                            position: "absolute",
                            left: -27,
                            top: 14,
                            width: 12, height: 12,
                            borderRadius: "50%",
                            background: specColor,
                            border: "2px solid white",
                            boxShadow: `0 0 0 2px ${specColor}`,
                            zIndex: 1,
                          }} />

                          {/* Record card */}
                          <div style={{
                            background: "white",
                            borderRadius: 12,
                            border: "1px solid var(--slate-200)",
                            borderLeft: `3px solid ${specColor}`,
                            overflow: "hidden",
                            transition: "box-shadow 0.15s",
                          }}>
                            {/* Card header */}
                            <div
                              style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "14px 16px",
                                cursor: "pointer",
                                background: expanded ? "var(--slate-50)" : "white",
                              }}
                              onClick={() => toggleRecord(r.id)}
                            >
                              <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: `${specColor}15`,
                                color: specColor,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, fontSize: 16,
                              }}>
                                🩺
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>
                                    {r.specialty}
                                  </span>
                                  {r.confidential && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 3, background: "rgba(239,68,68,0.1)", color: "var(--red)", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>
                                      <Lock size={8} /> CONFIDENCIAL
                                    </span>
                                  )}
                                  <span style={{
                                    background: "var(--blue-dim)", color: "var(--blue)",
                                    fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                                  }}>
                                    v{r.version}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 2 }}>
                                  {r.doctor} · {dayMonth} · {year}
                                </div>
                                {!expanded && (
                                  <div style={{ fontSize: 12, color: "var(--slate-600)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {r.diagnosis}
                                  </div>
                                )}
                              </div>
                              <div style={{ color: "var(--slate-400)", flexShrink: 0 }}>
                                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>

                            {/* Expanded content */}
                            {expanded && (
                              <div style={{ padding: "0 16px 16px" }}>
                                {/* Vitals */}
                                {r.vitals && (
                                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                                    {r.vitals.bp && <VitalPill label="TA" value={r.vitals.bp} />}
                                    {r.vitals.hr && <VitalPill label="FC" value={r.vitals.hr} />}
                                    {r.vitals.temp && <VitalPill label="Temp" value={r.vitals.temp} />}
                                    {r.vitals.weight && <VitalPill label="Peso" value={r.vitals.weight} />}
                                  </div>
                                )}

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                  <div style={{ background: "var(--slate-50)", borderRadius: 8, padding: 12 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--slate-400)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
                                      Diagnóstico
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--slate-700)", lineHeight: 1.5 }}>{r.diagnosis}</div>
                                  </div>
                                  <div style={{ background: "var(--slate-50)", borderRadius: 8, padding: 12 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--slate-400)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
                                      Tratamiento
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--slate-700)", lineHeight: 1.5 }}>{r.treatment}</div>
                                  </div>
                                </div>

                                {r.notes && (
                                  <div style={{ background: "#FEFCE8", borderRadius: 8, padding: 12, marginTop: 10, border: "1px solid #FEF08A" }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "#A16207", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
                                      Notas
                                    </div>
                                    <div style={{ fontSize: 12, color: "#713F12", lineHeight: 1.5 }}>{r.notes}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Turnos tab */}
      {activeTab === "turnos" && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          {appts.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>Sin turnos registrados</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--slate-50)" }}>
                  {["Hora", "Profesional", "Especialidad", "Obra Social", "Estado"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appts.map((a, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--slate-100)" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--navy)", fontFamily: "Georgia, serif" }}>{a.time}</td>
                    <td style={{ padding: "10px 14px" }}>{a.doctor}</td>
                    <td style={{ padding: "10px 14px", color: "var(--slate-500)" }}>{a.specialty}</td>
                    <td style={{ padding: "10px 14px", color: "var(--slate-500)" }}>{a.obra}</td>
                    <td style={{ padding: "10px 14px" }}><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Facturación tab */}
      {activeTab === "facturacion" && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--slate-200)", overflow: "hidden" }}>
          {bills.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>Sin prestaciones registradas</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--slate-50)" }}>
                  {["Fecha", "Práctica", "Obra Social", "Monto", "Estado", "Comprobante"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--slate-500)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--slate-200)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bills.map((b, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--slate-100)" }}>
                    <td style={{ padding: "10px 14px", color: "var(--slate-500)", fontSize: 12 }}>{b.date}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{b.practice}</td>
                    <td style={{ padding: "10px 14px", color: "var(--slate-500)" }}>{b.obra}</td>
                    <td style={{ padding: "10px 14px", fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--navy)" }}>${b.amount.toLocaleString()}</td>
                    <td style={{ padding: "10px 14px" }}><Badge status={b.status} /></td>
                    <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--slate-400)", fontFamily: "monospace" }}>{b.invoice ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Adjuntos tab */}
      {activeTab === "adjuntos" && (
        <div style={{ background: "white", borderRadius: 14, padding: 40, textAlign: "center", color: "var(--slate-400)", border: "1px solid var(--slate-200)" }}>
          <Paperclip size={40} style={{ marginBottom: 10, opacity: 0.3 }} />
          <div style={{ fontSize: 14, color: "var(--slate-500)", marginBottom: 16 }}>Sin adjuntos cargados</div>
          <button style={{ padding: "9px 20px", borderRadius: 8, background: "var(--teal)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            Subir adjunto
          </button>
        </div>
      )}
    </div>
  );
}
