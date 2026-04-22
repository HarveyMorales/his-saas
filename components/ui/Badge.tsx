"use client";

type Status =
  | "CONFIRMADO" | "PENDIENTE" | "EN CURSO" | "CANCELADO"
  | "ACTIVA" | "POR TERMINAR" | "PROGRAMADA"
  | "LIQUIDADO" | "OBSERVADO"
  | "APROBADO" | "RECHAZADO";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  CONFIRMADO:   { bg: "#DCFCE7", text: "#166534", dot: "#10B981" },
  PENDIENTE:    { bg: "#FEF9C3", text: "#854D0E", dot: "#F59E0B" },
  "EN CURSO":   { bg: "#DBEAFE", text: "#1E40AF", dot: "#2563EB" },
  CANCELADO:    { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  ACTIVA:       { bg: "#DCFCE7", text: "#166534", dot: "#10B981" },
  "POR TERMINAR": { bg: "#FEF9C3", text: "#854D0E", dot: "#F59E0B" },
  PROGRAMADA:   { bg: "#F3F4F6", text: "#374151", dot: "#94A3B8" },
  LIQUIDADO:    { bg: "#DCFCE7", text: "#166534", dot: "#10B981" },
  OBSERVADO:    { bg: "#FEF9C3", text: "#854D0E", dot: "#F59E0B" },
  APROBADO:     { bg: "#DCFCE7", text: "#166534", dot: "#10B981" },
  RECHAZADO:    { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

export function Badge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? { bg: "#F1F5F9", text: "#64748B", dot: "#94A3B8" };
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, display: "inline-block", flexShrink: 0 }} />
      {status}
    </span>
  );
}
