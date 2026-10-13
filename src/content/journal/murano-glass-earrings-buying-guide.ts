import type { Article } from "@/lib/journal/types";
import { CCI_GLASS_CARE, MUSEUM_BEADS, MUSEUM_GLOSSARY, OWN_PHOTO } from "./sources";

// A buying guide through the earrings in the shop. Each pair is described only
// by what its own product page states (beads, colours, fastening): no per-piece
// claims about technique or origin beyond that.
export const muranoGlassEarringsBuyingGuide: Article = {
  slug: "murano-glass-earrings-buying-guide",
  title: "How to Choose Murano Glass Earrings",
  seoTitle: "How to Choose Murano Glass Earrings: A Guide",
  description:
    "Hook, lever-back or post; small or drop; shiny or matte: a short guide to choosing Murano glass earrings, with our pairs and what to wear them with.",
  category: "buying",
  published: "2026-10-13",
  primaryKeyword: "murano glass earrings",
  secondaryKeywords: [
    "how to choose drop earrings",
    "murano glass drop earrings",
    "murano glass earrings gift",
  ],
  hero: {
    kind: "product",
    productSlug: "orecchini-petalo-di-rosa-e081a0",
    alt: "Drop earrings with a pink striped bead, a red crystal and a painted pink and gold oval",
    altIt:
      "Orecchini pendenti con una perla rosa striata, un cristallo rosso e un ovale dipinto rosa e oro",
    rights: OWN_PHOTO,
  },
  intro:
    "Earrings are the smallest pieces in a jewellery box, and the ones that move the most: every turn of the head sets the glass swinging and catching the light. To choose a pair, look at three things: how they fasten, how far they fall, and whether you want the glass to shine or to glow. Here they are, with the earrings in our collection.",
  body: [
    {
      type: "facts",
      title: "In short",
      items: [
        "A lever-back hook closes on itself, so it stays put through a long day.",
        "A simple hook is the lightest way to wear a drop.",
        "A post sits close to the lobe, with the beads falling straight below.",
        "Shiny glass sparkles; a sandblasted surface has a soft, matte glow.",
      ],
    },
    { type: "h2", text: "First: how they fasten" },
    {
      type: "p",
      text: "A lever-back hook has a small hinged back that clicks shut, a reassuring choice if you are on the move or new to drop earrings: [Onyx Pebble](/products/orecchini-sassolino-di-onice-6bae0d), [Rose Petal](/products/orecchini-petalo-di-rosa-e081a0) and [Mint Leaf](/products/orecchini-foglia-di-menta-9c749a) all hang from a silver-tone lever-back. [Ruby Drop](/products/orecchini-goccia-di-rubino-9ad623) and [Deep Blue](/products/orecchini-blu-profondo-fa4c96) use a simple silver-tone hook, light and quick to put on. [Ice Drop](/products/orecchini-goccia-di-ghiaccio-51362e) and [Pastel Garden](/products/orecchini-giardino-pastello-d650a2) are set on a silver-tone post, so the earring starts right at the lobe.",
    },
    { type: "h2", text: "Then: how far they fall" },
    { type: "h3", text: "Small, for every day" },
    {
      type: "p",
      text: "Two beads and nothing more. [Onyx Pebble](/products/orecchini-sassolino-di-onice-6bae0d) pairs a hematite bead with a white-and-black mottled oval, a small, graphic earring that goes with everything; [Mint Leaf](/products/orecchini-foglia-di-menta-9c749a) does the same with a round turquoise bead and a mottled turquoise-and-sand oval, a light touch of colour for every day.",
    },
    {
      type: "products",
      title: "Small drops",
      slugs: ["orecchini-sassolino-di-onice-6bae0d", "orecchini-foglia-di-menta-9c749a"],
    },
    { type: "h3", text: "Three tiers, for the evening" },
    {
      type: "p",
      text: "Three elements one below the other give a longer, moving line. [Rose Petal](/products/orecchini-petalo-di-rosa-e081a0) goes from a pink striped bead through a red crystal to a large oval painted in pink and gold; [Ruby Drop](/products/orecchini-goccia-di-rubino-9ad623) pairs ruby red with a faceted crystal and a sandblasted rose-amber drop, made for the evening without weighing on the ear; [Deep Blue](/products/orecchini-blu-profondo-fa4c96) layers a midnight-blue bead, a faceted black crystal and a copper-streaked bead, bold without being bulky.",
    },
    {
      type: "products",
      title: "Three-tier drops",
      slugs: [
        "orecchini-petalo-di-rosa-e081a0",
        "orecchini-goccia-di-rubino-9ad623",
        "orecchini-blu-profondo-fa4c96",
      ],
    },
    { type: "h3", text: "A cascade of three beads" },
    {
      type: "p",
      text: "[Ice Drop](/products/orecchini-goccia-di-ghiaccio-51362e) lets three beads fall from the post, blue, white and blue; [Pastel Garden](/products/orecchini-giardino-pastello-d650a2) is its softer version, in sage green and antique pink. Both have a sandblasted surface, which brings us to the last choice.",
    },
    {
      type: "products",
      title: "Cascades",
      slugs: ["orecchini-goccia-di-ghiaccio-51362e", "orecchini-giardino-pastello-d650a2"],
    },
    { type: "h2", text: "Finally: shine or glow" },
    {
      type: "p",
      text: "Most glass beads are glossy, and catch the light in small bright points. A sandblasted bead has had its surface softened, so it looks matte and almost velvety: the colour reads more gently and the earring feels quieter, good for the office or for anyone who finds sparkle too much near the face. Ice Drop and Pastel Garden are entirely sandblasted; Ruby Drop mixes the two, with a shiny bead and crystal above a sandblasted drop.",
    },
    { type: "h2", text: "What to wear them with" },
    {
      type: "p",
      text: "Each pair here has a partner elsewhere in the collection. Onyx Pebble shares its mottled white-and-black ovals with the [Onyx Blossom Bracelet](/products/bracciale-fiore-di-onice-1c6c6e). Mint Leaf has the same turquoise-and-sand ovals as the [Azure Lagoon Bracelet](/products/bracciale-laguna-azzurra-5ae8cc) and the [Emerald Waves Necklace](/products/collana-onde-di-smeraldo-143dbf). Ice Drop matches the sky-blue and milk-white, sandblasted beads of the [Sky Bubbles Bracelet](/products/bracciale-bolle-di-cielo-bee6fa). Ruby Drop goes with the [Ruby Necklace](/products/collana-rubino-ff1b2a), Rose Petal with the painted pink ovals of [Golden Peony](/products/collana-peonia-dorata-46a3de), and Deep Blue with the copper-streaked beads of the [Antique Copper Necklace](/products/collana-rame-antico-85514c). For more, see our guides to [necklaces](/blog/murano-glass-necklaces-buying-guide) and [bracelets](/blog/murano-glass-bracelets-buying-guide).",
    },
    {
      type: "products",
      title: "Their partners",
      slugs: [
        "bracciale-fiore-di-onice-1c6c6e",
        "bracciale-laguna-azzurra-5ae8cc",
        "bracciale-bolle-di-cielo-bee6fa",
        "collana-rubino-ff1b2a",
        "collana-peonia-dorata-46a3de",
        "collana-rame-antico-85514c",
      ],
    },
    { type: "h2", text: "A few beads, a long tradition" },
    {
      type: "p",
      text: "Glass beads have a long history on the lagoon: the [Murano Glass Museum](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/) documents bead making on Murano from the fourteenth century. Its [glossary](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) describes conterie, the tiny beads cut from hollow canes that you will find along our necklaces and bracelets; earrings use only a few larger beads instead, so each one has room to show its colour and surface. For the wider story, read [the history of Murano glass](/blog/history-of-murano-glass).",
    },
    { type: "h2", text: "Looking after them" },
    {
      type: "p",
      text: "Put earrings on after perfume and hairspray, take them off before a shower or a swim, and keep each pair apart so the beads cannot knock against each other. The [Canadian Conservation Institute](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-ceramics-glass.html) recommends padded storage for glass and warns that rapid changes of temperature can crack it. More in our article on [caring for Murano glass jewellery](/blog/how-to-care-for-murano-glass-jewelry).",
    },
    {
      type: "cta",
      text: "See every pair of earrings",
      href: "/category/orecchini-in-vetro-di-murano",
    },
  ],
  sources: [
    {
      ...MUSEUM_BEADS,
      usedFor: "Bead making on Murano documented from the fourteenth century.",
      usedForIt: "La produzione di perle a Murano documentata dal Trecento.",
    },
    {
      ...MUSEUM_GLOSSARY,
      usedFor: "The definition of conterie: small beads cut from thin hollow canes and rounded.",
      usedForIt:
        "La definizione di conterie: piccole perle tagliate da sottili canne cave e arrotondate.",
    },
    {
      ...CCI_GLASS_CARE,
      usedFor: "Padded storage for glass; avoiding rapid changes of temperature.",
      usedForIt:
        "Conservare il vetro su un supporto morbido; evitare i cambi bruschi di temperatura.",
    },
  ],
  related: [
    "murano-glass-necklaces-buying-guide",
    "murano-glass-bracelets-buying-guide",
    "how-to-care-for-murano-glass-jewelry",
  ],
  translations: {
    it: {
      title: "Come scegliere gli orecchini in vetro di Murano",
      seoTitle: "Come scegliere gli orecchini in vetro di Murano",
      description:
        "Gancio, leva o perno; piccoli o pendenti; lucidi o opachi: una breve guida per scegliere orecchini in vetro di Murano, con le nostre coppie e gli abbinamenti.",
      primaryKeyword: "orecchini vetro di murano",
      secondaryKeywords: [
        "come scegliere orecchini pendenti",
        "orecchini pendenti vetro di murano",
        "orecchini vetro di murano regalo",
      ],
      intro:
        "Gli orecchini sono i gioielli più piccoli, e quelli che si muovono di più: ogni volta che giri la testa il vetro oscilla e cattura la luce. Per scegliere un paio guarda tre cose: come si chiudono, quanto scendono, e se vuoi che il vetro brilli o che abbia una luce morbida. Eccole, con gli orecchini della nostra collezione.",
      body: [
        {
          type: "facts",
          title: "In breve",
          items: [
            "Il gancio a leva si chiude su se stesso, così resta al suo posto per tutta la giornata.",
            "Il gancio semplice è il modo più leggero di portare un pendente.",
            "Il perno sta vicino al lobo, con le perle che scendono dritte sotto.",
            "Il vetro lucido brilla; la superficie sabbiata ha una luce morbida e opaca.",
          ],
        },
        { type: "h2", text: "Prima di tutto: come si chiudono" },
        {
          type: "p",
          text: "Il gancio a leva ha un piccolo retro incernierato che scatta in chiusura: una scelta rassicurante se sei sempre in movimento o se porti per la prima volta orecchini pendenti. [Sassolino di Onice](/products/orecchini-sassolino-di-onice-6bae0d), [Petalo di Rosa](/products/orecchini-petalo-di-rosa-e081a0) e [Foglia di Menta](/products/orecchini-foglia-di-menta-9c749a) pendono tutti da un gancio a leva argentato. [Goccia di Rubino](/products/orecchini-goccia-di-rubino-9ad623) e [Blu Profondo](/products/orecchini-blu-profondo-fa4c96) usano un semplice gancio argentato, leggero e veloce da mettere. [Goccia di Ghiaccio](/products/orecchini-goccia-di-ghiaccio-51362e) e [Giardino Pastello](/products/orecchini-giardino-pastello-d650a2) sono montati su un perno argentato, quindi l'orecchino parte proprio dal lobo.",
        },
        { type: "h2", text: "Poi: quanto scendono" },
        { type: "h3", text: "Piccoli, per tutti i giorni" },
        {
          type: "p",
          text: "Due perle e niente di più. [Sassolino di Onice](/products/orecchini-sassolino-di-onice-6bae0d) unisce una perla ematite a un ovale maculato bianco e nero: un orecchino piccolo e grafico che va con tutto. [Foglia di Menta](/products/orecchini-foglia-di-menta-9c749a) fa lo stesso con una perla tonda turchese e un ovale maculato turchese e sabbia, un tocco di colore leggero per ogni giorno.",
        },
        {
          type: "products",
          title: "Piccoli pendenti",
          slugs: ["orecchini-sassolino-di-onice-6bae0d", "orecchini-foglia-di-menta-9c749a"],
        },
        { type: "h3", text: "Tre elementi, per la sera" },
        {
          type: "p",
          text: "Tre elementi uno sotto l'altro disegnano una linea più lunga e in movimento. [Petalo di Rosa](/products/orecchini-petalo-di-rosa-e081a0) va da una perla rosa striata a un cristallo rosso fino a un grande ovale dipinto nei toni del rosa e dell'oro; [Goccia di Rubino](/products/orecchini-goccia-di-rubino-9ad623) unisce il rosso rubino a un cristallo sfaccettato e a una goccia sabbiata rosa-ambra, pensato per la sera senza appesantire l'orecchio; [Blu Profondo](/products/orecchini-blu-profondo-fa4c96) sovrappone una perla blu notte, un cristallo nero sfaccettato e una perla striata di rame: deciso, ma non ingombrante.",
        },
        {
          type: "products",
          title: "Pendenti a tre elementi",
          slugs: [
            "orecchini-petalo-di-rosa-e081a0",
            "orecchini-goccia-di-rubino-9ad623",
            "orecchini-blu-profondo-fa4c96",
          ],
        },
        { type: "h3", text: "Una cascata di tre perle" },
        {
          type: "p",
          text: "[Goccia di Ghiaccio](/products/orecchini-goccia-di-ghiaccio-51362e) fa scendere dal perno tre perle, azzurra, bianca e azzurra; [Giardino Pastello](/products/orecchini-giardino-pastello-d650a2) ne è la versione più tenue, in verde salvia e rosa antico. Entrambi hanno una superficie sabbiata, e questo ci porta all'ultima scelta.",
        },
        {
          type: "products",
          title: "A cascata",
          slugs: ["orecchini-goccia-di-ghiaccio-51362e", "orecchini-giardino-pastello-d650a2"],
        },
        { type: "h2", text: "Infine: brillare o risplendere piano" },
        {
          type: "p",
          text: "La maggior parte delle perle di vetro è lucida e cattura la luce in piccoli punti brillanti. Una perla sabbiata ha la superficie ammorbidita: appare opaca, quasi vellutata, il colore si legge con più dolcezza e l'orecchino risulta più discreto, ideale in ufficio o per chi trova eccessivo lo scintillio vicino al viso. Goccia di Ghiaccio e Giardino Pastello sono interamente sabbiati; Goccia di Rubino mescola le due cose, con una perla e un cristallo lucidi sopra una goccia sabbiata.",
        },
        { type: "h2", text: "Con cosa portarli" },
        {
          type: "p",
          text: "Ogni coppia ha un compagno nella collezione. Sassolino di Onice condivide gli ovali maculati bianco e nero con il [Bracciale Fiore di Onice](/products/bracciale-fiore-di-onice-1c6c6e). Foglia di Menta ha gli stessi ovali turchese e sabbia del [Bracciale Laguna Azzurra](/products/bracciale-laguna-azzurra-5ae8cc) e della [Collana Onde di Smeraldo](/products/collana-onde-di-smeraldo-143dbf). Goccia di Ghiaccio si abbina alle perle sabbiate azzurro cielo e bianco latte del [Bracciale Bolle di Cielo](/products/bracciale-bolle-di-cielo-bee6fa). Goccia di Rubino va con la [Collana Rubino](/products/collana-rubino-ff1b2a), Petalo di Rosa con gli ovali rosa dipinti della [Peonia Dorata](/products/collana-peonia-dorata-46a3de), e Blu Profondo con le perle striate di rame della [Collana Rame Antico](/products/collana-rame-antico-85514c). Per altre idee, leggi le nostre guide alle [collane](/blog/murano-glass-necklaces-buying-guide) e ai [bracciali](/blog/murano-glass-bracelets-buying-guide).",
        },
        {
          type: "products",
          title: "I loro compagni",
          slugs: [
            "bracciale-fiore-di-onice-1c6c6e",
            "bracciale-laguna-azzurra-5ae8cc",
            "bracciale-bolle-di-cielo-bee6fa",
            "collana-rubino-ff1b2a",
            "collana-peonia-dorata-46a3de",
            "collana-rame-antico-85514c",
          ],
        },
        { type: "h2", text: "Poche perle, una lunga tradizione" },
        {
          type: "p",
          text: "Le perle di vetro hanno una lunga storia in laguna: il [Museo del Vetro di Murano](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/) documenta la produzione di perle a Murano dal Trecento. Il suo [glossario](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) descrive le conterie, le minuscole perle tagliate da canne cave che trovi lungo le nostre collane e i nostri bracciali; gli orecchini usano invece poche perle più grandi, così ognuna ha lo spazio per mostrare il suo colore e la sua superficie. Per la storia più ampia, leggi [la storia del vetro di Murano](/blog/history-of-murano-glass).",
        },
        { type: "h2", text: "Come averne cura" },
        {
          type: "p",
          text: "Metti gli orecchini dopo il profumo e la lacca, toglili prima della doccia o di una nuotata, e tieni ogni coppia separata perché le perle non urtino tra loro. Il [Canadian Conservation Institute](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-ceramics-glass.html) consiglia di riporre il vetro su un supporto imbottito e avverte che i cambi bruschi di temperatura possono incrinarlo. Altri consigli nel nostro articolo su [come prendersi cura dei gioielli in vetro di Murano](/blog/how-to-care-for-murano-glass-jewelry).",
        },
        {
          type: "cta",
          text: "Vedi tutti gli orecchini",
          href: "/category/orecchini-in-vetro-di-murano",
        },
      ],
    },
  },
};
