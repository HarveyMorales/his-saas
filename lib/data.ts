import type {
  Institution, UserRole, Patient, MedicalRecord,
  Appointment, Guard, InsuranceCompany, Nomenclature,
  BillingItem, ShareRequest, AuditEntry, LoginUser
} from "./types";

export const INSTITUTIONS: Institution[] = [
  { id: "inst_001", name: "Consultorio Dr. Romero", type: "CONSULTORIO", color: "#00BFA6", icon: "🩺", tenant: "tenant_001" },
  { id: "inst_002", name: "Clínica San Martín", type: "CLINICA", color: "#2563EB", icon: "🏥", tenant: "tenant_002" },
  { id: "inst_003", name: "Hospital Central", type: "HOSPITAL", color: "#8B5CF6", icon: "🏨", tenant: "tenant_003" },
];

export const USERS: Record<string, UserRole[]> = {
  inst_001: [
    { id: "u1", name: "Dr. Carlos Romero", role: "MEDICO", avatar: "CR", perms: ["records:rw", "appointments:rw", "patients:rw"] },
    { id: "u2", name: "Laura Asistente", role: "RECEPCION", avatar: "LA", perms: ["appointments:rw", "patients:r"] },
  ],
  inst_002: [
    { id: "u3", name: "Dra. Marta Vidal", role: "MEDICO", avatar: "MV", perms: ["records:rw", "appointments:rw", "patients:rw", "billing:r"] },
    { id: "u4", name: "Jorge Recepción", role: "RECEPCION", avatar: "JR", perms: ["appointments:rw", "patients:r"] },
    { id: "u5", name: "Ana Facturación", role: "FACTURACION", avatar: "AF", perms: ["billing:rw", "insurance:r"] },
  ],
  inst_003: [
    { id: "u6", name: "Dr. Luis Campos", role: "MEDICO", avatar: "LC", perms: ["records:rw", "appointments:rw", "patients:rw", "guards:rw"] },
    { id: "u7", name: "IT Admin", role: "ADMIN_IT", avatar: "IT", perms: ["*"] },
  ],
};

export const PATIENTS: Patient[] = [
  { id: "p001", dni: "27.381.445", name: "García, Laura", age: 52, sex: "F", obra: "OSDE 410", blood: "A+", phone: "351-555-0101", email: "lgarcia@email.com", alert: null, lastVisit: "15/04/2026", institution: "inst_002" },
  { id: "p002", dni: "18.992.310", name: "Martínez, Jorge", age: 68, sex: "M", obra: "PAMI", blood: "O+", phone: "351-555-0102", email: "jmartinez@email.com", alert: "⚠️ HC incompleta", lastVisit: "20/04/2026", institution: "inst_002" },
  { id: "p003", dni: "34.112.887", name: "López, Ana", age: 31, sex: "F", obra: "Swiss Medical", blood: "B-", phone: "351-555-0103", email: "alopez@email.com", alert: null, lastVisit: "10/03/2026", institution: "inst_001" },
  { id: "p004", dni: "22.554.001", name: "Fernández, Carlos", age: 45, sex: "M", obra: "Galeno", blood: "AB+", phone: "351-555-0104", email: "cfernandez@email.com", alert: null, lastVisit: "21/04/2026", institution: "inst_003" },
  { id: "p005", dni: "30.771.209", name: "Sosa, María", age: 38, sex: "F", obra: "IOMA", blood: "A-", phone: "351-555-0105", email: "msosa@email.com", alert: "🔴 Alergia: Penicilina", lastVisit: "18/04/2026", institution: "inst_002" },
  { id: "p006", dni: "29.001.338", name: "Rodríguez, Pedro", age: 60, sex: "M", obra: "OSDE 210", blood: "O-", phone: "351-555-0106", email: "prodriguez@email.com", alert: null, lastVisit: "05/04/2026", institution: "inst_001" },
  { id: "p007", dni: "33.445.667", name: "Peralta, Valentina", age: 29, sex: "F", obra: "Swiss Medical", blood: "B+", phone: "351-555-0107", email: "vperalta@email.com", alert: null, lastVisit: "01/04/2026", institution: "inst_002" },
  { id: "p008", dni: "25.118.990", name: "Acosta, Roberto", age: 71, sex: "M", obra: "PAMI", blood: "A+", phone: "351-555-0108", email: "racosta@email.com", alert: "⚠️ Diabetes tipo 2", lastVisit: "19/04/2026", institution: "inst_003" },
];

export const RECORDS: Record<string, MedicalRecord[]> = {
  p001: [
    {
      id: "r001", date: "15/04/2026", doctor: "Dra. Vidal", specialty: "Cardiología",
      diagnosis: "HTA controlada. ECG sin cambios relevantes. Presión arterial 128/82 mmHg.",
      treatment: "Enalapril 10mg c/12hs. Continuar dieta hiposódica. Control en 30 días.",
      notes: "Paciente refiere adherencia al tratamiento. Niega episodios de descompensación.",
      version: 3, confidential: false,
      vitals: { bp: "128/82", temp: "36.4°C", weight: "68kg", hr: "72bpm" }
    },
    {
      id: "r002", date: "01/03/2026", doctor: "Dra. Vidal", specialty: "Cardiología",
      diagnosis: "Evaluación rutinaria. Tensión arterial levemente elevada 138/88 mmHg.",
      treatment: "Ajuste de dosis de Enalapril a 10mg. Restricción de sodio reforzada.",
      version: 2, confidential: false,
      vitals: { bp: "138/88", temp: "36.6°C", weight: "69kg", hr: "76bpm" }
    },
    {
      id: "r003", date: "10/01/2026", doctor: "Dra. Vidal", specialty: "Cardiología",
      diagnosis: "Control trimestral. Laboratorio: colesterol 195 mg/dL, triglicéridos 148.",
      treatment: "Sin cambios en medicación. Se solicita eco Doppler cardíaco para seguimiento.",
      version: 1, confidential: false,
      vitals: { bp: "132/84", temp: "36.5°C", weight: "70kg", hr: "74bpm" }
    },
    {
      id: "r004", date: "15/10/2025", doctor: "Dr. Romero", specialty: "Clínica Médica",
      diagnosis: "Consulta por cefalea. Descartado origen cardíaco. Probable cefalea tensional.",
      treatment: "Ibuprofeno 400mg a demanda. Reposo relativo.",
      version: 1, confidential: false,
    },
  ],
  p002: [
    {
      id: "r005", date: "20/04/2026", doctor: "Dr. Romero", specialty: "Clínica Médica",
      diagnosis: "DBT tipo 2 con regular control glucémico. Glucemia en ayunas 180 mg/dL. HbA1c 8.2%.",
      treatment: "Metformina 850mg con desayuno y cena. Plan alimentario. Control en 15 días.",
      version: 1, confidential: false,
      vitals: { bp: "140/90", temp: "36.7°C", weight: "89kg", hr: "82bpm" }
    },
  ],
  p005: [
    {
      id: "r006", date: "18/04/2026", doctor: "Dra. Vidal", specialty: "Ginecología",
      diagnosis: "Control anual. Sin hallazgos relevantes. PAP sin atipias.",
      treatment: "Solicitud de ecografía pelviana de control.",
      version: 1, confidential: true,
    },
    {
      id: "r007", date: "10/02/2026", doctor: "Dra. Vidal", specialty: "Ginecología",
      diagnosis: "Consulta por irregularidad menstrual. Perfil hormonal solicitado.",
      treatment: "Awaiting lab results. Seguimiento en 4 semanas.",
      version: 1, confidential: true,
    },
  ],
  p003: [
    {
      id: "r008", date: "10/03/2026", doctor: "Dr. Romero", specialty: "Clínica Médica",
      diagnosis: "Episodio de lumbalgia aguda. Sin compromiso neurológico.",
      treatment: "Diclofenac 75mg c/12hs x 5 días. Reposo relativo. Fisioterapia.",
      version: 1, confidential: false,
    },
  ],
};

export const APPOINTMENTS: Appointment[] = [
  { id: "a001", time: "08:00", patient: "García, Laura", patientId: "p001", doctor: "Dra. Vidal", specialty: "Cardiología", status: "CONFIRMADO", obra: "OSDE 410", duration: 30 },
  { id: "a002", time: "08:30", patient: "Martínez, Jorge", patientId: "p002", doctor: "Dr. Romero", specialty: "Clínica Médica", status: "CONFIRMADO", obra: "PAMI", duration: 30 },
  { id: "a003", time: "09:00", patient: "López, Ana", patientId: "p003", doctor: "Dra. Vidal", specialty: "Control", status: "PENDIENTE", obra: "Swiss Medical", duration: 20 },
  { id: "a004", time: "09:30", patient: "Fernández, Carlos", patientId: "p004", doctor: "Dr. Campos", specialty: "Traumatología", status: "EN CURSO", obra: "Galeno", duration: 45 },
  { id: "a005", time: "10:00", patient: "Sosa, María", patientId: "p005", doctor: "Dra. Vidal", specialty: "Ginecología", status: "CONFIRMADO", obra: "IOMA", duration: 30 },
  { id: "a006", time: "10:30", patient: "Rodríguez, Pedro", patientId: "p006", doctor: "Dr. Romero", specialty: "Cardiología", status: "CANCELADO", obra: "OSDE 210", duration: 30 },
  { id: "a007", time: "11:00", patient: "García, Laura", patientId: "p001", doctor: "Dr. Campos", specialty: "Laboratorio", status: "PENDIENTE", obra: "OSDE 410", duration: 15 },
  { id: "a008", time: "11:30", patient: "Peralta, Valentina", patientId: "p007", doctor: "Dra. Vidal", specialty: "Clínica Médica", status: "CONFIRMADO", obra: "Swiss Medical", duration: 20 },
  { id: "a009", time: "12:00", patient: "Acosta, Roberto", patientId: "p008", doctor: "Dr. Campos", specialty: "Diabetología", status: "PENDIENTE", obra: "PAMI", duration: 30 },
];

export const GUARDS: Guard[] = [
  { id: "g001", doctor: "Dr. Romero", specialty: "Clínica Médica", from: "08:00", to: "16:00", status: "ACTIVA", patients: 8 },
  { id: "g002", doctor: "Dra. Figueroa", specialty: "Pediatría", from: "07:00", to: "15:00", status: "ACTIVA", patients: 5 },
  { id: "g003", doctor: "Dr. Campos", specialty: "Urgencias", from: "00:00", to: "12:00", status: "POR TERMINAR", patients: 14 },
  { id: "g004", doctor: "Dr. Silva", specialty: "Traumatología", from: "16:00", to: "00:00", status: "PROGRAMADA", patients: 0 },
];

export const INSURANCE: InsuranceCompany[] = [
  { id: "os001", name: "OSDE 410", code: "OS01", active: true, plans: 3, nomenclatures: 280 },
  { id: "os002", name: "OSDE 210", code: "OS02", active: true, plans: 2, nomenclatures: 195 },
  { id: "os003", name: "PAMI", code: "PM01", active: true, plans: 1, nomenclatures: 320 },
  { id: "os004", name: "Swiss Medical", code: "SM01", active: true, plans: 4, nomenclatures: 415 },
  { id: "os005", name: "IOMA", code: "IO01", active: true, plans: 2, nomenclatures: 260 },
  { id: "os006", name: "Galeno", code: "GL01", active: false, plans: 2, nomenclatures: 190 },
];

export const NOMENCLATURES: Nomenclature[] = [
  { code: "040101", description: "Consulta médica general", value: 4800, obra: "OSDE 410" },
  { code: "040201", description: "Consulta especialista", value: 7200, obra: "OSDE 410" },
  { code: "310101", description: "Electrocardiograma", value: 5500, obra: "OSDE 410" },
  { code: "390101", description: "Eco abdominal", value: 9800, obra: "PAMI" },
  { code: "040101", description: "Consulta médica general", value: 3200, obra: "PAMI" },
  { code: "040201", description: "Consulta especialista", value: 5100, obra: "PAMI" },
  { code: "040101", description: "Consulta médica general", value: 5200, obra: "Swiss Medical" },
  { code: "040201", description: "Consulta especialista", value: 8100, obra: "Swiss Medical" },
  { code: "380201", description: "Ecografía pelviana", value: 7400, obra: "Swiss Medical" },
];

export const BILLING: BillingItem[] = [
  { id: "b001", patient: "García, Laura", obra: "OSDE 410", practice: "Consulta especialista", amount: 7200, status: "LIQUIDADO", date: "15/04/2026", invoice: "0001-00001234" },
  { id: "b002", patient: "Martínez, Jorge", obra: "PAMI", practice: "Consulta médica general", amount: 3200, status: "PENDIENTE", date: "20/04/2026", invoice: null },
  { id: "b003", patient: "Sosa, María", obra: "IOMA", practice: "Consulta ginecología", amount: 6100, status: "PENDIENTE", date: "18/04/2026", invoice: null },
  { id: "b004", patient: "López, Ana", obra: "Swiss Medical", practice: "Eco abdominal", amount: 9800, status: "LIQUIDADO", date: "10/03/2026", invoice: "0001-00001198" },
  { id: "b005", patient: "Fernández, Carlos", obra: "Galeno", practice: "Traumatología - Rx", amount: 8400, status: "OBSERVADO", date: "21/04/2026", invoice: null },
  { id: "b006", patient: "Acosta, Roberto", obra: "PAMI", practice: "Consulta diabetología", amount: 5100, status: "PENDIENTE", date: "19/04/2026", invoice: null },
];

export const HC_SHARE_REQUESTS: ShareRequest[] = [
  { id: "sr001", patient: "García, Laura", fromInst: "Consultorio Dr. Romero", toInst: "Hospital Central", requestedBy: "Dr. Romero", reason: "Interconsulta cardiológica urgente", status: "PENDIENTE", date: "21/04/2026" },
  { id: "sr002", patient: "Sosa, María", fromInst: "Clínica San Martín", toInst: "Hospital Central", requestedBy: "Dra. Vidal", reason: "Derivación oncología", status: "APROBADO", date: "19/04/2026", expiresAt: "19/05/2026" },
];

export const AUDIT_LOG: AuditEntry[] = [
  { id: "al001", time: "09:41", user: "Dra. Vidal", action: "RECORD_VIEW", resource: "HC #r001 → García, Laura", ip: "192.168.1.45" },
  { id: "al002", time: "09:35", user: "Jorge Recepción", action: "APPOINTMENT_UPDATE", resource: "Turno #a003 → López Ana", ip: "192.168.1.12" },
  { id: "al003", time: "09:20", user: "Ana Facturación", action: "BILLING_CREATE", resource: "Item #b005 → Galeno", ip: "192.168.1.78" },
  { id: "al004", time: "09:15", user: "Dr. Romero", action: "RECORD_SHARE_REQUEST", resource: "HC García, Laura → Hospital Central", ip: "192.168.1.30" },
  { id: "al005", time: "08:55", user: "IT Admin", action: "USER_PERMISSION_UPDATE", resource: "User Dra. Vidal → permisos billing", ip: "192.168.1.1" },
  { id: "al006", time: "08:40", user: "Dr. Romero", action: "PATIENT_CREATE", resource: "Paciente → Peralta, Valentina", ip: "192.168.1.30" },
  { id: "al007", time: "08:15", user: "Dra. Vidal", action: "RECORD_WRITE", resource: "HC #r006 → Sosa, María", ip: "192.168.1.45" },
];

export const LOGIN_USERS: LoginUser[] = [
  { id: "lu001", email: "medico@his.com",       password: "medico123",  name: "Dr. Juan Rodríguez",   role: "MEDICO",      avatar: "JR", institution: "inst_002", institutionName: "Clínica San Martín",      specialty: "Clínica Médica" },
  { id: "lu002", email: "recepcion@his.com",    password: "recep123",   name: "María González",       role: "RECEPCION",   avatar: "MG", institution: "inst_002", institutionName: "Clínica San Martín" },
  { id: "lu003", email: "facturacion@his.com",  password: "factur123",  name: "Carlos Pérez",         role: "FACTURACION", avatar: "CP", institution: "inst_003", institutionName: "Hospital Central" },
  { id: "lu004", email: "admin.inst@his.com",   password: "admin123",   name: "Dra. Laura Sánchez",   role: "ADMIN_INST",  avatar: "LS", institution: "inst_001", institutionName: "Consultorio Dr. Romero" },
  { id: "lu005", email: "admin.it@his.com",     password: "it123",      name: "Sebastián Torres",     role: "ADMIN_IT",    avatar: "ST", institution: null, institutionName: null },
  { id: "lu006", email: "medico2@his.com",      password: "medico456",  name: "Dra. Ana Fernández",   role: "MEDICO",      avatar: "AF", institution: "inst_003", institutionName: "Hospital Central",       specialty: "Pediatría" },
];

export const SPECIALTY_COLORS: Record<string, string> = {
  "Cardiología": "#EF4444",
  "Clínica Médica": "#2563EB",
  "Ginecología": "#8B5CF6",
  "Traumatología": "#F59E0B",
  "Pediatría": "#10B981",
  "Neurología": "#06B6D4",
  "Diabetología": "#F97316",
  "Laboratorio": "#6366F1",
  "Urgencias": "#EF4444",
  "Control": "#10B981",
  "default": "#94A3B8",
};
