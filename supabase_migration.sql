-- ============================================================
-- HIS SaaS — Migration v4 (drop & recreate con tipos correctos)
-- Elimina tablas previas que pudieran tener columnas en snake_case
-- tenants.id / patients.id / users.id son TEXT (CUID de Prisma)
-- Las nuevas tablas usan UUID para sus propios IDs
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Drop previo (orden inverso de dependencias) ─────────────────
DROP TABLE IF EXISTS admissions       CASCADE;
DROP TABLE IF EXISTS invoice_items    CASCADE;
DROP TABLE IF EXISTS invoices         CASCADE;
DROP TABLE IF EXISTS patient_coverages CASCADE;
DROP TABLE IF EXISTS medical_practices CASCADE;
DROP TABLE IF EXISTS nomenclators      CASCADE;
DROP TABLE IF EXISTS beds              CASCADE;
DROP TABLE IF EXISTS insurance_providers CASCADE;

-- ── Obras Sociales ─────────────────────────────────────────────
CREATE TABLE insurance_providers (
  id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"   text    NOT NULL,                -- CUID → text
  name         text    NOT NULL,
  code         text,
  description  text,
  "isActive"   boolean DEFAULT true,
  "createdAt"  timestamptz DEFAULT now(),
  "updatedAt"  timestamptz DEFAULT now()
);
CREATE INDEX idx_ip_tenant ON insurance_providers("tenantId");

-- ── Nomencladores ──────────────────────────────────────────────
CREATE TABLE nomenclators (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"            text NOT NULL,
  "insuranceProviderId" uuid NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  version               text,
  "isActive"            boolean DEFAULT true,
  "createdAt"           timestamptz DEFAULT now(),
  "updatedAt"           timestamptz DEFAULT now()
);
CREATE INDEX idx_nom_tenant   ON nomenclators("tenantId");
CREATE INDEX idx_nom_provider ON nomenclators("insuranceProviderId");

-- ── Prácticas médicas ──────────────────────────────────────────
CREATE TABLE medical_practices (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"      text NOT NULL,
  "nomenclatorId" uuid NOT NULL REFERENCES nomenclators(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  description     text,
  "defaultValue"  numeric(12,2) DEFAULT 0,
  "isActive"      boolean DEFAULT true,
  "createdAt"     timestamptz DEFAULT now(),
  "updatedAt"     timestamptz DEFAULT now()
);
CREATE INDEX idx_mp_tenant      ON medical_practices("tenantId");
CREATE INDEX idx_mp_nomenclator ON medical_practices("nomenclatorId");

-- ── Coberturas de pacientes ────────────────────────────────────
CREATE TABLE patient_coverages (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"            text NOT NULL,
  "patientId"           text NOT NULL,           -- CUID → text
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
CREATE INDEX idx_pc_tenant   ON patient_coverages("tenantId");
CREATE INDEX idx_pc_patient  ON patient_coverages("patientId");
CREATE INDEX idx_pc_provider ON patient_coverages("insuranceProviderId");

-- ── Facturas ───────────────────────────────────────────────────
CREATE TABLE invoices (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"            text NOT NULL,
  "patientId"           text,                    -- CUID → text (nullable)
  "insuranceProviderId" uuid REFERENCES insurance_providers(id) ON DELETE SET NULL,
  number                text,
  status                text DEFAULT 'PENDING',
  subtotal              numeric(12,2) DEFAULT 0,
  total                 numeric(12,2) DEFAULT 0,
  notes                 text,
  "issuedAt"            timestamptz,
  "createdAt"           timestamptz DEFAULT now(),
  "updatedAt"           timestamptz DEFAULT now()
);
CREATE INDEX idx_inv_tenant  ON invoices("tenantId");
CREATE INDEX idx_inv_patient ON invoices("patientId");

-- ── Ítems de factura ───────────────────────────────────────────
CREATE TABLE invoice_items (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"          text NOT NULL,
  "invoiceId"         uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  "medicalPracticeId" uuid REFERENCES medical_practices(id) ON DELETE SET NULL,
  description         text,
  quantity            integer DEFAULT 1,
  "unitPrice"         numeric(12,2) NOT NULL,
  "totalPrice"        numeric(12,2) NOT NULL,
  "createdAt"         timestamptz DEFAULT now()
);
CREATE INDEX idx_ii_invoice ON invoice_items("invoiceId");

-- ── Camas ──────────────────────────────────────────────────────
CREATE TABLE beds (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"  text NOT NULL,
  code        text NOT NULL,
  room        text,
  ward        text,
  status      text DEFAULT 'AVAILABLE',
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
CREATE INDEX idx_beds_tenant ON beds("tenantId");

-- ── Internaciones ──────────────────────────────────────────────
CREATE TABLE admissions (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId"     text NOT NULL,
  "patientId"    text NOT NULL,             -- CUID → text
  "doctorId"     text,                      -- CUID → text (nullable)
  "bedId"        uuid REFERENCES beds(id) ON DELETE SET NULL,
  reason         text,
  "admittedAt"   timestamptz DEFAULT now(),
  "dischargedAt" timestamptz,
  status         text DEFAULT 'ACTIVE',
  notes          text,
  "createdAt"    timestamptz DEFAULT now(),
  "updatedAt"    timestamptz DEFAULT now()
);
CREATE INDEX idx_adm_tenant  ON admissions("tenantId");
CREATE INDEX idx_adm_patient ON admissions("patientId");
CREATE INDEX idx_adm_status  ON admissions(status);

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomenclators         ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_practices    ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_coverages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions           ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (cualquier usuario autenticado puede operar)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='insurance_providers' AND policyname='allow_all_authenticated') THEN
    CREATE POLICY allow_all_authenticated ON insurance_providers FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='nomenclators' AND policyname='allow_all_authenticated') THEN
    CREATE POLICY allow_all_authenticated ON nomenclators FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='medical_practices' AND policyname='allow_all_authenticated') THEN
    CREATE POLICY allow_all_authenticated ON medical_practices FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='patient_coverages' AND policyname='allow_all_authenticated') THEN
    CREATE POLICY allow_all_authenticated ON patient_coverages FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='invoices' AND policyname='allow_all_authenticated') THEN
    CREATE POLICY allow_all_authenticated ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='invoice_items' AND policyname='allow_all_authenticated') THEN
    CREATE POLICY allow_all_authenticated ON invoice_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='beds' AND policyname='allow_all_authenticated') THEN
    CREATE POLICY allow_all_authenticated ON beds FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admissions' AND policyname='allow_all_authenticated') THEN
    CREATE POLICY allow_all_authenticated ON admissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── Seed automático: lee tu tenant real y carga datos ──────────
DO $$
DECLARE
  v_tenant text;       -- CUID → text
  v_prov1  uuid;
  v_prov2  uuid;
  v_prov3  uuid;
  v_prov4  uuid;
  v_nom1   uuid;
  v_nom2   uuid;
  v_nom3   uuid;
  v_nom4   uuid;
BEGIN
  -- Toma el primer tenant que exista
  SELECT id INTO v_tenant FROM tenants LIMIT 1;

  IF v_tenant IS NULL THEN
    RAISE NOTICE 'No se encontró ningún tenant. Creá una cuenta primero y volvé a ejecutar.';
    RETURN;
  END IF;

  RAISE NOTICE 'Usando tenant ID: %', v_tenant;

  -- Obras sociales
  IF NOT EXISTS (SELECT 1 FROM insurance_providers WHERE "tenantId" = v_tenant) THEN
    INSERT INTO insurance_providers ("tenantId", name, code, description, "isActive") VALUES
      (v_tenant, 'OSDE 410',      'OS01', 'Plan 410 - Alta complejidad',         true),
      (v_tenant, 'PAMI',          'PM01', 'Programa Atención Médica Integral',   true),
      (v_tenant, 'Swiss Medical', 'SM01', 'Swiss Medical Group',                 true),
      (v_tenant, 'IOMA',          'IO01', 'Instituto de Obra Médica Asistencial', true);
    RAISE NOTICE '✓ Obras sociales creadas';
  ELSE
    RAISE NOTICE '  Obras sociales ya existen, saltando...';
  END IF;

  SELECT id INTO v_prov1 FROM insurance_providers WHERE "tenantId"=v_tenant AND code='OS01';
  SELECT id INTO v_prov2 FROM insurance_providers WHERE "tenantId"=v_tenant AND code='PM01';
  SELECT id INTO v_prov3 FROM insurance_providers WHERE "tenantId"=v_tenant AND code='SM01';
  SELECT id INTO v_prov4 FROM insurance_providers WHERE "tenantId"=v_tenant AND code='IO01';

  -- Nomencladores
  IF NOT EXISTS (SELECT 1 FROM nomenclators WHERE "tenantId" = v_tenant) THEN
    INSERT INTO nomenclators ("tenantId", "insuranceProviderId", name, version) VALUES
      (v_tenant, v_prov1, 'Nomenclador OSDE 2026',  '2026'),
      (v_tenant, v_prov2, 'Nomenclador PAMI 2026',  '2026'),
      (v_tenant, v_prov3, 'Nomenclador Swiss 2026', '2026'),
      (v_tenant, v_prov4, 'Nomenclador IOMA 2026',  '2026');
    RAISE NOTICE '✓ Nomencladores creados';
  END IF;

  SELECT id INTO v_nom1 FROM nomenclators WHERE "insuranceProviderId"=v_prov1;
  SELECT id INTO v_nom2 FROM nomenclators WHERE "insuranceProviderId"=v_prov2;
  SELECT id INTO v_nom3 FROM nomenclators WHERE "insuranceProviderId"=v_prov3;
  SELECT id INTO v_nom4 FROM nomenclators WHERE "insuranceProviderId"=v_prov4;

  -- Prácticas médicas
  IF NOT EXISTS (SELECT 1 FROM medical_practices WHERE "tenantId" = v_tenant) THEN
    INSERT INTO medical_practices ("tenantId","nomenclatorId",code,name,"defaultValue") VALUES
      (v_tenant,v_nom1,'040101','Consulta médica general',4800),
      (v_tenant,v_nom1,'040201','Consulta especialista',7200),
      (v_tenant,v_nom1,'310101','Electrocardiograma',5500),
      (v_tenant,v_nom1,'390101','Ecografía abdominal',9800),
      (v_tenant,v_nom1,'280101','Hemograma completo',2400),
      (v_tenant,v_nom1,'380201','Ecografía pelviana',8100),
      (v_tenant,v_nom2,'040101','Consulta médica general',3200),
      (v_tenant,v_nom2,'040201','Consulta especialista',5100),
      (v_tenant,v_nom2,'390101','Ecografía abdominal',7800),
      (v_tenant,v_nom2,'280101','Hemograma completo',1800),
      (v_tenant,v_nom3,'040101','Consulta médica general',5200),
      (v_tenant,v_nom3,'040201','Consulta especialista',8100),
      (v_tenant,v_nom3,'380201','Ecografía pelviana',7400),
      (v_tenant,v_nom3,'310101','Electrocardiograma',6200),
      (v_tenant,v_nom4,'040101','Consulta médica general',3800),
      (v_tenant,v_nom4,'040201','Consulta especialista',6000),
      (v_tenant,v_nom4,'390101','Ecografía abdominal',8500);
    RAISE NOTICE '✓ Prácticas médicas creadas (17 prácticas)';
  END IF;

  -- Camas hospitalarias
  IF NOT EXISTS (SELECT 1 FROM beds WHERE "tenantId" = v_tenant) THEN
    INSERT INTO beds ("tenantId",code,room,ward,status) VALUES
      (v_tenant,'A-01','Hab 101','Clínica Médica','OCCUPIED'),
      (v_tenant,'A-02','Hab 101','Clínica Médica','AVAILABLE'),
      (v_tenant,'A-03','Hab 102','Clínica Médica','AVAILABLE'),
      (v_tenant,'A-04','Hab 102','Clínica Médica','AVAILABLE'),
      (v_tenant,'B-01','Hab 201','Cirugía','OCCUPIED'),
      (v_tenant,'B-02','Hab 201','Cirugía','MAINTENANCE'),
      (v_tenant,'B-03','Hab 202','Cirugía','AVAILABLE'),
      (v_tenant,'C-01','Hab 301','Pediatría','AVAILABLE'),
      (v_tenant,'C-02','Hab 301','Pediatría','AVAILABLE'),
      (v_tenant,'UCI-01','UCI','UTI','OCCUPIED'),
      (v_tenant,'UCI-02','UCI','UTI','OCCUPIED'),
      (v_tenant,'UCI-03','UCI','UTI','AVAILABLE');
    RAISE NOTICE '✓ Camas creadas (12 camas en 4 sectores)';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration completada exitosamente para tenant: %', v_tenant;
  RAISE NOTICE '   Ahora podés recargar la app y verás LIVE DB en todas las vistas';
END $$;
