import { Link } from "@/components/localized-link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { FAQ_INITIAL, faqJsonLd, type FaqItem } from "@/lib/faq";
import { toSafeJsonLd } from "@/lib/json-ld";
import { FaqAccordion } from "@/components/faq-accordion";
import { BrandWave } from "@/components/brand-signature";
import "./faq.css";

// "Common questions": heading and a short intro beside the accordion
// ("editorial", homepage) or above it ("compact", beside the product story),
// then a contact line. The FAQPage data is built from the same items.
export function FaqSection({
  items,
  dict,
  variant = "editorial",
}: {
  items: FaqItem[];
  dict: Dictionary;
  variant?: "editorial" | "compact";
}) {
  return (
    <div className={`faq faq--${variant}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(faqJsonLd(items)) }}
      />
      <div className="faq-intro">
        <h2 className="shelf-heading">{dict.home.faqTitle}</h2>
        {variant === "editorial" && (
          <>
            <p>{dict.faq.intro}</p>
            <BrandWave className="faq-wave" />
          </>
        )}
      </div>
      <div>
        <FaqAccordion
          items={items}
          initial={FAQ_INITIAL}
          moreLabel={dict.faq.more}
          fewerLabel={dict.faq.fewer}
        />
        <p className="faq-contact">
          {dict.faq.stillQuestion}{" "}
          <Link href="/contact">
            {dict.faq.contactCta} <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
