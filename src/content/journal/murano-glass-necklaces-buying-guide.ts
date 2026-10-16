import type { Article } from "@/lib/journal/types";
import { CCI_GLASS_CARE, MUSEUM_BEADS, MUSEUM_GLOSSARY, OWN_PHOTO } from "./sources";

// A buying guide through the necklaces in the shop. Each piece is described
// only by what its own product page states (beads, colours, chain or strand,
// length): no per-piece claims about technique or origin beyond that.
export const muranoGlassNecklacesBuyingGuide: Article = {
  slug: "murano-glass-necklaces-buying-guide",
  title: "How to Choose a Murano Glass Necklace",
  seoTitle: "How to Choose a Murano Glass Necklace: A Guide",
  description:
    "Length, chain or strand, and the look you want: a short guide to choosing a Murano glass necklace, with the pieces in our collection for every neckline.",
  category: "buying",
  published: "2026-10-13",
  primaryKeyword: "murano glass necklace",
  secondaryKeywords: [
    "how to choose a glass bead necklace",
    "murano glass bead necklace",
    "murano glass necklace gift",
  ],
  hero: {
    kind: "product",
    productSlug: "collana-perla-rosa-e-salvia-ca0636",
    alt: "A long necklace of large antique-pink and sage glass beads with a pearl effect",
    altIt: "Una collana lunga di grandi perle di vetro rosa antico e salvia dall'effetto perlato",
    rights: OWN_PHOTO,
  },
  intro:
    "A necklace frames the face, so it changes an outfit more than a bracelet or a ring can. Three choices make the difference: how low it falls, whether the beads sit on a chain or along a strand, and the kind of glass you want to see. Here is how to make them, with the necklaces in our collection.",
  body: [
    {
      type: "facts",
      title: "In short",
      items: [
        "Close to the neck for open collars; longer strands for high necks and knitwear.",
        "A chain shows a few beads with space between them; a strand is colour all the way round.",
        "Pearl-effect and soft blues are the easiest to wear every day.",
        "Painted florals, deep reds and multicolour are made to be the centre of an outfit.",
      ],
    },
    { type: "h2", text: "First: how low it falls" },
    {
      type: "p",
      text: "A necklace that sits close to the base of the neck works with open collars and V-necks; a longer one falls over a high neck, a shirt buttoned up or a sweater, where a short necklace would disappear. Some of our necklaces come in two lengths: the [Poppy Necklace](/products/collana-papavero-70d5a3) is the longer version of [Royal Fuchsia](/products/collana-fucsia-reale-94d36e), for a lower line. The [Antique Copper Necklace](/products/collana-rame-antico-85514c) is long enough to wear doubled, and the [Pearl Rose & Sage](/products/collana-perla-rosa-e-salvia-ca0636) sits on a long strand with a retro feel. Each product page gives its own measurements.",
    },
    {
      type: "p",
      text: "If you are buying for someone else and are unsure of the length, the [Rainbow Necklace](/products/collana-arcobaleno-216e66) has an adjustable clasp on its gold-tone chain.",
    },
    {
      type: "products",
      title: "Longer lines",
      slugs: [
        "collana-papavero-70d5a3",
        "collana-rame-antico-85514c",
        "collana-perla-rosa-e-salvia-ca0636",
      ],
    },
    { type: "h2", text: "Then: chain or strand" },
    {
      type: "p",
      text: "On a chain, a few glass beads are spaced along fine metal, so the necklace looks lighter and the metal does part of the work: gold-tone for [Starry Night](/products/collana-notte-stellata-92b5fd) and Rainbow, silver-tone for [Summer Sky](/products/collana-cielo-d-estate-4cf739) and [Aquamarine](/products/collana-acquamarina-98782c). On a strand, the beads follow one another all the way round, often with small seed beads in between, and the colour is continuous: that is the case for most of the necklaces below.",
    },
    {
      type: "products",
      title: "On a chain",
      slugs: ["collana-notte-stellata-92b5fd", "collana-arcobaleno-216e66"],
    },
    { type: "h2", text: "Finally: the glass you want to see" },
    { type: "h3", text: "Pearl effect, the gentlest" },
    {
      type: "p",
      text: "Large round beads with a pearl-like sheen are the necklaces that go with the most. [Pearl Rose & Sage](/products/collana-perla-rosa-e-salvia-ca0636) has antique pink and sage; [Antique Pink Pearl](/products/collana-perla-rosa-antico-f396d8) is the same idea in a deeper tone, with metallic reflections, on a long row of grey seed beads. [Celestial Pearl](/products/collana-perla-celeste-5e4eb6) uses baroque beads, deliberately irregular, in white and sky blue: delicate and easy to wear every day.",
    },
    {
      type: "products",
      title: "Pearl effect",
      slugs: ["collana-perla-rosa-antico-f396d8", "collana-perla-celeste-5e4eb6"],
    },
    { type: "h3", text: "Painted florals" },
    {
      type: "p",
      text: "Oval beads painted with floral motifs, each one slightly different. [Golden Peony](/products/collana-peonia-dorata-46a3de) is pink and camel with small ruby-red crystals on golden seed beads; [Royal Fuchsia](/products/collana-fucsia-reale-94d36e) turns the same idea towards the evening, and Poppy is its longer version. [Night Flower](/products/collana-fiore-notturno-15492b) sets white, sage and pink painted ovals between large hematite beads, for a darker, more graphic look.",
    },
    {
      type: "products",
      title: "Painted florals",
      slugs: [
        "collana-peonia-dorata-46a3de",
        "collana-fucsia-reale-94d36e",
        "collana-fiore-notturno-15492b",
      ],
    },
    { type: "h3", text: "Faceted, to catch the light" },
    {
      type: "p",
      text: "Faceted beads are cut so that every movement sends the light back. [Faceted Turquoise](/products/collana-turchese-sfaccettato-8e4504) uses beads of different sizes in turquoise and sky blue for a natural rhythm along the strand; Summer Sky and Aquamarine put the same blues on a silver-tone chain, lighter on the neck.",
    },
    {
      type: "products",
      title: "Faceted blues",
      slugs: [
        "collana-turchese-sfaccettato-8e4504",
        "collana-cielo-d-estate-4cf739",
        "collana-acquamarina-98782c",
      ],
    },
    { type: "h3", text: "Deep colour: ruby, emerald, night" },
    {
      type: "p",
      text: "For a necklace that carries the outfit. The [Ruby Necklace](/products/collana-rubino-ff1b2a) has round and organic ruby-red beads crossed by golden veins; [Scarlet Flame](/products/collana-fiamma-scarlatta-17effb) is its richer version, with bolder gold and black veins. In green, [Emerald & Silver](/products/collana-smeraldo-e-argento-a0dd26) has gold inclusions in the emerald glass, and [Emerald Waves](/products/collana-onde-di-smeraldo-143dbf) moves between deep turquoise and mottled turquoise-and-sand ovals. In black, Antique Copper and Starry Night use black beads streaked with copper.",
    },
    {
      type: "products",
      title: "Deep colour",
      slugs: [
        "collana-rubino-ff1b2a",
        "collana-fiamma-scarlatta-17effb",
        "collana-smeraldo-e-argento-a0dd26",
        "collana-onde-di-smeraldo-143dbf",
      ],
    },
    { type: "h3", text: "Many colours at once" },
    {
      type: "p",
      text: "[Mixed Gems](/products/collana-gemme-miste-6e735f) gathers blue, green, orange, white and lilac beads with golden seed beads, a bohemian piece meant to lift a plain outfit; Rainbow spaces round beads in five colours along a chain, lighter and more playful. And [Amethyst](/products/collana-ametista-9e7d11), purple and lilac with smoked cabochons, is the one to choose if purple is your colour.",
    },
    {
      type: "products",
      title: "Multicolour and purple",
      slugs: ["collana-gemme-miste-6e735f", "collana-ametista-9e7d11"],
    },
    { type: "h2", text: "Completing the look" },
    {
      type: "p",
      text: "Several necklaces have a natural partner. Amethyst is made from the same beads as the [Lilac Bud Bracelet](/products/bracciale-boccio-di-lilla-5a445c); the copper-streaked beads of Antique Copper return in the [Midnight Copper Bracelet](/products/bracciale-rame-di-mezzanotte-ca793a) and in the [Deep Blue Earrings](/products/orecchini-blu-profondo-fa4c96). The Ruby Necklace finds its earrings in [Ruby Drop](/products/orecchini-goccia-di-rubino-9ad623), and Pearl Rose & Sage has the same sage and antique pink as the [Pastel Garden Earrings](/products/orecchini-giardino-pastello-d650a2). Our guides to [bracelets](/blog/murano-glass-bracelets-buying-guide) and [earrings](/blog/murano-glass-earrings-buying-guide) go through the rest.",
    },
    {
      type: "products",
      title: "To wear together",
      slugs: [
        "bracciale-boccio-di-lilla-5a445c",
        "bracciale-rame-di-mezzanotte-ca793a",
        "orecchini-goccia-di-rubino-9ad623",
        "orecchini-giardino-pastello-d650a2",
        "orecchini-blu-profondo-fa4c96",
      ],
    },
    { type: "h2", text: "The small beads along the strand" },
    {
      type: "p",
      text: "Seed beads like the gold, grey, red and burgundy ones running between the larger beads have a long history in the lagoon. The [Murano Glass Museum](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) describes conterie as small beads cut from thin hollow glass canes and then rounded, and its [history of Venetian beads](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/) documents bead making on Murano from the fourteenth century. The wider story is in [the history of Murano glass](/blog/history-of-murano-glass).",
    },
    { type: "h2", text: "Looking after it" },
    {
      type: "p",
      text: "Put a necklace on after perfume and hairspray, and store it flat rather than hanging, so the strand is not under constant tension. Glass likes soft, stable storage and no sudden heat: the [Canadian Conservation Institute](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-ceramics-glass.html) recommends padded storage for glass and warns that rapid changes of temperature can crack it. More in our article on [caring for Murano glass jewellery](/blog/how-to-care-for-murano-glass-jewelry).",
    },
    { type: "cta", text: "See every necklace", href: "/category/collane-in-vetro-di-murano" },
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
    "murano-glass-bracelets-buying-guide",
    "murano-glass-earrings-buying-guide",
    "how-to-care-for-murano-glass-jewelry",
  ],
  translations: {
    it: {
      title: "Come scegliere una collana in vetro di Murano",
      seoTitle: "Come scegliere una collana in vetro di Murano",
      description:
        "Lunghezza, catenella o filo, stile: una breve guida per scegliere una collana in vetro di Murano, con i pezzi della collezione per ogni scollatura.",
      primaryKeyword: "collana vetro di murano",
      secondaryKeywords: [
        "come scegliere una collana di perle di vetro",
        "collana perle vetro di murano",
        "collana vetro di murano regalo",
      ],
      intro:
        "La collana incornicia il viso, e per questo cambia l'insieme più di un bracciale o di un anello. Tre scelte fanno la differenza: quanto scende, se le perle stanno su una catenella o lungo un filo, e il tipo di vetro che vuoi vedere. Ecco come orientarsi, con le collane della nostra collezione.",
      body: [
        {
          type: "facts",
          title: "In breve",
          items: [
            "Vicina al collo per i colli aperti; fili più lunghi per dolcevita e maglieria.",
            "La catenella mostra poche perle distanziate; il filo è colore tutto intorno.",
            "Effetto perlato e azzurri tenui sono i più facili da portare ogni giorno.",
            "Motivi floreali, rossi profondi e multicolore sono fatti per essere il centro del look.",
          ],
        },
        { type: "h2", text: "Prima di tutto: quanto scende" },
        {
          type: "p",
          text: "Una collana che sta vicina alla base del collo funziona con i colli aperti e gli scolli a V; una più lunga scende sopra un collo alto, una camicia abbottonata o un maglione, dove una collana corta sparirebbe. Alcune nostre collane esistono in due lunghezze: la [Collana Papavero](/products/collana-papavero-70d5a3) è la versione più lunga della [Fucsia Reale](/products/collana-fucsia-reale-94d36e), per una linea più bassa. La [Collana Rame Antico](/products/collana-rame-antico-85514c) è abbastanza lunga da portarla doppia, e la [Perla Rosa e Salvia](/products/collana-perla-rosa-e-salvia-ca0636) è montata su un filo lungo dal fascino retrò. Ogni scheda prodotto riporta le sue misure.",
        },
        {
          type: "p",
          text: "Se è un regalo e non conosci la lunghezza giusta, la [Collana Arcobaleno](/products/collana-arcobaleno-216e66) ha una chiusura regolabile sulla catenella dorata.",
        },
        {
          type: "products",
          title: "Linee più lunghe",
          slugs: [
            "collana-papavero-70d5a3",
            "collana-rame-antico-85514c",
            "collana-perla-rosa-e-salvia-ca0636",
          ],
        },
        { type: "h2", text: "Poi: catenella o filo" },
        {
          type: "p",
          text: "Su una catenella, poche perle di vetro sono distanziate lungo un metallo sottile: la collana sembra più leggera e il metallo fa parte del lavoro. Dorata per [Notte Stellata](/products/collana-notte-stellata-92b5fd) e Arcobaleno, argentata per [Cielo d'Estate](/products/collana-cielo-d-estate-4cf739) e [Acquamarina](/products/collana-acquamarina-98782c). Su un filo, le perle si susseguono tutto intorno, spesso con piccole perline in mezzo, e il colore è continuo: è il caso della maggior parte delle collane qui sotto.",
        },
        {
          type: "products",
          title: "Su catenella",
          slugs: ["collana-notte-stellata-92b5fd", "collana-arcobaleno-216e66"],
        },
        { type: "h2", text: "Infine: il vetro che vuoi vedere" },
        { type: "h3", text: "Effetto perlato, il più delicato" },
        {
          type: "p",
          text: "Le grandi perle tonde dalla lucentezza perlata sono le collane che vanno d'accordo con più cose. [Perla Rosa e Salvia](/products/collana-perla-rosa-e-salvia-ca0636) unisce rosa antico e salvia; [Perla Rosa Antico](/products/collana-perla-rosa-antico-f396d8) è la stessa idea in un tono più profondo, con riflessi metallici, su una lunga fila di rocailles grigie. [Perla Celeste](/products/collana-perla-celeste-5e4eb6) usa perle barocche, volutamente irregolari, bianche e azzurro cielo: delicata e facile da portare ogni giorno.",
        },
        {
          type: "products",
          title: "Effetto perlato",
          slugs: ["collana-perla-rosa-antico-f396d8", "collana-perla-celeste-5e4eb6"],
        },
        { type: "h3", text: "Motivi floreali dipinti" },
        {
          type: "p",
          text: "Perle ovali dipinte con motivi floreali, ognuna un po' diversa dall'altra. [Peonia Dorata](/products/collana-peonia-dorata-46a3de) è rosa e cammello con piccoli cristalli rosso rubino su rocailles dorate; [Fucsia Reale](/products/collana-fucsia-reale-94d36e) porta la stessa idea verso la sera, e Papavero ne è la versione lunga. [Fiore Notturno](/products/collana-fiore-notturno-15492b) mette ovali dipinti bianchi, salvia e rosa tra grandi perle ematite, per un look più scuro e grafico.",
        },
        {
          type: "products",
          title: "Motivi floreali",
          slugs: [
            "collana-peonia-dorata-46a3de",
            "collana-fucsia-reale-94d36e",
            "collana-fiore-notturno-15492b",
          ],
        },
        { type: "h3", text: "Sfaccettate, per catturare la luce" },
        {
          type: "p",
          text: "Le perle sfaccettate sono tagliate in modo che ogni movimento rimandi la luce. [Turchese Sfaccettato](/products/collana-turchese-sfaccettato-8e4504) usa perle di misure diverse, turchese e azzurro cielo, per un ritmo naturale lungo il filo; Cielo d'Estate e Acquamarina mettono gli stessi azzurri su una catenella argentata, più leggera sul collo.",
        },
        {
          type: "products",
          title: "Azzurri sfaccettati",
          slugs: [
            "collana-turchese-sfaccettato-8e4504",
            "collana-cielo-d-estate-4cf739",
            "collana-acquamarina-98782c",
          ],
        },
        { type: "h3", text: "Colori profondi: rubino, smeraldo, notte" },
        {
          type: "p",
          text: "Per una collana che regge da sola l'outfit. La [Collana Rubino](/products/collana-rubino-ff1b2a) ha perle tonde e organiche rosso rubino attraversate da venature dorate; [Fiamma Scarlatta](/products/collana-fiamma-scarlatta-17effb) ne è la versione più ricca, con venature dorate e nere più marcate. Nel verde, [Smeraldo e Argento](/products/collana-smeraldo-e-argento-a0dd26) ha inclusioni dorate nel vetro smeraldo, e [Onde di Smeraldo](/products/collana-onde-di-smeraldo-143dbf) si muove tra il turchese profondo e ovali maculati turchese e sabbia. Nel nero, Rame Antico e Notte Stellata usano perle nere striate di rame.",
        },
        {
          type: "products",
          title: "Colori profondi",
          slugs: [
            "collana-rubino-ff1b2a",
            "collana-fiamma-scarlatta-17effb",
            "collana-smeraldo-e-argento-a0dd26",
            "collana-onde-di-smeraldo-143dbf",
          ],
        },
        { type: "h3", text: "Tanti colori insieme" },
        {
          type: "p",
          text: "[Gemme Miste](/products/collana-gemme-miste-6e735f) riunisce perle blu, verdi, arancio, bianche e lilla con rocailles dorate: un pezzo bohémien pensato per accendere un outfit semplice. Arcobaleno distanzia perle tonde in cinque colori lungo una catenella, più leggera e giocosa. E [Ametista](/products/collana-ametista-9e7d11), viola e lilla con cabochon fumé, è quella da scegliere se il viola è il tuo colore.",
        },
        {
          type: "products",
          title: "Multicolore e viola",
          slugs: ["collana-gemme-miste-6e735f", "collana-ametista-9e7d11"],
        },
        { type: "h2", text: "Per completare il look" },
        {
          type: "p",
          text: "Diverse collane hanno un compagno naturale. Ametista nasce dalle stesse perle del [Bracciale Boccio di Lilla](/products/bracciale-boccio-di-lilla-5a445c); le perle striate di rame di Rame Antico ritornano nel [Bracciale Rame di Mezzanotte](/products/bracciale-rame-di-mezzanotte-ca793a) e negli [Orecchini Blu Profondo](/products/orecchini-blu-profondo-fa4c96). La Collana Rubino trova i suoi orecchini in [Goccia di Rubino](/products/orecchini-goccia-di-rubino-9ad623), e Perla Rosa e Salvia ha lo stesso salvia e rosa antico degli [Orecchini Giardino Pastello](/products/orecchini-giardino-pastello-d650a2). Le nostre guide ai [bracciali](/blog/murano-glass-bracelets-buying-guide) e agli [orecchini](/blog/murano-glass-earrings-buying-guide) raccontano il resto.",
        },
        {
          type: "products",
          title: "Da portare insieme",
          slugs: [
            "bracciale-boccio-di-lilla-5a445c",
            "bracciale-rame-di-mezzanotte-ca793a",
            "orecchini-goccia-di-rubino-9ad623",
            "orecchini-giardino-pastello-d650a2",
            "orecchini-blu-profondo-fa4c96",
          ],
        },
        { type: "h2", text: "Le piccole perle lungo il filo" },
        {
          type: "p",
          text: "Perline come quelle dorate, grigie, rosse e bordeaux che corrono tra le perle più grandi hanno una lunga storia in laguna. Il [Museo del Vetro di Murano](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) descrive le conterie come piccole perle tagliate da sottili canne di vetro cave e poi arrotondate, e la sua [storia delle perle veneziane](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/) documenta la produzione di perle a Murano dal Trecento. Il resto della storia è nel nostro articolo sulla [storia del vetro di Murano](/blog/history-of-murano-glass).",
        },
        { type: "h2", text: "Come averne cura" },
        {
          type: "p",
          text: "Metti la collana dopo il profumo e la lacca, e conservala distesa invece che appesa, così il filo non resta sempre in tensione. Il vetro ama un appoggio morbido e stabile e nessun calore improvviso: il [Canadian Conservation Institute](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-ceramics-glass.html) consiglia di riporre il vetro su un supporto imbottito e avverte che i cambi bruschi di temperatura possono incrinarlo. Altri consigli nel nostro articolo su [come prendersi cura dei gioielli in vetro di Murano](/blog/how-to-care-for-murano-glass-jewelry).",
        },
        {
          type: "cta",
          text: "Vedi tutte le collane",
          href: "/category/collane-in-vetro-di-murano",
        },
      ],
    },
  },
};
