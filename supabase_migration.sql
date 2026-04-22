-- ============================================================
-- HIS SaaS — Migration: Módulo Facturación + Camas/Internaciones
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Fecha: 2026-04-22
-- ============================================================

-- ── Obras Sociales / Insurance Providers ──────────────────────
CREATE TABLE IF NOT EXISTS insurance_providers (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"    text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          text NOT NULL,
  code          text,
  description   text,
  "isActive"    boolean DEFAULT true,
  "createdAt"   timestamptz DEFAULT now(),
  "updatedAt"   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insurance_providers_tenant ON insurance_providers("tenantId");

-- ── Nomencladores (por obra social) ──────────────────────────
CREATE TABLE IF NOT EXISTS nomenclators (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"            text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "insuranceProviderId" uuid NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  version               text,
  "isActive"            boolean DEFAULT true,
  "createdAt"           timestamptz DEFAULT now(),
  "updatedAt"           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nomenclators_tenant ON nomenclators("tenantId");
CREATE INDEX IF NOT EXISTS idx_nomenclators_provider ON nomenclators("insuranceProviderId");

-- ── Prácticas médicas (códigos del nomenclador) ───────────────
CREATE TABLE IF NOT EXISTS medical_practices (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "nomenclatorId"  uuid NOT NULL REFERENCES nomenclators(id) ON DELETE CASCADE,
  code             text NOT NULL,
  name             text NOT NULL,
  description      text,
  "defaultValue"   numeric(12,2) DEFAULT 0,
  "isActive"       boolean DEFAULT true,
  "createdAt"      timestamptz DEFAULT now(),
  "updatedAt"      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_practices_tenant ON medical_practices("tenantId");
CREATE INDEX IF NOT EXISTS idx_medical_practices_nomenclator ON medical_practices("nomenclatorId");

-- ── Cobertura de pacientes ────────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_coverages (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"            text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "patientId"           uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "insuranceProviderId" uuid NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
  "affiliateNumber"     text,
  "planName"            text,
  status                text DEFAULT 'ACTIVE',
  "isPrimary"           boolean DEFAULT true,
  "validFrom"           date,
  "validUntil"          date,
  "createdAt"           timestamptz DEFAULT now(),
  "updatedAt"           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_coverages_tenant ON patient_coverages("tenantId");
CREATE INDEX IF NOT EXISTS idx_patient_coverages_patient ON patient_coverages("patientId");
CREATE INDEX IF NOT EXISTS idx_patient_coverages_provider ON patient_coverages("insuranceProviderId");

-- ── Facturas ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"            text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "patientId"           uuid REFERENCES patients(id) ON DELETE SET NULL,
  "insuranceProviderId" uuid REFERENCES insurance_providers(id) ON DELETE SET NULL,
  number                text,
  status                text DEFAULT 'DRAFT',
  subtotal              numeric(12,2) DEFAULT 0,
  total                 numeric(12,2) DEFAULT 0,
  notes                 text,
  "issuedAt"            timestamptz,
  "createdAt"           timestamptz DEFAULT now(),
  "updatedAt"           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices("tenantId");
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices("patientId");

-- ── Ítems de factura ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"          text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "invoiceId"         uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  "medicalPracticeId" uuid REFERENCES medical_practices(id) ON DELETE SET NULL,
  quantity            integer DEFAULT 1,
  "unitPrice"         numeric(12,2) NOT NULL,
  "totalPrice"        numeric(12,2) NOT NULL,
  description         text,
  "createdAt"         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items("invoiceId");

-- ── Camas hospitalarias ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS beds (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"   text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code         text NOT NULL,
  room         text,
  ward         text,
  status       text DEFAULT 'AVAILABLE',
  "createdAt"  timestamptz DEFAULT now(),
  "updatedAt"  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beds_tenant ON beds("tenantId");

-- ── Internaciones / Admisiones ────────────────────────────────
CREATE TABLE IF NOT EXISTS admissions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"    text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "patientId"   uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "doctorId"    text REFERENCES users(id) ON DELETE SET NULL,
  "bedId"       uuid REFERENCES beds(id) ON DELETE SET NULL,
  reason        text,
  "admittedAt"  timestamptz DEFAULT now(),
  "dischargedAt" timestamptz,
  status        text DEFAULT 'ACTIVE',
  notes         text,
  "createdAt"   timestamptz DEFAULT now(),
  "updatedAt"   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admissions_tenant ON admissions("tenantId");
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON admissions("patientId");
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);

-- ── RLS Policies (habilitar Row Level Security) ───────────────
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomenclators ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_coverages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

-- Políticas: acceso solo al propio tenant (service_role bypasses RLS)
CREATE POLICY "tenant_isolation_insurance_providers" ON insurance_providers
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tenant_isolation_nomenclators" ON nomenclators
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tenant_isolation_medical_practices" ON medical_practices
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tenant_isolation_patient_coverages" ON patient_coverages
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tenant_isolation_invoices" ON invoices
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tenant_isolation_invoice_items" ON invoice_items
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tenant_isolation_beds" ON beds
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tenant_isolation_admissions" ON admissions
  USING (auth.uid() IS NOT NULL);

-- ── Datos de ejemplo (seed) para tenant de prueba ─────────────
-- Reemplazar 'TU_TENANT_ID' con el ID real de tu tenant
-- Puedes obtenerlo con: SELECT id FROM tenants LIMIT 1;

/*
-- Descomenta y ejecuta reemplazando TU_TENANT_ID:

DO $$
DECLARE
  v_tenant text := 'TU_TENANT_ID';
  v_prov1 uuid;
  v_prov2 uuid;
  v_prov3 uuid;
  v_nom1 uuid;
  v_nom2 uuid;
  v_nom3 uuid;
  v_pat uuid;
BEGIN
  -- Obras Sociales
  INSERT INTO insurance_providers ("tenantId", name, code, description, "isActive")
  VALUES
    (v_tenant, 'OSDE 410', 'OS01', 'Plan 410 - Alta complejidad', true),
    (v_tenant, 'PAMI', 'PM01', 'Programa de Atención Médica Integral', true),
    (v_tenant, 'Swiss Medical', 'SM01', 'Swiss Medical Group', true)
  RETURNING id INTO v_prov1;

  SELECT id INTO v_prov1 FROM insurance_providers WHERE "tenantId" = v_tenant AND code = 'OS01';
  SELECT id INTO v_prov2 FROM insurance_providers WHERE "tenantId" = v_tenant AND code = 'PM01';
  SELECT id INTO v_prov3 FROM insurance_providers WHERE "tenantId" = v_tenant AND code = 'SM01';

  -- Nomencladores
  INSERT INTO nomenclators ("tenantId", "insuranceProviderId", name, version, "isActive")
  VALUES
    (v_tenant, v_prov1, 'Nomenclador OSDE 2026', '2026', true),
    (v_tenant, v_prov2, 'Nomenclador PAMI 2026', '2026', true),
    (v_tenant, v_prov3, 'Nomenclador Swiss 2026', '2026', true);

  SELECT id INTO v_nom1 FROM nomenclators WHERE "insuranceProviderId" = v_prov1;
  SELECT id INTO v_nom2 FROM nomenclators WHERE "insuranceProviderId" = v_prov2;
  SELECT id INTO v_nom3 FROM nomenclators WHERE "insuranceProviderId" = v_prov3;

  -- Prácticas médicas - OSDE
  INSERT INTO medical_practices ("tenantId", "nomenclatorId", code, name, "defaultValue", "isActive")
  VALUES
    (v_tenant, v_nom1, '040101', 'Consulta médica general', 4800, true),
    (v_tenant, v_nom1, '040201', 'Consulta especialista', 7200, true),
    (v_tenant, v_nom1, '310101', 'Electrocardiograma', 5500, true),
    (v_tenant, v_nom1, '390101', 'Ecografía abdominal', 9800, true);

  -- Prácticas médicas - PAMI
  INSERT INTO medical_practices ("tenantId", "nomenclatorId", code, name, "defaultValue", "isActive")
  VALUES
    (v_tenant, v_nom2, '040101', 'Consulta médica general', 3200, true),
    (v_tenant, v_nom2, '040201', 'Consulta especialista', 5100, true),
    (v_tenant, v_nom2, '390101', 'Ecografía abdominal', 7800, true);

  -- Prácticas médicas - Swiss Medical
  INSERT INTO medical_practices ("tenantId", "nomenclatorId", code, name, "defaultValue", "isActive")
  VALUES
    (v_tenant, v_nom3, '040101', 'Consulta médica general', 5200, true),
    (v_tenant, v_nom3, '040201', 'Consulta especialista', 8100, true),
    (v_tenant, v_nom3, '380201', 'Ecografía pelviana', 7400, true);

  -- Camas
  INSERT INTO beds ("tenantId", code, room, ward, status)
  VALUES
    (v_tenant, 'A-01', 'Hab 101', 'Clínica Médica', 'OCCUPIED'),
    (v_tenant, 'A-02', 'Hab 101', 'Clínica Médica', 'AVAILABLE'),
    (v_tenant, 'A-03', 'Hab 102', 'Clínica Médica', 'AVAILABLE'),
    (v_tenant, 'B-01', 'Hab 201', 'Cirugía', 'OCCUPIED'),
    (v_tenant, 'B-02', 'Hab 201', 'Cirugía', 'MAINTENANCE'),
    (v_tenant, 'C-01', 'Hab 301', 'Pediatría', 'AVAILABLE'),
    (v_tenant, 'UCI-01', 'UCI', 'UTI', 'OCCUPIED'),
    (v_tenant, 'UCI-02', 'UCI', 'UTI', 'AVAILABLE');

END$$;
*/
