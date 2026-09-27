import type { Article } from "@/lib/journal/types";
import {
  MUSEUM_BEADS,
  MUSEUM_CONTERIE,
  MUSEUM_GALLERY_GUIDE,
  MUSEUM_GLOSSARY,
  OWN_PHOTO,
} from "./sources";
import { SOFIA_BEAD_TRADE } from "./murano-glass-series-sources";

const series = {
  key: "murano-glass-reader",
  title: "Murano Glass: A Historical and Technical Reader",
  titleIt: "Il vetro di Murano: un percorso storico e tecnico",
  episode: 5,
  total: 6,
};

export const venetianGlassBeads: Article = {
  slug: "venetian-glass-beads",
  title: "Murano Glass, Part V: Beads, Skills and Global Trade",
  seoTitle: "Venetian Glass Beads: Techniques, History and Trade",
  description:
    "A source-led history of conterie, chevron and lampwork beads, their specialist production on the lagoon and their place in eighteenth-century global trade.",
  category: "craft",
  published: "2026-09-27",
  primaryKeyword: "Venetian glass beads",
  secondaryKeywords: [
    "Murano glass beads history",
    "conterie seed beads",
    "Venetian chevron beads",
    "lampwork glass beads",
  ],
  hero: {
    kind: "file",
    src: "/blog/venice-gondoliers-canal-golden-light.jpg",
    alt: "Venice canal at evening, a view of the lagoon city whose glass beads travelled through global trade",
    altIt: "Canale veneziano al tramonto, nella città lagunare da cui le perle di vetro viaggiavano lungo le rotte commerciali",
    rights: OWN_PHOTO,
  },
  series,
  intro:
    "Glass beads made in the Venetian world were small objects with long histories. Their forms preserve evidence of skilled work, while trade records trace some of them across oceans. This episode distinguishes three production families—conterie, chevron beads and lampwork—and follows the documented routes of eighteenth-century exports without treating every bead, destination or exchange as the same.",
  body: [
    {
      type: "facts",
      title: "Three terms, three processes",
      items: [
        "Conterie are small beads formed from thin hollow canes cut into short pieces and rounded.",
        "Chevron or rosetta beads come from layered canes with a star-shaped section, cut and ground to expose the pattern.",
        "Lampwork beads are shaped individually by winding softened glass around a rod in a flame.",
        "These categories describe ways of making; they do not by themselves prove an object’s precise date, workshop or route.",
      ],
    },
    { type: "h2", text: "Conterie: hollow canes made into small beads" },
    {
      type: "p",
      text: "The [Murano Glass Museum](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) defines conterie as beads made from thin hollow glass canes. The cane is cut into small pieces and the sections are rounded; the resulting beads could be used in embroidery, jewellery and larger decorative compositions. The Museum’s [history of Venetian beads](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/) documents bead making on Murano from the fourteenth century. That is an institutional chronology for the craft, not a date that can be assigned to an individual bead without further evidence.",
    },
    {
      type: "p",
      text: "The name is also associated with the large nineteenth- and twentieth-century bead works known as the Conterie. The Museum’s history of the [Conterie space](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/the-conterie-space/) records the consolidation of several companies into the Società Veneziana Conterie in 1898, its major employment in the following decades, and its closure in 1993. This industrial history belongs alongside the older workshop tradition, but it should not be mistaken for one unchanged organisation spanning the centuries.",
    },
    { type: "h2", text: "Rosetta and chevron: pattern through the cross-section" },
    {
      type: "p",
      text: "Chevron beads begin as larger pierced canes built from layers of coloured glass. A mould gives the cane a star-shaped section; after it is drawn out, short pieces are cut and ground so the layered star appears at the surface. The Museum’s [gallery guide](https://museovetro.visitmuve.it/wp-content/uploads/2020/09/SCHEDE-DI-SALA-Museo-del-Vetro-ENG-OK.pdf) associates the Venetian rosetta bead with the fifteenth century and with Marietta Barovier, while presenting the attribution as a traditional account. It is safer to describe this as an attribution than as a securely documented invention by one individual.",
    },
    {
      type: "p",
      text: "The technique connects bead making to the broader practice of assembling hot glass from prepared canes. For related terms and the construction of patterned rods, see the Museum’s [glass glossary](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) and our earlier episode on [filigrana, reticello and murrine](/blog/murano-glassmaking-techniques-filigrana-murrine).",
    },
    { type: "h2", text: "Lampwork: each bead shaped at the flame" },
    {
      type: "p",
      text: "In lampwork, the maker heats a solid rod in a flame and winds softened glass around a metal mandrel, rotating the work as it builds. Layers, colours and applied decoration can be added while the glass remains workable. Unlike cutting many beads from one cane, this is a bead-by-bead process. The Museum’s [gallery guide](https://museovetro.visitmuve.it/wp-content/uploads/2020/09/SCHEDE-DI-SALA-Museo-del-Vetro-ENG-OK.pdf) places Venetian lampworked beads in the early modern period; the exact chronology of a piece still depends on its construction and provenance.",
    },
    {
      type: "image",
      image: {
        kind: "product",
        productSlug: "orecchini-goccia-di-ghiaccio-51362e",
        alt: "Murano glass drop earrings with clear, ice-like beads",
        caption: "Small differences in a hand-shaped glass bead record the gestures of its maker.",
        rights: OWN_PHOTO,
      },
    },
    { type: "h2", text: "Following beads through eighteenth-century records" },
    {
      type: "p",
      text: "Pierre Niccolò Sofia’s [study of eighteenth-century trade](https://doi.org/10.7264/z3zcxh35) moves beyond stories of famous routes by comparing Venetian registers, manifests and trade datasets. It uses this evidence to analyse firms, export flows and the changing value of beads during the eighteenth century. For 1773–1790, the study estimates beads at 43% of the value of Venetian glass exports and about 12% of the value of privileged manufactured exports. These figures refer to defined archival categories and years; they are not estimates for every period or every bead-producing island workshop.",
    },
    {
      type: "p",
      text: "The routes also need historical context. Sofia relates some Venetian bead exports to Atlantic trade systems that included the transatlantic slave trade. That association is part of the history of the markets through which beads moved; it does not mean all beads went to the Americas, served as currency, or had a single exchange value. The article therefore keeps claims close to the specific routes and records its study examines.",
    },
    { type: "h2", text: "Work, expertise and the people behind the objects" },
    {
      type: "p",
      text: "Bead production could be divided among cane makers, bead workers, finishers, stringers, merchants and exporters. The Museum’s [gallery guide](https://museovetro.visitmuve.it/wp-content/uploads/2020/09/SCHEDE-DI-SALA-Museo-del-Vetro-ENG-OK.pdf) describes women as a significant part of the later bead workforce and its design history. The scale and form of that participation changed over time, and surviving commercial records do not always name every worker. Read alongside the history of [guilds and labour on Murano](/blog/murano-glassmakers-guilds-labor), bead history brings the social organisation of glassmaking into view.",
    },
    {
      type: "p",
      text: "A bead is therefore more than a decorative miniature. Its shape can reveal a process; a group of beads may point to a workshop practice; archival records can illuminate trade. Each type of evidence answers a different question. For the island-wide historical frame, return to [episode one](/blog/history-of-murano-glass), or continue to [episode six on revival and modern design](/blog/murano-glass-modern-revival-design).",
    },
    {
      type: "products",
      title: "Contemporary glass beads",
      slugs: [
        "bracciale-laguna-azzurra-5ae8cc",
        "orecchini-goccia-di-ghiaccio-51362e",
        "collana-perla-celeste-5e4eb6",
      ],
    },
    { type: "cta", text: "Discover handmade Murano glass jewellery", href: "/category/bracciali-in-vetro-di-murano" },
  ],
  translations: {
    it: {
      title: "Vetro di Murano, V: perle, saperi e commercio globale",
      seoTitle: "Perle veneziane di vetro: tecniche, storia e commercio",
      description:
        "Una storia documentata di conterie, perle a chevron e lavorazione a lume, della loro produzione specializzata e dei commerci globali del Settecento.",
      primaryKeyword: "perle veneziane di vetro",
      secondaryKeywords: [
        "storia delle perle di vetro di Murano",
        "conterie veneziane",
        "perle chevron veneziane",
        "perle a lume",
      ],
      intro:
        "Le perle di vetro prodotte nel mondo veneziano erano oggetti piccoli ma portatori di storie lunghe. Le loro forme documentano saperi specializzati, mentre i registri commerciali permettono di seguirne alcune attraverso gli oceani. Questo episodio distingue tre famiglie di lavorazione—conterie, perle chevron e perle a lume—e ricostruisce le rotte documentate delle esportazioni settecentesche senza trattare ogni perla, destinazione e scambio come se fossero uguali.",
      body: [
        {
          type: "facts",
          title: "Tre termini, tre processi",
          items: [
            "Le conterie sono piccole perle ricavate tagliando e arrotondando sottili canne cave.",
            "Le perle chevron o rosetta si ottengono da canne stratificate con sezione a stella, tagliate e molate per rivelare il disegno.",
            "Le perle a lume sono modellate una per una avvolgendo il vetro ammorbidito attorno a un supporto, sopra una fiamma.",
            "Queste categorie descrivono tecniche di produzione; da sole non dimostrano data, fornace o percorso preciso di un oggetto.",
          ],
        },
        { type: "h2", text: "Conterie: canne cave trasformate in piccole perle" },
        {
          type: "p",
          text: "Il [Museo del Vetro di Murano](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) definisce le conterie come perle ricavate da sottili canne cave di vetro. La canna viene tagliata in piccoli segmenti, che vengono poi arrotondati; le perle risultanti potevano essere impiegate nel ricamo, nella gioielleria e in composizioni decorative più ampie. La [storia museale delle perle veneziane](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/) documenta la produzione muranese dal Trecento. È una cronologia istituzionale della lavorazione, non una data attribuibile a ogni singolo esemplare senza altre prove.",
        },
        {
          type: "p",
          text: "Il nome è legato anche alle grandi vetrerie ottocentesche e novecentesche conosciute come Conterie. La storia museale dello [spazio delle Conterie](https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/the-conterie-space/) ricorda la riunione di diverse imprese nella Società Veneziana Conterie nel 1898, la notevole occupazione nei decenni successivi e la chiusura nel 1993. Questa vicenda industriale si affianca alla tradizione più antica, ma non va confusa con un’unica organizzazione rimasta immutata per secoli.",
        },
        { type: "h2", text: "Rosetta e chevron: il disegno nella sezione" },
        {
          type: "p",
          text: "Le perle chevron si ricavano da canne forate più grandi, costruite con strati di vetro colorato. Uno stampo dà alla canna una sezione a stella; dopo averla tirata, si tagliano brevi segmenti e li si mola per portare in superficie la stella stratificata. La [guida alle sale del Museo](https://museovetro.visitmuve.it/wp-content/uploads/2020/09/SCHEDE-DI-SALA-Museo-del-Vetro-ENG-OK.pdf) associa la perla rosetta veneziana al Quattrocento e a Marietta Barovier, presentando però questa attribuzione come tradizione. È più prudente parlare di attribuzione che di invenzione individuale documentata con certezza.",
        },
        {
          type: "p",
          text: "La tecnica collega la produzione di perle alla pratica più ampia di assemblare il vetro caldo a partire da canne preparate. Per la terminologia e la costruzione delle bacchette decorate, consulta il [glossario del Museo](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) e il precedente episodio su [filigrana, reticello e murrine](/blog/murano-glassmaking-techniques-filigrana-murrine).",
        },
        { type: "h2", text: "A lume: ogni perla modellata sulla fiamma" },
        {
          type: "p",
          text: "Nella lavorazione a lume, il vetraio scalda una bacchetta piena sulla fiamma e avvolge il vetro ammorbidito intorno a un mandrino metallico, ruotando il pezzo man mano che cresce. Si possono aggiungere strati, colori e decorazioni applicate mentre il vetro è ancora lavorabile. Diversamente dal taglio di molte perle da un’unica canna, questo procedimento lavora una perla alla volta. La [guida del Museo](https://museovetro.visitmuve.it/wp-content/uploads/2020/09/SCHEDE-DI-SALA-Museo-del-Vetro-ENG-OK.pdf) colloca le perle veneziane a lume nell’età moderna; la cronologia di un singolo pezzo dipende comunque dalla sua struttura e provenienza.",
        },
        {
          type: "image",
          image: {
            kind: "product",
            productSlug: "orecchini-goccia-di-ghiaccio-51362e",
            alt: "Orecchini a goccia in vetro di Murano con perle trasparenti simili al ghiaccio",
            caption: "Le piccole differenze di una perla modellata a mano conservano i gesti di chi l’ha lavorata.",
            rights: OWN_PHOTO,
          },
        },
        { type: "h2", text: "Seguire le perle attraverso i registri del Settecento" },
        {
          type: "p",
          text: "Lo [studio di Pierre Niccolò Sofia sul commercio settecentesco](https://doi.org/10.7264/z3zcxh35) va oltre i racconti sulle rotte celebri confrontando registri veneziani, manifesti e basi di dati commerciali. Usa queste prove per analizzare imprese, flussi di esportazione e variazioni del valore delle perle nel Settecento. Per il periodo 1773–1790, lo studio stima che le perle costituissero il 43% del valore delle esportazioni veneziane di vetro e circa il 12% del valore dei manufatti esportati con privilegi. Sono cifre riferite a categorie archivistiche e anni definiti: non valgono per ogni epoca o per tutte le fornaci produttrici di perle.",
        },
        {
          type: "p",
          text: "Anche le rotte vanno collocate nel loro contesto storico. Sofia mette in relazione alcune esportazioni veneziane di perle con sistemi commerciali atlantici che comprendevano la tratta transatlantica degli schiavi. È un aspetto della storia dei mercati attraversati dalle perle; non significa che tutte fossero dirette in America, venissero usate come moneta o avessero un unico valore di scambio. L’articolo mantiene quindi le affermazioni vicine alle rotte e ai documenti specifici esaminati.",
        },
        { type: "h2", text: "Lavoro, competenze e persone dietro gli oggetti" },
        {
          type: "p",
          text: "La produzione poteva distribuire le mansioni fra chi preparava le canne, chi formava le perle, chi le rifiniva, le infilava, le vendeva e le esportava. La [guida alle sale del Museo](https://museovetro.visitmuve.it/wp-content/uploads/2020/09/SCHEDE-DI-SALA-Museo-del-Vetro-ENG-OK.pdf) descrive le donne come una componente significativa del lavoro e del disegno delle perle nell’industria più tarda. L’entità e le forme di questa partecipazione cambiarono nel tempo; i documenti commerciali superstiti non nominano sempre ogni lavoratore. Accostata alla storia delle [corporazioni e del lavoro a Murano](/blog/murano-glassmakers-guilds-labor), la storia delle perle rende visibile l’organizzazione sociale dell’arte vetraria.",
        },
        {
          type: "p",
          text: "Una perla è quindi più di una miniatura decorativa. La sua forma può rivelare un processo; un gruppo di perle può indicare una pratica di fornace; i registri possono illuminare il commercio. Ogni tipo di prova risponde a una domanda diversa. Per il quadro storico dell’isola, torna al [primo episodio](/blog/history-of-murano-glass), oppure prosegui con il [sesto episodio sulla rinascita e il design moderno](/blog/murano-glass-modern-revival-design).",
        },
        {
          type: "products",
          title: "Perle contemporanee in vetro",
          slugs: [
            "bracciale-laguna-azzurra-5ae8cc",
            "orecchini-goccia-di-ghiaccio-51362e",
            "collana-perla-celeste-5e4eb6",
          ],
        },
        { type: "cta", text: "Scopri i gioielli artigianali in vetro di Murano", href: "/category/bracciali-in-vetro-di-murano" },
      ],
    },
  },
  sources: [
    {
      ...MUSEUM_BEADS,
      kind: "institutional",
      usedFor:
        "The Museum’s history and classification of Venetian glass beads; dates are presented as institutional context, not as the provenance of individual beads.",
      usedForIt:
        "La storia museale e la classificazione delle perle veneziane; le date sono presentate come contesto, non come provenienza di ogni singola perla.",
    },
    {
      ...MUSEUM_GALLERY_GUIDE,
      kind: "institutional",
      locator: "Bead-making sections; rosetta/chevron and lampworked bead entries.",
      usedFor:
        "Descriptions of bead processes, the traditional attribution of rosetta beads to Marietta Barovier, and museum chronology for Venetian bead work.",
      usedForIt:
        "Descrizioni delle lavorazioni, attribuzione tradizionale delle perle rosetta a Marietta Barovier e cronologia museale delle perle veneziane.",
    },
    {
      ...MUSEUM_GLOSSARY,
      kind: "institutional",
      usedFor: "The definition and making process of conterie.",
      usedForIt: "La definizione e la lavorazione delle conterie.",
    },
    {
      ...MUSEUM_CONTERIE,
      kind: "institutional",
      usedFor:
        "The 1898 Società Veneziana Conterie consolidation, later industrial history and the 1993 closure.",
      usedForIt:
        "La riunione nella Società Veneziana Conterie del 1898, la successiva storia industriale e la chiusura del 1993.",
    },
    {
      ...SOFIA_BEAD_TRADE,
      locator: "Especially pp. 11–26; see the 1773–1790 export analysis and method discussion.",
      usedFor:
        "Archival method, eighteenth-century export estimates, trade routes and the contextual relationship between some bead routes and Atlantic slave-trade systems.",
      usedForIt:
        "Metodo archivistico, stime delle esportazioni settecentesche, rotte commerciali e relazione contestuale fra alcune rotte delle perle e i sistemi della tratta atlantica.",
    },
  ],
  related: ["history-of-murano-glass", "murano-glassmakers-guilds-labor", "how-to-care-for-murano-glass-jewelry"],
};
