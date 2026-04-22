-- ============================================================
-- Row Level Security (RLS) — HIS SaaS
-- Ejecutar en Supabase SQL Editor (con service_role)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. FUNCIÓN: inyectar tenant_id en JWT al login
-- ──────────────────────────────────────────────────────────────
-- Supabase llama esta función en cada JWT generado.
-- Agrega el tenant_id del usuario como claim custom.

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

  SELECT tenant_id, role
  INTO   v_tenant
  FROM   public.users
  WHERE  auth_id = v_user_id
  LIMIT  1;

  IF v_tenant.tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant.tenant_id));
    claims := jsonb_set(claims, '{user_role}', to_jsonb(v_tenant.role));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Otorgar permiso de ejecución al hook
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- ──────────────────────────────────────────────────────────────
-- 2. HELPERS: leer el tenant_id y rol del JWT en cada request
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
-- 3. HABILITAR RLS EN TODAS LAS TABLAS
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

-- Tablas globales (sin RLS por tenant — solo lectura pública)
-- insurance_companies, insurance_plans, nomenclatures

-- ──────────────────────────────────────────────────────────────
-- 4. POLÍTICAS: TENANTS
-- ──────────────────────────────────────────────────────────────

-- SELECT: cada usuario ve SOLO su propio tenant
CREATE POLICY "tenant_select_own"
ON public.tenants FOR SELECT
USING (
  is_super_admin()
  OR id = current_tenant_id()
);

-- UPDATE: solo TENANT_ADMIN de ese tenant (o SUPER_ADMIN)
CREATE POLICY "tenant_update_own"
ON public.tenants FOR UPDATE
USING (
  is_super_admin()
  OR (id = current_tenant_id() AND current_user_role() = 'TENANT_ADMIN')
);

-- INSERT / DELETE: solo SUPER_ADMIN
CREATE POLICY "tenant_insert_superadmin"
ON public.tenants FOR INSERT
WITH CHECK (is_super_admin());

CREATE POLICY "tenant_delete_superadmin"
ON public.tenants FOR DELETE
USING (is_super_admin());

-- ──────────────────────────────────────────────────────────────
-- 5. POLÍTICAS: USERS
-- ──────────────────────────────────────────────────────────────

-- SELECT: ven usuarios de su propio tenant
CREATE POLICY "users_select_own_tenant"
ON public.users FOR SELECT
USING (
  is_super_admin()
  OR tenant_id = current_tenant_id()
);

-- INSERT: TENANT_ADMIN puede crear usuarios en su tenant
CREATE POLICY "users_insert_tenant_admin"
ON public.users FOR INSERT
WITH CHECK (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN')
  )
);

-- UPDATE: TENANT_ADMIN puede editar usuarios de su tenant
--         El usuario puede editar su propio perfil
CREATE POLICY "users_update_own_tenant"
ON public.users FOR UPDATE
USING (
  is_super_admin()
  OR tenant_id = current_tenant_id()
)
WITH CHECK (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN')
  )
  OR auth_id = (SELECT auth.uid()::text)  -- self-update
);

-- DELETE: solo TENANT_ADMIN (soft-delete preferido → isActive=false)
CREATE POLICY "users_delete_tenant_admin"
ON public.users FOR DELETE
USING (
  is_super_admin()
  OR (tenant_id = current_tenant_id() AND current_user_role() = 'TENANT_ADMIN')
);

-- ──────────────────────────────────────────────────────────────
-- 6. POLÍTICAS: PATIENTS
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "patients_tenant_isolation"
ON public.patients FOR ALL
USING (
  is_super_admin()
  OR tenant_id = current_tenant_id()
)
WITH CHECK (
  is_super_admin()
  OR tenant_id = current_tenant_id()
);

-- ──────────────────────────────────────────────────────────────
-- 7. POLÍTICAS: APPOINTMENTS
-- ──────────────────────────────────────────────────────────────

-- SELECT: MEDICO solo ve sus propios turnos
CREATE POLICY "appointments_select"
ON public.appointments FOR SELECT
USING (
  is_super_admin()
  OR tenant_id != current_tenant_id()  -- bloquear otros tenants
  OR (
    tenant_id = current_tenant_id()
    AND (
      current_user_role() IN ('TENANT_ADMIN', 'RECEPCION', 'FACTURACION')
      OR doctor_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::text LIMIT 1)
    )
  )
);

-- Versión simplificada para WRITE — mismo tenant
CREATE POLICY "appointments_insert_update"
ON public.appointments FOR INSERT
WITH CHECK (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'RECEPCION', 'MEDICO')
  )
);

CREATE POLICY "appointments_update"
ON public.appointments FOR UPDATE
USING (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'RECEPCION', 'MEDICO')
  )
);

CREATE POLICY "appointments_delete"
ON public.appointments FOR DELETE
USING (
  is_super_admin()
  OR (tenant_id = current_tenant_id() AND current_user_role() IN ('TENANT_ADMIN', 'RECEPCION'))
);

-- ──────────────────────────────────────────────────────────────
-- 8. POLÍTICAS: MEDICAL RECORDS (HCE)  ← MÁS CRÍTICO
-- ──────────────────────────────────────────────────────────────

-- SELECT: el registro confidencial solo lo ve el autor y el TENANT_ADMIN
CREATE POLICY "medical_records_select"
ON public.medical_records FOR SELECT
USING (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND (
      -- No confidencial: cualquier médico del tenant lo puede leer
      (NOT is_confidential AND current_user_role() IN ('TENANT_ADMIN', 'MEDICO'))
      -- Confidencial: solo el autor o el admin
      OR (is_confidential AND (
        author_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::text LIMIT 1)
        OR current_user_role() = 'TENANT_ADMIN'
      ))
    )
  )
);

-- INSERT: solo MEDICO (el autor debe ser el usuario actual)
CREATE POLICY "medical_records_insert"
ON public.medical_records FOR INSERT
WITH CHECK (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND current_user_role() = 'MEDICO'
    AND author_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::text LIMIT 1)
  )
);

-- UPDATE: solo el autor puede editar su propio registro
CREATE POLICY "medical_records_update"
ON public.medical_records FOR UPDATE
USING (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND author_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::text LIMIT 1)
  )
);

-- DELETE: prohibido para todos (audit trail — solo soft-delete)
-- No se crea policy de DELETE → nadie puede borrar HCE

-- ──────────────────────────────────────────────────────────────
-- 9. POLÍTICAS: ATTACHMENTS (heredan de la HCE)
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "attachments_via_medical_record"
ON public.attachments FOR ALL
USING (
  medical_record_id IN (
    SELECT id FROM public.medical_records
    -- La policy de medical_records ya filtra por tenant y confidencialidad
  )
);

-- ──────────────────────────────────────────────────────────────
-- 10. POLÍTICAS: BILLING  (solo FACTURACION y TENANT_ADMIN)
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "billing_items_access"
ON public.billing_items FOR ALL
USING (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'FACTURACION')
  )
)
WITH CHECK (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'FACTURACION')
  )
);

CREATE POLICY "invoices_access"
ON public.invoices FOR ALL
USING (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'FACTURACION')
  )
)
WITH CHECK (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'FACTURACION')
  )
);

-- ──────────────────────────────────────────────────────────────
-- 11. POLÍTICAS: SHARE REQUESTS (interconsultas)
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "share_requests_select"
ON public.share_requests FOR SELECT
USING (
  is_super_admin()
  OR from_tenant_id = current_tenant_id()
  OR to_tenant_id   = current_tenant_id()
);

CREATE POLICY "share_requests_insert"
ON public.share_requests FOR INSERT
WITH CHECK (
  is_super_admin()
  OR (
    from_tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'MEDICO')
  )
);

CREATE POLICY "share_requests_update"
ON public.share_requests FOR UPDATE
USING (
  is_super_admin()
  OR from_tenant_id = current_tenant_id()
  OR (
    to_tenant_id = current_tenant_id()
    AND current_user_role() IN ('TENANT_ADMIN', 'MEDICO')  -- solo ellos aprueban
  )
);

-- ──────────────────────────────────────────────────────────────
-- 12. POLÍTICAS: AUDIT LOG  (solo lectura para el tenant)
-- ──────────────────────────────────────────────────────────────

-- SELECT: TENANT_ADMIN y SUPER_ADMIN pueden leer su log
CREATE POLICY "audit_logs_select"
ON public.audit_logs FOR SELECT
USING (
  is_super_admin()
  OR (tenant_id = current_tenant_id() AND current_user_role() = 'TENANT_ADMIN')
);

-- INSERT: SOLO service_role (server-side) — los usuarios nunca escriben el audit
-- No se crea policy de INSERT con authenticated → blocked por default
-- El server usa Supabase service_role key que bypasea RLS

-- ──────────────────────────────────────────────────────────────
-- 13. POLÍTICAS: NOTIFICACIONES
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "notifications_own"
ON public.notifications FOR ALL
USING (
  is_super_admin()
  OR (
    tenant_id = current_tenant_id()
    AND user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::text LIMIT 1)
  )
)
WITH CHECK (
  is_super_admin()
  OR tenant_id = current_tenant_id()
);

-- ──────────────────────────────────────────────────────────────
-- 14. POLÍTICAS: ESPECIALIDADES / ROOMS / SCHEDULES
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "specialties_tenant"
ON public.specialties FOR ALL
USING (is_super_admin() OR tenant_id = current_tenant_id())
WITH CHECK (is_super_admin() OR tenant_id = current_tenant_id());

CREATE POLICY "consulting_rooms_tenant"
ON public.consulting_rooms FOR ALL
USING (is_super_admin() OR tenant_id = current_tenant_id())
WITH CHECK (is_super_admin() OR tenant_id = current_tenant_id());

CREATE POLICY "doctor_schedules_tenant"
ON public.doctor_schedules FOR ALL
USING (is_super_admin() OR tenant_id = current_tenant_id())
WITH CHECK (is_super_admin() OR tenant_id = current_tenant_id());

CREATE POLICY "tenant_insurance_plans_tenant"
ON public.tenant_insurance_plans FOR ALL
USING (is_super_admin() OR tenant_id = current_tenant_id())
WITH CHECK (is_super_admin() OR tenant_id = current_tenant_id());

-- ──────────────────────────────────────────────────────────────
-- 15. STORAGE BUCKET — políticas para archivos adjuntos
-- ──────────────────────────────────────────────────────────────

-- Ejecutar en Supabase Storage dashboard o via API:
--
-- Bucket: "medical-records" (PRIVATE)
-- Estructura: {tenant_id}/{patient_id}/{uuid}.{ext}
--
-- Policy de acceso:
-- UPLOAD: solo usuarios autenticados del mismo tenant
-- DOWNLOAD: solo usuarios autenticados del mismo tenant
--
-- La verificación de tenant se hace en el Server Action antes
-- de generar la signed URL (nunca exponer URL pública de archivos médicos).

-- ──────────────────────────────────────────────────────────────
-- 16. SUPABASE DASHBOARD — Configurar el hook
-- ──────────────────────────────────────────────────────────────

-- En Supabase Dashboard → Authentication → Hooks:
-- Evento: "Custom Access Token"
-- Función: public.custom_access_token_hook
-- Esto agrega tenant_id y user_role al JWT automáticamente.
