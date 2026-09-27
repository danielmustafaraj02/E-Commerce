import type { Article } from "@/lib/journal/types";
import {
  MUVE_GALLERY_GUIDE,
  MUVE_GLOSSARY,
  MUVE_MEDIEVAL_TO_RENAISSANCE,
  MUVE_MURRINE,
  SCARPA_MET,
} from "./murano-glass-series-sources";

const series = {
  key: "murano-glass-reader",
  title: "Murano Glass: A Historical and Technical Reader",
  titleIt: "Il vetro di Murano: un percorso storico e tecnico",
  episode: 3,
  total: 6,
};

export const muranoGlassTechniques: Article = {
  slug: "murano-glassmaking-techniques-filigrana-murrine",
  title: "Murano Glass, Part III: Filigrana, Reticello and Murrine",
  seoTitle: "Murano Glass Techniques: Filigrana, Reticello, Murrine",
  description:
    "Learn how filigrana, reticello, rosetta and murrine are made, what their names describe, and how Murano techniques changed across centuries.",
  category: "craft",
  published: "2026-09-27",
  primaryKeyword: "Murano glass techniques",
  secondaryKeywords: [
    "filigrana glass",
    "reticello Murano glass",
    "murrine and millefiori",
    "rosetta glass cane",
  ],
  hero: {
    kind: "product",
    productSlug: "collana-gemme-miste-6e735f",
    alt: "Handmade necklace with coloured Murano glass beads",
    altIt: "Collana artigianale con perle colorate in vetro di Murano",
    rights: { credit: "Perla Murano Glass", license: "own-photography" },
  },
  series,
  intro:
    "Murano’s technique names are more than labels for decorative effects. Filigrana describes a way of building patterns into hot glass; reticello names a particular crossed structure; murrine begin as patterned canes cut into slices. Following the process behind each word reveals a craft that depends on timing, heat and coordinated work—and a history in which old forms were repeatedly adapted.",
  body: [
    {
      type: "facts",
      title: "A short technical glossary",
      items: [
        "Filigrana incorporates fine threads of lattimo or coloured glass into a clear gather using prepared canes.",
        "In retortoli the threads twist; in reticello the canes cross to form a net-like pattern.",
        "Rosetta canes are layered rods with a star-shaped cross-section; slices can be used for beads or millefiori decoration.",
        "Murrine are patterned glass slices assembled and reheated into a mosaic-like surface or object.",
      ],
    },
    { type: "h2", text: "Filigrana: pattern built into the glass" },
    {
      type: "p",
      text: "Filigrana is not paint applied to a finished vessel. Glassworkers prepare canes containing threads of lattimo or coloured glass, then arrange and fuse them with clear glass while the material is hot. The [Murano Glass Museum’s technical glossary](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) distinguishes filigrana a retortoli, where the threads are twisted, from reticello, where the canes cross. The crossing creates a net-like design and can trap small bubbles at the intersections.",
    },
    {
      type: "p",
      text: "The museum dates the invention of filigrana to the first half of the sixteenth century, while its gallery guide associates the technique with Filippo Catani della Sirena around 1527. Such dates name a historical attribution, not a surviving patent or a modern workshop manual. The important technical point is that the pattern is assembled from prepared canes and must be fused while the glass remains workable.",
    },
    { type: "h2", text: "Rosetta and millefiori: from cane to pattern" },
    {
      type: "p",
      text: "A rosetta cane is made from successive layers of differently coloured glass shaped in a mould. Its cross-section reveals concentric rings and often a star. When a cane is pulled longer and cut into short slices, the pattern repeats in each section. The slices can become beads, or they can be embedded in a hot gather to create a millefiori surface. The museum glossary describes millefiori as a decoration that makes a vessel look like a field of flowers; rosetta is one cane design used to produce that effect, not a synonym for every millefiori pattern.",
    },
    { type: "h2", text: "Murrine: a mosaic that can be reheated" },
    {
      type: "p",
      text: "Murrine begin as short sections of patterned cane arranged while cold. The composition is gradually reheated until its elements soften and join, then shaped or attached to another glass form. The Glass Museum traces the technique to Roman precedents and describes its revival in Murano in the nineteenth century. Its account follows how makers used millefiori canes to revive historic effects while inventing new designs, including miniature portraits.",
    },
    {
      type: "p",
      text: "These names are useful because they connect appearance to process. But they do not identify an object’s maker, date or place of production on their own. The twentieth-century designer Carlo Scarpa, for example, reworked mezza filigrana in a Venini piece catalogued by [The Metropolitan Museum of Art](https://www.metmuseum.org/art/collection/search/499940): instead of the traditional clear rods, he used coloured rods to create a new linear texture. A technique can therefore remain recognisable while its design changes.",
    },
    {
      type: "p",
      text: "For the materials behind these processes, continue to [episode two on cristallo and lattimo](/blog/murano-glass-materials-cristallo-lattimo). The next episode widens the lens from the bench to the people and rules that shaped production in [Murano’s glasshouses](/blog/murano-glassmakers-guilds-labor). For the island’s longer history, return to [episode one](/blog/history-of-murano-glass).",
    },
    {
      type: "products",
      title: "Contemporary pieces shaped by glass technique",
      slugs: [
        "collana-gemme-miste-6e735f",
        "orecchini-giardino-pastello-d650a2",
        "bracciale-laguna-azzurra-5ae8cc",
      ],
    },
    { type: "cta", text: "Explore handmade Murano glass jewellery", href: "/products" },
  ],
  translations: {
    it: {
      title: "Vetro di Murano, III: filigrana, reticello e murrine",
      seoTitle: "Tecniche del vetro di Murano: filigrana e murrine",
      description:
        "Come si realizzano filigrana, reticello, rosetta e murrine, cosa descrivono i loro nomi e come le tecniche muranesi sono cambiate nei secoli.",
      primaryKeyword: "tecniche del vetro di Murano",
      secondaryKeywords: [
        "vetro a filigrana",
        "reticello di Murano",
        "murrine e millefiori",
        "canna rosetta vetro",
      ],
      intro:
        "I nomi delle tecniche muranesi non sono semplici etichette decorative. La filigrana descrive un modo di costruire motivi nel vetro caldo; il reticello indica una struttura incrociata; le murrine nascono da canne decorate, tagliate a fette. Seguire il processo dietro ogni termine rivela un’arte che dipende da tempi, calore e lavoro coordinato, e una storia in cui le forme del passato sono state continuamente reinterpretate.",
      body: [
        {
          type: "facts",
          title: "Un breve glossario tecnico",
          items: [
            "La filigrana incorpora fili sottili di lattimo o di vetro colorato in una massa trasparente, usando canne preparate in precedenza.",
            "Nel retortoli i fili sono ritorti; nel reticello le canne si incrociano formando una trama.",
            "Le canne rosetta sono bacchette stratificate con una sezione a stella; le fette possono diventare perle o decori millefiori.",
            "Le murrine sono sezioni di vetro decorato, composte e riscaldate per formare una superficie o un oggetto simile a un mosaico.",
          ],
        },
        { type: "h2", text: "Filigrana: un motivo costruito nel vetro" },
        {
          type: "p",
          text: "La filigrana non è una decorazione dipinta sull’oggetto finito. I vetrai preparano canne che contengono fili di lattimo o di vetro colorato, poi li dispongono e li fondono con il vetro trasparente mentre è ancora caldo. Il [glossario tecnico del Museo del Vetro di Murano](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) distingue la filigrana a retortoli, in cui i fili sono ritorti, dal reticello, in cui le canne si incrociano. L’intreccio forma una rete e può intrappolare piccole bolle nei punti di intersezione.",
        },
        {
          type: "p",
          text: "Il Museo colloca l’invenzione della filigrana nella prima metà del Cinquecento; la sua guida alle sale la attribuisce a Filippo Catani della Sirena intorno al 1527. Queste date sono attribuzioni storiche, non un brevetto conservato né un manuale contemporaneo di fornace. Il punto tecnico è che il motivo nasce da canne preparate in precedenza e deve essere fuso quando il vetro è ancora lavorabile.",
        },
        { type: "h2", text: "Rosetta e millefiori: dalla canna al motivo" },
        {
          type: "p",
          text: "Una canna rosetta si ottiene sovrapponendo strati di vetro di colori diversi e modellandoli in uno stampo. La sezione rivela anelli concentrici e spesso una stella. Quando la canna viene allungata e tagliata in brevi segmenti, il motivo si ripete in ogni sezione. Queste fette possono diventare perle oppure essere incorporate in una massa calda per creare un decoro millefiori. Il glossario del Museo del Vetro descrive il millefiori come una decorazione che ricorda un campo fiorito: la rosetta è uno dei disegni di canna usati per ottenerlo, non un sinonimo di ogni motivo millefiori.",
        },
        { type: "h2", text: "Murrine: il mosaico che torna al calore" },
        {
          type: "p",
          text: "Le murrine cominciano con brevi sezioni di canna decorata, disposte a freddo. La composizione viene riscaldata gradualmente finché gli elementi si ammorbidiscono e si uniscono, poi viene modellata o applicata a un’altra forma di vetro. Il Museo del Vetro ne rintraccia i precedenti nell’antichità romana e descrive la ripresa della tecnica a Murano nell’Ottocento. La sua ricostruzione mostra come i vetrai utilizzarono canne millefiori per riprendere effetti antichi e inventare nuovi disegni, compresi ritratti in miniatura.",
        },
        {
          type: "p",
          text: "Questi nomi sono utili perché collegano l’aspetto di un oggetto al processo che l’ha creato. Da soli, però, non ne determinano autore, data o luogo di produzione. Il designer novecentesco Carlo Scarpa, per esempio, reinterpretò la mezza filigrana in un pezzo Venini catalogato dal [Metropolitan Museum of Art](https://www.metmuseum.org/art/collection/search/499940): al posto delle tradizionali canne trasparenti usò bacchette colorate per ottenere una nuova trama lineare. Una tecnica può quindi restare riconoscibile mentre il disegno cambia.",
        },
        {
          type: "p",
          text: "Per i materiali alla base di questi processi, continua con [il secondo episodio su cristallo e lattimo](/blog/murano-glass-materials-cristallo-lattimo). Nel prossimo allargheremo lo sguardo dal banco di lavoro alle persone e alle regole che organizzavano la produzione nelle [fornaci di Murano](/blog/murano-glassmakers-guilds-labor). Per la storia più ampia dell’isola, torna al [primo episodio](/blog/history-of-murano-glass).",
        },
        {
          type: "products",
          title: "Creazioni contemporanee e tecniche del vetro",
          slugs: [
            "collana-gemme-miste-6e735f",
            "orecchini-giardino-pastello-d650a2",
            "bracciale-laguna-azzurra-5ae8cc",
          ],
        },
        { type: "cta", text: "Scopri i gioielli artigianali in vetro di Murano", href: "/products" },
      ],
    },
  },
  sources: [
    {
      ...MUVE_GLOSSARY,
      usedFor:
        "Definitions of filigrana, retortoli, reticello, rosetta canes and millefiori, with the process behind each term.",
      usedForIt:
        "Definizioni di filigrana, retortoli, reticello, canne rosetta e millefiori, con descrizione dei relativi processi.",
    },
    {
      ...MUVE_MEDIEVAL_TO_RENAISSANCE,
      usedFor:
        "The museum’s account of the sixteenth-century emergence and technical construction of filigree glass.",
      usedForIt:
        "La ricostruzione museale dell’affermazione della filigrana nel Cinquecento e della sua costruzione tecnica.",
    },
    {
      ...MUVE_GALLERY_GUIDE,
      usedFor:
        "The attribution of early filigree to Filippo Catani della Sirena around 1527 and descriptions of historic objects.",
      usedForIt:
        "L’attribuzione della prima filigrana a Filippo Catani della Sirena intorno al 1527 e la descrizione di oggetti storici.",
    },
    {
      ...MUVE_MURRINE,
      usedFor:
        "The assembly and reheating of murrine, their Roman antecedents, nineteenth-century revival and millefiori cane portraits.",
      usedForIt:
        "La composizione e la rifusione delle murrine, i precedenti romani, la ripresa ottocentesca e i ritratti in canna millefiori.",
    },
    {
      ...SCARPA_MET,
      usedFor:
        "The museum catalogue’s description of Carlo Scarpa’s modern adaptation of mezza filigrana in a Venini piece.",
      usedForIt:
        "La scheda museale sulla reinterpretazione novecentesca della mezza filigrana di Carlo Scarpa per Venini.",
    },
  ],
  related: ["history-of-murano-glass", "murano-glass-materials-cristallo-lattimo"],
};
