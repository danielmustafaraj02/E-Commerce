import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { getStripePublishableKey } from "@/lib/stripe";
import { turnstileSiteKey } from "@/lib/turnstile";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isPaypalConfigured } from "@/lib/paypal";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { isStripeConfigured } from "@/lib/stripe";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  const [
    session,
    settings,
    countryRows,
    nonce,
    uiLocale,
    siteKey,
    stripePublishableKey,
    paypalEnabled,
    cardsEnabled,
  ] = await Promise.all([
      auth(),
      getStoreSettings(),
      db.shippingZoneCountry.findMany({ distinct: ["country"], select: { country: true } }),
      headers().then((h) => h.get("x-nonce") ?? undefined),
      getLocale(),
      turnstileSiteKey(),
      getStripePublishableKey(),
      isPaypalConfigured(),
      isStripeConfigured(),
    ]);
  const dict = getDictionary(uiLocale);

  const countries = countryRows.map((row) => row.country).sort();
  const savedAddress = session?.user?.id
    ? await db.address.findFirst({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { id: "asc" }],
        select: {
          fullName: true,
          street: true,
          city: true,
          postalCode: true,
          country: true,
          phone: true,
        },
      })
    : null;

  return (
    <ShelfMain>
      <ShelfHead title={dict.checkout.title} width="full" />
      <ShelfBody width="full">
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
          savedAddress={savedAddress}
          turnstileSiteKey={siteKey}
          stripePublishableKey={stripePublishableKey}
          expressCheckoutLabel={dict.cart.expressCheckoutOr}
          quoteLoadingLabel={dict.payment.loading}
          paymentMethods={{
            cards: cardsEnabled,
            paypal: paypalEnabled,
            klarna: cardsEnabled && settings.klarnaEnabled,
            bankTransfer: settings.bankTransferEnabled && Boolean(settings.bankIban),
          }}
          trustLabels={{
            handmadeInMurano: dict.product.handmadeInMurano,
            secureBadge: dict.product.secureBadge,
            trackedShipping: dict.product.trackedShipping,
            returnsBadge: dict.product.returnsBadge,
          }}
          supportLabel={dict.footer.contact}
          bankTransferLabel={dict.payment.bankTransfer}
          nonce={nonce}
          dict={dict.checkout}
        />
      </ShelfBody>
    </ShelfMain>
  );
}
