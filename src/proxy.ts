import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Coarse-grained gate only. Every admin route/API handler must also check
// `role === "admin"` itself — proxy does not run for Server Functions, so it
// is not a substitute for server-side authorization checks.
//
// Uses getToken() (decodes the session JWT directly with AUTH_SECRET) rather
// than the auth(callback) HOC — auth.ts's NextAuth config is now a lazy
// async function (so Google OAuth can be toggled from the DB at runtime),
// and that HOC wraps to a Promise<NextMiddleware> when the config is a
// function, which Next's proxy loader rejects since it needs a plain
// function synchronously. getToken() only needs the (static, env-only)
// AUTH_SECRET, so it sidesteps the lazy-config path entirely.
//
// This also sets a per-request CSP nonce on every page (§13.1 — checkout-page
// script injection is the #1 real-world card-theft vector, so script-src is
// nonce-gated rather than 'unsafe-inline'). The whole app is already
// dynamically rendered (Header reads the session on every request), so
// nonce-based CSP costs nothing here.
// Admin/staff sessions get a shorter absolute ceiling than the regular
// customer session (build spec §13.3 — "short session expiry for admin
// accounts"), enforced here rather than by shortening the global NextAuth
// `session.maxAge` in auth.ts, which would also log out ordinary customers
// far more often than is reasonable. `token.iat` is the time the JWT was
// last (re-)signed, not "now" — NextAuth only re-signs on sign-in or a
// rolling-session refresh, so this really does force a credential re-check
// this many minutes after an admin last authenticated, not after their last
// click.
const ADMIN_SESSION_MAX_AGE_SECONDS = Number(process.env.ADMIN_SESSION_MAX_AGE_MINUTES || 240) * 60;

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const role = token?.role as string | undefined;

  if (pathname.startsWith("/admin")) {
    const issuedAt = typeof token?.iat === "number" ? token.iat : 0;
    const sessionTooOld = Date.now() / 1000 - issuedAt > ADMIN_SESSION_MAX_AGE_SECONDS;

    if ((role !== "admin" && role !== "staff") || sessionTooOld) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  if (pathname.startsWith("/account") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' https: data:;
    font-src 'self' data:;
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return withSecurityHeaders(response);
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
