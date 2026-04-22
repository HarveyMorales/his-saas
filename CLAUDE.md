# CLAUDE.md — HIS SaaS (Historia Clínica Electrónica)

Instrucciones y contexto permanente para Claude en este proyecto.

---

## Descripción del proyecto

Sistema de Historia Clínica Electrónica multi-tenant para instituciones médicas argentinas. Permite gestionar pacientes, turnos, HC, facturación, compartir HC entre instituciones y auditoría de accesos.

**Repo:** https://github.com/HarveyMorales/his-saas  
**Local:** `d:\Har\CLAUDE NUEVO\HC WEB\`  
**Dev:** `npm run dev` → localhost:3000  

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL) + RLS |
| ORM | Prisma (genera camelCase) |
| Auth | Supabase Auth |
| UI | Inline styles (NO Tailwind) |
| Deploy | Vercel |

---

## Supabase

- **Proyecto ID:** `fxgnoexdeacuwezcpqpo`
- **Tablas principales:** tenants, users, patients, appointments, medical_records, billing_items, share_requests, audit_logs
- **Cliente server:** `import { createClient } from "@/lib/supabase/server"`
- **Cliente client:** `import { createClient } from "@/lib/supabase/client"`
- **Tipos:** `import type { Tables } from "@/lib/supabase/types"`

### CRÍTICO: Columnas camelCase
Prisma genera columnas camelCase. SIEMPRE usar:
- ✅ `tenantId`, `authId`, `scheduledAt`, `createdAt`, `patientId`
- ❌ NUNCA `tenant_id`, `auth_id`, `scheduled_at`

---

## Arquitectura de datos (dual-mode)

Todas las vistas soportan modo real (Supabase) y mock (datos hardcoded).

```typescript
const { profile } = useCurrentUser();
const tenantId = (profile as any)?.tenantId ?? null;
const isLive = !!tenantId;

const displayData = isLive
  ? dbData.map(transformFn)
  : MOCK_DATA.map(r => ({ ...r }));
```

### LIVE DB badge
Toda vista wired debe mostrar este badge cuando `isLive`:
```tsx
{isLive && (
  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99,
    background: "rgba(16,185,129,0.1)", color: "#059669" }}>LIVE DB</span>
)}
```

---

## Patrones clave

### 1. Hooks de datos (`lib/hooks/useSupabase.ts`)
Todos los hooks de datos viven aquí. Patrón estándar:
```typescript
export function usePatients(tenantId: string | null, search?: string) {
  const [patients, setPatients] = useState([]);
  const fetch = useCallback(async () => {
    if (!tenantId) return;
    const { data } = await supabase.from("patients").select("*").eq("tenantId", tenantId);
    setPatients(data ?? []);
  }, [tenantId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { patients, loading, refetch: fetch };
}
```

### 2. Server Actions (`app/actions/*.ts`)
Todas las mutaciones van por Server Actions con `"use server"`:
```typescript
// app/actions/patients.ts
"use server";
export async function createPatient(payload: {...}) {
  const supabase = await createClient();  // server client
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "No autenticado" };
  const { data, error } = await supabase.from("patients").insert({...}).select().single();
  return { data, error: error?.message ?? null };
}
```

### 3. RefreshKey pattern
Cuando un modal guarda datos y el parent necesita refrescar el hijo:
```typescript
// AppShell: incrementa counter después de guardar
onSaved={() => { setModal(false); setRefreshKey(k => k + 1); }}

// Vista hija: detecta cambio y refetch
const prevKey = useRef(refreshKey);
useEffect(() => {
  if (refreshKey !== prevKey.current) { prevKey.current = refreshKey; refetch(); }
}, [refreshKey]);
```

### 4. Joins en Supabase
Para traer datos relacionados usar select con join:
```typescript
supabase.from("appointments")
  .select("*, patients(firstName, lastName), users(firstName, lastName, specialty)")
  .eq("tenantId", tenantId)
```
Si TypeScript se queja de tipos en joins, castear: `(supabase as any).from(...)`

### 5. Login redirect
Después de `signInWithPassword` exitoso, redirigir con full page reload:
```typescript
window.location.href = "/dashboard";  // NO usar router.push()
```
Necesario para que el middleware de Next.js capture la sesión de Supabase.

---

## Estructura de archivos clave

```
app/
  actions/          ← Server actions (mutaciones DB)
    auth.ts         ← signIn, signOut, getCurrentUserProfile, inviteUser
    patients.ts     ← createPatient, updatePatient
    appointments.ts ← createAppointment, updateAppointmentStatus
    records.ts      ← createMedicalRecord
    sharing.ts      ← createShareRequest, approveShareRequest, rejectShareRequest
    users.ts        ← toggleUserActive
  dashboard/page.tsx
  login/page.tsx
  middleware.ts     ← Protege rutas, verifica sesión Supabase

components/
  views/            ← Vistas principales (una por sección del sidebar)
  modals/           ← Modales (NewPatient, NewConsultation, etc.)
  AppShell.tsx      ← Orquestador principal, maneja nav + state global
  Sidebar.tsx
  TopBar.tsx

lib/
  hooks/
    useSupabase.ts  ← TODOS los hooks de datos van aquí
  supabase/
    client.ts       ← Cliente browser
    server.ts       ← Cliente server (para Server Actions y Server Components)
    types.ts        ← Tipos sincronizados con el schema (manual, no auto-gen)
  data.ts           ← Datos mock (fallback cuando no hay DB)
  types.ts          ← Tipos TypeScript del dominio
```

---

## Roles de usuario

| Rol | Descripción |
|-----|-------------|
| SUPER_ADMIN | Acceso total, ve AdminView |
| TENANT_ADMIN | Admin de su institución |
| MEDICO | Médico, puede crear HC |
| RECEPCION | Solo turnos y pacientes |
| FACTURACION | Solo billing |
| ADMIN_IT | Rol mock (equivale a SUPER_ADMIN) |

---

## Convenciones de UI

- **Fuente titulares:** `fontFamily: "Georgia, serif"`
- **Fuente cuerpo:** sistema (sans-serif por defecto)
- **Colores vía CSS vars:** `var(--navy)`, `var(--teal)`, `var(--slate-500)`, `var(--blue)`, `var(--red)`, `var(--amber)`, `var(--green)`
- **Border radius tarjetas:** 12px
- **Padding tarjetas:** 20px
- **Sin Tailwind** — solo inline styles y CSS vars

---

## Status mappings (español)

### Turnos
```typescript
const STATUS_MAP = {
  SCHEDULED: "PENDIENTE", CONFIRMED: "CONFIRMADO",
  IN_PROGRESS: "EN CURSO", COMPLETED: "COMPLETADO",
  CANCELLED: "CANCELADO", NO_SHOW: "AUSENTE"
};
```

### Solicitudes de compartir
```typescript
const STATUS_MAP = {
  PENDING: "PENDIENTE", APPROVED: "APROBADO",
  REJECTED: "RECHAZADO", EXPIRED: "CANCELADO", REVOKED: "CANCELADO"
};
```

### Facturación
```typescript
const BILLING_STATUS_MAP = {
  DRAFT: "PENDIENTE", PENDING: "PENDIENTE", SUBMITTED: "PENDIENTE",
  APPROVED: "LIQUIDADO", PAID: "LIQUIDADO", REJECTED: "OBSERVADO"
};
```

---

## Deploy (Vercel)

1. Usuario debe ejecutar en terminal: `vercel login` (requiere browser)
2. Luego: `vercel --prod`
3. Variables de entorno en `vercel.json` (referencias a secrets de Vercel)
4. También configurar manualmente en Vercel Dashboard si falla vercel.json

### Variables de entorno necesarias
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## Pasos manuales pendientes en Supabase Dashboard

1. **JWT Custom Hook:** Authentication → Hooks → Add `public.custom_access_token_hook`
   - Necesario para que `tenantId` esté en el JWT y disponible en RLS

2. **RLS Policies:** Verificar que estén habilitadas en todas las tablas

---

## Cómo continuar en una nueva sesión

1. Leer este archivo (CLAUDE.md)
2. Leer TASKS.md para ver qué falta
3. Leer PROGRESS.txt para contexto histórico completo
4. El código está todo en `d:\Har\CLAUDE NUEVO\HC WEB\`
5. El repo es https://github.com/HarveyMorales/his-saas

---

## Filosofía del proyecto

- **Velocidad primero:** Avanzar lo más rápido posible conectando vistas a DB real
- **Fallback siempre:** Si no hay tenantId, mostrar mock data — nunca pantalla rota
- **Un archivo por responsabilidad:** Hooks en useSupabase.ts, actions en app/actions/
- **TypeScript pragmático:** Castear `as any` cuando los tipos de Supabase sean rígidos con joins
- **Sin over-engineering:** No abstracciones prematuras, el código directo es mejor
