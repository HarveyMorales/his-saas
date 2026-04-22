"use client";

import type { MedicalRecord } from "@/lib/types";

interface VitalsTrendChartProps {
  records: MedicalRecord[];
}

function parseBP(bp: string): { sys: number; dia: number } | null {
  const m = bp.match(/(\d+)\/(\d+)/);
  if (!m) return null;
  return { sys: parseInt(m[1]), dia: parseInt(m[2]) };
}

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? null : n;
}

const W = 480;
const H = 130;
const PADL = 34;
const PADR = 16;
const PADT = 12;
const PADB = 26;

function scaleY(val: number, min: number, max: number) {
  const range = max - min || 1;
  return PADT + (H - PADT - PADB) * (1 - (val - min) / range);
}

function toPoints(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

export function VitalsTrendChart({ records }: VitalsTrendChartProps) {
  const withVitals = [...records].filter(r => r.vitals).reverse();
  if (withVitals.length < 2) return null;

  const n = withVitals.length;
  const xStep = (W - PADL - PADR) / Math.max(n - 1, 1);
  const xOf = (i: number) => PADL + i * xStep;

  const dates = withVitals.map(r => r.date.split("/").slice(0, 2).join("/"));
  const bpData = withVitals.map(r => r.vitals?.bp ? parseBP(r.vitals.bp) : null);
  const wData = withVitals.map(r => r.vitals?.weight ? parseNum(r.vitals.weight) : null);

  const hasBP = bpData.some(Boolean);
  const hasWeight = wData.some(x => x !== null);
  if (!hasBP && !hasWeight) return null;

  const bpVals = bpData.flatMap(x => x ? [x.sys, x.dia] : []);
  const bpMin = bpVals.length ? Math.max(0, Math.min(...bpVals) - 10) : 60;
  const bpMax = bpVals.length ? Math.max(...bpVals) + 10 : 160;

  const wVals = wData.filter((x): x is number => x !== null);
  const wMin = wVals.length ? Math.max(0, Math.min(...wVals) - 5) : 50;
  const wMax = wVals.length ? Math.max(...wVals) + 5 : 100;

  const sysPoints: [number, number][] = [];
  const diaPoints: [number, number][] = [];
  const wPoints: [number, number][] = [];

  withVitals.forEach((_, i) => {
    const x = xOf(i);
    if (bpData[i]) {
      sysPoints.push([x, scaleY(bpData[i]!.sys, bpMin, bpMax)]);
      diaPoints.push([x, scaleY(bpData[i]!.dia, bpMin, bpMax)]);
    }
    if (wData[i] !== null) {
      wPoints.push([x, scaleY(wData[i]!, wMin, wMax)]);
    }
  });

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--slate-200)", padding: "14px 18px", marginBottom: 20 }}>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--slate-500)", textTransform: "uppercase", letterSpacing: 0.8 }}>
          Tendencia de signos vitales
        </span>
        <div style={{ display: "flex", gap: 14 }}>
          {hasBP && (
            <>
              <LegendItem color="#EF4444" label="TAS" />
              <LegendItem color="#3B82F6" label="TAD" />
            </>
          )}
          {hasWeight && <LegendItem color="#10B981" label="Peso kg" dashed />}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Grid */}
        {[0, 0.33, 0.67, 1].map(f => {
          const y = PADT + f * (H - PADT - PADB);
          return <line key={f} x1={PADL} y1={y} x2={W - PADR} y2={y} stroke="#E2E8F0" strokeWidth={1} />;
        })}

        {/* X-axis labels */}
        {dates.map((d, i) => (
          <text key={i} x={xOf(i)} y={H - 4}
            textAnchor="middle" fill="#94A3B8" fontSize={9} fontFamily="system-ui">
            {d}
          </text>
        ))}

        {/* Y-axis labels */}
        {hasBP && [0, 0.5, 1].map(f => {
          const val = Math.round(bpMin + (bpMax - bpMin) * (1 - f));
          const y = PADT + f * (H - PADT - PADB);
          return (
            <text key={f} x={PADL - 4} y={y + 4}
              textAnchor="end" fill="#94A3B8" fontSize={8.5} fontFamily="Georgia, serif">
              {val}
            </text>
          );
        })}

        {/* Lines */}
        {sysPoints.length >= 2 && (
          <polyline points={toPoints(sysPoints)} fill="none" stroke="#EF4444" strokeWidth={2}
            strokeLinejoin="round" strokeLinecap="round" />
        )}
        {diaPoints.length >= 2 && (
          <polyline points={toPoints(diaPoints)} fill="none" stroke="#3B82F6" strokeWidth={2}
            strokeLinejoin="round" strokeLinecap="round" />
        )}
        {wPoints.length >= 2 && (
          <polyline points={toPoints(wPoints)} fill="none" stroke="#10B981" strokeWidth={2}
            strokeDasharray="5 3" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Dots */}
        {sysPoints.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#EF4444" />)}
        {diaPoints.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#3B82F6" />)}
        {wPoints.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#10B981" />)}
      </svg>
    </div>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <svg width={18} height={10}>
        <line x1={0} y1={5} x2={18} y2={5}
          stroke={color} strokeWidth={2}
          strokeDasharray={dashed ? "4 3" : undefined}
          strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: 10, color: "var(--slate-500)" }}>{label}</span>
    </div>
  );
}
