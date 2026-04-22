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
    .select("*, tenants(id, name, type, slug, primary_color)")
    .eq("auth_id", user.id)
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

  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Error al crear usuario" };
  }

  const { error: profileError } = await admin.from("users").insert({
    auth_id: authData.user.id,
    tenant_id: tenantId,
    role: role as any,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: null,
    avatar_url: null,
    specialty: null,
    license_num: null,
    is_active: true,
    last_login_at: null,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return { error: "Error al crear perfil de usuario" };
  }

  return { success: true };
}
