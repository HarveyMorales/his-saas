-- ============================================================
-- Row Level Security (RLS) — HIS SaaS
-- Columnas en camelCase (generadas por Prisma sin @map)
-- Ejecutar con service_role / postgres en Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. FUNCIÓN: inyectar tenantId en JWT al login
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims    jsonb;
  v_user_id text;
  v_tenant  record;
BEGIN
  claims    := event -> 'claims';
  v_user_id := event ->> 'user_id';

  SELECT "tenantId", role
  INTO   v_tenant
  FROM   public.users
  WHERE  "authId" = v_user_id
  LIMIT  1;

  IF v_tenant."tenantId" IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant."tenantId"));
    claims := jsonb_set(claims, '{user_role}', to_jsonb(v_tenant.role::text));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- ──────────────────────────────────────────────────────────────
-- 2. HELPERS: leer tenant_id y rol del JWT en cada request
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id',
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb ->> 'user_role',
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT current_user_role() = 'SUPER_ADMIN';
$$;

-- ──────────────────────────────────────────────────────────────
-- 3. HABILITAR RLS
-- ──────────────────────────────────────────────────────────────

ALTER TABLE public.tenants               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_rooms      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_insurance_plans ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 4. TENANTS
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "tenant_select_own"
ON public.tenants FOR SELECT
USING (is_super_admin() OR id = current_tenant_id());

CREATE POLICY "tenant_update_own"
ON public.tenants FOR UPDATE
USING (
  is_super_admin()
  OR (id = current_tenant_id() AND current_user_role() = 'TENANT_ADMIN')
);

CREATE POLICY "tenant_insert_superadmin"
ON public.tenants FOR INSERT
WITH CHECK (is_super_admin());

CREATE POLICY "tenant_delete_superadmin"
ON public.tenants FOR DELETE
USING (is_super_admin());

-- ──────────────────────────────────────────────────────────────
-- 5. USERS
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "users_select_own_tenant"
ON public.users FOR SELECT
USING (
  is_super_admin()
  OR "tenantId" = current_tenant_id()
);

CREATE POLICY "users_insert_tenant_admin"
ON public.users FOR INSERT
WITH CHECK (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND current_user_role() = 'TENANT_ADMIN'
  )
);

CREATE POLICY "users_update_own_tenant"
ON public.users FOR UPDATE
USING (
  is_super_admin()
  OR "tenantId" = current_tenant_id()
)
WITH CHECK (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND current_user_role() = 'TENANT_ADMIN'
  )
  OR "authId" = auth.uid()::text
);

CREATE POLICY "users_delete_tenant_admin"
ON public.users FOR DELETE
USING (
  is_super_admin()
  OR ("tenantId" = current_tenant_id() AND current_user_role() = 'TENANT_ADMIN')
);

-- ──────────────────────────────────────────────────────────────
-- 6. PATIENTS
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "patients_tenant_isolation"
ON public.patients FOR ALL
USING (
  is_super_admin()
  OR "tenantId" = current_tenant_id()
)
WITH CHECK (
  is_super_admin()
  OR "tenantId" = current_tenant_id()
);

-- ──────────────────────────────────────────────────────────────
-- 7. APPOINTMENTS
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "appointments_select"
ON public.appointments FOR SELECT
USING (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND (
      current_user_role() IN ('TENANT_ADMIN', 'RECEPCION', 'FACTURACION')
      OR "doctorId" = (SELECT id FROM public.users WHERE "authId" = auth.uid()::text LIMIT 1)
    )
  )
);

CREATE POLICY "appointments_insert"
ON public.appointments FOR INSERT
WITH CHECK (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'RECEPCION', 'MEDICO')
  )
);

CREATE POLICY "appointments_update"
ON public.appointments FOR UPDATE
USING (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'RECEPCION', 'MEDICO')
  )
);

CREATE POLICY "appointments_delete"
ON public.appointments FOR DELETE
USING (
  is_super_admin()
  OR ("tenantId" = current_tenant_id() AND current_user_role() IN ('TENANT_ADMIN', 'RECEPCION'))
);

-- ──────────────────────────────────────────────────────────────
-- 8. MEDICAL RECORDS
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "medical_records_select"
ON public.medical_records FOR SELECT
USING (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND (
      (NOT "isConfidential" AND current_user_role() IN ('TENANT_ADMIN', 'MEDICO'))
      OR ("isConfidential" AND (
        "authorId" = (SELECT id FROM public.users WHERE "authId" = auth.uid()::text LIMIT 1)
        OR current_user_role() = 'TENANT_ADMIN'
      ))
    )
  )
);

CREATE POLICY "medical_records_insert"
ON public.medical_records FOR INSERT
WITH CHECK (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND current_user_role() = 'MEDICO'
    AND "authorId" = (SELECT id FROM public.users WHERE "authId" = auth.uid()::text LIMIT 1)
  )
);

CREATE POLICY "medical_records_update"
ON public.medical_records FOR UPDATE
USING (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND "authorId" = (SELECT id FROM public.users WHERE "authId" = auth.uid()::text LIMIT 1)
  )
);

-- ──────────────────────────────────────────────────────────────
-- 9. ATTACHMENTS
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "attachments_via_medical_record"
ON public.attachments FOR ALL
USING (
  "medicalRecordId" IN (SELECT id FROM public.medical_records)
);

-- ──────────────────────────────────────────────────────────────
-- 10. BILLING
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "billing_items_access"
ON public.billing_items FOR ALL
USING (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'FACTURACION')
  )
)
WITH CHECK (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'FACTURACION')
  )
);

CREATE POLICY "invoices_access"
ON public.invoices FOR ALL
USING (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'FACTURACION')
  )
)
WITH CHECK (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'FACTURACION')
  )
);

-- ──────────────────────────────────────────────────────────────
-- 11. SHARE REQUESTS
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "share_requests_select"
ON public.share_requests FOR SELECT
USING (
  is_super_admin()
  OR "fromTenantId" = current_tenant_id()
  OR "toTenantId"   = current_tenant_id()
);

CREATE POLICY "share_requests_insert"
ON public.share_requests FOR INSERT
WITH CHECK (
  is_super_admin()
  OR (
    "fromTenantId" = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'MEDICO')
  )
);

CREATE POLICY "share_requests_update"
ON public.share_requests FOR UPDATE
USING (
  is_super_admin()
  OR "fromTenantId" = current_tenant_id()
  OR (
    "toTenantId" = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'MEDICO')
  )
);

-- ──────────────────────────────────────────────────────────────
-- 12. AUDIT LOG (solo lectura)
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "audit_logs_select"
ON public.audit_logs FOR SELECT
USING (
  is_super_admin()
  OR ("tenantId" = current_tenant_id() AND current_user_role() = 'TENANT_ADMIN')
);

-- ──────────────────────────────────────────────────────────────
-- 13. NOTIFICATIONS
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "notifications_own"
ON public.notifications FOR ALL
USING (
  is_super_admin()
  OR (
    "tenantId" = current_tenant_id()
    AND "userId" = (SELECT id FROM public.users WHERE "authId" = auth.uid()::text LIMIT 1)
  )
)
WITH CHECK (
  is_super_admin()
  OR "tenantId" = current_tenant_id()
);

-- ──────────────────────────────────────────────────────────────
-- 14. SPECIALTIES / ROOMS / SCHEDULES / INSURANCE
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "specialties_tenant"
ON public.specialties FOR ALL
USING (is_super_admin() OR "tenantId" = current_tenant_id())
WITH CHECK (is_super_admin() OR "tenantId" = current_tenant_id());

CREATE POLICY "consulting_rooms_tenant"
ON public.consulting_rooms FOR ALL
USING (is_super_admin() OR "tenantId" = current_tenant_id())
WITH CHECK (is_super_admin() OR "tenantId" = current_tenant_id());

CREATE POLICY "doctor_schedules_tenant"
ON public.doctor_schedules FOR ALL
USING (is_super_admin() OR "tenantId" = current_tenant_id())
WITH CHECK (is_super_admin() OR "tenantId" = current_tenant_id());

CREATE POLICY "tenant_insurance_plans_tenant"
ON public.tenant_insurance_plans FOR ALL
USING (is_super_admin() OR "tenantId" = current_tenant_id())
WITH CHECK (is_super_admin() OR "tenantId" = current_tenant_id());
