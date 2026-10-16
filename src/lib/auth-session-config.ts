// Keep the proxy's JWT reader and Auth.js on the same secret and cookie mode.
// NEXTAUTH_SECRET remains supported by next-auth for existing installations.
export function authSessionConfig() {
  return {
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    useSecureCookies: process.env.NODE_ENV === "production",
  };
}
