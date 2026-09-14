// Runs once per server instance at startup — see
// node_modules/next/dist/docs/01-app/02-guides/instrumentation.md. Only the
// Node.js runtime loads Sentry (proxy.ts runs on the Edge runtime and never
// imports src/lib/monitoring.ts, so this guard is mostly belt-and-braces).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initMonitoring } = await import("@/lib/monitoring");
    initMonitoring();
  }
}
