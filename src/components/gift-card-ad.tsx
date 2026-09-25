import Link from "next/link";
import { GiftCard3D } from "@/components/gift-card-3d";
import { giftCardLines, type GiftCardSticker } from "@/lib/gift-card";
import { applyTemplate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// A sample of what a card can carry: a motif on the front, a coloured back.
const SAMPLE_STICKERS: GiftCardSticker[] = [{ icon: "heart", x: 80, y: 20 }];

// The invitation to /personalised-gift-card, with a sample card in 3D that
// turns over to show the back: on the home page and above "You might also
// like" on product pages.
export function GiftCardAd({
  dict,
  price,
  brand,
}: {
  dict: Dictionary["giftCard"];
  price: string;
  brand: string;
}) {
  const sample = giftCardLines(
    { message: dict.presets[0], recipient: "Sofia", sender: "Marco" },
    dict
  );
  return (
    <section className="shelf-section gc-ad">
      <div className="shelf-wrap gc-ad-grid">
        <div className="gc-ad-card">
          <GiftCard3D
            lines={sample}
            font="serif"
            brand={brand}
            stickers={SAMPLE_STICKERS}
            back="lagoon"
            labels={{ seeBack: dict.seeBack, seeFront: dict.seeFront }}
          />
        </div>
        <div className="gc-ad-text">
          <h2 className="shelf-heading">{dict.adHeadline}</h2>
          <p className="gc-ad-sub">{dict.adSub}</p>
          <p className="gc-ad-body">{applyTemplate(dict.adBody, { price })}</p>
          <Link href="/personalised-gift-card" className="shelf-button">
            {dict.adCta}
            <span aria-hidden="true" className="shelf-button-arrow">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
