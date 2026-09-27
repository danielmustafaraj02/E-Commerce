import type { Article } from "@/lib/journal/types";
import {
  MUVE_MUSEUM_HISTORY,
  MUVE_REVIVAL,
  PROMOVETRO_MARK,
  SCARPA_MET,
  VENETO_MARK,
} from "./murano-glass-series-sources";

const series = {
  key: "murano-glass-reader",
  title: "Murano Glass: A Historical and Technical Reader",
  titleIt: "Il vetro di Murano: un percorso storico e tecnico",
  episode: 6,
  total: 6,
};

export const muranoGlassModernRevival: Article = {
  slug: "murano-glass-modern-revival-design",
  title: "Murano Glass, Part VI: Revival, Design and Living Tradition",
  seoTitle: "Murano Glass Revival: From the 19th Century to Design",
  description:
    "How Murano glassmaking was revived in the nineteenth century, reshaped by modern design and museums, and represented by the Vetro Artistico® Murano mark.",
  category: "history",
  published: "2026-09-27",
  primaryKeyword: "Murano glass revival",
  secondaryKeywords: [
    "nineteenth-century Murano glass",
    "Murano glass design history",
    "Carlo Scarpa Venini glass",
    "Vetro Artistico Murano mark",
  ],
  hero: {
    kind: "product",
    productSlug: "collana-fiamma-scarlatta-17effb",
    alt: "Contemporary Murano glass necklace with red flame-like beads",
    altIt: "Collana contemporanea in vetro di Murano con perle rosse dalla forma fiammeggiante",
    rights: { credit: "Perla Murano Glass", license: "own-photography" },
  },
  series,
  intro:
    "Murano glass is often presented as a tradition passed intact from the Renaissance to the present. The historical record suggests a more interesting story: periods of difficulty, deliberate revival, new institutions and designers who treated inherited techniques as material for change. This final episode follows that history from the nineteenth century to the present, and asks what a mark of origin can—and cannot—tell us.",
  body: [
    {
      type: "facts",
      title: "The modern story at a glance",
      items: [
        "The Murano Glass Museum dates a major revival of historic techniques to 1850–1895, a period shaped by collectors, makers and changing markets.",
        "The Glass Museum was founded in 1861; the Abate Zanetti glass school followed in 1862.",
        "Twentieth-century designers such as Carlo Scarpa adapted workshop techniques for modern forms rather than simply reproducing historic objects.",
        "The Vetro Artistico® Murano mark identifies regulated origin and production on the island; it is not, by itself, an independent appraisal of quality or date.",
      ],
    },
    { type: "h2", text: "Revival is a historical process" },
    {
      type: "p",
      text: "The Museum’s account of [the 1850–1895 revival](https://museovetro.visitmuve.it/it/il-museo/percorsi-e-collezioni/vetro-xix-secolo/) describes renewed interest in historic techniques during a period of economic and political change. Makers, antiquarians and collectors helped recover, reinterpret and promote older forms. The result was not a simple return to an unchanged past: the revival responded to contemporary markets and to new ideas about Venetian identity.",
    },
    {
      type: "p",
      text: "Institutions also helped make the past visible. The [Glass Museum](https://museovetro.visitmuve.it/en/il-museo/museum/) was founded in 1861, and the Abate Zanetti school opened in 1862. A museum organises objects into a history; a school gives knowledge a place to be taught and renewed. Neither is a neutral window onto the past, but together they became part of how Murano’s craft was preserved and presented.",
    },
    { type: "h2", text: "Modern design works with tradition" },
    {
      type: "p",
      text: "In the twentieth century, designers collaborated with glassworks to explore how familiar techniques could produce new visual effects. The Metropolitan Museum catalogues Carlo Scarpa’s Venini piece [Rigati e Tessuti, no. 3976](https://www.metmuseum.org/art/collection/search/499940), made around 1942. Its coloured rods reinterpret mezza filigrana as a modern linear pattern. This is one documented object, not a summary of all Murano design, but it shows how technical knowledge could support invention as well as continuity.",
    },
    {
      type: "p",
      text: "The distinction is useful when looking at a contemporary piece. A historic technique may be carried forward, modified or combined with newer design choices. Calling something traditional should invite a closer question—what knowledge and process does it carry?—rather than imply that every form or recipe has remained identical for centuries.",
    },
    { type: "h2", text: "What the Murano mark certifies" },
    {
      type: "p",
      text: "The Vetro Artistico® Murano mark was established under Veneto Regional Law 70/1994. The [Veneto Region](https://www.regione.veneto.it/web/attivita-produttive/vetro-artistico-murano-inglese) and the [Promovetro consortium](https://promovetro.com/en/the-vetro-artistico-di-murano-mark-2/) describe it as a collective mark for artistic glass made on Murano according to the relevant production requirements. It is a practical way to check a declared island origin; it does not automatically establish the maker, date, artistic merit or market value of every object.",
    },
    {
      type: "p",
      text: "That distinction joins the six episodes of this series. Place, materials, techniques, labour and commerce all contribute to the history of Murano glass, but no single label can replace careful looking and reliable documentation. Start again with [the first episode on the island and its furnaces](/blog/history-of-murano-glass), or continue to explore the [pieces in our collection](/products) with these questions in mind.",
    },
    {
      type: "products",
      title: "Contemporary Murano glass from our collection",
      slugs: [
        "collana-notte-stellata-92b5fd",
        "bracciale-fiore-di-onice-1c6c6e",
        "orecchini-goccia-di-ghiaccio-51362e",
      ],
    },
    { type: "cta", text: "Explore the collection", href: "/products" },
  ],
  translations: {
    it: {
      title: "Vetro di Murano, VI: rinascita, design e tradizione viva",
      seoTitle: "La rinascita del vetro di Murano: dall’Ottocento al design",
      description:
        "La ripresa ottocentesca del vetro muranese, il dialogo con il design moderno e il significato del marchio Vetro Artistico® Murano.",
      primaryKeyword: "rinascita del vetro di Murano",
      secondaryKeywords: [
        "vetro di Murano nell’Ottocento",
        "storia del design muranese",
        "Carlo Scarpa e Venini",
        "marchio Vetro Artistico Murano",
      ],
      intro:
        "Spesso il vetro di Murano viene raccontato come una tradizione passata intatta dal Rinascimento a oggi. Le fonti storiche suggeriscono una vicenda più interessante: periodi di difficoltà, progetti di rinascita, nuove istituzioni e designer che hanno trattato le tecniche ereditate come materia per il cambiamento. Questo episodio conclusivo segue il percorso dall’Ottocento al presente e si chiede che cosa possa—e non possa—attestare un marchio di origine.",
      body: [
        {
          type: "facts",
          title: "La storia moderna in breve",
          items: [
            "Il Museo del Vetro colloca una significativa ripresa delle tecniche storiche fra il 1850 e il 1895, in un periodo segnato da collezionisti, maestri e mercati in trasformazione.",
            "Il Museo del Vetro fu fondato nel 1861; la scuola vetraria Abate Zanetti seguì nel 1862.",
            "Nel Novecento designer come Carlo Scarpa adattarono le tecniche di fornace a forme moderne, invece di limitarsi a riprodurre oggetti storici.",
            "Il marchio Vetro Artistico® Murano identifica origine regolamentata e produzione sull’isola; da solo non è una perizia indipendente sulla qualità o sulla data.",
          ],
        },
        { type: "h2", text: "La rinascita è un processo storico" },
        {
          type: "p",
          text: "La ricostruzione del Museo del [periodo di rinascita 1850–1895](https://museovetro.visitmuve.it/it/il-museo/percorsi-e-collezioni/vetro-xix-secolo/) descrive un rinnovato interesse per le tecniche storiche in una fase di cambiamenti economici e politici. Maestri, antiquari e collezionisti contribuirono a recuperare, reinterpretare e promuovere le forme del passato. Non si trattò di un semplice ritorno a un passato immutato: la rinascita rispondeva ai mercati contemporanei e a nuove idee sull’identità veneziana.",
        },
        {
          type: "p",
          text: "Anche le istituzioni contribuirono a rendere visibile il passato. Il [Museo del Vetro](https://museovetro.visitmuve.it/en/il-museo/museum/) fu fondato nel 1861 e la scuola Abate Zanetti aprì nel 1862. Un museo organizza gli oggetti in una storia; una scuola crea un luogo in cui i saperi possono essere insegnati e rinnovati. Nessuno dei due è una finestra neutrale sul passato, ma insieme divennero parte del modo in cui l’arte muranese veniva conservata e presentata.",
        },
        { type: "h2", text: "Il design moderno lavora con la tradizione" },
        {
          type: "p",
          text: "Nel Novecento i designer collaborarono con le fornaci per esplorare nuovi effetti visivi ottenuti da tecniche conosciute. Il Metropolitan Museum cataloga il pezzo Venini di Carlo Scarpa [Rigati e Tessuti, n. 3976](https://www.metmuseum.org/art/collection/search/499940), realizzato intorno al 1942. Le bacchette colorate reinterpretano la mezza filigrana come motivo lineare moderno. È un oggetto documentato, non il riassunto di tutto il design muranese, ma mostra come il sapere tecnico potesse sostenere l’invenzione oltre alla continuità.",
        },
        {
          type: "p",
          text: "Questa distinzione è utile anche quando si osserva un pezzo contemporaneo. Una tecnica storica può essere tramandata, modificata o combinata con nuove scelte di design. Definire qualcosa tradizionale dovrebbe invitare a chiedersi quali saperi e processi custodisca, invece di suggerire che ogni forma o ricetta sia rimasta identica per secoli.",
        },
        { type: "h2", text: "Che cosa certifica il marchio Murano" },
        {
          type: "p",
          text: "Il marchio Vetro Artistico® Murano è stato istituito dalla Legge Regionale del Veneto 70/1994. La [Regione del Veneto](https://www.regione.veneto.it/web/attivita-produttive/vetro-artistico-murano-inglese) e il [consorzio Promovetro](https://promovetro.com/en/the-vetro-artistico-di-murano-mark-2/) lo descrivono come marchio collettivo per il vetro artistico realizzato a Murano secondo i requisiti di produzione previsti. Aiuta a verificare una dichiarazione di origine sull’isola; non determina automaticamente autore, data, valore artistico o commerciale di ogni oggetto.",
        },
        {
          type: "p",
          text: "Questa distinzione riunisce i sei episodi. Luogo, materiali, tecniche, lavoro e commercio fanno tutti parte della storia del vetro di Murano, ma nessuna singola etichetta sostituisce l’osservazione e una documentazione attendibile. Puoi ricominciare dal [primo episodio sull’isola e le sue fornaci](/blog/history-of-murano-glass), oppure esplorare i [pezzi della nostra collezione](/products) tenendo a mente queste domande.",
        },
        {
          type: "products",
          title: "Vetro di Murano contemporaneo dalla nostra collezione",
          slugs: [
            "collana-notte-stellata-92b5fd",
            "bracciale-fiore-di-onice-1c6c6e",
            "orecchini-goccia-di-ghiaccio-51362e",
          ],
        },
        { type: "cta", text: "Esplora la collezione", href: "/products" },
      ],
    },
  },
  sources: [
    {
      ...MUVE_REVIVAL,
      usedFor:
        "The museum’s 1850–1895 chronology and its account of nineteenth-century revival, makers and historic techniques.",
      usedForIt:
        "La cronologia museale 1850–1895 e la ricostruzione della rinascita ottocentesca, dei maestri e delle tecniche storiche.",
    },
    {
      ...MUVE_MUSEUM_HISTORY,
      usedFor: "The founding of the Glass Museum in 1861 and the Abate Zanetti school in 1862.",
      usedForIt: "La fondazione del Museo del Vetro nel 1861 e della scuola Abate Zanetti nel 1862.",
    },
    {
      ...SCARPA_MET,
      usedFor:
        "The Metropolitan Museum’s catalogue record for Carlo Scarpa’s Venini Rigati e Tessuti, no. 3976, dated around 1942.",
      usedForIt:
        "La scheda del Metropolitan Museum per Rigati e Tessuti n. 3976 di Carlo Scarpa per Venini, datato intorno al 1942.",
    },
    {
      ...PROMOVETRO_MARK,
      usedFor:
        "The collective origin mark’s stated purpose and production requirements; the article distinguishes these from appraisal.",
      usedForIt:
        "La finalità dichiarata del marchio collettivo e i requisiti di produzione; l’articolo li distingue da una perizia.",
    },
    {
      ...VENETO_MARK,
      usedFor:
        "The regional description of the Vetro Artistico® Murano mark and its legal basis in Veneto Regional Law 70/1994.",
      usedForIt:
        "La descrizione regionale del marchio Vetro Artistico® Murano e la sua base normativa nella Legge Regionale 70/1994.",
    },
  ],
  related: ["history-of-murano-glass", "murano-glassmaking-techniques-filigrana-murrine"],
};
