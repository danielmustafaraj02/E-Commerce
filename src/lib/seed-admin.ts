import { randomBytes } from "node:crypto";

// Credentials for the admin account prisma/seed.ts creates. The seed used to
// hard-code `ChangeMe123!`, which is published in the repo — and because MFA
// enrollment is forced on an admin's first sign-in, whoever logged in first
// with that password would have *owned* the account. So there is no built-in
// password any more: it comes from the environment, or is generated fresh and
// shown once.
export const DEFAULT_ADMIN_EMAIL = "admin@demo-store.example";
// The default the seed shipped with before this change; kept only so the seed
// can warn about databases that were created with it.
export const LEGACY_DEFAULT_PASSWORD = "ChangeMe123!";
export const MIN_ADMIN_PASSWORD_LENGTH = 12;
const MAX_ADMIN_PASSWORD_LENGTH = 72; // bcrypt ignores everything past 72 bytes

export class SeedConfigError extends Error {}

export function resolveSeedAdmin(env: Record<string, string | undefined>) {
  const production = env.NODE_ENV === "production";

  // The seed also creates demo categories/products and placeholder store
  // details, none of which belong in a real store.
  if (production && env.SEED_ALLOW_PRODUCTION !== "1") {
    throw new SeedConfigError(
      "Refusing to seed with NODE_ENV=production: the seed creates demo data. " +
        "Create your admin account another way (see the README's Deploying section)."
    );
  }

  const email = env.SEED_ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
  const provided = env.SEED_ADMIN_PASSWORD;

  if (provided) {
    // Length alone isn't enough: the old default is 12 characters long.
    if (provided === LEGACY_DEFAULT_PASSWORD) {
      throw new SeedConfigError(
        "SEED_ADMIN_PASSWORD is the old published default password — choose another."
      );
    }
    if (
      provided.length < MIN_ADMIN_PASSWORD_LENGTH ||
      provided.length > MAX_ADMIN_PASSWORD_LENGTH
    ) {
      throw new SeedConfigError(
        `SEED_ADMIN_PASSWORD must be ${MIN_ADMIN_PASSWORD_LENGTH}–${MAX_ADMIN_PASSWORD_LENGTH} characters.`
      );
    }
    return { email, password: provided, generated: false };
  }

  if (production) {
    throw new SeedConfigError("SEED_ADMIN_PASSWORD is required when seeding in production.");
  }

  // 18 random bytes -> 24 URL-safe characters (144 bits).
  return { email, password: randomBytes(18).toString("base64url"), generated: true };
}
