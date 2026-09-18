import { headers } from "next/headers";
import { turnstileSiteKey } from "@/lib/turnstile";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { AuthCard } from "@/components/auth-card";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const raw = params.callbackUrl;
  const callbackUrl = (Array.isArray(raw) ? raw[0] : raw) ?? "/account";
  const [nonce, locale, siteKey, settings] = await Promise.all([
    headers().then((h) => h.get("x-nonce") ?? undefined),
    getLocale(),
    turnstileSiteKey(),
    getStoreSettings(),
  ]);
  const dict = getDictionary(locale);
  const googleEnabled = Boolean(
    (settings.googleClientId || process.env.GOOGLE_CLIENT_ID) &&
    (settings.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET)
  );

  return (
    <main className="bg-surface relative flex flex-1 flex-col overflow-hidden">
      <div className="section-glass-bg" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
        <AuthCard
          initialMode="login"
          storeName={settings.storeName}
          callbackUrl={callbackUrl}
          siteKey={siteKey}
          nonce={nonce}
          dict={dict.auth}
          googleEnabled={googleEnabled}
        />
      </div>
    </main>
  );
}
