// Renders nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured — the
// server-side check in src/lib/turnstile.ts degrades the same way, so the
// feature stays fully dormant (not half-broken) without real keys.
export function TurnstileWidget({ siteKey, nonce }: { siteKey: string | null; nonce?: string }) {
  if (!siteKey) return null;

  return (
    <>
      <script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        nonce={nonce}
      />
      <div className="cf-turnstile" data-sitekey={siteKey} />
    </>
  );
}
