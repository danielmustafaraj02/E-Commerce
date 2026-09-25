import { getStoreSettings } from "@/lib/store-settings";
import { getStripePublishableKey } from "@/lib/stripe";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getShippingBanner } from "@/lib/shipping-banner";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { CartClient } from "./cart-client";
import { giftCardFontClasses } from "@/lib/gift-card-fonts";

export default async function CartPage() {
  const [settings, uiLocale, stripePublishableKey] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getStripePublishableKey(),
  ]);
  const dict = getDictionary(uiLocale);
  const shippingBanner = await getShippingBanner(
    dict.product.shippingBanner,
    settings.defaultCurrency,
    settings.defaultLocale
  );

  return (
    <ShelfMain className="shelf--footer-space">
      <ShelfHead title={dict.cart.title} width="lg">
        <p className="shop-lede">{dict.cart.subtitle}</p>
      </ShelfHead>
      <ShelfBody width="lg">
        <div className={giftCardFontClasses}>
        <CartClient
          locale={settings.defaultLocale}
          uiLocale={uiLocale}
          dict={dict.cart}
          shippingBanner={shippingBanner}
          freeShippingThreshold={settings.freeShippingThreshold}
          stripePublishableKey={stripePublishableKey}
          giftCardOffer={
            settings.giftCardEnabled
              ? { price: settings.giftCardPrice, dict: dict.giftCard, brand: settings.storeName }
              : null
          }
        />
        </div>
      </ShelfBody>
    </ShelfMain>
  );
}
