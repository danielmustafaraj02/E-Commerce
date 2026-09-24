// Runs `prisma migrate deploy` before `next build` (see package.json "build"),
// except on Vercel preview deployments: their DATABASE_URL is the production
// database, so a pull request's migrations would otherwise change the live
// database before the PR is merged. Production deploys (and builds outside
// Vercel) migrate as before.
//
// If previews get their own database (e.g. a Neon branch per preview), set
// MIGRATE_PREVIEWS=1 in Vercel's Preview environment to migrate them too.
// Until then, a preview of a PR that adds database columns may fail, because
// its code expects columns the live database doesn't have yet.
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export function shouldMigrate(env) {
  if (env.VERCEL_ENV === "preview") return env.MIGRATE_PREVIEWS === "1";
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (shouldMigrate(process.env)) {
    execSync("prisma migrate deploy", { stdio: "inherit" });
  } else {
    console.log("Preview deployment: skipping database migrations (see scripts/migrate.mjs).");
  }
}
