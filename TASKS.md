# TASKS — HIS SaaS
Última actualización: 2026-04-22

---

## ✅ COMPLETADO

### Infraestructura
- [x] Next.js 14 + TypeScript setup
- [x] Supabase client/server configurado
- [x] Middleware de autenticación (protege rutas)
- [x] lib/supabase/types.ts con schema completo
- [x] lib/hooks/useSupabase.ts con todos los hooks
- [x] vercel.json para deploy

### Autenticación
- [x] LoginView conectado a Supabase Auth
- [x] Redirect post-login con window.location.href
- [x] signOut server action
- [x] getCurrentUserProfile
- [x] SUPER_ADMIN routing a AdminView
- [x] displayUser construido desde supabaseProfile para Sidebar

### Vistas wired a Supabase
- [x] DashboardView — stats reales (turnos, pacientes, pendientes)
- [x] PatientsView — lista real + búsqueda + refreshKey
- [x] PatientDetailView — HC real + vitales + refreshKey
- [x] AppointmentsView — turnos reales + realtime + acciones
- [x] BillingView — billing_items reales
- [x] AuditView — audit_logs reales con join users
- [x] UsersView — useTenantUsers + toggle activo
- [x] SharingView — share_requests + aprobar/rechazar
- [x] AdminView — routing SUPER_ADMIN

### Modales wired
- [x] NewPatientModal → createPatient server action
- [x] NewConsultationModal → createMedicalRecord (SOAP completo)
- [x] NewAppointmentModal → dropdowns reales + createAppointment
- [x] InviteUserModal → inviteUser (Supabase Auth + users row)

### CommandPalette
- [x] Búsqueda debounced en Supabase (200ms)
- [x] handleSelectPatientById busca en mock + DB

### Server Actions creados
- [x] app/actions/auth.ts (signIn, signOut, getCurrentUserProfile, inviteUser)
- [x] app/actions/patients.ts (createPatient)
- [x] app/actions/appointments.ts (createAppointment, updateAppointmentStatus)
- [x] app/actions/records.ts (createMedicalRecord)
- [x] app/actions/sharing.ts (createShareRequest, approveShareRequest, rejectShareRequest)
- [x] app/actions/users.ts (toggleUserActive)

---

## ⏳ PENDIENTE — PASO MANUAL NECESARIO

- [ ] Ejecutar `supabase_migration.sql` en Supabase Dashboard → SQL Editor
  (crea tablas: insurance_providers, nomenclators, medical_practices,
   patient_coverages, invoices, invoice_items, beds, admissions)

---

## 🔲 PENDIENTE — ALTA PRIORIDAD

### NotificationsPanel
- [ ] Usar useCurrentUser para tenantId
- [ ] Turnos del día próximos → notificaciones tipo "turno"
- [ ] Share requests pendientes → notificaciones tipo "solicitud"
- [ ] Tab filter funcional con estado (Todas / No leídas / Alertas)
- [ ] Mock fallback cuando no hay tenantId

### Deploy
- [ ] Usuario ejecuta: vercel login (requiere browser)
- [ ] vercel --prod
- [ ] Verificar variables de entorno en Vercel Dashboard

### Supabase Manual
- [ ] JWT Custom Hook: Authentication → Hooks → public.custom_access_token_hook
- [ ] Verificar RLS policies en todas las tablas

---

## 🔲 PENDIENTE — MEDIA PRIORIDAD

### Funcionalidad
- [ ] EditPatientModal — formulario precargado + updatePatient action
- [ ] Revocar acceso en SharingView (botón conectado)
- [ ] Nueva Solicitud de Compartir (formulario completo)
- [ ] SharingView: mostrar nombre de institución (join a tenants)
- [ ] SharingView: mostrar nombre de médico (join a users)

### Vistas (todas tienen mock fallback)
- [x] InsuranceView — LIVE si migration ejecutada (obras sociales + nomenclador)
- [x] GuardsView — LIVE si migration ejecutada (camas + internaciones)

---

## 🔲 PENDIENTE — BAJA PRIORIDAD / MEJORAS

### UX/Performance
- [ ] Paginación en PatientsView (.range() en query)
- [ ] Notificaciones realtime (Supabase channel para appointments + share_requests)
- [ ] Loading skeletons (reemplazar texto "cargando..." con placeholders)
- [ ] Toast de confirmación en más acciones

### Features nuevas
- [ ] Export PDF de Historia Clínica del paciente
- [ ] Módulo de Reportes / Analytics (turnos por período, facturación)
- [ ] Búsqueda global mejorada (más recursos en CommandPalette)
- [ ] Historial de cambios por paciente

### Calidad
- [ ] Tests E2E con Playwright
- [ ] Generar tipos Supabase automáticamente (supabase gen types)
- [ ] Error boundaries en vistas principales

---

## NOTAS

- Las columnas son camelCase (Prisma): tenantId, authId, scheduledAt — NUNCA snake_case
- Siempre mantener mock fallback: if (!tenantId) usar MOCK_DATA
- Toda vista conectada muestra badge verde "LIVE DB"
- Server actions en app/actions/, hooks en lib/hooks/useSupabase.ts
