import type { Metadata } from "next";
import Link from "next/link";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { hreflangAlternates } from "@/lib/hreflang";
import { getComposerPieces } from "@/lib/look-data";
import { COMPOSED_LOOK_DISCOUNT_PERCENT } from "@/lib/looks";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { LookComposer } from "@/components/look-composer";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale()).looks;
  return {
    title: dict.composeTitle,
    description: dict.composeMeta,
    alternates: { canonical: "/looks/compose", languages: hreflangAlternates("/looks/compose") },
  };
}

export default async function ComposeLookPage() {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);
  const pieces = await getComposerPieces(locale);

  return (
    <ShelfMain>
      <ShelfHead title={dict.looks.composeTitle} width="full">
        <p className="shop-lede">
          {applyTemplate(dict.looks.composeSubtitle, { percent: COMPOSED_LOOK_DISCOUNT_PERCENT })}
        </p>
        <Link href="/looks" className="look-back">
          <span aria-hidden="true">←</span> {dict.looks.backToLooks}
        </Link>
      </ShelfHead>
      <ShelfBody width="full">
        <LookComposer
          pieces={pieces}
          locale={settings.defaultLocale}
          labels={{
            kinds: {
              necklace: dict.giftFinder.preference.necklace,
              bracelet: dict.giftFinder.preference.bracelet,
              earrings: dict.giftFinder.preference.earrings,
            },
            hint: dict.looks.composeHint,
            total: dict.looks.composeTotal,
            individualTotal: dict.look.individualTotal,
            save: dict.look.save,
            add: dict.looks.composeAdd,
            added: dict.look.added,
            outOfStock: dict.product.outOfStock,
          }}
        />
      </ShelfBody>
    </ShelfMain>
  );
}
