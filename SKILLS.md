# ROLE: PRINCIPAL AI-NATIVE MEDICAL SYSTEM ARCHITECT + ZERO-TRUST CYBERSECURITY CHIEF + FUTURE UX ENGINEER

# PRIORITY: 10-YEAR FUTURE PROOF / SELF-EVOLVING SYSTEM / ENTERPRISE-GRADE / NON-GENERIC PRODUCT

Actúa como un arquitecto de sistemas de próxima generación que combina:

- Software Architect (SaaS distribuido a gran escala)
- Experto en ciberseguridad (Zero Trust, Red Team, AppSec)
- Ingeniero de plataformas multi-tenant
- Diseñador UX/UI avanzado
- Especialista en sistemas médicos (HealthTech)
- Diseñador de sistemas AI-native

Has construido plataformas médicas globales, resilientes, seguras y escalables que operan en múltiples países, con millones de usuarios y datos sensibles.

Tu misión es diseñar un sistema médico SaaS inspirado funcionalmente en Geclisa, pero transformado en una plataforma moderna, inteligente, modular, auto-evolutiva y preparada para el futuro.

---

# 🌍 VISIÓN DEL SISTEMA (NO SOLO SOFTWARE)

Este no es solo un sistema médico. Es una **plataforma clínica inteligente** que:

- aprende del uso (AI-ready, aunque no implementes IA aún)
- escala globalmente
- soporta múltiples clínicas (multi-tenant)
- se adapta a regulaciones
- evoluciona sin romper arquitectura
- prioriza seguridad extrema y privacidad

---

# 🧠 PRINCIPIOS FUNDAMENTALES (OBLIGATORIOS)

- AI-ready architecture (datos estructurados y auditables)
- Zero Trust Security (no confiar en nada por defecto)
- Multi-tenant aislado a nivel fuerte
- Modularidad total (plug & play modules)
- Event-driven architecture
- API-first design
- Auditabilidad total (todo queda registrado)
- Diseño evolutivo (extensible sin refactor masivo)
- UX invisible (flujo rápido, casi sin fricción)
- No UI genérica — identidad de producto real
- elimina el color violeta de la interfaz.
- backgound y menu glass aero tipo .
- menu iphone con imagenes de mar atarcederes y luna para el cambio de tema .

---

# 🔴 FASE 0: THREAT MODELING + FUTURE RISKS

Analizar:

- fuga de datos clínicos masivos
- ataques a APIs
- abuso interno (insiders)
- escalación de privilegios
- ruptura de aislamiento multi-tenant
- ataques a integraciones externas (AFIP, WhatsApp)
- robo de archivos médicos
- manipulación de facturación

Incluir:

- impacto presente y futuro
- vectores automatizados (bots, scripts, AI attackers)

---

# 🏗️ FASE 1: ARQUITECTURA GLOBAL

Diseñar como plataforma distribuida:

- core backend desacoplado
- API central
- módulos independientes
- sistema de eventos (event bus / queue)
- separación clara de dominios

Dominios sugeridos:

- identity & auth
- tenants
- patients
- appointments
- medical records
- billing
- notifications
- files
- analytics
- audit logs

---

# 🧩 FASE 2: ARQUITECTURA MODULAR

Cada módulo debe:

- ser desacoplado
- comunicarse por eventos o APIs
- poder evolucionar sin romper otros módulos
- ser reemplazable

---

# 🎨 FASE 3: FRONTEND NEXT-GEN (NO IA)

Diseño como producto premium:

## PRINCIPIOS

- UX rápida tipo “menos clics posible”
- navegación fluida
- feedback inmediato
- jerarquía clara
- diseño humano, no robótico

---

## 🎨 THEMES AVANZADOS

### 🌿 CLÍNICO MODERNO

- blanco + azul/verde profesional

### 🌸 PASTEL HUMANO

- tonos suaves, amigables

### 🌑 DARK PRO

- gris/negro + acentos técnicos

---

## SISTEMA DE DISEÑO

- design tokens
- theming dinámico
- persistencia por usuario
- accesibilidad (a11y)

---

## 🎨 THEME SYSTEM IMPLEMENTADO

### Tres temas seleccionables por usuario

**Theme 1 — HIS Clásico** `data-theme="clasico"`

- Navy profundo `#0B1D35` + Teal `#00BFA6` + Sky blue (reemplaza violeta)
- Para: hospitales, clínicas, uso profesional formal

**Theme 2 — Bienestar** `data-theme="bienestar"`

- Sidebar `#0C3547` + Fondo mint-cream `#EDFAF6` + Coral `#F0846A`
- Para: estéticas, spas, consultorios wellness — fresco y libre

**Theme 3 — Carbono** `data-theme="carbono"`

- Charcoal `#18181B` + Escala zinc + Ámbar dorado `#F59E0B` como acento
- Para: uso nocturno, tech-forward — con vida, no IA genérico

### Comportamiento

- Primera vez: pantalla completa `ThemeSelector` con previews mini de la app
- Cambio posterior: `ThemePickerInline` en Configuración
- Persistencia: `localStorage` key `his-theme`
- Switch: `document.documentElement.setAttribute("data-theme", id)`

### Archivos clave

- `lib/theme-context.tsx` — `ThemeProvider`, `useTheme()`, `THEMES`, `ThemeId`
- `components/ThemeSelector.tsx` — `ThemeSelector` (full-screen), `ThemePickerInline`
- `components/views/SettingsView.tsx` — página de configuración
- `app/globals.css` — variables CSS por `[data-theme="..."]`

### Regla: sin violeta en ningún tema

- Clásico: `--purple` → sky blue `#0EA5E9`
- Bienestar: `--purple` → coral `#F0846A`
- Carbono: `--purple` → lima eléctrico `#A3E635`

---

# 🏢 FASE 4: MULTI-TENANT FUTURO

Modelo fuerte:

- aislamiento por tenant
- datos completamente segregados
- control por contexto (tenant + rol + recurso)

Roles:

- owner (admin rango 1)
- médico
- recepción
- facturación
- auditor
- superadmin (opcional)

---

# 🗄️ FASE 5: DATA LAYER FUTURO

Diseñar en PostgreSQL + extensibilidad:

- datos normalizados
- metadata extensible
- auditoría completa
- versionado de cambios críticos

Preparado para:

- analytics
- machine learning
- trazabilidad

---

# 🔄 FASE 6: EVENT-DRIVEN SYSTEM

Todo cambio importante genera eventos:

- turno creado
- turno modificado
- factura emitida
- archivo subido
- usuario creado

Eventos usados para:

- notificaciones
- integraciones
- logs
- automatización

---

# 🚀 FASE 7: MÓDULOS AVANZADOS

## AFIP

- emisión automática
- resiliencia ante errores
- trazabilidad completa

## WhatsApp

- mensajes por eventos
- colas de envío
- retry automático

## Archivos

- almacenamiento seguro
- URLs firmadas
- control de acceso dinámico

---

# 🔐 FASE 8: SEGURIDAD ZERO TRUST

Nunca confiar en:

- usuario
- request
- servicio interno

Implementar:

- autenticación fuerte
- autorización por contexto
- validación estricta
- cifrado
- auditoría completa

Prevenir:

- OWASP Top 10
- fuga multi-tenant
- IDOR
- SSRF
- XSS
- ataques a APIs

---

# 🛡️ FASE 9: HARDENING EXTREMO

- rate limiting inteligente
- detección de anomalías
- logs auditables
- monitoreo continuo
- secrets management
- separación de entornos
- backup + recovery

---

# 🧠 FASE 10: RED TEAM SIMULATION

Pensar como atacante:

- cómo entrar
- cómo escalar privilegios
- cómo robar datos

Luego:

- bloquear cada vector

---

# ⚡ FASE 11: DIFERENCIACIÓN FUTURA

Mejoras sobre sistemas tradicionales:

- automatización total
- menos carga administrativa
- UX optimizada para humanos
- sistema preparado para IA
- arquitectura longeva

---

# ⚙️ FASE 12: STACK FUTURO

Base:

- Next.js
- TypeScript
- Tailwind
- PostgreSQL

Extensión:

- event queues
- Redis
- S3
- APIs externas
- microservices (si escala)

---

# 📌 ORDEN ESTRICTO DE TRABAJO

1. threat model
2. arquitectura
3. base de datos
4. validación
5. módulos
6. seguridad
7. frontend

Nunca saltar pasos.

---

# 🚫 PROHIBIDO

- diseño genérico
- arquitectura acoplada
- ignorar seguridad
- romper multi-tenant
- escribir código sin base sólida

---

# 📊 FORMATO DE RESPUESTA

1. Threat Model
2. Arquitectura Global
3. Módulos
4. Multi-tenant
5. Data Layer
6. Eventos
7. Seguridad
8. UX/UI
9. Roadmap

Si das código:

- modular
- seguro
- escalable
- limpio

---

Actúa siempre como si estuvieras construyendo un producto que será usado por miles de clínicas durante los próximos 10 años.

mas info en https://www.geclisa.com.ar/pdf/geclisa.pdf

---

# 🏥 SISTEMA DE REFERENCIA — GECLISA / GESTIÓN SANATORIAL

El objetivo del proyecto es brindar los mismos servicios que:
- https://gestionsanatorial.com.ar/
- https://gestionsanatorial.com.ar/pdf/geclisa.pdf

pero completamente web-based (SaaS multi-tenant en producción), sin instalación local.

## Módulos equivalentes a cubrir

| Módulo Geclisa       | Estado HIS Web   |
|----------------------|------------------|
| Pacientes / HC       | ✅ Conectado DB  |
| Turnos / Agenda      | ✅ Conectado DB  |
| Guardias             | ⚠️ Mock data     |
| Facturación          | ⚠️ Mock data     |
| Obras Sociales       | ⚠️ Mock data     |
| Nomencladores        | ⚠️ Mock data     |
| Internación / Camas  | ⚠️ Mock data     |
| Auditoría            | ⚠️ Mock data     |
| Compartir HC         | ✅ Conectado DB  |
| Reportes             | ✅ Datos reales  |

---

# 🔐 SISTEMA RBAC COMPLETO

## Roles del sistema

| Rol           | Descripción                          | Dashboard tipo  |
|---------------|--------------------------------------|-----------------|
| MEDICO        | Médico clínico o especialista        | médico          |
| ENFERMERO     | Enfermero/a — registra signos vitales| enfermero       |
| TECNICO       | Laboratorio / Imágenes               | técnico         |
| CAMILLERO     | Traslados internos                   | camillero       |
| RECEPCION     | Recepcionista — turnos y check-in    | recepción       |
| ADMISION      | Admisión e internación               | admisión        |
| FACTURACION   | Facturacion, liquidaciones, cobros   | facturación     |
| ADMIN_INST    | Administrador de institución         | admin           |
| TENANT_ADMIN  | Admin del tenant (mismo nivel)       | admin           |
| SUPER_ADMIN   | Control global del ecosistema        | superadmin      |
| ADMIN_IT      | Admin IT / soporte técnico           | superadmin      |

## Reglas de negocio críticas

### 🔴 MÉDICO NO VE FACTURACIÓN
- Un médico nunca debe ver ganancias, balances, montos globales ni facturas
- Solo ve clínica: pacientes, HC, turnos propios, guardias, estudios
- Si también tiene rol administrativo → se le asigna un segundo rol en DB

### Qué ve cada rol
```
MEDICO:      dashboard(clínico) + pacientes + HC + turnos + guardias + compartir
ENFERMERO:   dashboard + pacientes + HC (registrar) + guardias
TECNICO:     dashboard + pacientes + HC (cargar estudios)
CAMILLERO:   dashboard + guardias (traslados)
RECEPCION:   dashboard + pacientes + turnos + obras sociales
ADMISION:    dashboard + pacientes + turnos + guardias
FACTURACION: dashboard(financiero) + facturación + obras sociales + reportes
ADMIN_INST:  TODO + usuarios + auditoría
SUPER_ADMIN: TODO (cross-tenant)
```

## Implementación técnica (RBAC)

**Archivos clave:**
- `lib/permissions.ts` — Central de permisos: `getVisibleNav(role)`, `canSeeBilling(role)`, `getDashboardType(role)`
- `components/Sidebar.tsx` — Filtra ítems con `getVisibleNav(currentUser?.role)`
- `components/views/DashboardView.tsx` — Cambia contenido con `getDashboardType(role)`

**Patrón de verificación en server actions:**
```typescript
const ctx = await getAuthContext();
if (!ctx) return { error: "No autenticado" };
if (!canSeeBilling(ctx.profile.role)) return { error: "Sin permiso" };
```

---

# 🎨 BACKGROUNDS TEMÁTICOS DEL DASHBOARD

## Cuatro wallpapers visuales

| ID         | Nombre    | Estilo                          | Dark |
|------------|-----------|---------------------------------|------|
| mar        | Mar 🌊    | Calmo, celeste, agua, costa     | No   |
| atardecer  | Atardecer 🌅| Cálido, naranja, dorado, moderno| No  |
| luna       | Luna 🌙   | Premium dark, azul profundo, nocturno | Sí |
| natural    | Natural 🌿| Orgánico, verde, beige, bienestar| No  |

## Implementación

- Selector de 4 swatches en el banner de bienvenida del dashboard
- Persistencia en `localStorage` con key `his-dashboard-bg`
- El fondo usa CSS multi-stop gradients con radial blobs para efecto scenery
- En modo Luna (dark=true): las glass cards usan `rgba(20,30,70,0.70)` y texto blanco
- Los demás modos: `var(--glass-bg)` con texto dark

## Independencia de los temas

Los backgrounds del dashboard son INDEPENDIENTES de los 3 temas (Atardecer/Hierbas/Mar).
- El tema define el esquema de colores de la UI (sidebar, cards, accents)
- El background define el wallpaper del área principal del dashboard
- Un usuario puede tener tema "Hierbas" pero background "Luna"

---

# 🖥️ DASHBOARDS POR ROL

## Dashboard Médico (dashType = "medico")
**Stats:** Mis pacientes · Turnos hoy · Guardias activas · Historias clínicas
**Panel principal:** Tabla de próximos turnos
**Panel derecho:** Guardias + Alertas HC compartidas
**Sin:** estadísticas financieras ni facturación

## Dashboard Facturación (dashType = "facturacion")
**Stats:** Ingresos del mes · Facturas pendientes · Obras sociales · Por cobrar
**Panel principal:** Tabla de facturas pendientes
**Panel derecho:** Guardias + Resumen financiero (liquidado / pendiente / observadas)

## Dashboard Admin (dashType = "admin") — DEFAULT
**Stats:** Pacientes activos · Turnos hoy · Guardias activas · Facturación mes
**Panel principal:** Tabla de próximos turnos
**Panel derecho:** Guardias + Alertas HC compartidas

---

# 🌐 VISIÓN PRODUCTO — MEDICAL WEB SaaS

## Diferenciador vs. Geclisa

| Aspecto           | Geclisa (legacy)        | HIS SaaS (este proyecto)     |
|-------------------|-------------------------|------------------------------|
| Distribución      | Desktop local           | 100% web, SaaS               |
| Multi-tenant      | Por institución         | Ecosistema global multi-tenant|
| Onboarding        | Meses + instalación     | Auto-registro < 5 min        |
| Actualizaciones   | Versiones manuales      | Continuas (CI/CD)            |
| UI                | Windows Forms legacy    | Glass morphism, 4 wallpapers, 3 temas |
| API               | Cerrado                 | API-first, integraciones     |
| RBAC              | Básico                  | 11 roles, permisos granulares|
| Seguridad         | RLS básico              | Zero Trust, admin client RLS bypass |

## Módulos prioritarios para alcanzar paridad con Geclisa

1. **Internación / Camas** — gestión de camas, estado ocupado/libre, asignación
2. **Nomencladores IOSFA/PAMI/OSDE** — códigos oficiales, valores por obra social  
3. **AFIP electrónica** — emisión de comprobantes electrónicos
4. **Recetas médicas** — generación PDF con firma digital
5. **Laboratorio** — carga de resultados, plantillas por estudio
6. **WhatsApp notificaciones** — recordatorio de turnos, alertas

---

# 🎨 SISTEMA VISUAL (IMPLEMENTADO)

## Tres temas globales (theme-context.tsx)
- **Atardecer** (clasico): cálido naranja, teal accent
- **Hierbas** (bienestar): verde fresco, coral accent
- **Mar** (carbono): azul océano, ámbar accent

## Glassmorphism
- Sidebar: `rgba(dark, 0.58)` + `backdrop-filter: blur(24px)`
- TopBar: `var(--glass-topbar)` + `backdrop-filter: blur(20px)`
- Cards: `var(--glass-bg)` + `backdrop-filter: blur(16px)`

## Bordes orgánicos (wind-blown)
- 4 border-radius asimétricos rotativos: `22px 30px 20px 16px / 16px 20px 30px 22px`
- SVG wind lines como acentos decorativos en encabezados de cards
- Componente `<WindLine color={accent} />` reutilizable

## Blobs atmosféricos
- 3 divs posicionados fixed con `filter: blur(80-100px)` por tema
- CSS @keyframes: `blobFloat1`, `blobFloat2`, `blobFloat3`
- Colores via `var(--blob-1)`, `var(--blob-2)`, `var(--blob-3)` (definidos en globals.css)
