import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hreflangAlternates } from "@/lib/hreflang";
import { formatMoney } from "@/lib/format";
import { giftCardFontClasses } from "@/lib/gift-card-fonts";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { GiftCardDesigner } from "@/components/gift-card-designer";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  if (!settings.giftCardEnabled) return {};
  const dict = getDictionary(locale).giftCard;
  return {
    title: dict.title,
    description: dict.metaDescription,
    alternates: {
      canonical: "/personalised-gift-card",
      languages: hreflangAlternates("/personalised-gift-card"),
    },
  };
}

export default async function PersonalisedGiftCardPage() {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  // Switched off in Admin > Settings: the page doesn't exist.
  if (!settings.giftCardEnabled) notFound();
  const dict = getDictionary(locale).giftCard;

  return (
    <ShelfMain>
      <div className={giftCardFontClasses}>
        <ShelfHead title={dict.title} width="full">
          <p className="shop-lede">{dict.subtitle}</p>
        </ShelfHead>
        <ShelfBody width="full">
          <GiftCardDesigner
            dict={dict}
            price={formatMoney(settings.giftCardPrice, settings.defaultCurrency, settings.defaultLocale)}
            brand={settings.storeName}
          />
        </ShelfBody>
      </div>
    </ShelfMain>
  );
}
