import { JEWELLERY_STYLES } from "./jewellery-styles";
import { createSectionDesigns } from "./section-designs";
import { ARTICLE_SECTIONS, SECTIONS_BY_TARGET, type PageTarget } from "@/lib/page-layout";
import {
  SECTION_TEMPLATES,
  type BuilderBlock,
  type BuilderDoc,
  type SectionTemplate,
} from "@/lib/section-builder";

/**
 * The site, section by section, as editable designs.
 *
 * Every built-in section of every page has a template here that recreates it
 * (`page` + `recreates`), so opening any section in the editor starts from how
 * the site looks today. Text is written as references to the site's own
 * wording ({{…}}), which is already translated into every language and edited
 * in Settings > Page text, so a recreated section stays multilingual. Colours
 * are references to the palette (var(--site-…)), so a design follows Settings >
 * Site style. Sections built on live data (products, forms, filters, the
 * product being viewed) recreate it with the "original content" block: the
 * real thing, with everything around it editable.
 */

export type PageTemplate = SectionTemplate & { page?: PageTarget; forSection?: string };

// ---- Small builders ------------------------------------------------------------------

const heading = (
  text: string,
  size: "s" | "m" | "l" | "xl" = "l",
  extra: Partial<Extract<BuilderBlock, { type: "heading" }>> = {}
): BuilderBlock => ({ type: "heading", text, size, ...extra });
const text = (value: string, extra: Partial<Extract<BuilderBlock, { type: "text" }>> = {}) =>
  ({ type: "text", text: value, ...extra }) as BuilderBlock;
const button = (
  label: string,
  href: string,
  look: "solid" | "outline" = "solid",
  extra: Record<string, unknown> = {}
) => ({ type: "button", text: label, href, look, ...extra }) as BuilderBlock;
const rise = (order?: number) => ({ type: "rise" as const, ...(order ? { order } : {}) });

const single = (cells: BuilderBlock[], extra: Partial<BuilderDoc> = {}): BuilderDoc => ({
  columns: 1,
  gap: 1.25,
  divider: "none",
  valign: "top",
  cells: [cells],
  ...extra,
});

/** The section exactly as it is, inside a design that can grow around it. */
const original = (): BuilderDoc => ({
  columns: 1,
  gap: 0,
  divider: "none",
  valign: "top",
  width: "full",
  cells: [[{ type: "original" }]],
});

// Pieces used by the editorial rows (files that ship with the site).
const PIECES = {
  earrings: {
    src: "/products/orecchini-in-vetro-di-murano/orecchini-petalo-di-rosa-e081a0.png",
    href: "/products/orecchini-petalo-di-rosa-e081a0",
    name: "Orecchini Petalo di Rosa",
  },
  necklace: {
    src: "/products/collane-in-vetro-di-murano/collana-acquamarina-98782c.png",
    href: "/products/collana-acquamarina-98782c",
    name: "Collana Acquamarina",
  },
  bracelet: {
    src: "/products/bracciali-in-vetro-di-murano/bangle-cremisi-3c2860.png",
    href: "/products/bangle-cremisi-3c2860",
    name: "Bangle Cremisi",
  },
};

const storyRow = (
  n: 1 | 2 | 3,
  piece: (typeof PIECES)[keyof typeof PIECES],
  side: "left" | "right"
): BuilderBlock => ({
  type: "story",
  title: `{{home.muranoReason${n}Title}}`,
  text: `{{home.muranoReason${n}Body}}`,
  cta: "{{lookPage.viewPiece}}",
  href: piece.href,
  src: piece.src,
  alt: piece.name,
  side,
  ratio: "square",
  blend: true,
  cardTitle: piece.name,
  cardCta: "{{lookPage.viewPiece}}",
  motion: { type: "rise" },
});

// ---- Home ---------------------------------------------------------------------------------

const HOME: PageTemplate[] = [
  {
    id: "home-hero",
    page: "home",
    recreates: "hero",
    name: "Home · Hero (film behind)",
    description:
      "The film fills the band; your store's name types itself out over a soft veil, then the tagline and the button.",
    style: {
      bgVideo: "/hero/hero-atelier.mp4",
      bgImage: "/hero/hero-atelier-poster.jpg",
      overlayColor: "var(--site-bg)",
      overlayStrength: 90,
      overlayFade: "left",
      minHeight: 82,
      padTop: 3,
      padBottom: 3,
    },
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      mobile: { gap: 1 },
      cells: [
        [
          heading("{{store.name}}", "xl", { typing: "normal", h1: true }),
          text("*{{home.heroSubtitle}}*", { typing: "fast" }),
          button("{{home.heroCta}}  →", "/products", "solid", { afterTyping: true }),
        ],
        [],
      ],
    },
  },
  {
    id: "home-hero-split",
    page: "home",
    forSection: "hero",
    name: "Home · Hero (film beside the text)",
    description: "The same words beside the film instead of over it: calm and very readable.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      widths: [0.9, 1.1],
      cells: [
        [
          { type: "eyebrow", text: "Murano · Venezia", line: "after" },
          heading("{{store.name}}", "xl", { typing: "normal", h1: true }),
          text("*{{home.heroSubtitle}}*", { typing: "fast" }),
          button("{{home.heroCta}}  →", "/products", "solid", { afterTyping: true }),
        ],
        [
          {
            type: "video",
            url: "/hero/hero-atelier.mp4",
            motion: { type: "zoom", ease: "snappy" },
          },
        ],
      ],
    },
  },
  {
    id: "home-hero-classical",
    page: "home",
    forSection: "hero",
    name: "Home · Hero (classical photograph)",
    description:
      "A centred serif title, fine rules and an inset still photograph. Every line, image and button is editable.",
    style: {
      bg: "var(--site-surface)",
      padTop: 3,
      padBottom: 3,
      maxWidth: 72,
      borderTop: true,
      borderBottom: true,
      css: ".bld-fit { max-width: 34rem; margin-inline: auto; } .bld-img { object-fit: contain; }",
    },
    doc: single([
      { type: "eyebrow", text: "Murano · Venezia", line: "both", align: "center" },
      heading("{{store.name}}", "l", { h1: true, align: "center", rule: "gold" }),
      {
        type: "image",
        src: "/hero/hero-atelier-poster.jpg",
        alt: "",
        style: { h: 28 },
      },
      text("*{{home.heroSubtitle}}*", { align: "center" }),
      button("{{home.heroCta}} →", "/products", "outline", { align: "center" }),
    ]),
  },
  {
    id: "home-hero-minimal",
    page: "home",
    forSection: "hero",
    name: "Home · Hero (minimal manifesto)",
    description:
      "A generous text-only opening: store name, tagline and one button, without a film or photograph.",
    style: { padTop: 5, padBottom: 5, minHeight: 65, maxWidth: 64 },
    doc: single(
      [
        { type: "eyebrow", text: "Murano · Venezia", line: "after" },
        heading("{{store.name}}", "xl", { h1: true, rule: "gold" }),
        text("{{home.heroSubtitle}}"),
        button("{{home.heroCta}} →", "/products", "outline"),
      ],
      { gap: 2 }
    ),
  },
  {
    id: "home-hero-cover",
    page: "home",
    forSection: "hero",
    name: "Home · Hero (editorial cover)",
    description:
      "A still photograph fills the opening behind a large ivory headline, with a dark veil for readability.",
    style: {
      bgImage: "/hero/hero-atelier-poster.jpg",
      overlayColor: "#102b23",
      overlayStrength: 80,
      minHeight: 82,
      padTop: 4,
      padBottom: 4,
    },
    doc: single(
      [
        { type: "eyebrow", text: "Murano · Venezia", line: "after", style: { color: "#ffffff" } },
        heading("{{store.name}}", "xl", { h1: true, style: { color: "#ffffff" } }),
        text("{{home.heroSubtitle}}", { style: { color: "#ffffff" } }),
        button("{{home.heroCta}} →", "/products", "solid", {
          style: { bg: "#ffffff", color: "#102b23" },
        }),
      ],
      { gap: 2 }
    ),
  },
  {
    id: "home-hero-gallery",
    page: "home",
    forSection: "hero",
    name: "Home · Hero (gallery diptych)",
    description:
      "A generous portrait photograph beside a quiet serif title. Fine spacing, an ivory surface and a discreet shop link; text comes first on phones.",
    style: {
      bg: "var(--site-surface)",
      padTop: 3,
      padBottom: 3,
      maxWidth: 84,
      css: ".bld-img { object-fit: contain; }",
    },
    doc: {
      columns: 2,
      gap: 4,
      divider: "none",
      valign: "center",
      widths: [1.15, 0.85],
      mobile: { reverse: true, gap: 2 },
      cells: [
        [
          {
            type: "image",
            src: "/hero/hero-atelier-poster.jpg",
            alt: "",
            style: { h: 34, mh: 26 },
          },
        ],
        [
          { type: "eyebrow", text: "Murano · Venezia", line: "after" },
          heading("{{store.name}}", "xl", { h1: true, style: { font: "heading" } }),
          text("*{{home.heroSubtitle}}*", { style: { scale: 110 } }),
          button("{{home.heroCta}} →", "/products", "outline"),
        ],
      ],
    },
  },
  {
    id: "home-hero-print",
    page: "home",
    forSection: "hero",
    name: "Home · Hero (print editorial)",
    description:
      "An oversized magazine headline beside a slender portrait, separated by a champagne hairline. The typography leads and the photograph stays whole.",
    style: {
      padTop: 4,
      padBottom: 4,
      borderTop: true,
      borderBottom: true,
      css: ".bld-img { object-fit: contain; }",
    },
    doc: {
      columns: 2,
      gap: 3,
      divider: "thin",
      dividerColor: "var(--brass)",
      valign: "center",
      widths: [1.3, 0.7],
      mobile: { gap: 2 },
      cells: [
        [
          { type: "eyebrow", text: "Murano · Venezia", line: "none" },
          heading("{{store.name}}", "xl", { h1: true, style: { scale: 125 } }),
          { type: "divider" },
          text("{{home.heroSubtitle}}"),
          button("{{home.heroCta}} →", "/products", "outline"),
        ],
        [
          {
            type: "image",
            src: "/hero/hero-atelier-poster.jpg",
            alt: "",
            style: { h: 32, mh: 24 },
          },
        ],
      ],
    },
  },
  {
    id: "home-showcase",
    page: "home",
    recreates: "showcase",
    name: "Home · Collections animation",
    description: "The scrolling necklace, bracelet and earrings sequence, with all its settings.",
    doc: {
      columns: 1,
      gap: 0,
      divider: "none",
      valign: "top",
      width: "full",
      cells: [[{ type: "showcase" }]],
    },
  },
  {
    id: "home-popular",
    page: "home",
    recreates: "popular",
    name: "Home · Community favourites",
    description: "A centred title with a gold rule over the sliding carousel of favourite pieces.",
    style: { padTop: 1, padBottom: 1 },
    doc: single(
      [
        heading("{{home.popularTitle}}", "l", { align: "center", rule: "gold", motion: rise() }),
        { type: "carousel", source: "popular", count: 10 },
      ],
      { gap: 2 }
    ),
  },
  {
    id: "home-popular-minimal",
    page: "home",
    forSection: "popular",
    name: "Home · Favourites (minimal row)",
    description:
      "A quiet title above the live favourites carousel, with generous space and no decorative rules.",
    style: { padTop: 3, padBottom: 3 },
    doc: single(
      [heading("{{home.popularTitle}}", "m"), { type: "carousel", source: "popular", count: 8 }],
      { gap: 2 }
    ),
  },
  {
    id: "home-popular-classical",
    page: "home",
    forSection: "popular",
    name: "Home · Favourites (classical band)",
    description:
      "A cream band, centred serif heading and fine rules around a carousel of your actual favourite products.",
    style: { bg: "var(--site-surface)", padTop: 3, padBottom: 3 },
    doc: single(
      [
        { type: "divider" },
        heading("{{home.popularTitle}}", "l", { align: "center", rule: "gold" }),
        { type: "carousel", source: "popular", count: 10 },
        { type: "divider" },
      ],
      { gap: 2 }
    ),
  },
  {
    id: "home-popular-editorial",
    page: "home",
    forSection: "popular",
    name: "Home · Favourites (editorial spread)",
    description:
      "A large heading and shop link beside the favourites carousel. The columns stack on phones.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "thin",
      valign: "center",
      widths: [0.55, 1.45],
      cells: [
        [
          heading("{{home.popularTitle}}", "xl", { rule: "gold" }),
          button("{{footer.allProducts}} →", "/products", "outline"),
        ],
        [{ type: "carousel", source: "popular", count: 8 }],
      ],
    },
  },
  {
    id: "home-popular-grid",
    page: "home",
    forSection: "popular",
    name: "Home · Favourites (product grid)",
    description:
      "A centred heading above a browsable grid of favourite products instead of an animated carousel.",
    style: { padTop: 3, padBottom: 3 },
    doc: single(
      [
        heading("{{home.popularTitle}}", "l", { align: "center", rule: "gold" }),
        { type: "shelf", source: "popular", count: 6 },
      ],
      { gap: 2 }
    ),
  },
  {
    id: "home-popular-gallery",
    page: "home",
    forSection: "popular",
    name: "Home · Favourites (gallery collection)",
    description:
      "A numbered editorial heading and fine rules above eight live favourites. An open product grid gives every piece room to be compared.",
    style: { padTop: 4, padBottom: 4, borderTop: true, borderBottom: true },
    doc: single(
      [
        { type: "eyebrow", number: "01", text: "{{store.name}}", line: "after" },
        heading("{{home.popularTitle}}", "xl", { style: { font: "heading" } }),
        { type: "shelf", source: "popular", count: 8 },
        button("{{footer.allProducts}} →", "/products", "outline", { align: "center" }),
      ],
      { gap: 2.5 }
    ),
  },
  {
    id: "home-popular-salon",
    page: "home",
    forSection: "popular",
    name: "Home · Favourites (classical salon)",
    description:
      "An ivory salon band with a slim title column, champagne divider and a curated six-piece grid. All pieces, prices and links stay connected to the catalogue.",
    style: { bg: "var(--site-surface)", padTop: 4, padBottom: 4 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "thin",
      dividerColor: "var(--brass)",
      valign: "top",
      widths: [0.65, 1.35],
      mobile: { gap: 2 },
      cells: [
        [
          { type: "eyebrow", text: "{{store.name}}", line: "after" },
          heading("{{home.popularTitle}}", "l", { style: { font: "heading" } }),
          button("{{footer.allProducts}} →", "/products", "outline"),
        ],
        [{ type: "shelf", source: "popular", count: 6 }],
      ],
    },
  },
  {
    id: "home-bestsellers",
    page: "home",
    recreates: "bestSellers",
    name: "Home · Best sellers",
    description: "Title with a gold rule and a row of your best-selling pieces.",
    doc: single(
      [
        heading("{{home.bestSellers}}", "l", { rule: "gold", motion: rise() }),
        { type: "shelf", source: "bestSellers", count: 4 },
      ],
      { gap: 2 }
    ),
  },
  {
    id: "home-looks",
    page: "home",
    recreates: "looks",
    name: "Home · Looks",
    description: "Your editorial looks under a centred title, with the link to all looks.",
    doc: single(
      [
        heading("{{looks.title}}", "l", { align: "center", rule: "gold", motion: rise() }),
        { type: "looks", count: 3 },
        button("{{looks.allLooks}}  →", "/looks", "outline", { align: "center" }),
      ],
      { gap: 2 }
    ),
  },
  {
    id: "home-new",
    page: "home",
    recreates: "newArrivals",
    name: "Home · New arrivals",
    description: "Title, a line of intro and the link, over two rows of the latest pieces.",
    doc: single(
      [
        heading("{{home.newArrivals}}", "l", { rule: "gold", motion: rise(1) }),
        text("{{home.newArrivalsIntro}}", { motion: { type: "fade", order: 2 } }),
        button("{{footer.allProducts}}  →", "/products", "outline"),
        { type: "shelf", source: "newest", count: 8 },
      ],
      { gap: 1.5 }
    ),
  },
  {
    id: "home-special",
    page: "home",
    recreates: "special",
    name: "Home · Special selection",
    description: "Hand-picked pieces at special prices, with the title, a line and the link.",
    doc: single(
      [
        heading("{{home.specialSelectionTitle}}", "l", { rule: "gold", motion: rise() }),
        text("{{home.specialSelectionSubtitle}}"),
        button("{{home.specialSelectionCta}}  →", "/products?sale=1", "outline"),
        { type: "shelf", source: "special", count: 4 },
      ],
      { gap: 1.5 }
    ),
  },
  {
    id: "home-reasons",
    page: "home",
    recreates: "reasons",
    name: "Home · Why Murano (story rows)",
    description:
      "Three editorial rows that alternate sides: title, gold rule, text and button beside a piece with its card.",
    doc: single(
      [
        storyRow(1, PIECES.earrings, "right"),
        storyRow(2, PIECES.necklace, "left"),
        storyRow(3, PIECES.bracelet, "right"),
      ],
      { gap: 0 }
    ),
  },
  {
    id: "home-faq",
    page: "home",
    recreates: "faq",
    name: "Home · Questions and answers",
    description: "Your site's FAQ, written from your shipping and returns settings.",
    doc: single([{ type: "siteFaq" }], { gap: 0 }),
  },
  {
    id: "home-giftfinder",
    page: "home",
    recreates: "giftFinder",
    name: "Home · Gift finder band",
    description: "A quiet band that invites people to the gift finder, centred.",
    style: { bg: "var(--site-surface)", padTop: 3, padBottom: 3 },
    doc: single(
      [
        { type: "eyebrow", text: "{{giftFinder.homeCtaTime}}", line: "both", align: "center" },
        heading("[{{giftFinder.homeCtaLine}}  →](/gift-finder)", "l", {
          align: "center",
          motion: rise(),
        }),
        text("{{giftFinder.homeCtaDetails}}", { align: "center" }),
      ],
      { gap: 0.75 }
    ),
  },
  {
    id: "home-reviews",
    page: "home",
    recreates: "testimonials",
    name: "Home · Customer reviews",
    description: "Title with a gold rule and three real reviews.",
    doc: single(
      [
        heading("{{home.testimonialsTitle}}", "l", { rule: "gold", motion: rise() }),
        { type: "reviews", count: 3 },
      ],
      { gap: 2 }
    ),
  },
  {
    id: "home-journal",
    page: "home",
    recreates: "journal",
    name: "Home · Journal",
    description: "Your latest journal articles, as the home page shows them.",
    doc: {
      columns: 1,
      gap: 0,
      divider: "none",
      valign: "top",
      width: "full",
      cells: [[{ type: "journal" }]],
    },
  },
  {
    id: "home-newsletter",
    page: "home",
    recreates: "newsletter",
    name: "Home · Newsletter",
    description: "The deep band with the invitation, the signup form and a large −10%.",
    style: { bg: "var(--site-text)", color: "var(--site-bg)", padTop: 2.5, padBottom: 2.5 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      widths: [1.4, 0.6],
      mobile: { reverse: true, gap: 1 },
      cells: [
        [
          heading("{{home.newsletterCtaTitle}}", "l", { motion: rise() }),
          text("{{home.newsletterCtaBody}}"),
          { type: "newsletter" },
        ],
        [
          {
            ...heading("−10%", "xl", { align: "right" }),
            style: { color: "var(--site-accent)", scale: 260 },
            motion: { type: "zoom", ease: "bounce" },
          } as BuilderBlock,
        ],
      ],
    },
  },
];

// ---- About ---------------------------------------------------------------------------------

const ABOUT: PageTemplate[] = [
  {
    id: "about-hero",
    page: "about",
    recreates: "hero",
    name: "About · Hero",
    description:
      "Burano's coloured houses behind a deep veil, with the label, the title and the intro.",
    style: {
      bgImage: "/blog/burano-colorful-houses-canal.jpg",
      overlayColor: "var(--site-primary)",
      overlayStrength: 82,
      overlayFade: "left",
      color: "#ffffff",
      minHeight: 70,
      padTop: 4,
      padBottom: 4,
    },
    doc: {
      columns: 2,
      gap: 2,
      divider: "none",
      valign: "center",
      widths: [1.55, 0.45],
      cells: [
        [
          { type: "eyebrow", text: "Murano · Venezia", line: "before" },
          heading("{{about.title}}", "xl", { h1: true, rule: "gold", motion: rise(1) }),
          text("{{about.intro}}", { motion: { type: "fade", order: 2 } }),
        ],
        [],
      ],
    },
  },
  {
    id: "about-body",
    page: "about",
    recreates: "body",
    name: "About · Story and values (as it is)",
    description: "The heritage text, the values and why choose us, exactly as now.",
    doc: original(),
  },
  {
    id: "about-heritage",
    page: "about",
    name: "About · Heritage (editorial)",
    description: "The heritage story as an editorial row beside a photo of Venice.",
    doc: single([
      {
        type: "story",
        eyebrow: "Murano · Venezia",
        title: "{{about.heritageTitle}}",
        text: "{{about.heritageBody1}}\n\n{{about.heritageBody2}}",
        cta: "{{about.guideLinkCta}}",
        href: "/murano-glass",
        src: "/about/venice-moored-gondolas.jpg",
        alt: "Gondolas moored in Venice",
        side: "right",
        motion: { type: "rise" },
      },
    ]),
  },
  {
    id: "about-values",
    page: "about",
    name: "About · Our values (three panels)",
    description:
      "Three values side by side, with fine lines between them and a sequence animation.",
    doc: {
      columns: 3,
      gap: 2.5,
      divider: "thin",
      valign: "top",
      stagger: 200,
      cells: [1, 2, 3].map((n) => [
        heading(`{{about.value${n}Title}}`, "m", { motion: { type: "rise", order: n } }),
        text(`{{about.value${n}Body}}`, { motion: { type: "fade", order: n } }),
      ]),
    },
  },
  {
    id: "about-why",
    page: "about",
    name: "About · Why choose us",
    description: "Shipping, secure payment and returns, as three icon points.",
    doc: {
      columns: 3,
      gap: 2,
      divider: "none",
      valign: "top",
      cells: [
        [
          {
            type: "icon",
            icon: "truck",
            title: "{{home.whyShipping}}",
            text: "{{home.whyShippingBody}}",
          },
        ],
        [
          {
            type: "icon",
            icon: "shield",
            title: "{{home.whySecure}}",
            text: "{{home.whySecureBody}}",
          },
        ],
        [
          {
            type: "icon",
            icon: "heart",
            title: "{{home.whyReturns}}",
            text: "{{home.whyReturnsBody}}",
          },
        ],
      ],
    },
  },
  {
    id: "about-art",
    page: "about",
    recreates: "art",
    name: "About · Gondola drawing (as it is)",
    description: "The drawing at the foot of the page.",
    doc: original(),
  },
];

// ---- Other pages ---------------------------------------------------------------------------

/** A page title and its first line, in the site's own type. */
const pageHead = (title: string, intro: string): BuilderDoc =>
  single(
    [
      heading(title, "xl", { h1: true, motion: rise(1) }),
      text(intro, { motion: { type: "fade", order: 2 } }),
    ],
    { gap: 0.75 }
  );

const asItIs = (page: PageTarget, id: string, name: string, description: string): PageTemplate => ({
  id: `${page}-${id}`,
  page,
  recreates: id,
  name,
  description,
  doc: original(),
});

const OTHER: PageTemplate[] = [
  {
    id: "contact-head",
    page: "contact",
    recreates: "head",
    name: "Contact · Title and intro",
    description: "The page title and its first line.",
    style: { padTop: 2, padBottom: 0 },
    doc: pageHead("{{contact.title}}", "{{contact.intro}}"),
  },
  asItIs(
    "contact",
    "form",
    "Contact · Details and form (as it is)",
    "Email, address and the message form."
  ),
  {
    id: "looks-head",
    page: "looks",
    recreates: "head",
    name: "Looks · Title and intro",
    description: "The page title and the editorial introduction.",
    style: { padTop: 2, padBottom: 0 },
    doc: pageHead("{{looks.title}}", "{{lookPage.editorialIntro}}"),
  },
  asItIs("looks", "list", "Looks · All looks (as it is)", "Every look, in the editorial layout."),
  asItIs(
    "journal",
    "head",
    "Journal · Title and filters (as it is)",
    "The title, intro and category filters."
  ),
  asItIs("journal", "list", "Journal · Articles (as it is)", "The featured article and the list."),
  asItIs(
    "category",
    "head",
    "Category · Title and links (as it is)",
    "The category name and its quick links."
  ),
  asItIs("category", "list", "Category · Products (as it is)", "Filters and the product grid."),
  asItIs(
    "products",
    "head",
    "Shop · Title and promises (as it is)",
    "The heading, shipping promise and badges."
  ),
  asItIs(
    "products",
    "list",
    "Shop · Filters and products (as it is)",
    "Search, filters and the grid."
  ),
  asItIs(
    "product",
    "gift",
    "Product · Gift packaging (as it is)",
    "The gift box photo and its features."
  ),
  asItIs(
    "product",
    "reviews",
    "Product · Reviews (as it is)",
    "Customer reviews and the review form."
  ),
  asItIs(
    "product",
    "customBlocks",
    "Product · Custom blocks (as it is)",
    "The text written for each product."
  ),
  asItIs(
    "product",
    "story",
    "Product · Story and FAQ (as it is)",
    "Why this piece, and its questions."
  ),
  asItIs(
    "product",
    "articles",
    "Product · Related articles (as it is)",
    "Journal articles about this piece."
  ),
  asItIs("product", "look", "Product · Complete the look (as it is)", "The matching pieces."),
  asItIs(
    "product",
    "related",
    "Product · You might also like (as it is)",
    "Related pieces from the same family."
  ),
  asItIs(
    "product",
    "giftCard",
    "Product · Gift card (as it is)",
    "The personalised gift card promotion."
  ),
  {
    id: "product-promise",
    page: "product",
    name: "Product · Our promise (editorial)",
    description: "Three promises under the piece: handmade, shipping and returns.",
    doc: {
      columns: 3,
      gap: 2,
      divider: "thin",
      valign: "top",
      cells: [
        [
          {
            type: "icon",
            icon: "gem",
            title: "{{about.value1Title}}",
            text: "{{about.value1Body}}",
            align: "center",
          },
        ],
        [
          {
            type: "icon",
            icon: "truck",
            title: "{{home.whyShipping}}",
            text: "{{home.whyShippingBody}}",
            align: "center",
          },
        ],
        [
          {
            type: "icon",
            icon: "heart",
            title: "{{home.whyReturns}}",
            text: "{{home.whyReturnsBody}}",
            align: "center",
          },
        ],
      ],
    },
  },
  {
    id: "any-story-row",
    name: "Story row (editorial)",
    description:
      "One editorial row: a piece on one side, title, rule, text and button on the other.",
    doc: single([storyRow(1, PIECES.necklace, "right")]),
  },
  {
    id: "any-original",
    name: "Section as it is",
    description: "The section's own content, with room to add anything above or below it.",
    doc: original(),
  },
];

// ---- Editorial examples --------------------------------------------------------------------
//
// Five ready-made home-page sections, written in the site's own editorial voice:
// a numbered eyebrow, a gold rule, the store's own wording ({{…}}, so they stay
// translated and editable in Settings > Page text) and the palette's colours
// (var(--site-…), so they follow Settings > Site style). They carry no `recreates`,
// so the admin can add, restyle, reorder or delete each one on its own.
const EDITORIAL: PageTemplate[] = [
  {
    id: "editorial-manifesto",
    page: "home",
    name: "Editorial · Manifesto band",
    description:
      "A numbered label and a large statement over the store's own line, centred on a tinted band.",
    style: { bg: "var(--site-surface)", padTop: 4, padBottom: 4 },
    doc: single(
      [
        {
          type: "eyebrow",
          number: "01",
          text: "{{home.heroEyebrow}}",
          line: "both",
          align: "center",
          motion: { type: "fade" },
        },
        heading("{{store.name}}", "xl", { align: "center", rule: "gold", motion: rise(1) }),
        text("{{home.heroSubtitle}}", {
          align: "center",
          motion: { type: "fade", order: 2 },
        }),
        button("{{home.heroCta}}", "/products", "outline", {
          align: "center",
          afterTyping: true,
          motion: { type: "rise", order: 3 },
        }),
      ],
      { gap: 1.25 }
    ),
  },
  {
    id: "editorial-story-spread",
    page: "home",
    name: "Editorial · Story spread",
    description:
      "A tall piece beside the first Murano reason: eyebrow, gold rule, text and a link to the piece.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 3.5,
      divider: "none",
      valign: "center",
      cells: [
        [
          {
            type: "image",
            src: PIECES.necklace.src,
            alt: PIECES.necklace.name,
            style: { h: 32 },
            motion: { type: "rise" },
          },
        ],
        [
          { type: "eyebrow", number: "02", text: "Murano · Venezia", line: "after" },
          heading("{{home.muranoReason1Title}}", "l", { rule: "gold", motion: rise(1) }),
          text("{{home.muranoReason1Body}}", { motion: { type: "fade", order: 2 } }),
          button("{{lookPage.viewPiece}}", PIECES.necklace.href, "outline", {
            motion: { type: "rise", order: 3 },
          }),
        ],
      ],
    },
  },
  {
    id: "editorial-numbers",
    page: "home",
    name: "Editorial · House numbers",
    description:
      "Four figures about the workshop, separated by vertical lines that draw themselves in.",
    style: { bg: "var(--site-surface)", padTop: 3, padBottom: 3 },
    doc: {
      columns: 4,
      gap: 2,
      divider: "thin",
      drawLines: true,
      valign: "center",
      cells: [
        [
          {
            type: "counter",
            value: 700,
            suffix: "+",
            label: "{{home.muranoReason1Title}}",
            size: "xl",
            align: "center",
          },
        ],
        [
          {
            type: "counter",
            value: 100,
            suffix: "%",
            label: "{{home.whyShipping}}",
            size: "xl",
            align: "center",
          },
        ],
        [
          {
            type: "counter",
            value: 48,
            suffix: "h",
            label: "{{home.whySecure}}",
            size: "xl",
            align: "center",
          },
        ],
        [
          {
            type: "counter",
            value: 30,
            label: "{{home.whyReturns}}",
            size: "xl",
            align: "center",
          },
        ],
      ],
    },
  },
  {
    id: "editorial-pull-quote",
    page: "home",
    name: "Editorial · Pull quote",
    description:
      "A big line from a real review, set large between hairline rules, with the reviewer credited.",
    style: { padTop: 4, padBottom: 4, align: "center", maxWidth: 52 },
    doc: single(
      [
        { type: "divider", draw: true },
        {
          type: "quote",
          text: "{{home.testimonialsTitle}}",
          cite: "{{store.name}}",
          style: { scale: 140 },
          motion: { type: "fade" },
        },
        { type: "divider", draw: true },
      ],
      { gap: 1.5 }
    ),
  },
  {
    id: "editorial-shelf-feature",
    page: "home",
    name: "Editorial · Feature shelf",
    description:
      "A numbered label, a title with the link beside it and a single row of hand-picked pieces.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 2,
      divider: "none",
      valign: "center",
      cells: [
        [
          {
            type: "eyebrow",
            number: "03",
            text: "{{home.specialSelectionSubtitle}}",
            line: "after",
          },
          heading("{{home.specialSelectionTitle}}", "l", { rule: "gold", motion: rise() }),
        ],
        [
          button("{{home.specialSelectionCta}}", "/products?sale=1", "outline", {
            align: "right",
          }),
        ],
      ],
    },
    // The shelf sits under the heading row, full width, so the pieces stay the
    // page's own cards rather than a hand-built imitation of them.
    // (Kept as a second section by the admin: see EDITORIAL_HOME_SECTIONS.)
  },
];

const ARTICLE: PageTemplate[] = ARTICLE_SECTIONS.map((section) => ({
  id: `article-${section.id}`,
  page: "article",
  recreates: section.id,
  name: `Article · ${section.label}`,
  description: section.hint,
  doc: original(),
}));

/** Ten coordinated, palette-linked layouts available on every admin page. */
export const JEWELLERY_TEMPLATES: PageTemplate[] = JEWELLERY_STYLES.map((direction, index) => {
  const dark = direction.id === "palazzo-evening";
  const center = ["quiet-atelier", "gallery-no-10", "sculpture-studio"].includes(direction.id);
  const ink = dark ? "var(--site-on-primary)" : "var(--site-text)";
  const plate = (
    piece: (typeof PIECES)[keyof typeof PIECES],
    extra: Record<string, unknown> = {}
  ): BuilderBlock => ({
    type: "image",
    src: piece.src,
    alt: piece.name,

    style: { h: 30, mh: 22, radius: direction.radius, ...extra },
  });
  const copy: BuilderBlock[] = [
    {
      type: "eyebrow",
      number: String(index + 1).padStart(2, "0"),
      text: "Murano · Venezia",
      line: "after",
      align: center ? "center" : "left",
      style: { color: ink },
    },
    heading("{{store.name}}", direction.id === "venetian-archive" ? "l" : "xl", {
      align: center ? "center" : "left",
      style: { color: ink, font: "heading" },
    }),
    text(
      ["couture-papers", "modern-heirloom"].includes(direction.id)
        ? "*{{home.heroSubtitle}}*"
        : "{{home.heroSubtitle}}",
      { align: center ? "center" : "left", style: { color: ink } }
    ),
    button("{{home.heroCta}} →", "/products", "outline", {
      align: center ? "center" : "left",
      style: { color: ink, radius: Math.min(direction.radius, 0.5) },
    }),
  ];
  let doc: BuilderDoc = {
    columns: 2,
    gap: direction.gap,
    divider: "none",
    valign: "center",
    widths: [1, 1.2],
    mobile: { gap: 2 },
    cells: [copy, [plate(PIECES.necklace)]],
  };
  switch (direction.id) {
    case "quiet-atelier":
      doc = single([...copy.slice(0, 3), plate(PIECES.earrings, { h: 22, mh: 18 }), copy[3]], {
        gap: 2,
      });
      break;
    case "the-editorial":
      doc.widths = [1.4, 0.6];
      doc.divider = "thin";
      doc.dividerColor = "var(--site-accent)";
      break;
    case "gallery-no-10":
      doc = {
        columns: 3,
        gap: 2,
        divider: "none",
        valign: "top",
        mobile: { gap: 2 },
        cells: Object.values(PIECES).map((piece, i) => [
          {
            type: "eyebrow",
            number: String(i + 1).padStart(2, "0"),
            text: "Murano · Venezia",
            line: "after",
            align: "center",
          },
          plate(piece, { h: 24, mh: 20 }),
          heading(piece.name, "s", { align: "center" }),
          button("{{home.heroCta}} →", piece.href, "outline", { align: "center" }),
        ]),
      };
      break;
    case "venetian-archive":
      doc.divider = "thin";
      doc.dividerColor = "var(--site-accent)";
      doc.widths = [0.8, 1.2];
      break;
    case "botanical-muse":
      doc.cells = [copy, [plate(PIECES.earrings, { bg: "var(--site-bg)", pad: 2 })]];
      break;
    case "couture-papers":
      doc.cells = [
        copy,
        [
          plate(PIECES.necklace, { bg: "var(--site-bg)", pad: 1.5, w: 85 }),
          plate(PIECES.bracelet, {
            h: 16,
            mh: 14,
            w: 55,
            x: 35,
            y: -3,
            mx: 20,
            my: 0,
            bg: "var(--site-surface)",
            pad: 1,
          }),
        ],
      ];
      break;
    case "sculpture-studio":
      doc = single([copy[0], plate(PIECES.bracelet, { h: 34, mh: 24 }), ...copy.slice(1)], {
        gap: 1.5,
      });
      break;
    case "modern-heirloom":
      doc.cells = [copy, [plate(PIECES.necklace, { bg: "var(--site-bg)", pad: 2 })]];
      break;
    case "palazzo-evening":
      doc.cells[1] = [plate(PIECES.earrings, { bg: "var(--site-surface)", pad: 2 })];
      break;
  }
  return {
    id: `jewellery-${direction.id}`,
    name: `${direction.name} · Jewellery`,
    description: `${direction.note} Uses your Site style palette; every element is editable.`,
    style: {
      bg: dark
        ? "var(--site-primary)"
        : ["venetian-archive", "botanical-muse", "couture-papers", "modern-heirloom"].includes(
              direction.id
            )
          ? "var(--site-surface)"
          : "var(--site-bg)",
      color: ink,
      padTop: 4,
      padBottom: 4,
      maxWidth: 84,
      css: `.bld-img { object-fit: contain; } .bld-h { letter-spacing: ${direction.tracking}em; line-height: ${direction.leading}; } .bld-text { max-width: 36rem; line-height: 1.8; ${center ? "margin-inline: auto;" : ""} } .bld-btn { border-color: currentColor; } @media (max-width: 640px) { .bld-h { overflow-wrap: anywhere; } }`,
    },
    doc,
  };
});

export const PAGE_TEMPLATES: PageTemplate[] = [...HOME, ...ABOUT, ...OTHER, ...ARTICLE];

export function alternativesFor(page: PageTarget, section: string): PageTemplate[] {
  return PAGE_TEMPLATES.filter(
    (template) =>
      template.page === page && (template.forSection === section || template.recreates === section)
  );
}

/** The five editorial examples, offered to every page as ready-made sections. */
export const EDITORIAL_TEMPLATES: PageTemplate[] = EDITORIAL;

/**
 * A template's design and style, ready to drop into a LayoutEntry.
 *
 * Used to place the editorial examples on the home page (see
 * `withEditorialExamples` in page-layout.ts), which is why it returns a plain
 * body rather than a whole entry: the caller owns the id and the name.
 */
export function templateBody(
  templateId: string
): { builder: BuilderDoc; style?: PageTemplate["style"] } | null {
  const template =
    ALL_TEMPLATES.find((t) => t.id === templateId) ??
    SECTION_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return null;
  return {
    builder: structuredClone(template.doc),
    ...(template.style ? { style: structuredClone(template.style) } : {}),
  };
}

/** Every template: the site's sections first, then the editorial examples, then
 *  the general designs. */
export const ALL_TEMPLATES: PageTemplate[] = [
  ...PAGE_TEMPLATES,
  ...JEWELLERY_TEMPLATES,
  ...EDITORIAL_TEMPLATES,
  ...SECTION_TEMPLATES,
];

/** The template that recreates a page's built-in section, if any. */
export const recreateTemplateFor = (page: PageTarget, id: string) =>
  PAGE_TEMPLATES.find((t) => t.recreates === id && (t.page ?? "home") === page);

/** The templates offered for a page: this page's own first, then the editorial
 *  examples, then the general ones. Another page's sections (its hero, its
 *  title…) are never offered, so the About hero can't end up on the home page. */
export function templatesFor(page: PageTarget): PageTemplate[] {
  const own = PAGE_TEMPLATES.filter((t) => t.page === page);
  const general = ALL_TEMPLATES.filter((t) => !t.page);
  return [...own, ...EDITORIAL_TEMPLATES, ...general];
}

/** True when a template needs a built-in section around it (it shows the
 *  section's own content), so it can't start a new section of its own. */
export const usesOriginal = (t: SectionTemplate) =>
  t.doc.cells.some((cell) => cell.some((b) => b.type === "original"));

/** The ten styles of this particular section, generated only when needed. */
export function sectionStylesFor(page: PageTarget, sectionId: string) {
  const section = SECTIONS_BY_TARGET[page].find((item) => item.id === sectionId);
  const source =
    page === "home" && sectionId === "hero"
      ? PAGE_TEMPLATES.find((template) => template.id === "home-hero-split")
      : recreateTemplateFor(page, sectionId);
  return section ? createSectionDesigns(page, section, source) : [];
}
