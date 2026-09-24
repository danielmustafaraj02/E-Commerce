import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { getStripePublishableKey } from "@/lib/stripe";
import { turnstileSiteKey } from "@/lib/turnstile";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  const [session, settings, countryRows, nonce, uiLocale, siteKey, stripePublishableKey] =
    await Promise.all([
      auth(),
      getStoreSettings(),
      db.shippingZoneCountry.findMany({ distinct: ["country"], select: { country: true } }),
      headers().then((h) => h.get("x-nonce") ?? undefined),
      getLocale(),
      turnstileSiteKey(),
      getStripePublishableKey(),
    ]);
  const dict = getDictionary(uiLocale);

  const countries = countryRows.map((row) => row.country).sort();

  return (
    <ShelfMain>
      <ShelfHead title={dict.checkout.title} />
      <ShelfBody>
        <CheckoutClient
          giftCardOffer={
            settings.giftCardEnabled
              ? {
                  productName: dict.giftCard.productName,
                  printedNote: dict.giftCard.printedNote,
                }
              : null
          }
          locale={settings.defaultLocale}
          uiLocale={uiLocale}
          countries={countries}
          isLoggedIn={Boolean(session?.user)}
          userEmail={session?.user?.email ?? null}
          turnstileSiteKey={siteKey}
          stripePublishableKey={stripePublishableKey}
          expressCheckoutLabel={dict.cart.expressCheckoutOr}
          nonce={nonce}
          dict={dict.checkout}
        />
      </ShelfBody>
    </ShelfMain>
  );
}
