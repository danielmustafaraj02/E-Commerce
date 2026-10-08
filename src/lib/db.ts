import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Next.js loads .env itself, but standalone scripts run via `tsx` (e.g. the
// seed script) don't get that for free — load it defensively here too.
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch {
    // .env is optional (e.g. in CI where vars are injected directly)
  }
}

// Prisma 7 requires an explicit driver adapter (no more `url` in the
// datasource block).
// Make pg's current certificate-verifying SSL behaviour explicit rather than
// relying on deprecated aliases. Leave intentional libpq compatibility alone.
export function explicitDatabaseSslMode(connectionString: string): string {
  const url = new URL(connectionString);
  const mode = url.searchParams.get("sslmode");
  if (
    url.searchParams.get("uselibpqcompat") !== "true" &&
    (mode === "prefer" || mode === "require" || mode === "verify-ca")
  ) {
    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  }
  return connectionString;
}

// Serverless Postgres (Neon) closes idle connections, and a pooled connection
// that was closed behind the pool's back fails the next query that picks it up
// ("Connection terminated unexpectedly") before the pool notices. So idle
// connections are retired well before the server would drop them, TCP
// keep-alive stays on, and connecting has a clear timeout instead of hanging.
const adapter = new PrismaPg({
  connectionString: explicitDatabaseSslMode(process.env.DATABASE_URL!),
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 15_000,
  keepAlive: true,
});

// A connection that drops for a moment (a serverless database waking up, a
// network blip, the pool handing out a connection the server just closed) makes
// the query fail once and the whole page with it. Read queries are therefore
// retried a couple of times when the error is a connection problem. Writes are
// never retried: if the first attempt did reach the database, a second one
// could save the same thing twice.
const READS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);
// P1001/P1002 unreachable, P1008 timeout, P1011 TLS, P1017 closed, P2024 pool
// timeout, P2028/P2037 too many connections.
const TRANSIENT_CODES = new Set([
  "P1001",
  "P1002",
  "P1008",
  "P1011",
  "P1017",
  "P2024",
  "P2028",
  "P2037",
]);
const TRANSIENT_MESSAGE =
  /connection terminated|econnreset|econnrefused|etimedout|timeout exceeded when trying to connect|connection timeout|can't reach database|too many (clients|connections)|server closed the connection|terminating connection|socket hang up/i;
// Waits between attempts: a serverless database that was asleep can take a few
// seconds to wake, so the last pause is long.
const RETRY_DELAYS_MS = [400, 1200, 2500];

export function isTransientDbError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (code && TRANSIENT_CODES.has(code)) return true;
  return TRANSIENT_MESSAGE.test(String((error as Error | null)?.message ?? ""));
}

/** Tables already reported missing, so the warning appears once per process. */
const missingTables = new Set<string>();

const retrying = new PrismaClient({ adapter }).$extends({
  query: {
    async $allOperations({ operation, args, query }) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await query(args);
        } catch (error) {
          const transient = isTransientDbError(error);
          if (attempt >= RETRY_DELAYS_MS.length || !READS.has(operation) || !transient) {
            // Say what actually failed: the framework's own log cuts the message off.
            const e = error as { code?: string; message?: string };
            // A table that a pending migration creates: every caller falls back
            // safely, so say it once (as a warning) instead of on every page.
            if (e.code === "P2021") {
              const table = /table `([^`]+)`/.exec(String(e.message ?? ""))?.[1] ?? "unknown";
              if (!missingTables.has(table)) {
                missingTables.add(table);
                console.warn(
                  `[db] table ${table} is missing: run \`npx prisma migrate deploy\` to create it (the site falls back meanwhile).`
                );
              }
              throw error;
            }
            console.error(
              `[db] ${operation} failed${transient ? ` after ${attempt + 1} tries` : ""}: code=${e.code ?? "none"} ${String(
                e.message ?? ""
              )
                .split("\n")
                .filter(Boolean)
                .slice(-2)
                .join(" | ")
                .slice(0, 300)}`
            );
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
        }
      }
    },
  },
});

// Typed as the plain client on purpose: the extended client's type is not
// assignable to Prisma.TransactionClient, which transaction helpers across the
// app take as a parameter. Only the runtime behaviour (retrying reads) differs.
const client = retrying as unknown as PrismaClient;

// A fresh key (not "prisma" / "prismaPooled") so a dev server that is already
// running picks up this configuration on its next reload.
const globalForPrisma = globalThis as unknown as { prismaResilient?: typeof client };

export const db = globalForPrisma.prismaResilient ?? client;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaResilient = db;
}
