import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile();
} catch {
  // .env is optional (e.g. in CI where vars are injected directly)
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
