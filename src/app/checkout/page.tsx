import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { turnstileSiteKey } from "@/lib/turnstile";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  const [session, settings, countryRows, nonce, uiLocale, siteKey] = await Promise.all([
    auth(),
    getStoreSettings(),
    db.shippingZoneCountry.findMany({ distinct: ["country"], select: { country: true } }),
    headers().then((h) => h.get("x-nonce") ?? undefined),
    getLocale(),
    turnstileSiteKey(),
  ]);
  const dict = getDictionary(uiLocale);

  const countries = countryRows.map((row) => row.country).sort();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">{dict.checkout.title}</h1>
      <CheckoutClient
        locale={settings.defaultLocale}
        countries={countries}
        isLoggedIn={Boolean(session?.user)}
        userEmail={session?.user?.email ?? null}
        turnstileSiteKey={siteKey}
        nonce={nonce}
        dict={dict.checkout}
      />
    </main>
  );
}
