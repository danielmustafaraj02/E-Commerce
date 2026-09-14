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
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
