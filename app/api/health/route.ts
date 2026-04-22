import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const start = Date.now();
  try {
    const admin = createAdminClient();
    await admin.from("tenants").select("id", { count: "exact", head: true });
    return NextResponse.json({
      status: "ok",
      db: "connected",
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({
      status: "error",
      db: "disconnected",
      error: e.message,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
