// Set by next.config.ts: accounts (and the MFA-gated admin) are on everywhere.
export const LOCAL_ACCOUNTS_ENABLED = process.env.NEXT_PUBLIC_LOCAL_ACCOUNTS === "true";

// The passwordless loopback admin: development only, and only when the private
// local session module is installed (next.config.ts sets LOCAL_ADMIN_SOURCE).
// Without it nothing signs the visitor in, so treating localhost as admin
// showed the Admin link to logged-out visitors and looped login <-> /admin.
export function isLocalAdminAccess(host: string | null): boolean {
  return (
    LOCAL_ACCOUNTS_ENABLED &&
    process.env.LOCAL_ADMIN_SOURCE === "true" &&
    process.env.NODE_ENV === "development" &&
    !!host &&
    /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)
  );
}
