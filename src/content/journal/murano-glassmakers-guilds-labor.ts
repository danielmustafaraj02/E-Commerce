import type { Article } from "@/lib/journal/types";
import {
  MCCRAY_BOOK,
  MUVE_GLOSSARY,
  SOFIA_BEAD_TRADE,
  TRIVELLATO_BOOK,
} from "./murano-glass-series-sources";

const series = {
  key: "murano-glass-reader",
  title: "Murano Glass: A Historical and Technical Reader",
  titleIt: "Il vetro di Murano: un percorso storico e tecnico",
  episode: 4,
  total: 6,
};

export const muranoGlassmakersAndLabor: Article = {
  slug: "murano-glassmakers-guilds-labor",
  title: "Murano Glass, Part IV: Guilds, Labour and the Furnace",
  seoTitle: "Murano Glassmakers: Guilds, Labour and the Furnace",
  description:
    "How guild rules, skilled labour and gendered work shaped Murano glassmaking, from furnace crews and secrecy to bead production and export.",
  category: "history",
  published: "2026-09-27",
  primaryKeyword: "Murano glassmakers",
  secondaryKeywords: [
    "history of Murano glassmakers",
    "Murano glass guild",
    "Venetian glass workers",
    "history of glass bead making",
  ],
  hero: {
    kind: "file",
    src: "/blog/IMG_3204.JPG",
    alt: "Handmade Murano glass bracelet with a dark floral bead",
    altIt: "Bracciale artigianale in vetro di Murano con una perla floreale scura",
    rights: { credit: "Perla Murano Glass", license: "own-photography" },
  },
  series,
  intro:
    "The history of Murano glass is also a history of organised labour. Glass emerged from teams, specialised skills, furnace schedules, commercial rules and family networks. The surviving record is uneven: statutes and commercial documents preserve some voices far more clearly than others. Reading production through that imbalance helps explain both the craft’s sophistication and the people whose work sustained it.",
  body: [
    {
      type: "facts",
      title: "A social history in four points",
      items: [
        "Glass was a coordinated workshop activity: the master’s skill depended on assistants, tools, fuel, prepared materials and the furnace’s heat.",
        "Guild and state rules shaped training, production and commercial conduct; they changed over time and were not a single unchanging code.",
        "The written record centres male masters and institutions, while other kinds of work can be less visible in official sources.",
        "Bead making linked specialised production on the lagoon to international merchants and, in some Atlantic circuits, colonial and enslaved labour systems.",
      ],
    },
    { type: "h2", text: "A furnace was a team, not a lone artisan" },
    {
      type: "p",
      text: "A finished vessel may bear the name of a master glassmaker, but its production relied on coordinated hands. Heating, gathering, shaping, reheating, preparing tools and maintaining the furnace demanded different tasks and a shared sense of timing. In [Glassmaking in Renaissance Venice](https://books.google.com/books?id=i3NBDgAAQBAJ), historian W. Patrick McCray studies glass as a fragile craft whose technical choices were tied to markets, regulation and the organisation of work. The object is evidence of skill; it is not a complete record of everyone who helped make it.",
    },
    { type: "h2", text: "Guild rules, knowledge and control" },
    {
      type: "p",
      text: "Venetian authorities and craft institutions sought to regulate who could practise, how work was organised and how technical knowledge circulated. These arrangements could protect specialised knowledge and market position, while also setting limits on workers’ mobility and commercial activity. They must be read historically: statutes, privileges and enforcement shifted across centuries, and a rule on paper does not prove that every workshop followed it exactly.",
    },
    {
      type: "p",
      text: "Francesca Trivellato’s specialist study [Fondamenta dei vetrai](https://books.google.com/books?id=4yX5lcsbOwEC) examines labour, technology and markets in Venice between the seventeenth and eighteenth centuries. Its scope is a useful corrective to a story told only through celebrated inventions: workshop knowledge belonged to a social and economic world, shaped by relationships between workers, merchants and institutions.",
    },
    { type: "h2", text: "Who appears in the archive?" },
    {
      type: "p",
      text: "Official records preserve masters, guilds and commercial transactions especially well. They can tell us less about informal assistance, household labour or workers whose names did not enter the same records. The Museum’s [glassmaking glossary](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) includes the term gastaldo for a guild officer, a reminder that craft vocabulary also records institutional roles. It does not, by itself, describe the whole workforce.",
    },
    {
      type: "p",
      text: "Bead production opens a wider view. Pierre Niccolò Sofia’s [archival study of eighteenth-century Venetian bead trade](https://doi.org/10.7264/z3zcxh35) draws on trade registers and manifests to follow routes, firms and export values. The Museum also describes women’s significant presence in bead work and design during the later crisis of blown glass. These accounts concern different evidence and periods, so they should be set alongside one another rather than flattened into a timeless picture of women’s work.",
    },
    { type: "h2", text: "A local craft in global systems" },
    {
      type: "p",
      text: "Beads travelled far beyond the lagoon. Sofia’s study connects some Venetian export routes to Atlantic commercial systems that included the slave trade. That context matters, but it does not mean every bead had the same destination or function, or that beads can simply be described as “currency.” Specific claims need to remain tied to the surviving records and the particular route under discussion.",
    },
    {
      type: "p",
      text: "Looking at labour changes how we read an object: technique depends on trained people, social organisation and movement of materials. In the next episode we follow one product through these networks in more detail, tracing [Venetian glass beads and their global trade](/blog/venetian-glass-beads). For the techniques themselves, return to [episode three](/blog/murano-glassmaking-techniques-filigrana-murrine), or revisit [episode one and the island’s longer history](/blog/history-of-murano-glass).",
    },
    {
      type: "products",
      title: "Glass made for wearing and keeping",
      slugs: [
        "bracciale-laguna-azzurra-5ae8cc",
        "collana-gemme-miste-6e735f",
        "orecchini-giardino-pastello-d650a2",
      ],
    },
    { type: "cta", text: "Discover handmade Murano glass jewellery", href: "/products" },
  ],
  translations: {
    it: {
      title: "Vetro di Murano, IV: corporazioni, lavoro e fornace",
      seoTitle: "I vetrai di Murano: corporazioni, lavoro e fornace",
      description:
        "Come regole corporative, lavoro specializzato e divisioni di genere hanno plasmato la produzione muranese, dalle fornaci alle perle destinate all’esportazione.",
      primaryKeyword: "vetrai di Murano",
      secondaryKeywords: [
        "storia dei vetrai di Murano",
        "corporazione dei vetrai",
        "lavoratori del vetro veneziani",
        "storia delle perle di vetro",
      ],
      intro:
        "La storia del vetro di Murano è anche storia del lavoro organizzato. Ogni oggetto nasceva da squadre, competenze specializzate, turni di fornace, regole commerciali e reti familiari. Le fonti conservate sono disomogenee: statuti e documenti mercantili tramandano alcune voci molto più chiaramente di altre. Leggere la produzione tenendo conto di questo squilibrio aiuta a comprendere sia la complessità dell’arte sia le persone che la sostenevano.",
      body: [
        {
          type: "facts",
          title: "Quattro punti per una storia sociale",
          items: [
            "La lavorazione del vetro era un’attività coordinata: il sapere del maestro dipendeva da assistenti, attrezzi, combustibile, materiali preparati e calore della fornace.",
            "Norme corporative e statali regolavano formazione, produzione e commercio; cambiavano nel tempo e non formavano un codice immutabile.",
            "I documenti scritti danno più spazio ai maestri e alle istituzioni maschili; altri tipi di lavoro possono restare meno visibili nelle fonti ufficiali.",
            "La produzione delle perle collegava le fornaci della laguna ai mercanti internazionali e, in alcune rotte atlantiche, ai sistemi coloniali e alla schiavitù.",
          ],
        },
        { type: "h2", text: "La fornace era una squadra, non un artigiano solo" },
        {
          type: "p",
          text: "Un vaso finito può portare il nome di un maestro vetraio, ma per realizzarlo servivano gesti coordinati. Scaldare, raccogliere il vetro, modellarlo, riscaldarlo di nuovo, preparare gli utensili e mantenere la fornace richiedeva compiti diversi e un senso condiviso del ritmo. In [Glassmaking in Renaissance Venice](https://books.google.com/books?id=i3NBDgAAQBAJ), lo storico W. Patrick McCray studia il vetro come un’arte fragile, legata ai mercati, alla regolamentazione e all’organizzazione del lavoro. L’oggetto testimonia l’abilità tecnica, ma non registra da solo tutte le persone che contribuirono a produrlo.",
        },
        { type: "h2", text: "Regole corporative, saperi e controllo" },
        {
          type: "p",
          text: "Le autorità veneziane e le istituzioni di mestiere cercavano di regolare chi potesse esercitare, come organizzare il lavoro e in che modo circolassero le conoscenze tecniche. Queste regole potevano proteggere saperi specializzati e posizioni di mercato, ma anche limitare la mobilità dei lavoratori e le attività commerciali. Vanno lette nel loro contesto: statuti, privilegi e controlli variarono nei secoli, e l’esistenza di una norma scritta non dimostra che ogni fornace la applicasse allo stesso modo.",
        },
        {
          type: "p",
          text: "Lo studio specialistico di Francesca Trivellato, [Fondamenta dei vetrai](https://books.google.com/books?id=4yX5lcsbOwEC), esamina lavoro, tecnologia e mercati a Venezia fra Sei e Settecento. Il suo campo di indagine corregge una narrazione affidata soltanto alle invenzioni più celebri: il sapere di fornace apparteneva a un mondo sociale ed economico, plasmato dai rapporti fra lavoratori, mercanti e istituzioni.",
        },
        { type: "h2", text: "Chi compare negli archivi?" },
        {
          type: "p",
          text: "I documenti ufficiali conservano soprattutto notizie su maestri, corporazioni e transazioni commerciali. Possono dirci meno sul lavoro informale, domestico o svolto da persone i cui nomi non entravano con la stessa frequenza negli atti. Il [glossario del Museo del Vetro](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) registra il termine gastaldo per un ufficiale di corporazione: un esempio di come il lessico tecnico tramandi anche ruoli istituzionali. Da solo, però, non descrive l’intera forza lavoro.",
        },
        {
          type: "p",
          text: "La produzione delle perle apre uno scorcio più ampio. Lo [studio archivistico di Pierre Niccolò Sofia sul commercio veneziano del Settecento](https://doi.org/10.7264/z3zcxh35) analizza registri e manifesti per ricostruire rotte, imprese e valori di esportazione. Il Museo documenta inoltre la presenza significativa delle donne nella produzione e nel disegno delle perle durante la crisi più tarda del vetro soffiato. Si tratta di prove e periodi diversi: vanno affiancati, senza ridurli a un’immagine senza tempo del lavoro femminile.",
        },
        { type: "h2", text: "Un’arte locale dentro reti globali" },
        {
          type: "p",
          text: "Le perle viaggiavano lontano dalla laguna. Lo studio di Sofia collega alcune rotte di esportazione veneziane a sistemi commerciali atlantici che comprendevano la tratta degli schiavi. È un contesto storico necessario, ma non significa che ogni perla avesse la stessa destinazione o funzione, né che si possa definire semplicemente “moneta”. Le affermazioni specifiche devono restare legate ai documenti conservati e alla singola rotta esaminata.",
        },
        {
          type: "p",
          text: "Il lavoro cambia il nostro modo di leggere un oggetto: ogni tecnica dipende da persone formate, organizzazione sociale e circolazione dei materiali. Nel prossimo episodio seguiremo più da vicino un prodotto attraverso queste reti, ricostruendo [le perle veneziane e il loro commercio globale](/blog/venetian-glass-beads). Per le tecniche di fornace, torna al [terzo episodio](/blog/murano-glassmaking-techniques-filigrana-murrine), oppure rileggi il [primo episodio sulla storia dell’isola](/blog/history-of-murano-glass).",
        },
        {
          type: "products",
          title: "Vetro da indossare e custodire",
          slugs: [
            "bracciale-laguna-azzurra-5ae8cc",
            "collana-gemme-miste-6e735f",
            "orecchini-giardino-pastello-d650a2",
          ],
        },
        { type: "cta", text: "Scopri i gioielli artigianali in vetro di Murano", href: "/products" },
      ],
    },
  },
  sources: [
    {
      ...MCCRAY_BOOK,
      usedFor:
        "The relationship between Renaissance glass technology, regulation, markets and the organisation of workshop labour.",
      usedForIt:
        "Il rapporto fra tecnologia vetraria rinascimentale, regole, mercati e organizzazione del lavoro di fornace.",
    },
    {
      ...TRIVELLATO_BOOK,
      usedFor:
        "Specialist social and economic study of Venetian glassworkers, technology and markets in the seventeenth and eighteenth centuries.",
      usedForIt:
        "Studio specialistico sociale ed economico su vetrai veneziani, tecnologia e mercati fra Sei e Settecento.",
    },
    {
      ...MUVE_GLOSSARY,
      usedFor:
        "The historical craft term gastaldo and its institutional meaning.",
      usedForIt:
        "Il termine storico gastaldo e il suo significato istituzionale.",
    },
    {
      ...SOFIA_BEAD_TRADE,
      locator: "Especially pp. 11–26; eighteenth-century registers, manifests and route analysis.",
      usedFor:
        "Archival method, firms, export values and trade routes; the evidence linking some Venetian bead exports to Atlantic systems that included slavery.",
      usedForIt:
        "Metodo archivistico, imprese, valori di esportazione e rotte; prove sul legame fra alcune esportazioni veneziane di perle e sistemi atlantici comprendenti la schiavitù.",
    },
  ],
  related: ["history-of-murano-glass", "venetian-glass-beads"],
};
