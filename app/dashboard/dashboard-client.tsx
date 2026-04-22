"use client";

import { AppShell } from "@/components/AppShell";
import type { User } from "@supabase/supabase-js";

interface DashboardClientProps {
  user: User;
  profile: any;
}

export function DashboardClient({ user, profile }: DashboardClientProps) {
  return <AppShell supabaseUser={user} supabaseProfile={profile} />;
}
