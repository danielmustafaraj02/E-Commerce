import { headers } from "next/headers";
import { turnstileSiteKey } from "@/lib/turnstile";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import ForgotPasswordForm from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const [nonce, locale, siteKey, settings] = await Promise.all([
    headers().then((h) => h.get("x-nonce") ?? undefined),
    getLocale(),
    turnstileSiteKey(),
    getStoreSettings(),
  ]);
  const dict = getDictionary(locale).auth;

  return (
    <main className="bg-surface relative flex flex-1 flex-col overflow-hidden">
      <div className="section-glass-bg" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
        <h1 className="mb-1 text-center text-2xl font-semibold">{dict.forgotPasswordTitle}</h1>
        <p className="text-foreground/60 mb-6 text-center text-sm">{settings.storeName}</p>
        <ForgotPasswordForm siteKey={siteKey} nonce={nonce} dict={dict} />
      </div>
    </main>
  );
}
