import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Use admin client to bypass RLS for profile read (JWT Custom Hook may not be configured)
  const admin = createAdminClient();
  const { data: profile } = await (admin as any)
    .from("users")
    .select("*, tenants(id, name, type, slug, primaryColor)")
    .eq("authId", user.id)
    .single();

  return <DashboardClient user={user} profile={profile} />;
}
