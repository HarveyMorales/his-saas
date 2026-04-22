// lib/supabase/admin.ts
// Cliente con service_role key — SOLO usar en Server Actions/API Routes
// NUNCA importar este cliente en componentes del browser
// Bypasea RLS — usar con extrema precaución

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Singleton para evitar crear múltiples instancias
let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("[Admin] SUPABASE_SERVICE_ROLE_KEY no está configurada");
  }

  if (!adminClient) {
    adminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return adminClient;
}
