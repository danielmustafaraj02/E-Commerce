import type { Article } from "@/lib/journal/types";
import { CCI_GLASS_CARE, MUSEUM_BEADS, MUSEUM_GLOSSARY, OWN_PHOTO } from "./sources";

// A buying guide through the bracelets in the shop. It describes each piece
// only by what its own product page states (beads, colours, how it closes):
// no per-piece claims about technique or origin beyond that.
export const muranoGlassBraceletsBuyingGuide: Article = {
  slug: "murano-glass-bracelets-buying-guide",
  title: "How to Choose a Murano Glass Bracelet",
  seoTitle: "How to Choose a Murano Glass Bracelet: A Guide",
  description:
    "Wrap, strung or rigid; soft colour or bold: a short guide to choosing a Murano glass bracelet, with the pieces in our collection that suit each wrist.",
  category: "buying",
  published: "2026-10-13",
  primaryKeyword: "murano glass bracelet",
  secondaryKeywords: [
    "how to choose a glass bead bracelet",
    "murano glass wrap bracelet",
    "murano glass bracelet gift",
  ],
  hero: {
    kind: "product",
    productSlug: "bracciale-laguna-azzurra-5ae8cc",
    alt: "A bracelet of aqua and mottled turquoise glass beads",
    altIt: "Un bracciale di perle di vetro azzurro acqua e turchese maculato",
    rights: OWN_PHOTO,
  },
  intro:
    "A bracelet is the piece you see most often while you wear it: on the desk, at the table, every time you reach for something. Choosing one comes down to three questions, in this order: how it goes on, how much colour you want, and when you will wear it. This guide walks through the bracelets in our collection with those three questions in mind.",
  body: [
    {
      type: "facts",
      title: "In short",
      items: [
        "Wrap bracelets have no clasp: they coil around the wrist and slip off in one move.",
        "Strung bracelets close with a clasp and sit like a classic string of beads.",
        "A rigid bangle keeps its shape and slides straight on.",
        "Soft tones for every day; ruby, glitter and multicolour when you want it to show.",
      ],
    },
    { type: "h2", text: "First: how it goes on" },
    {
      type: "p",
      text: "Wrap bracelets are a spiral band of small beads with two larger glass beads set into it. There is no clasp to fiddle with, which makes them the easiest to put on with one hand, and the spiral adapts to the wrist rather than to a fixed size. They are light, and they layer: two or three worn together read as one piece. The [Rose Quartz Wrap](/products/bracciale-avvolto-quarzo-rosa-f4920c) is the most delicate of them; the [Amber Wrap](/products/bracciale-avvolto-ambra-8b8166) coils around the wrist several times and ends in a small teardrop charm.",
    },
    {
      type: "products",
      title: "Wrap bracelets",
      slugs: [
        "bracciale-avvolto-quarzo-rosa-f4920c",
        "bracciale-avvolto-salvia-e-oro-fec6dc",
        "bracciale-avvolto-egeo-6bbcaa",
        "bracciale-avvolto-chiaro-di-luna-07cf09",
        "bracciale-avvolto-polvere-di-stelle-f1788c",
        "bracciale-avvolto-ambra-8b8166",
      ],
    },
    {
      type: "p",
      text: "Strung bracelets are a single row of glass beads with a clasp, the shape most people picture when they think of a glass bead bracelet. The beads are larger and the colour is continuous all the way round. [Azure Lagoon](/products/bracciale-laguna-azzurra-5ae8cc), [Onyx Blossom](/products/bracciale-fiore-di-onice-1c6c6e) and [Rose Gold Dust](/products/bracciale-polvere-d-oro-rosa-380f82) all close with a silver-tone lobster clasp; each product page gives the details of its own fastening.",
    },
    {
      type: "p",
      text: "The rigid bangle is the third way. The [Crimson Bangle](/products/bangle-cremisi-3c2860) is a spiral of ruby-red beads and golden seed beads that holds its shape, with a small charm hanging from it: it slides on without a clasp and stays put, a good choice for anyone who finds small clasps awkward.",
    },
    { type: "h2", text: "Then: how much colour" },
    { type: "h3", text: "Soft, for every day" },
    {
      type: "p",
      text: "If the bracelet is going to be worn with everything, start from the pale tones. [Sky Bubbles](/products/bracciale-bolle-di-cielo-bee6fa) pairs sky-blue and milk-white beads with a sandblasted surface, so they have a soft, matte glow rather than a shine. [Pearl Gold Dust](/products/bracciale-polvere-d-oro-perlato-13ecaa) is the lighter version of Rose Gold Dust, with pearl-grey beads among the rose, sage and champagne. The [Moonlight Wrap](/products/bracciale-avvolto-chiaro-di-luna-07cf09) sets two milk-white beads against black and silver: quiet by day, graphic in the evening.",
    },
    {
      type: "products",
      title: "Soft tones",
      slugs: [
        "bracciale-bolle-di-cielo-bee6fa",
        "bracciale-polvere-d-oro-perlato-13ecaa",
        "bracciale-polvere-d-oro-rosa-380f82",
      ],
    },
    { type: "h3", text: "Blues of the lagoon" },
    {
      type: "p",
      text: "There is more than one blue. [Caribbean](/products/bracciale-caraibi-88bfe3) is faceted turquoise and sky blue, cut to throw the light back, and light enough to forget you are wearing it. [Azure Lagoon](/products/bracciale-laguna-azzurra-5ae8cc) mixes round aqua beads with mottled turquoise-and-sand ovals, a summer bracelet. The [Aegean Wrap](/products/bracciale-avvolto-egeo-6bbcaa) has two translucent aqua spheres that let the light through.",
    },
    {
      type: "products",
      title: "Blues",
      slugs: ["bracciale-caraibi-88bfe3", "bracciale-laguna-azzurra-5ae8cc"],
    },
    { type: "h3", text: "Warm tones, for autumn" },
    {
      type: "p",
      text: "[Tuscan Rose](/products/bracciale-rosa-toscana-735d23) alternates pink-and-camel mottled ovals with small ruby-coloured crystals and sits well against knitwear. [Golden Forest](/products/bracciale-foresta-dorata-37b0e2) brings sage-green beads with gold inclusions; [Midnight Copper](/products/bracciale-rame-di-mezzanotte-ca793a) has black beads streaked with copper between golden seed beads, discreet enough for the office and rich enough for dinner.",
    },
    {
      type: "products",
      title: "Warm tones",
      slugs: [
        "bracciale-rosa-toscana-735d23",
        "bracciale-foresta-dorata-37b0e2",
        "bracciale-rame-di-mezzanotte-ca793a",
      ],
    },
    { type: "h3", text: "Bold, to be noticed" },
    {
      type: "p",
      text: "For a bracelet that is the point of the outfit: [Garnet Fire](/products/bracciale-fuoco-di-granato-9ff520), large ruby-red beads with gold-veined ones and small crystals that catch the light as the wrist moves; [Carnival](/products/bracciale-carnevale-c35a85), crackle-effect beads in yellow, green, orange, blue and red; and the [Stardust Wrap](/products/bracciale-avvolto-polvere-di-stelle-f1788c), whose two midnight-blue beads glitter like a night sky, made for the evening.",
    },
    {
      type: "products",
      title: "Bold colour",
      slugs: [
        "bracciale-fuoco-di-granato-9ff520",
        "bracciale-carnevale-c35a85",
        "bangle-cremisi-3c2860",
        "bracciale-fiore-di-onice-1c6c6e",
      ],
    },
    { type: "h2", text: "Wearing it with a necklace" },
    {
      type: "p",
      text: "Some bracelets have a necklace made from the same beads. [Lilac Bud](/products/bracciale-boccio-di-lilla-5a445c), purple and lilac beads with smoked cabochons on burgundy seed beads, is matched by the [Amethyst Necklace](/products/collana-ametista-9e7d11). The copper-streaked black beads of Midnight Copper return in the [Antique Copper Necklace](/products/collana-rame-antico-85514c). If you prefer earrings, our [guide to Murano glass earrings](/blog/murano-glass-earrings-buying-guide) suggests a pair for several of these bracelets, and the [necklace guide](/blog/murano-glass-necklaces-buying-guide) does the same the other way round.",
    },
    {
      type: "products",
      title: "Bracelet and necklace sets",
      slugs: [
        "bracciale-boccio-di-lilla-5a445c",
        "collana-ametista-9e7d11",
        "collana-rame-antico-85514c",
      ],
    },
    { type: "h2", text: "The small beads in between" },
    {
      type: "p",
      text: "Look closely at most of these bracelets and you will see small seed beads between the larger ones: gold, silver, clear, burgundy. They have a long history on the lagoon. The [Murano Glass Museum](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) describes conterie as small beads cut from thin hollow glass canes and then rounded, used in embroidery and jewellery, and its [history of Venetian beads](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/) documents bead making on Murano from the fourteenth century. To go further back still, read [the history of Murano glass](/blog/history-of-murano-glass).",
    },
    { type: "h2", text: "Looking after it" },
    {
      type: "p",
      text: "A bracelet meets more water, soap and hand cream than any other piece, so put it on last and take it off to wash your hands when you can. Store it on its own, on something soft, and keep it away from sudden heat: the [Canadian Conservation Institute](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-ceramics-glass.html) advises padded storage for glass and warns that rapid changes of temperature can crack it. Our article on [caring for Murano glass jewellery](/blog/how-to-care-for-murano-glass-jewelry) has the rest.",
    },
    { type: "cta", text: "See every bracelet", href: "/category/bracciali-in-vetro-di-murano" },
  ],
  sources: [
    {
      ...MUSEUM_GLOSSARY,
      usedFor: "The definition of conterie: small beads cut from thin hollow canes and rounded.",
      usedForIt:
        "La definizione di conterie: piccole perle tagliate da sottili canne cave e arrotondate.",
    },
    {
      ...MUSEUM_BEADS,
      usedFor: "Bead making on Murano documented from the fourteenth century.",
      usedForIt: "La produzione di perle a Murano documentata dal Trecento.",
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
    "murano-glass-earrings-buying-guide",
    "how-to-care-for-murano-glass-jewelry",
  ],
  translations: {
    it: {
      title: "Come scegliere un bracciale in vetro di Murano",
      seoTitle: "Come scegliere un bracciale in vetro di Murano",
      description:
        "Avvolgente, su filo o rigido; colori tenui o decisi: una breve guida per scegliere un bracciale in vetro di Murano, con i pezzi della collezione adatti a ogni polso.",
      primaryKeyword: "bracciale vetro di murano",
      secondaryKeywords: [
        "come scegliere un bracciale di perle",
        "bracciale avvolgente vetro di murano",
        "bracciale vetro di murano regalo",
      ],
      intro:
        "Il bracciale è il gioiello che vedi più spesso mentre lo indossi: sulla scrivania, a tavola, ogni volta che allunghi la mano. Sceglierlo si riduce a tre domande, in quest'ordine: come si mette, quanto colore vuoi, quando lo porterai. Questa guida attraversa i bracciali della nostra collezione con queste tre domande in mente.",
      body: [
        {
          type: "facts",
          title: "In breve",
          items: [
            "I bracciali avvolgenti non hanno chiusura: si avvolgono intorno al polso e si sfilano con un gesto.",
            "I bracciali su filo si chiudono con un moschettone e cadono come un classico filo di perle.",
            "Il bangle rigido mantiene la sua forma e si infila direttamente.",
            "Toni tenui per tutti i giorni; rubino, glitter e multicolore quando vuoi che si veda.",
          ],
        },
        { type: "h2", text: "Prima di tutto: come si mette" },
        {
          type: "p",
          text: "I bracciali avvolgenti sono una fascia a spirale di piccole perline con due perle di vetro più grandi incastonate. Non c'è nessuna chiusura da agganciare, quindi sono i più facili da mettere con una mano sola, e la spirale si adatta al polso invece che a una misura fissa. Sono leggeri e si sovrappongono: due o tre portati insieme sembrano un unico gioiello. L'[Avvolto Quarzo Rosa](/products/bracciale-avvolto-quarzo-rosa-f4920c) è il più delicato; l'[Avvolto Ambra](/products/bracciale-avvolto-ambra-8b8166) fa più giri di polso e termina con un piccolo charm a goccia.",
        },
        {
          type: "products",
          title: "Bracciali avvolgenti",
          slugs: [
            "bracciale-avvolto-quarzo-rosa-f4920c",
            "bracciale-avvolto-salvia-e-oro-fec6dc",
            "bracciale-avvolto-egeo-6bbcaa",
            "bracciale-avvolto-chiaro-di-luna-07cf09",
            "bracciale-avvolto-polvere-di-stelle-f1788c",
            "bracciale-avvolto-ambra-8b8166",
          ],
        },
        {
          type: "p",
          text: "I bracciali su filo sono un'unica fila di perle di vetro con una chiusura: la forma che quasi tutti immaginano pensando a un bracciale di perle. Le perle sono più grandi e il colore gira tutto intorno al polso. [Laguna Azzurra](/products/bracciale-laguna-azzurra-5ae8cc), [Fiore di Onice](/products/bracciale-fiore-di-onice-1c6c6e) e [Polvere d'Oro Rosa](/products/bracciale-polvere-d-oro-rosa-380f82) si chiudono con un moschettone argentato; ogni scheda prodotto riporta i dettagli della propria chiusura.",
        },
        {
          type: "p",
          text: "Il bangle rigido è la terza strada. Il [Bangle Cremisi](/products/bangle-cremisi-3c2860) è una spirale di perle rosso rubino e rocailles dorate che mantiene la sua forma, con un piccolo charm pendente: si infila senza chiusura e resta al suo posto, una buona scelta per chi trova scomodi i moschettoni piccoli.",
        },
        { type: "h2", text: "Poi: quanto colore" },
        { type: "h3", text: "Tenui, per tutti i giorni" },
        {
          type: "p",
          text: "Se il bracciale deve andare con tutto, parti dai toni chiari. [Bolle di Cielo](/products/bracciale-bolle-di-cielo-bee6fa) unisce perle azzurro cielo e bianco latte dalla superficie sabbiata, con un bagliore morbido e opaco invece che lucido. [Polvere d'Oro Perlato](/products/bracciale-polvere-d-oro-perlato-13ecaa) è la versione più chiara di Polvere d'Oro Rosa, con perle grigio perla tra il rosa, il salvia e lo champagne. L'[Avvolto Chiaro di Luna](/products/bracciale-avvolto-chiaro-di-luna-07cf09) mette due perle bianco latte sul nero e l'argento: discreto di giorno, grafico la sera.",
        },
        {
          type: "products",
          title: "Toni tenui",
          slugs: [
            "bracciale-bolle-di-cielo-bee6fa",
            "bracciale-polvere-d-oro-perlato-13ecaa",
            "bracciale-polvere-d-oro-rosa-380f82",
          ],
        },
        { type: "h3", text: "I blu della laguna" },
        {
          type: "p",
          text: "Di blu ce n'è più di uno. [Caraibi](/products/bracciale-caraibi-88bfe3) è turchese e azzurro cielo sfaccettato, tagliato per rimandare la luce, e così leggero che ci si dimentica di averlo. [Laguna Azzurra](/products/bracciale-laguna-azzurra-5ae8cc) alterna perle tonde azzurro acqua a ovali maculati turchese e sabbia: un bracciale da estate. L'[Avvolto Egeo](/products/bracciale-avvolto-egeo-6bbcaa) ha due sfere azzurro acqua traslucide che lasciano passare la luce.",
        },
        {
          type: "products",
          title: "Blu",
          slugs: ["bracciale-caraibi-88bfe3", "bracciale-laguna-azzurra-5ae8cc"],
        },
        { type: "h3", text: "Toni caldi, per l'autunno" },
        {
          type: "p",
          text: "[Rosa Toscana](/products/bracciale-rosa-toscana-735d23) alterna ovali maculati rosa e cammello a piccoli cristalli color rubino e sta bene con la maglieria. [Foresta Dorata](/products/bracciale-foresta-dorata-37b0e2) porta perle verde salvia con inclusioni dorate; [Rame di Mezzanotte](/products/bracciale-rame-di-mezzanotte-ca793a) ha perle nere striate di rame tra rocailles dorate, abbastanza discreto per l'ufficio e abbastanza ricco per una cena.",
        },
        {
          type: "products",
          title: "Toni caldi",
          slugs: [
            "bracciale-rosa-toscana-735d23",
            "bracciale-foresta-dorata-37b0e2",
            "bracciale-rame-di-mezzanotte-ca793a",
          ],
        },
        { type: "h3", text: "Decisi, per farsi notare" },
        {
          type: "p",
          text: "Per un bracciale che sia il centro del look: [Fuoco di Granato](/products/bracciale-fuoco-di-granato-9ff520), grandi perle rosso rubino con perle venate d'oro e piccoli cristalli che catturano la luce a ogni movimento del polso; [Carnevale](/products/bracciale-carnevale-c35a85), perle craquelé gialle, verdi, arancio, azzurre e rosse; e l'[Avvolto Polvere di Stelle](/products/bracciale-avvolto-polvere-di-stelle-f1788c), con due perle blu notte che brillano come un cielo stellato, pensato per la sera.",
        },
        {
          type: "products",
          title: "Colori decisi",
          slugs: [
            "bracciale-fuoco-di-granato-9ff520",
            "bracciale-carnevale-c35a85",
            "bangle-cremisi-3c2860",
            "bracciale-fiore-di-onice-1c6c6e",
          ],
        },
        { type: "h2", text: "Da portare con una collana" },
        {
          type: "p",
          text: "Alcuni bracciali hanno una collana fatta con le stesse perle. [Boccio di Lilla](/products/bracciale-boccio-di-lilla-5a445c), perle viola e lilla con cabochon fumé su rocailles bordeaux, ha come compagna la [Collana Ametista](/products/collana-ametista-9e7d11). Le perle nere striate di rame di Rame di Mezzanotte ritornano nella [Collana Rame Antico](/products/collana-rame-antico-85514c). Se preferisci gli orecchini, la nostra [guida agli orecchini in vetro di Murano](/blog/murano-glass-earrings-buying-guide) suggerisce un paio per molti di questi bracciali, e la [guida alle collane](/blog/murano-glass-necklaces-buying-guide) fa lo stesso al contrario.",
        },
        {
          type: "products",
          title: "Bracciale e collana coordinati",
          slugs: [
            "bracciale-boccio-di-lilla-5a445c",
            "collana-ametista-9e7d11",
            "collana-rame-antico-85514c",
          ],
        },
        { type: "h2", text: "Le piccole perle in mezzo" },
        {
          type: "p",
          text: "Guarda da vicino quasi tutti questi bracciali e vedrai piccole perline tra quelle più grandi: dorate, argentate, trasparenti, bordeaux. In laguna hanno una lunga storia. Il [Museo del Vetro di Murano](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) descrive le conterie come piccole perle tagliate da sottili canne di vetro cave e poi arrotondate, usate nel ricamo e nella gioielleria, e la sua [storia delle perle veneziane](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/) documenta la produzione di perle a Murano dal Trecento. Per andare ancora più indietro, leggi [la storia del vetro di Murano](/blog/history-of-murano-glass).",
        },
        { type: "h2", text: "Come averne cura" },
        {
          type: "p",
          text: "Il bracciale incontra più acqua, sapone e crema per le mani di qualsiasi altro gioiello: mettilo per ultimo e, quando puoi, toglilo per lavarti le mani. Conservalo da solo, su qualcosa di morbido, e lontano dal calore improvviso: il [Canadian Conservation Institute](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-ceramics-glass.html) consiglia di riporre il vetro su un supporto imbottito e avverte che i cambi bruschi di temperatura possono incrinarlo. Il resto è nel nostro articolo su [come prendersi cura dei gioielli in vetro di Murano](/blog/how-to-care-for-murano-glass-jewelry).",
        },
        {
          type: "cta",
          text: "Vedi tutti i bracciali",
          href: "/category/bracciali-in-vetro-di-murano",
        },
      ],
    },
  },
};
