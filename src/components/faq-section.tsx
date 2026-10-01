import { Link } from "@/components/localized-link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { FAQ_INITIAL, faqJsonLd, type FaqItem } from "@/lib/faq";
import { toSafeJsonLd } from "@/lib/json-ld";
import { FaqAccordion } from "@/components/faq-accordion";
import { Reveal } from "@/components/reveal";
import "./faq.css";

// "Common questions": heading and a short intro beside the accordion
// ("editorial", homepage) or above it ("compact", beside the product story),
// then a contact line. The FAQPage data is built from the same items, unless
// `structuredItems` narrows it: Google asks that a question repeated on
// several pages be marked up on one of them only.
export function FaqSection({
  items,
  dict,
  variant = "editorial",
  structuredItems = items,
}: {
  items: FaqItem[];
  dict: Dictionary;
  variant?: "editorial" | "compact";
  structuredItems?: FaqItem[];
}) {
  const content = (
    <div className={`faq faq--${variant}`}>
      <div className="faq-intro">
        <p className="faq-eyebrow">{dict.faq.eyebrow}</p>
        <h2 className="shelf-heading faq-title">{dict.home.faqTitle}</h2>
        {variant === "editorial" && (
          <>
            <p className="faq-lede">{dict.faq.intro}</p>
            {/* The way to a person, given the weight of a real control rather
                than left as the tail of a sentence under the accordion. The
                teal wave that used to sit here is gone: it was the one stroke
                of a colour the palette does not contain. */}
            <Link href="/contact" className="faq-contact-cta">
              {dict.faq.contactCta}
              <span aria-hidden="true">→</span>
            </Link>
          </>
        )}
      </div>
      <div>
        {/* On entry only. With `repeatOnView` the reveal also ran BACKWARDS:
            leaving the viewport set data-reveal="false", whose rule hides every
            row — so a resize, or scrolling the section out and back, left a
            column of blank rules where the questions had been. */}
        <Reveal className="faq-list-reveal">
          <FaqAccordion
            items={items}
            initial={FAQ_INITIAL}
            moreLabel={dict.faq.more}
            fewerLabel={dict.faq.fewer}
          />
        </Reveal>
        {/* On the compact variant the intro column has no call to action, so
            the contact line stays where it was. */}
        {variant === "compact" && (
          <p className="faq-contact">
            {dict.faq.stillQuestion}{" "}
            <Link href="/contact">
              {dict.faq.contactCta} <span aria-hidden="true">→</span>
            </Link>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {structuredItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJsonLd(faqJsonLd(structuredItems)) }}
        />
      )}
      {variant === "compact" ? (
        <Reveal className="faq-compact-reveal" delayMs={1050}>
          {content}
        </Reveal>
      ) : (
        content
      )}
    </>
  );
}
