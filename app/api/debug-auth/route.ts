import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const result: Record<string, any> = {};

  // 1. Env vars
  result.env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + "...",
  };

  // 2. Session (regular client)
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    result.session = {
      hasUser: !!user,
      userId: user?.id?.slice(0, 8) + "...",
      email: user?.email,
      error: error?.message ?? null,
    };

    // 3. Users table query (regular client - RLS applied)
    if (user) {
      const { data: profileRLS, error: rlsError } = await supabase
        .from("users")
        .select("id, tenantId, role")
        .eq("authId", user.id)
        .single();
      result.profileWithRLS = {
        found: !!profileRLS,
        tenantId: (profileRLS as any)?.tenantId?.slice(0, 8) + "...",
        role: (profileRLS as any)?.role,
        error: rlsError?.message ?? null,
      };
    }
  } catch (e: any) {
    result.sessionError = e.message;
  }

  // 4. Admin client
  try {
    const admin = createAdminClient();
    result.adminClient = { created: true };

    // 5. Users table query (admin - no RLS)
    const supabase2 = await createClient();
    const { data: { user: user2 } } = await supabase2.auth.getUser();
    if (user2) {
      const { data: profileAdmin, error: adminErr } = await (admin as any)
        .from("users")
        .select("id, tenantId, role")
        .eq("authId", user2.id)
        .single();
      result.profileWithAdmin = {
        found: !!profileAdmin,
        tenantId: (profileAdmin as any)?.tenantId?.slice(0, 8) + "...",
        role: (profileAdmin as any)?.role,
        error: adminErr?.message ?? null,
      };

      // 6. Count all users rows
      const { count } = await (admin as any)
        .from("users")
        .select("*", { count: "exact", head: true });
      result.totalUsersRows = count;
    }
  } catch (e: any) {
    result.adminError = e.message;
  }

  return NextResponse.json(result, { status: 200 });
}
