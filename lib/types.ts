export type Phase = "login" | "select-institution" | "app";

export interface LoginUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "MEDICO" | "RECEPCION" | "FACTURACION" | "ADMIN_IT" | "ADMIN_INST";
  avatar: string;
  institution: string | null;
  institutionName: string | null;
  specialty?: string;
}

export type NavId =
  | "dashboard"
  | "patients"
  | "records"
  | "appointments"
  | "guards"
  | "insurance"
  | "billing"
  | "sharing"
  | "users"
  | "audit";

export interface Institution {
  id: string;
  name: string;
  type: "CONSULTORIO" | "CLINICA" | "HOSPITAL";
  color: string;
  icon: string;
  tenant: string;
}

export interface UserRole {
  id: string;
  name: string;
  role: "MEDICO" | "RECEPCION" | "FACTURACION" | "ADMIN_IT" | "ADMIN_INST";
  avatar: string;
  perms: string[];
}

export interface Patient {
  id: string;
  dni: string;
  name: string;
  age: number;
  sex: "M" | "F";
  obra: string;
  blood: string;
  phone: string;
  email: string;
  alert: string | null;
  lastVisit: string;
  institution: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  version: number;
  confidential: boolean;
  vitals?: {
    bp?: string;
    temp?: string;
    weight?: string;
    hr?: string;
  };
}

export interface Appointment {
  id: string;
  time: string;
  patient: string;
  patientId: string;
  doctor: string;
  specialty: string;
  status: "CONFIRMADO" | "PENDIENTE" | "EN CURSO" | "CANCELADO";
  obra: string;
  duration: number;
}

export interface Guard {
  id: string;
  doctor: string;
  specialty: string;
  from: string;
  to: string;
  status: "ACTIVA" | "POR TERMINAR" | "PROGRAMADA";
  patients: number;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
  active: boolean;
  plans: number;
  nomenclatures: number;
}

export interface Nomenclature {
  code: string;
  description: string;
  value: number;
  obra: string;
}

export interface BillingItem {
  id: string;
  patient: string;
  obra: string;
  practice: string;
  amount: number;
  status: "LIQUIDADO" | "PENDIENTE" | "OBSERVADO";
  date: string;
  invoice: string | null;
}

export interface ShareRequest {
  id: string;
  patient: string;
  fromInst: string;
  toInst: string;
  requestedBy: string;
  reason: string;
  status: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  date: string;
  expiresAt?: string;
}

export interface AuditEntry {
  id: string;
  time: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
}
