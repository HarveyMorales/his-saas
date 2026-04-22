// prisma.config.ts — Prisma 7
// Connection URLs separate from schema (Prisma 7+ standard)
// Docs: https://pris.ly/d/config-datasource
//
// SETUP: create a .env.local with:
//   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
//   DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

export default {
  schema: "./prisma/schema.prisma",
  datasources: {
    db: {
      url: process.env.DATABASE_URL ?? "",
      directUrl: process.env.DIRECT_URL ?? "",
    },
  },
};
