// Local source only. These paths must never enter a public deployment or Git push.
export const privatePaths = [
  "src/app/admin",
  "src/app/account",
  "src/app/login",
  "src/app/register",
  "src/app/forgot-password",
  "src/app/reset-password",
  "src/app/api/admin",
  "src/app/api/account",
  "src/app/api/auth",
  "src/app/api/automation/roadmap",
  "src/components/admin-nav.tsx",
  "src/components/auth-card.tsx",
  "src/lib/admin-nav.ts",
  "src/lib/admin-nav.test.ts",
  "src/lib/require-admin.ts",
  "src/lib/require-admin.test.ts",
];

export const privateRoute =
  /^\/(?:admin|account|login|register|forgot-password|reset-password)(?:\/|$)|^\/api\/(?:admin|account|auth|automation\/roadmap)(?:\/|$)/;
