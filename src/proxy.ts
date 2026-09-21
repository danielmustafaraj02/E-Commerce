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
  // secureCookie must be forced rather than left to getToken()'s own
  // protocol-sniffing: on Vercel's Edge runtime, the request as seen by
  // middleware doesn't reliably report https, so auto-detection looks for
  // the plain "authjs.session-token" cookie instead of the
  // "__Secure-authjs.session-token" one NextAuth actually issues in
  // production — silently failing to find a perfectly valid session.
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const role = token?.role as string | undefined;

  if (pathname.startsWith("/admin")) {
    const issuedAt = typeof token?.iat === "number" ? token.iat : 0;
    const sessionTooOld = Date.now() / 1000 - issuedAt > ADMIN_SESSION_MAX_AGE_SECONDS;

    if ((role !== "admin" && role !== "staff") || sessionTooOld) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // MFA is mandatory for admin/staff — the highest-value account on the
    // site. `token.mfaEnabled` is only as fresh as the last sign-in (see
    // auth.ts's jwt callback), so this deliberately sends them to set it up
    // rather than silently letting a not-yet-enrolled admin session through.
    if (!token?.mfaEnabled) {
      const mfaUrl = new URL("/account/mfa", request.url);
      mfaUrl.searchParams.set("required", "1");
      return withSecurityHeaders(NextResponse.redirect(mfaUrl));
    }
  }

  if (pathname.startsWith("/account") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // Express Checkout (Apple Pay/Google Pay via @stripe/react-stripe-js,
  // src/components/express-checkout-button.tsx) is the one place this app
  // loads a third-party script on-page rather than redirecting to it —
  // still SAQ-A (Stripe's Elements iframe tokenizes client-side, same
  // guarantee as Hosted Checkout's redirect), but it needs three narrow,
  // Stripe-only additions: js.stripe.com can load *as* a script (also
  // covered by 'strict-dynamic' for browsers that support it, since
  // loadStripe() injects it from our own nonce'd code — listed explicitly
  // too for older browsers), its iframes need frame-src (default-src alone
  // would block them), and its own API/fraud-check calls need connect-src.
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' https: data:;
    font-src 'self' data:;
    connect-src 'self' https://api.stripe.com https://m.stripe.network;
    frame-src https://js.stripe.com https://hooks.stripe.com;
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
  // Every page's <html lang> and content (product names/descriptions,
  // titles) switch on Accept-Language (see src/lib/i18n/locale.ts) even
  // though the URL stays the same — this is Google's documented "dynamic
  // serving" pattern, and it's what makes the self-referencing hreflang
  // alternates (see each page's `alternates.languages`) valid rather than
  // misleading: without it, a shared cache could serve the wrong language
  // to a crawler or visitor with different header/cookie state.
  response.headers.append("Vary", "Accept-Language");
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
