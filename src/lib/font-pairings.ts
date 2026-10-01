/**
 * Ready-made heading + body font pairings for Admin > Settings > Site style.
 *
 * Every family here is a free Google Font. They are NOT bundled with the site:
 * when a pairing is in use the root layout adds one stylesheet link to
 * fonts.googleapis.com for exactly the two families it needs, and nothing is
 * requested at all while the store is on its own bundled faces. That is the
 * difference between a font setting that works and the one this replaced,
 * which wrote a family name into the page and hoped the visitor had it.
 *
 * `heading` and `body` are the family names as Google spells them, which is
 * also what goes into the StoreSettings row and into --font-heading-family /
 * --font-body-family.
 */

export type FontPairing = {
  id: string;
  heading: string;
  body: string;
  /** How the pair reads, for the admin's benefit. */
  style: string;
  /** Who it suits — the same shorthand the source list uses. */
  bestFor: string;
};

/** The bundled default: the site's own faces, no external request. */
export const BUNDLED_PAIRING = {
  id: "bundled",
  heading: "",
  body: "",
  style: "Editorial · Quiet · The brand's own",
  bestFor: "NewYork + DM Sans, served from this site",
} as const;

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "cormorant-manrope",
    heading: "Cormorant Garamond",
    body: "Manrope",
    style: "Editorial · Elegant · Timeless",
    bestFor: "Interior designers, luxury photographers, creative entrepreneurs",
  },
  {
    id: "playfair-dmsans",
    heading: "Playfair Display",
    body: "DM Sans",
    style: "Classic · Feminine · Sophisticated",
    bestFor: "Luxury coaches, wedding professionals, boutique brands",
  },
  {
    id: "bodoni-inter",
    heading: "Bodoni Moda",
    body: "Inter",
    style: "High fashion · Modern luxury · Editorial",
    bestFor: "Luxury brands, interior designers, high-end services",
  },
  {
    id: "prata-worksans",
    heading: "Prata",
    body: "Work Sans",
    style: "European · Refined · Quiet luxury",
    bestFor: "Interior designers, luxury realtors, boutique hotels",
  },
  {
    id: "instrument-inter",
    heading: "Instrument Serif",
    body: "Inter",
    style: "Contemporary · Sophisticated · Minimal luxury",
    bestFor: "Luxury coaches, interior designers, boutique services",
  },
  {
    id: "fraunces-manrope",
    heading: "Fraunces",
    body: "Manrope",
    style: "Modern editorial · Artistic · Sophisticated",
    bestFor: "Creative studios, luxury brands, boutique agencies",
  },
  {
    id: "librebaskerville-outfit",
    heading: "Libre Baskerville",
    body: "Outfit",
    style: "Timeless · Elevated · Refined",
    bestFor: "Luxury consultants, attorneys, financial professionals",
  },
  {
    id: "newsreader-inter",
    heading: "Newsreader",
    body: "Inter",
    style: "Editorial · Understated · Sophisticated",
    bestFor: "Luxury coaches, copywriters, lifestyle brands",
  },
  {
    id: "ebgaramond-manrope",
    heading: "EB Garamond",
    body: "Manrope",
    style: "Parisian · Romantic · Elegant",
    bestFor: "Wedding professionals, luxury florists, event designers",
  },
  {
    id: "gloock-inter",
    heading: "Gloock",
    body: "Inter",
    style: "Editorial · Dramatic · Luxury",
    bestFor: "Luxury fashion, high-end beauty, boutique studios",
  },
  {
    id: "cormorantinfant-manrope",
    heading: "Cormorant Infant",
    body: "Manrope",
    style: "Soft luxury · Romantic · Editorial",
    bestFor: "Lifestyle brands, boutique wedding professionals, studios",
  },
  {
    id: "librecaslon-manrope",
    heading: "Libre Caslon Display",
    body: "Manrope",
    style: "Sophisticated · Artistic · Editorial",
    bestFor: "Luxury coaches, authors, creative directors",
  },
];

/** The pairing whose two families match what is saved, if any. */
export function findPairing(heading?: string | null, body?: string | null) {
  const h = (heading ?? "").trim().toLowerCase();
  const b = (body ?? "").trim().toLowerCase();
  if (!h && !b) return null;
  return (
    FONT_PAIRINGS.find(
      (p) => p.heading.toLowerCase() === h && p.body.toLowerCase() === b
    ) ?? null
  );
}

/** Every family any pairing can ask for — the allowlist the layout trusts. */
const KNOWN_FAMILIES = new Set(
  FONT_PAIRINGS.flatMap((p) => [p.heading, p.body]).map((f) => f.toLowerCase())
);

/**
 * The Google Fonts stylesheet for the saved families, or null when the store
 * is on its bundled faces — in which case no third-party request is made.
 *
 * Only families from the catalogue above are ever requested: a name typed by
 * hand into the form is used as a local family and never turned into an
 * outbound URL, so the setting cannot be used to make the site fetch an
 * arbitrary address.
 */
export function googleFontsHref(heading?: string | null, body?: string | null) {
  const families = [heading, body]
    .map((f) => (f ?? "").trim())
    .filter((f) => f.length > 0 && KNOWN_FAMILIES.has(f.toLowerCase()));

  const unique = [...new Set(families)];
  if (unique.length === 0) return null;

  /* Only the weights the site actually uses: 400 for running text, 500/600 for
     the headings and controls. Asking for the whole family would download
     several times the bytes for faces nothing references. */
  const params = unique
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600`)
    .join("&");

  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
