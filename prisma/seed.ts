// prisma/seed.ts — usa Prisma para IDs + Supabase Admin para auth
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TENANTS = [
  { slug: "consultorio-romero", name: "Consultorio Dr. Romero", type: "CONSULTORIO" as const, primaryColor: "#00BFA6" },
  { slug: "clinica-san-martin", name: "Clínica San Martín",     type: "CLINICA" as const,     primaryColor: "#2563EB" },
  { slug: "hospital-central",   name: "Hospital Central",       type: "HOSPITAL" as const,    primaryColor: "#8B5CF6" },
];

const DEMO_USERS = [
  { email: "medico@his.com",      password: "medico123", role: "MEDICO" as const,       firstName: "Carlos",  lastName: "Romero",    tenantSlug: "clinica-san-martin",  specialty: "Cardiología" },
  { email: "recepcion@his.com",   password: "recep123",  role: "RECEPCION" as const,    firstName: "Laura",   lastName: "Asistente", tenantSlug: "clinica-san-martin" },
  { email: "facturacion@his.com", password: "factur123", role: "FACTURACION" as const,  firstName: "Ana",     lastName: "Factura",   tenantSlug: "hospital-central" },
  { email: "admin.inst@his.com",  password: "admin123",  role: "TENANT_ADMIN" as const, firstName: "Marcos",  lastName: "Admin",     tenantSlug: "consultorio-romero" },
  { email: "medico2@his.com",     password: "medico456", role: "MEDICO" as const,       firstName: "Marta",   lastName: "Vidal",     tenantSlug: "hospital-central",    specialty: "Clínica Médica" },
  { email: "admin.it@his.com",    password: "it123",     role: "SUPER_ADMIN" as const,  firstName: "IT",      lastName: "Admin",     tenantSlug: "clinica-san-martin" },
];

async function seed() {
  console.log("🌱 Seeding demo data...\n");

  const tenantMap: Record<string, string> = {};

  for (const t of TENANTS) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, name: t.name, type: t.type, status: "ACTIVE", primaryColor: t.primaryColor, country: "AR" },
      update: {},
    });
    tenantMap[t.slug] = tenant.id;
    console.log(`  ✓ Tenant: ${t.name} (${tenant.id})`);
  }

  for (const u of DEMO_USERS) {
    const tenantId = tenantMap[u.tenantSlug];

    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list?.users?.find(x => x.email === u.email);
    let authId = existing?.id;

    if (!authId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email, password: u.password, email_confirm: true,
      });
      if (error || !data.user) { console.error(`  ✗ Auth ${u.email}:`, error?.message); continue; }
      authId = data.user.id;
      console.log(`  ✓ Auth: ${u.email}`);
    } else {
      console.log(`  ~ Auth exists: ${u.email}`);
    }

    await prisma.user.upsert({
      where: { authId },
      create: {
        authId,
        tenantId,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        specialty: (u as any).specialty ?? null,
        isActive: true,
      },
      update: {},
    });
    console.log(`  ✓ Profile: ${u.firstName} ${u.lastName} [${u.role}]`);
  }

  console.log("\n✅ Seed completado!\n");
  console.log("📋 Credenciales demo:");
  console.log("─────────────────────────────────────────────────");
  for (const u of DEMO_USERS) {
    console.log(`  ${u.email.padEnd(28)} / ${u.password.padEnd(12)} → ${u.role}`);
  }
  console.log("─────────────────────────────────────────────────\n");
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
