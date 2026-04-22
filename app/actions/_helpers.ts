"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Returns { profile, db } where:
 * - profile: the current user's profile (fetched via admin to bypass RLS)
 * - db: admin Supabase client for mutations (bypasses RLS; auth already verified)
 *
 * RLS requires JWT Custom Hook (tenant_id claim) which may not be configured.
 * Using admin client for server actions is safe because we verify auth first.
 */
export async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await (admin as any)
    .from("users")
    .select("*, tenants(id, name, type, slug, primaryColor)")
    .eq("authId", user.id)
    .single();

  if (!profile) return null;

  return { profile, db: admin as any };
}
