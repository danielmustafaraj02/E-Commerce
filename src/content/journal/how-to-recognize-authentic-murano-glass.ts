import type { Article } from "@/lib/journal/types";
import { MUSEUM_GALLERY_GUIDE, OWN_PHOTO, PROMOVETRO_MARK, VENETO_MARK } from "./sources";

export const howToRecognizeAuthenticMuranoGlass: Article = {
  slug: "how-to-recognize-authentic-murano-glass",
  title: "How to Recognize Authentic Murano Glass",
  seoTitle: "How to Recognize Authentic Murano Glass",
  description:
    "What the Vetro Artistico® Murano mark guarantees, how to check its label, and the questions worth asking any seller before you buy Murano glass.",
  category: "buying",
  published: "2026-09-24",
  primaryKeyword: "authentic murano glass",
  secondaryKeywords: [
    "genuine murano glass",
    "vetro artistico murano",
    "murano glass certificate",
    "how to tell if murano glass is real",
  ],
  hero: {
    kind: "file",
    src: "/blog/burano-colorful-houses-canal.jpg",
    alt: "Brightly painted houses along a canal on Burano, in the Venetian lagoon",
    rights: OWN_PHOTO,
  },
  intro:
    "“Murano” is one of the most borrowed words in glass. Because the name carries so much history, it also attracts imitation. The good news is that there is an official, checkable mark — and a few simple questions that will tell you a lot about any piece.",
  body: [
    {
      type: "facts",
      title: "At a glance",
      items: [
        "The Vetro Artistico® Murano mark was created by Veneto Regional Law no. 70 of 23 December 1994.",
        "It certifies that a piece was made on the island of Murano, following the island's glassmaking tradition.",
        "Since 2016, its labels carry a serial number and a Datamatrix code you can check.",
      ],
    },
    { type: "h2", text: "What the Vetro Artistico® Murano mark is" },
    {
      type: "p",
      text: "The mark was established by the Veneto Region with Regional Law no. 70 of 23 December 1994, and it is registered as a European trademark. It is managed and promoted by the [Consorzio Promovetro](https://promovetro.com/en/the-vetro-artistico-di-murano-mark-2/). According to Promovetro, it certifies that a product was made on the island of Murano, following the island's glassmaking tradition.",
    },
    {
      type: "p",
      text: "Only companies producing glass on Murano can be authorised to use it. The [Veneto Region](https://www.regione.veneto.it/web/attivita-produttive/vetro-artistico-murano-inglese) explains that concessionaires are inspected before they may apply the label to their products, and that shops selling marked glass can display a window sticker with the logo and their own identification number.",
    },
    { type: "h2", text: "How to read and check the label" },
    {
      type: "p",
      text: "The label shows the trademark logo and a company code. Since 2016, Promovetro says, each label also carries a serial number and a Datamatrix code that identify the individual product. You can scan the code with an app that reads Datamatrix codes, or enter the codes on the Vetro Artistico® Murano website to confirm them.",
    },
    {
      type: "quote",
      text: "Since 2016, the label includes a serial number and a datamatrix code that unequivocally identify the product.",
      cite: "Consorzio Promovetro",
    },
    { type: "h2", text: "Questions worth asking any seller" },
    {
      type: "p",
      text: "Not every piece you meet will carry a label, and a label is the only independent guarantee. For everything else, a trustworthy seller should be able to answer plainly:",
    },
    {
      type: "facts",
      title: "Before you buy",
      items: [
        "Where exactly was the glass worked, and by whom?",
        "Which technique was used — for beads, for example, lampwork or cut cane?",
        "Does the piece carry the Vetro Artistico® Murano label, and can you see its codes?",
        "What are the other materials: the thread, the clasp, the findings?",
      ],
    },
    {
      type: "p",
      text: "Clear, specific answers are a good sign; vague ones are worth noticing. Knowing a little of the craft helps too: our articles on [the history of Murano glass](/blog/history-of-murano-glass) and [Venetian glass beads](/blog/venetian-glass-beads) explain the techniques a seller might mention, and our [Murano glass guide](/murano-glass) describes the ones named on our own product pages.",
    },
    {
      type: "p",
      text: "If you have a question about the origin of any of our pieces, [write to us](/contact) — we will answer as specifically as we can.",
    },
    {
      type: "products",
      title: "Pieces from the collection",
      slugs: [
        "collana-notte-stellata-92b5fd",
        "bracciale-fiore-di-onice-1c6c6e",
        "orecchini-sassolino-di-onice-6bae0d",
      ],
    },
    { type: "cta", text: "Explore the collection", href: "/products" },
  ],
  sources: [
    {
      ...PROMOVETRO_MARK,
      usedFor:
        "What the mark certifies; the 1994 law; Promovetro's role; the label, its colours and the serial number and Datamatrix code since 2016; how to verify it.",
    },
    {
      ...VENETO_MARK,
      usedFor:
        "Regional Law no. 70/1994; the European trademark registration; inspection of concessionaires; shop window stickers.",
    },
    {
      ...MUSEUM_GALLERY_GUIDE,
      usedFor: "Background on Murano glassmaking techniques referred to in the article.",
    },
  ],
  related: ["history-of-murano-glass", "venetian-glass-beads"],
};
