import { defineConfig } from "prisma/config";
import { readFileSync } from "fs";

// Variables the caller exported themselves (shell, CI) — these always win.
const fromShell = new Set(Object.keys(process.env));

try {
  process.loadEnvFile();
} catch {
  // .env is optional (e.g. in CI where vars are injected directly)
}

// Next.js precedence: shell > .env.local > .env, so the CLI targets the same
// database as `next dev`. process.loadEnvFile can't override, so apply by hand;
// `DATABASE_URL=... npx prisma ...` still points the CLI somewhere else.
try {
  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !fromShell.has(m[1])) {
      process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    }
  }
} catch {
  // .env.local is optional
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
//
// If DATABASE_URL_UNPOOLED isn't set but DATABASE_URL is a Neon pooled URL
// (host `ep-xxx-pooler.…`), derive the direct URL by dropping `-pooler`.
function directUrl(url: string | undefined) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith(".neon.tech")) {
      u.hostname = u.hostname.replace(/-pooler(?=\.)/, "");
    }
    return u.toString();
  } catch {
    return url;
  }
}

const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ??
  directUrl(process.env.DATABASE_URL) ??
  "postgresql://placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
