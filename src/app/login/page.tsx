import { headers } from "next/headers";
import { turnstileSiteKey } from "@/lib/turnstile";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import LoginForm from "./login-form";

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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">{dict.auth.signInTitle}</h1>
      <LoginForm
        callbackUrl={callbackUrl}
        siteKey={siteKey}
        nonce={nonce}
        dict={dict.auth}
        googleEnabled={googleEnabled}
      />
      <p className="text-foreground/70 mt-4 text-sm">
        {dict.auth.noAccount}{" "}
        <a href="/register" className="text-primary underline">
          {dict.auth.createOne}
        </a>
      </p>
    </main>
  );
}
