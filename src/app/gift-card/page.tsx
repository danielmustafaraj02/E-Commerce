import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { ShelfMain } from "@/components/shelf-main";
import { GiftCardPreview } from "@/components/gift-card-preview";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { localizedCanonical, hreflangAlternates } from "@/lib/hreflang";
import { getGiftVoucherCopy } from "@/lib/gift-voucher-copy";
import { getStoreSettings } from "@/lib/store-settings";
import { turnstileSiteKey } from "@/lib/turnstile";
import { ShelfBody, ShelfHead } from "@/components/shelf-page";
import { GiftVoucherPurchaseForm } from "./gift-voucher-purchase-form";
import "./gift-card.css";

const PATH = "/gift-card";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, settings] = await Promise.all([getLocale(), getStoreSettings()]);
  const copy = getGiftVoucherCopy(locale);
  return {
    title: `${copy.title} | ${settings.storeName}`,
    description: copy.metaDescription,
    alternates: {
      canonical: localizedCanonical(locale, PATH),
      languages: hreflangAlternates(PATH),
    },
    openGraph: {
      title: `${copy.title} | ${settings.storeName}`,
      description: copy.metaDescription,
      type: "website",
    },
  };
}

export default async function GiftVoucherPage() {
  const [locale, settings, session, nonce, siteKey] = await Promise.all([
    getLocale(),
    getStoreSettings(),
    auth(),
    headers().then((value) => value.get("x-nonce") ?? undefined),
    turnstileSiteKey(),
  ]);
  const copy = getGiftVoucherCopy(locale);
  const checkoutDict = getDictionary(locale).checkout;

  return (
    <ShelfMain>
      <ShelfHead title={copy.title} width="full">
        <p className="shop-lede">{copy.intro}</p>
      </ShelfHead>
      <ShelfBody width="full" className="gift-voucher-page">
        <section className="gift-voucher-layout">
          <div className="gift-voucher-story">
            <div className="gift-voucher-card-stage">
              <GiftCardPreview
                lines={[copy.purchaseLabel, "Perla · Murano"]}
                font="serif"
                brand={settings.storeName}
                stickers={[{ icon: "pearl", x: 82, y: 22 }]}
              />
              <p className="gift-voucher-card-caption">{copy.deliveryNote}</p>
            </div>
            <div className="gift-voucher-benefits">
              <span className="gift-voucher-benefit-rule" aria-hidden="true" />
              <p>{copy.balanceTerms}</p>
            </div>
          </div>

          <GiftVoucherPurchaseForm
            copy={copy}
            checkoutDict={checkoutDict}
            locale={settings.defaultLocale}
            buyerEmail={session?.user?.email ?? ""}
            isLoggedIn={Boolean(session?.user)}
            turnstileSiteKey={siteKey}
            nonce={nonce}
          />
        </section>
      </ShelfBody>
    </ShelfMain>
  );
}
