import type { Article } from "@/lib/journal/types";
import { CCI_GLASS_CARE, MUSEUM_BEADS, MUSEUM_SECTIONS, OWN_PHOTO } from "./sources";

export const howToCareForMuranoGlassJewelry: Article = {
  slug: "how-to-care-for-murano-glass-jewelry",
  title: "How to Care for Murano Glass Jewelry",
  seoTitle: "How to Care for Murano Glass Jewelry",
  description:
    "Simple ways to clean, wear and store Murano glass jewelry so the glass keeps its colour and shine, based on how conservators look after glass.",
  category: "care",
  published: "2026-09-24",
  primaryKeyword: "how to care for murano glass jewelry",
  secondaryKeywords: [
    "how to clean murano glass jewelry",
    "how to store glass jewelry",
    "murano glass care",
  ],
  hero: {
    kind: "file",
    src: "/about/venice-moored-gondolas.jpg",
    alt: "Gondolas moored along a quiet canal in Venice",
    rights: OWN_PHOTO,
  },
  intro:
    "Glass is one of the most durable materials people have ever made — the Murano Glass Museum holds Roman pieces from the first to the third century AD. Worn every day, though, a piece of jewellery meets water, perfume, knocks and changes of temperature. A few habits keep it looking as it did the day it arrived.",
  body: [
    {
      type: "facts",
      title: "At a glance",
      items: [
        "Put jewellery on last, after perfume and creams.",
        "Clean with a soft cloth and lukewarm water; let it dry slowly.",
        "Avoid sudden changes of temperature.",
        "Store each piece on its own, on something soft.",
      ],
    },
    { type: "h2", text: "Wearing it" },
    {
      type: "p",
      text: "Make your jewellery the last thing you put on, once perfume, hairspray and creams have dried, and take it off before swimming, bathing or sport. The glass itself is not what worries us here: it is the thread, the clasp and the other findings, which last longer when they stay dry and clean.",
    },
    { type: "h2", text: "Cleaning it" },
    {
      type: "p",
      text: "Usually a soft, dry cloth is all a piece needs. If the glass is dull, wipe it with a cloth dampened in lukewarm water and let it dry in the air. The [Canadian Conservation Institute](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-ceramics-glass.html), which advises museums on caring for glass, recommends clean lukewarm water for sound glass, and warns against speeding up drying with heat.",
    },
    {
      type: "quote",
      text: "Glass and ceramics should be air-dried very slowly. Never use heat to reduce drying time.",
      cite: "Canadian Conservation Institute",
    },
    {
      type: "p",
      text: "Avoid dishwashers, ultrasonic cleaners and household cleaning products, and don't soak strung pieces: water that stays in the thread and around the clasp is exactly what you want to avoid.",
    },
    { type: "h2", text: "Heat and cold" },
    {
      type: "p",
      text: "Glass expands and contracts with temperature. The same conservation guidance advises avoiding temperature extremes and, above all, rapid changes, which can crack glass. For jewellery, that simply means not leaving it on a sunny windowsill or near a radiator, and not rinsing it in hot water straight after it has been in the cold.",
    },
    {
      type: "image",
      image: {
        kind: "product",
        productSlug: "collana-perla-rosa-antico-f396d8",
        alt: "A necklace of antique-rose Murano glass beads",
        caption: "Stored flat and apart, beads keep their surface unmarked.",
        rights: OWN_PHOTO,
      },
    },
    { type: "h2", text: "Storing it" },
    {
      type: "p",
      text: "Glass beads can chip or scratch each other, so store each piece on its own — in its pouch or box, or in a lined compartment. Lay necklaces flat rather than hanging them for long periods, so the thread isn't under constant tension. Conservators line shelves for glass with soft padding and make sure objects can't shift about; a soft-lined box does the same job for jewellery.",
    },
    { type: "h2", text: "When something needs attention" },
    {
      type: "p",
      text: "If a thread starts to look worn or a clasp loosens, stop wearing the piece until it has been re-strung or repaired: the glass will outlast the thread many times over. Handmade beads are made to last — lampworking on Murano, as the [Glass Museum](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/) explains, goes back to the seventeenth century — and with a little care, yours will too. You can read more about how they are made in our article on [Venetian glass beads](/blog/venetian-glass-beads), or go further back with [the history of Murano glass](/blog/history-of-murano-glass).",
    },
    {
      type: "products",
      title: "Pieces from the collection",
      slugs: [
        "orecchini-blu-profondo-fa4c96",
        "collana-perla-rosa-antico-f396d8",
        "bracciale-avvolto-quarzo-rosa-f4920c",
      ],
    },
    { type: "cta", text: "Find a piece to treasure", href: "/products" },
  ],
  sources: [
    {
      ...CCI_GLASS_CARE,
      usedFor:
        "Cleaning sound glass with lukewarm water; drying slowly without heat; avoiding rapid temperature changes; padded, stable storage.",
    },
    {
      ...MUSEUM_SECTIONS,
      usedFor: "Roman glass from the 1st–3rd century AD in the museum's archaeological section.",
    },
    { ...MUSEUM_BEADS, usedFor: "Lampwork beads traced back to the seventeenth century." },
  ],
  related: ["venetian-glass-beads", "how-to-recognize-authentic-murano-glass"],
};
