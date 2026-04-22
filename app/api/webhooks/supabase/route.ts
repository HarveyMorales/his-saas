import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

// Webhook receptor para eventos de Supabase Auth
// Configurar en: Dashboard → Auth → Hooks → Send Email Hook (o usar pg_notify)
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, record } = body;

  if (type === "INSERT" && record?.table === "users") {
    // Nuevo usuario creado — write audit log
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: record.new.tenantId,
          userId: record.new.id,
          action: "CREATE",
          resource: "User",
          resourceId: record.new.id,
        },
      });
    } catch (e) {
      console.error("Audit log error:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
