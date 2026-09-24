import Link from "next/link";
import { GiftCardPreview } from "@/components/gift-card-preview";
import { giftCardLines } from "@/lib/gift-card";
import { applyTemplate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// The home page's invitation to /personalised-gift-card, with a sample card.
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
        <div className="gc-ad-card" aria-hidden="true">
          <GiftCardPreview lines={sample} font="serif" brand={brand} />
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
