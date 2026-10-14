import { isLocalAdminAccess } from "@/lib/local-features";

/** An empty, standalone document for one template at a time. Playwright loads
 * the selected template's script-free markup into it; no app layouts or
 * admin controls are rendered here. This route is excluded from public builds. */
export function GET(request: Request) {
  if (!isLocalAdminAccess(request.headers.get("host"))) return new Response(null, { status: 404 });
  return new Response(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Template capture canvas</title></head><body style="margin:0"><main data-template-capture-page></main></body></html>',
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}
