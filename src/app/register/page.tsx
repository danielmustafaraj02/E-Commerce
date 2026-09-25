import { headers } from "next/headers";
import { turnstileSiteKey } from "@/lib/turnstile";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { AuthCard } from "@/components/auth-card";
import { homeFontClasses } from "@/app/home-fonts";
import "../home.css";
import "../shop.css";

export default async function RegisterPage() {
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
    <main
      className={`auth-flow-page shelf relative flex flex-1 flex-col overflow-hidden ${homeFontClasses}`}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
        <AuthCard
          initialMode="register"
          storeName={settings.storeName}
          callbackUrl={`/${locale}/account`}
          siteKey={siteKey}
          nonce={nonce}
          dict={dict.auth}
          googleEnabled={googleEnabled}
        />
      </div>
    </main>
  );
}
