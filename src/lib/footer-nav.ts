import type { Dictionary } from "@/lib/i18n/dictionaries";

// The footer's links as data: collapsible sections on phones, columns on
// desktop (components/footer.tsx). Every link appears once; legal pages sit in
// their own small row at the bottom.
export type FooterLink = { href: string; label: string };
export type FooterSection = { id: string; title: string; links: FooterLink[] };

export function buildFooterNav({
  dict,
  categories,
  contactEmail,
}: {
  dict: Dictionary;
  categories: { slug: string; label: string }[];
  contactEmail: string;
}): { sections: FooterSection[]; legal: FooterLink[] } {
  const f = dict.footer;
  return {
    sections: [
      {
        id: "shop",
        title: f.shopHeading,
        links: [
          { href: "/products", label: f.allProducts },
          ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.label })),
        ],
      },
      {
        id: "about",
        title: f.aboutHeading,
        links: [
          { href: "/about", label: f.about },
          { href: "/murano-glass", label: f.muranoGuide },
        ],
      },
      {
        id: "care",
        title: f.careHeading,
        links: [
          { href: "/contact", label: f.contact },
          { href: "/legal/returns", label: f.returns },
          { href: `mailto:${contactEmail}`, label: contactEmail },
        ],
      },
    ],
    legal: legalLinks(dict),
  };
}

// The small legal row at the very bottom of the footer and the mobile menu.
export function legalLinks(dict: Dictionary): FooterLink[] {
  return [
    { href: "/legal/privacy", label: dict.footer.privacy },
    { href: "/legal/terms", label: dict.footer.terms },
    { href: "/legal/cookies", label: dict.footer.cookies },
  ];
}
