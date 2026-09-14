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
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
