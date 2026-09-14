import { requireAdmin } from "@/lib/require-admin";
import { getStoreSettings } from "@/lib/store-settings";
import { IntegrationsForm } from "./integrations-form";

export default async function AdminIntegrationsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  const configured = {
    resendApiKey: Boolean(settings.resendApiKey || process.env.RESEND_API_KEY),
    emailFrom: Boolean(settings.emailFrom || process.env.EMAIL_FROM),
    turnstileSiteKey: Boolean(
      settings.turnstileSiteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    ),
    turnstileSecretKey: Boolean(settings.turnstileSecretKey || process.env.TURNSTILE_SECRET_KEY),
    upstashRedisUrl: Boolean(settings.upstashRedisUrl || process.env.UPSTASH_REDIS_REST_URL),
    upstashRedisToken: Boolean(settings.upstashRedisToken || process.env.UPSTASH_REDIS_REST_TOKEN),
    googleClientId: Boolean(settings.googleClientId || process.env.GOOGLE_CLIENT_ID),
    googleClientSecret: Boolean(settings.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET),
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Integrations</h1>
      <p className="text-foreground/70 mb-6 max-w-xl text-sm">
        Optional services — the site works without any of these, just with reduced functionality
        (emails log instead of send, CAPTCHA doesn&apos;t render, rate limiting stays in-memory).
      </p>
      <IntegrationsForm
        configured={configured}
        current={{
          emailFrom: settings.emailFrom ?? process.env.EMAIL_FROM ?? "",
          turnstileSiteKey:
            settings.turnstileSiteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
          googleClientId: settings.googleClientId ?? process.env.GOOGLE_CLIENT_ID ?? "",
        }}
      />
    </div>
  );
}
