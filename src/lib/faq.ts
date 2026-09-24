import type { Dictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";

// The FAQ shown on the homepage and product pages (components/faq-section).
// Answers restate the site's own pages and settings — shipping figures come
// from the shipping zones, the returns answer from the returns policy — and
// link to the full page rather than repeating it.
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  link?: { href: string; label: string };
};

export type ShippingFacts = {
  prices: { northAmerica: string; rest: string } | null;
  days: { europe: string; northAmerica: string; rest: string } | null;
};

// Shown before "More questions": the doubts that most often stop a purchase.
export const FAQ_INITIAL = 6;

export function buildFaq(dict: Dictionary, facts: ShippingFacts, contactEmail: string): FaqItem[] {
  const f = dict.faq;
  // Reused, already-translated answers from the product FAQ.
  const [authentic, , care, , , packaging] = dict.product.faq;

  return [
    {
      id: "authentic",
      ...authentic,
      link: { href: "/murano-glass", label: dict.footer.muranoGuide },
    },
    {
      id: "shipping-cost",
      question: f.shippingCostQ,
      answer: facts.prices ? applyTemplate(f.shippingCostA, facts.prices) : f.shippingCostFallback,
    },
    {
      id: "shipping-time",
      question: f.shippingTimeQ,
      answer: facts.days ? applyTemplate(f.shippingTimeA, facts.days) : f.shippingTimeFallback,
    },
    {
      id: "returns",
      question: f.returnsQ,
      answer: f.returnsA,
      link: { href: "/legal/returns", label: dict.footer.returns },
    },
    { id: "where", question: f.whereQ, answer: f.whereA },
    // Kept as "gift-packaging": the product page's gift section links to #gift-packaging.
    { id: "gift-packaging", ...packaging },
    {
      id: "gift",
      question: f.giftQ,
      answer: f.giftA,
      link: { href: "/gift-finder", label: f.giftLink },
    },
    {
      id: "care",
      ...care,
      link: { href: "/blog/how-to-care-for-murano-glass-jewelry", label: f.careLink },
    },
    {
      id: "damaged",
      question: f.damagedQ,
      answer: f.damagedA,
      link: { href: "/contact", label: dict.footer.contact },
    },
    {
      id: "contact",
      question: f.contactQ,
      answer: applyTemplate(f.contactA, { email: contactEmail }),
      link: { href: "/contact", label: dict.footer.contact },
    },
  ];
}

// FAQPage structured data for exactly the questions on the page.
export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
