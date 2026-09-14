import * as Sentry from "@sentry/node";

// Server-side only, deliberately. The checkout page's CSP locks connect-src
// down to 'self' (§13.1 — third-party scripts on checkout are the #1
// real-world card-theft vector), so we don't add a browser Sentry SDK that
// would need an external ingest domain allowed there. Client-side errors are
// instead POSTed to our own /api/client-error route (same-origin) and
// reported from here on the server. See src/instrumentation.ts for init.
let initialized = false;

export function initMonitoring() {
  if (initialized) return;
  initialized = true;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({ dsn, environment: process.env.NODE_ENV, tracesSampleRate: 0 });
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error(error, context ?? "");
  if (!process.env.SENTRY_DSN) return;
  initMonitoring();
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
