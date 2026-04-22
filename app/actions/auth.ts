"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos" };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*, tenants(id, name, type, slug, primaryColor)")
    .eq("authId", user.id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const tenantId = formData.get("tenantId") as string;
  const role = formData.get("role") as string;

  if (!email || !password || !firstName || !lastName || !tenantId || !role) {
    return { error: "Todos los campos son requeridos" };
  }

  const adminClient = createAdminClient();

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Error al crear usuario" };
  }

  const { error: profileError } = await adminClient.from("users").insert({
    authId: authData.user.id,
    tenantId,
    role: role as any,
    firstName,
    lastName,
    email,
    phone: null,
    avatarUrl: null,
    specialty: null,
    licenseNum: null,
    isActive: true,
    lastLoginAt: null,
    updatedAt: new Date().toISOString(),
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { error: "Error al crear perfil de usuario" };
  }

  return { success: true };
}
