import type { Article } from "@/lib/journal/types";
import {
  MUSEUM_BEADS,
  MUSEUM_CONTERIE,
  MUSEUM_GALLERY_GUIDE,
  MUSEUM_GLOSSARY,
  OWN_PHOTO,
} from "./sources";

export const venetianGlassBeads: Article = {
  slug: "venetian-glass-beads",
  title: "Venetian Glass Beads: Conterie, Chevrons and Lampwork",
  seoTitle: "Venetian Glass Beads: History and How They Are Made",
  description:
    "The three kinds of Venetian glass beads, conterie, chevron and lampwork, how each is made, and how beads kept Murano working through its hardest years.",
  category: "craft",
  published: "2026-09-24",
  primaryKeyword: "venetian glass beads",
  secondaryKeywords: [
    "murano glass beads",
    "murano glass beads history",
    "lampwork beads",
    "chevron beads",
  ],
  hero: {
    kind: "file",
    src: "/blog/venice-gondoliers-canal-golden-light.jpg",
    alt: "Gondoliers rowing along a Venice canal in warm evening light",
    rights: OWN_PHOTO,
  },
  intro:
    "Long before glass beads were jewellery for the few, they were one of Venice's great exports. The Murano Glass Museum dates the first Venetian beads to the fourteenth century, and for centuries they travelled in trade to Africa, the Americas and India.",
  body: [
    {
      type: "facts",
      title: "At a glance",
      items: [
        "Conterie (seed beads): tiny, single-coloured, cut from thin hollow canes, documented on Murano from the fourteenth century.",
        "Rosetta (chevron beads): layered canes with a star-shaped cross-section, traditionally credited to Marietta Barovier in the fifteenth century.",
        "A lume (lampwork beads): shaped one by one in a flame, traced back to the seventeenth century.",
      ],
    },
    {
      type: "p",
      text: "The museum groups Venetian beads by how they are made. All three begin with glass rods, thin or thick, of one colour or built from concentric layers, solid or pierced through the middle, but they become very different objects.",
    },
    { type: "h2", text: "Conterie: seed beads by the thousand" },
    {
      type: "p",
      text: "Conterie are the smallest and simplest: single-coloured beads made in quantity from thin, hollow glass canes. The museum's [glossary](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) describes them as beads made by cutting a hollow cane and giving the resulting cylinders a round shape. They were used for embroidery and all kinds of compositions, and they are documented on Murano from the fourteenth century.",
    },
    { type: "h2", text: "Rosetta: the chevron bead" },
    {
      type: "p",
      text: "Chevron beads start from much larger pierced canes, made of several coloured layers, each with a star-shaped cross-section. The cane is cut into short cylinders, which are then rounded on a grinding wheel so that the star pattern shows through. The results are large and oval, most often in white, red and blue. According to tradition, the technique was invented in the fifteenth century by Marietta Barovier, daughter of Angelo Barovier, the glassmaker credited with [inventing cristallo](/blog/history-of-murano-glass).",
    },
    {
      type: "quote",
      text: "The rods are cut into small cylinders and then rounded using a grinding wheel to “reveal” the star pattern.",
      cite: "Glass Museum of Murano, gallery guide",
    },
    { type: "h2", text: "A lume: beads shaped in a flame" },
    {
      type: "p",
      text: "Lampwork beads are the most individual of the three, and they can be traced back to the seventeenth century. Here the starting point is a solid rod. The glassworker heats it in a flame, the lume that gives the technique its name, and lets the softened glass wind onto a metal wire held in one hand and turned continuously. Colours, layers and surface effects are added bead by bead, so no two come out quite the same.",
    },
    {
      type: "image",
      image: {
        kind: "product",
        productSlug: "orecchini-goccia-di-ghiaccio-51362e",
        alt: "Murano glass drop earrings with clear, ice-like beads",
        caption: "Each bead carries small variations from the hand that shaped it.",
        rights: OWN_PHOTO,
      },
    },
    { type: "h2", text: "How beads kept Murano working" },
    {
      type: "p",
      text: "When blown glass fell into crisis after the end of the Republic of Venice in 1797, bead-making held on. The museum notes that it kept its factories and sales networks, and that women were a significant presence both among the workers and as designers of the most successful beads.",
    },
    {
      type: "p",
      text: "In 1898 a number of bead-making companies joined together as a single large firm, the Società Veneziana Conterie, in buildings in the heart of Murano near the Basilica of San Donato. Between 1940 and 1970 it employed more than 3,000 people; it closed in 1993. Its restored spaces are now part of the Glass Museum.",
    },
    { type: "h2", text: "Beads you can wear" },
    {
      type: "p",
      text: "Today, glass beads are one of the most personal ways to carry a piece of Murano's history. When you choose one, look closely: the small irregularities of a hand-shaped bead are part of its character. For help telling genuine Murano glass from imitation, read [how to recognize authentic Murano glass](/blog/how-to-recognize-authentic-murano-glass).",
    },
    {
      type: "products",
      title: "Pieces from the collection",
      slugs: [
        "bracciale-laguna-azzurra-5ae8cc",
        "orecchini-goccia-di-ghiaccio-51362e",
        "collana-perla-celeste-5e4eb6",
      ],
    },
    {
      type: "cta",
      text: "Discover our Murano glass bracelets",
      href: "/category/bracciali-in-vetro-di-murano",
    },
  ],
  sources: [
    {
      ...MUSEUM_BEADS,
      usedFor: "The three bead types and their dates; Marietta Barovier; the export trade.",
    },
    {
      ...MUSEUM_GALLERY_GUIDE,
      usedFor:
        "How conterie, chevron and lampwork beads are made; bead-making during the crisis after 1797; women as workers and designers.",
    },
    { ...MUSEUM_GLOSSARY, usedFor: "The definition of conterie." },
    {
      ...MUSEUM_CONTERIE,
      usedFor: "The Società Veneziana Conterie: 1898, its workforce 1940–1970, closure in 1993.",
    },
  ],
  related: ["history-of-murano-glass", "how-to-care-for-murano-glass-jewelry"],
};
