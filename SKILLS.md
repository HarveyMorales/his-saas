# SKILLS — HIS SaaS (Historia Clínica Electrónica)

Módulos funcionales completos del sistema. Cada skill es una unidad de lógica implementable.

---

## MÓDULO 1 — AUTENTICACIÓN Y ACCESO
- [ ] Login con email/password (Supabase Auth)
- [ ] Recuperación de contraseña por email
- [ ] Invitación de usuarios por el admin
- [ ] Roles: SUPER_ADMIN, TENANT_ADMIN, MEDICO, RECEPCION, FACTURACION
- [ ] Protección de rutas por rol (middleware)
- [ ] Logout con limpieza de sesión
- [ ] Multi-tenant: cada institución ve solo sus datos

---

## MÓDULO 2 — PACIENTES
- [x] Crear paciente (nombre, DNI, fecha de nacimiento, sexo, contacto)
- [x] Editar paciente
- [x] Buscar paciente por nombre / DNI
- [ ] Dar de baja paciente (soft delete)
- [ ] Foto de perfil del paciente
- [ ] Historial de cambios del paciente (audit log)
- [ ] Búsqueda avanzada (por obra social, médico tratante, fecha)
- [ ] Paginación en lista de pacientes
- [ ] Exportar lista de pacientes a CSV/Excel

---

## MÓDULO 3 — TURNOS / AGENDA
- [x] Crear turno (paciente, médico, fecha/hora, motivo)
- [x] Cambiar estado del turno (PENDIENTE → CONFIRMADO → EN CURSO → COMPLETADO)
- [x] Cancelar turno con motivo
- [ ] Vista de agenda semanal (grilla por médico)
- [ ] Vista de agenda diaria (timeline)
- [ ] Turnos recurrentes (ej: cada semana)
- [ ] Envío de recordatorio por email/SMS al paciente
- [ ] Bloqueo de horarios (vacaciones, ausencias)
- [ ] Sobreturno / lista de espera
- [ ] Color por especialidad en la agenda

---

## MÓDULO 4 — HISTORIA CLÍNICA (HC)
- [x] Crear registro médico (SOAP: Subjetivo, Objetivo, Evaluación, Plan)
- [x] Diagnóstico CIE-10 y texto libre
- [x] Signos vitales (TA, FC, temperatura, peso, altura)
- [x] Registro confidencial (solo médico autor)
- [ ] Adjuntar archivos (PDF, imágenes, estudios)
- [ ] Plantillas de HC por especialidad (pediatría, odontología, estética)
- [ ] Firma digital del médico
- [ ] Versiones de la HC (historial de ediciones)
- [ ] Exportar HC completa a PDF
- [ ] Vista cronológica de la HC del paciente
- [ ] Recetas médicas (imprimir / descargar PDF)
- [ ] Indicaciones post-consulta

---

## MÓDULO 5 — FACTURACIÓN
- [x] Crear factura con ítems (descripción, cantidad, precio)
- [x] Asociar factura a paciente y/o obra social
- [x] Cambiar estado de factura (PENDIENTE → LIQUIDADO → OBSERVADO)
- [x] Eliminar factura
- [ ] Nomenclador de prácticas por obra social
- [ ] Liquidación mensual por obra social
- [ ] Exportar factura a PDF
- [ ] Remito / comprobante de prestación
- [ ] Estadísticas de facturación por período
- [ ] Integración AFIP (factura electrónica, CUIT, CAE) — solo Argentina

---

## MÓDULO 6 — OBRAS SOCIALES / SEGUROS
- [x] Crear obra social (nombre, código)
- [x] Crear nomenclador de prácticas
- [x] Agregar prácticas médicas al nomenclador
- [x] Asignar cobertura a paciente (número de afiliado, plan)
- [ ] Listar coberturas activas por paciente
- [ ] Vencimiento de cobertura con alerta
- [ ] Importar nomenclador desde archivo (CSV)
- [ ] Carátula / formulario de presentación por obra social

---

## MÓDULO 7 — INTERNACIÓN / GUARDIA
- [x] Crear cama (código, habitación, sector)
- [x] Cambiar estado de cama (DISPONIBLE / OCUPADA / MANTENIMIENTO)
- [x] Registrar internación (paciente, médico, cama, motivo)
- [x] Dar de alta al paciente (libera cama automáticamente)
- [ ] Mapa visual de camas por piso/sector
- [ ] Evolución diaria del internado
- [ ] Indicaciones médicas durante internación
- [ ] Parte de enfermería
- [ ] Epicrisis al alta

---

## MÓDULO 8 — COMPARTIR HC ENTRE INSTITUCIONES
- [x] Solicitar acceso a HC de un paciente (otra institución)
- [x] Aprobar / rechazar solicitud
- [x] Revocar acceso ya aprobado
- [ ] Vista de HC compartida (read-only para institución receptora)
- [ ] Expiración automática de acceso compartido
- [ ] Notificación al médico cuando aprueban su solicitud
- [ ] Auditoría de quién accedió a qué HC

---

## MÓDULO 9 — USUARIOS Y CONFIGURACIÓN
- [ ] Panel de gestión de usuarios de la institución
- [ ] Invitar nuevo usuario por email
- [ ] Activar / desactivar usuario
- [ ] Cambiar rol de usuario
- [ ] Configuración de la institución (nombre, logo, dirección)
- [ ] Especialidades disponibles en la institución
- [ ] Configuración de horarios de atención

---

## MÓDULO 10 — NOTIFICACIONES
- [ ] Panel de notificaciones en tiempo real
- [ ] Alertas de turnos del día
- [ ] Alertas de solicitudes de HC pendientes
- [ ] Badge con cantidad de no leídas
- [ ] Marcar como leída / limpiar todas

---

## MÓDULO 11 — REPORTES Y ESTADÍSTICAS
- [ ] Dashboard con métricas clave (turnos, pacientes, facturación)
- [ ] Turnos por médico / por período
- [ ] Pacientes nuevos por mes
- [ ] Facturación por obra social
- [ ] Exportar reportes a PDF / Excel
- [ ] Morbilidad (diagnósticos más frecuentes CIE-10)

---

## MÓDULO 12 — ESTÉTICA (módulo especial)
- [ ] Ficha estética del paciente (fotos antes/después)
- [ ] Tratamientos (tipo, sesiones, progreso)
- [ ] Consentimiento informado digital
- [ ] Registro de productos/insumos usados por sesión
- [ ] Recordatorio de próxima sesión
- [ ] Galería de fotos por zona tratada

---

## MÓDULO 13 — INFRAESTRUCTURA / TÉCNICO
- [x] Multi-tenant con RLS (Row Level Security)
- [x] Admin client bypass para server actions
- [x] Autogeneración de IDs (crypto.randomUUID)
- [ ] JWT Custom Hook (tenant en claims para RLS nativo)
- [ ] Logs de auditoría (quién hizo qué y cuándo)
- [ ] Rate limiting en API
- [ ] Backup automático de datos
- [ ] Tests E2E (Playwright)
- [ ] CI/CD con GitHub Actions

---

## PRIORIDAD SUGERIDA

| Prioridad | Módulo | Estado |
|-----------|--------|--------|
| 🔴 CRÍTICO | Auth completo + roles | Parcial |
| 🔴 CRÍTICO | HC — adjuntos y PDF | Pendiente |
| 🔴 CRÍTICO | Facturación — exportar PDF | Pendiente |
| 🟡 IMPORTANTE | Agenda semanal visual | Pendiente |
| 🟡 IMPORTANTE | Notificaciones en tiempo real | Pendiente |
| 🟡 IMPORTANTE | Reportes básicos | Pendiente |
| 🟢 NICE TO HAVE | Módulo estética | Pendiente |
| 🟢 NICE TO HAVE | Integración AFIP | Pendiente |
