import type { NavId } from "./types";

/* ─── Role definitions ─────────────────────────────────────────── */

export type SystemRole =
  | "MEDICO"
  | "ENFERMERO"
  | "TECNICO"
  | "CAMILLERO"
  | "RECEPCION"
  | "ADMISION"
  | "FACTURACION"
  | "ADMIN_INST"
  | "TENANT_ADMIN"
  | "SUPER_ADMIN"
  | "ADMIN_IT";

export const ROLE_LABELS: Record<string, string> = {
  MEDICO:       "Médico/a",
  ENFERMERO:    "Enfermero/a",
  TECNICO:      "Técnico/a",
  CAMILLERO:    "Camillero/a",
  RECEPCION:    "Recepción",
  ADMISION:     "Admisión / Internación",
  FACTURACION:  "Facturación",
  ADMIN_INST:   "Admin Institucional",
  TENANT_ADMIN: "Admin Institución",
  SUPER_ADMIN:  "Super Admin",
  ADMIN_IT:     "Admin IT",
};

/* ─── Nav visibility per role ──────────────────────────────────── */

const ALL_NAV: NavId[] = [
  "dashboard", "patients", "records", "appointments", "guards",
  "insurance", "billing", "sharing", "users", "audit", "reportes", "settings",
];

export const ROLE_NAV: Record<string, NavId[]> = {
  MEDICO:       ["dashboard", "patients", "records", "appointments", "guards", "sharing", "settings"],
  ENFERMERO:    ["dashboard", "patients", "records", "guards", "settings"],
  TECNICO:      ["dashboard", "patients", "records", "settings"],
  CAMILLERO:    ["dashboard", "guards", "settings"],
  RECEPCION:    ["dashboard", "patients", "appointments", "insurance", "settings"],
  ADMISION:     ["dashboard", "patients", "appointments", "guards", "settings"],
  FACTURACION:  ["dashboard", "billing", "insurance", "patients", "reportes", "settings"],
  ADMIN_INST:   ALL_NAV,
  TENANT_ADMIN: ALL_NAV,
  SUPER_ADMIN:  ALL_NAV,
  ADMIN_IT:     ALL_NAV,
};

export function getVisibleNav(role: string | undefined): NavId[] {
  return ROLE_NAV[role ?? ""] ?? ALL_NAV;
}

/* ─── Dashboard type per role ──────────────────────────────────── */

export type DashboardType = "medico" | "enfermero" | "recepcion" | "facturacion" | "admin";

export function getDashboardType(role: string | undefined): DashboardType {
  if (!role) return "admin";
  if (["MEDICO", "TECNICO"].includes(role))     return "medico";
  if (role === "ENFERMERO")                      return "enfermero";
  if (["RECEPCION", "ADMISION", "CAMILLERO"].includes(role)) return "recepcion";
  if (role === "FACTURACION")                    return "facturacion";
  return "admin";
}

/* ─── Permission check helpers ─────────────────────────────────── */

export function canSeeModule(role: string | undefined, navId: NavId): boolean {
  return getVisibleNav(role).includes(navId);
}

export function canSeeBilling(role: string | undefined): boolean {
  return ["FACTURACION", "ADMIN_INST", "TENANT_ADMIN", "SUPER_ADMIN", "ADMIN_IT"].includes(role ?? "");
}

export function canEditPatients(role: string | undefined): boolean {
  return !["CAMILLERO", "FACTURACION"].includes(role ?? "");
}

export function isAdminRole(role: string | undefined): boolean {
  return ["ADMIN_INST", "TENANT_ADMIN", "SUPER_ADMIN", "ADMIN_IT"].includes(role ?? "");
}
