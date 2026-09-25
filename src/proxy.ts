import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { defaultLocale, LOCALE_COOKIE, splitLocalePrefix, type Locale } from "./lib/i18n/locale-constants";
import { detectLocale } from "./lib/i18n/detect-locale";

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

// Routes that never get a locale prefix: the admin backend (internal,
// unlocalized per PRODUCT.md), and well-known files whose path is fixed by
// convention (robots.txt, sitemap.xml, the manifest, llms.txt, the two
// file-convention icons — favicon.ico is already excluded by the matcher
// below, unlike these, so it needs listing here too for consistency even
// though it never actually reaches this check with the current matcher).
const UNLOCALIZED_PATH_RE =
  /^\/(admin|robots\.txt|sitemap\.xml|manifest\.webmanifest|llms\.txt|icon\.png|apple-icon\.png|favicon\.ico)(\/|$)/;

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const unlocalized = UNLOCALIZED_PATH_RE.test(pathname);

  // Locale now lives in the URL. A request with no valid /xx prefix (a bare
  // "/products/foo", or an old bookmarked/indexed pre-migration URL) gets a
  // *permanent* redirect to its prefixed equivalent — this is the step that
  // carries existing search-engine equity over to the new URLs rather than
  // losing it. A request that already carries a valid prefix is rewritten
  // internally to the unprefixed route (the actual page files never moved),
  // with the locale carried forward via the X-Locale header for
  // src/lib/i18n/locale.ts's getLocale() to read.
  let locale: Locale = defaultLocale;
  let logicalPathname = pathname;

  if (!unlocalized) {
    const split = splitLocalePrefix(pathname);
    if (!split.locale) {
      const preferred = detectLocale(
        request.cookies.get(LOCALE_COOKIE)?.value,
        request.headers.get("accept-language") ?? undefined
      );
      const target = request.nextUrl.clone();
      target.pathname = `/${preferred}${pathname}`;
      return withSecurityHeaders(NextResponse.redirect(target, 308));
    }
    locale = split.locale;
    logicalPathname = split.rest;
  }

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

  if (logicalPathname.startsWith("/admin")) {
    const issuedAt = typeof token?.iat === "number" ? token.iat : 0;
    const sessionTooOld = Date.now() / 1000 - issuedAt > ADMIN_SESSION_MAX_AGE_SECONDS;

    if ((role !== "admin" && role !== "staff") || sessionTooOld) {
      // Admin is unlocalized, and so is the login it bounces to here —
      // staff sign-in doesn't need per-visitor language detection.
      const loginUrl = new URL(`/${defaultLocale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", logicalPathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // MFA is mandatory for admin/staff — the highest-value account on the
    // site. `token.mfaEnabled` is only as fresh as the last sign-in (see
    // auth.ts's jwt callback), so this deliberately sends them to set it up
    // rather than silently letting a not-yet-enrolled admin session through.
    if (!token?.mfaEnabled) {
      const mfaUrl = new URL(`/${defaultLocale}/account/mfa`, request.url);
      mfaUrl.searchParams.set("required", "1");
      return withSecurityHeaders(NextResponse.redirect(mfaUrl));
    }
  }

  if (logicalPathname.startsWith("/account") && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", `/${locale}${logicalPathname}`);
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
  if (!unlocalized) requestHeaders.set("x-locale", locale);

  const response = unlocalized
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : NextResponse.rewrite(
        (() => {
          const url = request.nextUrl.clone();
          url.pathname = logicalPathname;
          return url;
        })(),
        { request: { headers: requestHeaders } }
      );
  response.headers.set("Content-Security-Policy", csp);
  return withSecurityHeaders(response);
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Isolates this site's tabs/windows from ones opened by (or opening) it —
  // no page here relies on `window.opener`/cross-window access (sign-in is a
  // full-page redirect, not a popup), so this is free hardening against
  // cross-origin tab-napping and Spectre-style timing attacks. Doesn't affect
  // the Stripe/PayPal iframes, which are governed by frame-ancestors above.
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  // Locale now lives in the URL path, not Accept-Language content
  // negotiation at a shared URL — so this response no longer varies by
  // that header. (Kept documented here rather than silently dropped: if a
  // dynamic-serving fallback is ever reintroduced for an unlocalized path,
  // this is where its Vary would need to come back.)
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
