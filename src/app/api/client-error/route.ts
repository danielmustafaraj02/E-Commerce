import { NextResponse } from "next/server";
import { z } from "zod";
import { captureError } from "@/lib/monitoring";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Same-origin sink for error.tsx/global-error.tsx (both Client Components,
// so they can't import @sentry/node directly) — keeps client-side error
// reporting inside the app's own CSP connect-src 'self' instead of adding a
// third-party browser SDK. See src/lib/monitoring.ts.
const schema = z.object({
  message: z.string().max(2000),
  digest: z.string().max(200).optional(),
  url: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const { success } = await rateLimit(`client-error:${clientIp(request)}`, 20, 60_000);
  if (!success) return NextResponse.json({ ok: false }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  captureError(new Error(parsed.data.message), {
    scope: "client",
    digest: parsed.data.digest,
    url: parsed.data.url,
  });

  return NextResponse.json({ ok: true });
}
