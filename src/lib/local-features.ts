// Set by next.config.ts: accounts (and the MFA-gated admin) are on everywhere.
export const LOCAL_ACCOUNTS_ENABLED = process.env.NEXT_PUBLIC_LOCAL_ACCOUNTS === "true";

export function isLocalAdminAccess(host: string | null): boolean {
  return (
    LOCAL_ACCOUNTS_ENABLED &&
    process.env.NODE_ENV === "development" &&
    !!host &&
    /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)
  );
}
