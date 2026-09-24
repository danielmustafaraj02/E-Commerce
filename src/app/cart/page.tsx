import { getStoreSettings } from "@/lib/store-settings";
import { getStripePublishableKey } from "@/lib/stripe";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { CartClient } from "./cart-client";

export default async function CartPage() {
  const [settings, uiLocale, stripePublishableKey] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getStripePublishableKey(),
  ]);
  const dict = getDictionary(uiLocale);

  return (
    <ShelfMain>
      <ShelfHead title={dict.cart.title} width="lg" />
      <ShelfBody width="lg">
        <CartClient
          locale={settings.defaultLocale}
          uiLocale={uiLocale}
          dict={dict.cart}
          shippingBanner={dict.product.shippingBanner}
          freeShippingThreshold={settings.freeShippingThreshold}
          stripePublishableKey={stripePublishableKey}
        />
      </ShelfBody>
    </ShelfMain>
  );
}
