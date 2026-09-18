import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile();
} catch {
  // .env is optional (e.g. in CI where vars are injected directly)
}

// `prisma generate` (run from postinstall) doesn't need a live DB connection,
// so don't hard-fail config loading when DATABASE_URL isn't set yet (e.g. a
// Vercel build environment where it wasn't configured). Commands that do
// need it (migrate, db push, studio) will fail on their own with a clear
// connection error instead.
//
// This file only configures the Prisma CLI (migrate/studio/db push), never
// the running app (src/lib/db.ts sets up its own Prisma Client directly from
// DATABASE_URL) — so it's safe, and necessary, to prefer the unpooled
// connection here. `migrate deploy` takes a session-level Postgres advisory
// lock, which doesn't survive PgBouncer's transaction-pooling mode (Neon's
// default DATABASE_URL): a lock taken on one pooled connection can be
// silently orphaned when PgBouncer reassigns that backend to a different
// client, leaving `migrate deploy` hanging/timing out on a lock nobody is
// really holding anymore. DATABASE_URL_UNPOOLED (Neon's direct, non-PgBouncer
// connection string) doesn't have that problem.
const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "postgresql://placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
