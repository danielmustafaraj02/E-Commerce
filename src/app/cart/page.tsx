import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CartClient } from "./cart-client";

export default async function CartPage() {
  const [settings, uiLocale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(uiLocale);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">{dict.cart.title}</h1>
      <CartClient
        locale={settings.defaultLocale}
        dict={dict.cart}
        freeShippingThreshold={settings.freeShippingThreshold}
      />
    </main>
  );
}
