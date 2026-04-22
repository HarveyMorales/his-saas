// ============================================================
// lib/prisma.ts
// Cliente Prisma singleton + helpers multi-tenant
// ============================================================

import { PrismaClient } from "@prisma/client";

// ── Singleton (evitar conexiones múltiples en dev hot-reload) ──
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ── Tipos de sesión ────────────────────────────────────────────
export type SessionUser = {
  id: string;          // users.id (cuid)
  authId: string;      // Supabase auth.users UUID
  tenantId: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
};

// ── Helper: asegurar que la operación sea del tenant correcto ──
// Usar en TODOS los Server Actions y API Routes.
// Jamás confiar en params de cliente — validar siempre contra la sesión.
export function tenantFilter(tenantId: string) {
  return { tenantId };
}

// ── Helper: verificar ownership antes de mutar ────────────────
export async function assertResourceBelongsToTenant(
  resourceId: string,
  tenantId: string,
  model: "patient" | "appointment" | "medicalRecord" | "billingItem"
): Promise<void> {
  // @ts-expect-error — acceso dinámico al modelo
  const record = await prisma[model].findFirst({
    where: { id: resourceId, tenantId },
    select: { id: true },
  });
  if (!record) {
    throw new Error(`[RLS] Recurso ${model}#${resourceId} no pertenece al tenant ${tenantId}`);
  }
}

// ── Helper: log de auditoría (siempre server-side) ────────────
export async function writeAuditLog(params: {
  tenantId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({
    data: {
      tenantId:   params.tenantId,
      userId:     params.userId,
      action:     params.action as never,
      resource:   params.resource,
      resourceId: params.resourceId,
      oldValues:  params.oldValues as any,
      newValues:  params.newValues as any,
      ipAddress:  params.ipAddress,
      userAgent:  params.userAgent,
    },
  });
}
