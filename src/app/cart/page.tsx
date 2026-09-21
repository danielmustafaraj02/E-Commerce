import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { CartClient } from "./cart-client";

export default async function CartPage() {
  const [settings, uiLocale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(uiLocale);

  return (
    <ShelfMain>
      <ShelfHead title={dict.cart.title} width="lg" />
      <ShelfBody width="lg">
        <CartClient
          locale={settings.defaultLocale}
          dict={dict.cart}
          freeShippingThreshold={settings.freeShippingThreshold}
        />
      </ShelfBody>
    </ShelfMain>
  );
}
