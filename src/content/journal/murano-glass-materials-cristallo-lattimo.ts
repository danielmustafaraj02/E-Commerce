import type { Article } from "@/lib/journal/types";
import {
  DUPRE_GLASS,
  MEDIEVAL_GLASS_ANALYSIS,
  MUVE_GLASS_COMPOUNDS,
  MUVE_GLOSSARY,
  NERI_ART_OF_GLASS,
  VERITA_SODA_GLASS,
} from "./murano-glass-series-sources";

const series = {
  key: "murano-glass-reader",
  title: "Murano Glass: A Historical and Technical Reader",
  titleIt: "Il vetro di Murano: un percorso storico e tecnico",
  episode: 2,
  total: 6,
};

export const muranoGlassMaterials: Article = {
  slug: "murano-glass-materials-cristallo-lattimo",
  title: "Murano Glass, Part II: Cristallo, Lattimo and the Material",
  seoTitle: "Murano Cristallo and Lattimo: What the Terms Mean",
  description:
    "A material-led guide to Murano cristallo and lattimo, historic recipes, glass chemistry and why Venetian cristallo is not modern lead crystal.",
  category: "craft",
  published: "2026-09-27",
  primaryKeyword: "Murano cristallo and lattimo",
  secondaryKeywords: [
    "what is Murano cristallo",
    "lattimo glass meaning",
    "Venetian glass composition",
    "Murano glass materials",
  ],
  hero: {
    kind: "file",
    src: "/hero/handmade-red-murano-glass-necklace.jpg",
    alt: "Red and clear Murano glass beads photographed for Perla Murano Glass",
    altIt: "Perle rosse e trasparenti in vetro di Murano fotografate per Perla Murano Glass",
    rights: { credit: "Perla Murano Glass", license: "own-photography" },
  },
  series,
  intro:
    "“Murano glass” names a place and a living body of practice, not one chemical formula. The words cristallo and lattimo refer to particular historical kinds of glass, each made possible by choices about ingredients, heat and working time. Reading them carefully helps separate historical material from modern advertising language—and shows why glass history is also a history of supply and experiment.",
  body: [
    {
      type: "facts",
      title: "Terms to keep distinct",
      items: [
        "Cristallo was a clear Venetian soda glass, carefully refined and decolourised; it is not the same material as modern lead crystal.",
        "Lattimo is opaque white glass, made opaque with tin-bearing compounds according to the Murano Glass Museum glossary.",
        "Historic recipes changed by place, period and workshop; an object’s appearance alone cannot disclose its full composition.",
      ],
    },
    { type: "h2", text: "Cristallo was not lead crystal" },
    {
      type: "p",
      text: "In Murano’s historical vocabulary, cristallo means a clear, bright glass made from selected and purified materials. The [Glass Museum’s glossary](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) describes it as decolourised with manganese dioxide and distinguishes its composition from Bohemian and English crystal. The term is easy to misread today: Venetian cristallo was a soda glass, not the lead crystal commonly meant by “crystal” in modern retail.",
    },
    {
      type: "p",
      text: "This clarity was a technical achievement, not a single miraculous ingredient. Marco Verità’s chapter on [Venetian soda glass](https://doi.org/10.1002/9781118314234.ch24) compares archaeological compositions with historical sources across many centuries. It treats glass chemistry as a changing record of raw materials and workshop practice. Analyses of medieval vessels from Murano likewise identify more than one silica source, even among objects that share evidence of a likely Levantine plant-ash flux.",
    },
    { type: "h2", text: "Lattimo: opaque white made in glass" },
    {
      type: "p",
      text: "Lattimo takes its name from latte, milk. It is an opaque white glass whose surface can suggest porcelain, but the resemblance is visual rather than material. The museum glossary identifies tin dioxide as the opacifier, introduced through tin-bearing ingredients. That distinction matters: “white glass” is not one recipe, and appearance cannot tell us whether an object is lattimo, enamelled glass or another opaque composition without looking at its structure and evidence.",
    },
    { type: "h2", text: "Recipes, records and what they cannot tell us" },
    {
      type: "p",
      text: "Antonio Neri’s [L’Arte Vetraria](https://digital.sciencehistory.org/works/hq37vp32z/viewer/5t34sk447), printed in 1612, is an important early book about making and colouring glass. It records knowledge available in its author’s world; it should not be treated as a universal Murano recipe book for every century. Recipes describe ingredients, but successful glass also depended on the quality of raw materials, furnace conditions and decisions made by experienced workers.",
    },
    {
      type: "p",
      text: "The point is visible in the vocabulary itself. The Museum’s [techniques and compositions guide](https://museovetro.visitmuve.it/it/il-museo/approfondimenti/lavorazioni-e-composti-vetro/) defines cristallo, filigrana and other terms by both composition and method. Historian Sven Dupré’s peer-reviewed essay [“The Nature of Glass”](https://doi.org/10.1086/724806) offers a useful broader frame: glass is a family of materials whose properties depend on knowledge, processing and the supply chains that bring ingredients together.",
    },
    {
      type: "p",
      text: "A material name is therefore a starting point, not a full attribution. In the next episode, we move from composition to process and look at how [filigrana, reticello and murrine](/blog/murano-glassmaking-techniques-filigrana-murrine) are built into the glass. For the longer history of the island and its furnaces, return to [episode one](/blog/history-of-murano-glass).",
    },
    {
      type: "products",
      title: "Contemporary Murano glass",
      slugs: [
        "collana-notte-stellata-92b5fd",
        "bracciale-fiore-di-onice-1c6c6e",
        "orecchini-goccia-di-ghiaccio-51362e",
      ],
    },
    { type: "cta", text: "Explore contemporary Murano glass jewellery", href: "/products" },
  ],
  translations: {
    it: {
      title: "Vetro di Murano, II: cristallo, lattimo e materia",
      seoTitle: "Cristallo e lattimo di Murano: significato e differenze",
      description:
        "Una guida a cristallo e lattimo muranesi, alle ricette storiche e alla chimica del vetro. Il cristallo veneziano non è il moderno cristallo al piombo.",
      primaryKeyword: "cristallo e lattimo di Murano",
      secondaryKeywords: [
        "che cos’è il cristallo di Murano",
        "significato del vetro lattimo",
        "composizione del vetro veneziano",
        "materie prime vetro di Murano",
      ],
      intro:
        "“Vetro di Murano” indica un luogo e un insieme vivo di pratiche, non una sola formula chimica. Cristallo e lattimo sono termini storici per specifici tipi di vetro, resi possibili da scelte di ingredienti, temperatura e tempi di lavorazione. Capirli aiuta a distinguere i materiali storici dal linguaggio commerciale odierno e mostra che la storia del vetro è anche storia di approvvigionamento e sperimentazione.",
      body: [
        {
          type: "facts",
          title: "Termini da non confondere",
          items: [
            "Il cristallo era un vetro sodico veneziano trasparente, depurato e decolorato; non coincide con il moderno cristallo al piombo.",
            "Il lattimo è un vetro bianco opaco, reso tale con composti contenenti stagno, secondo il glossario del Museo del Vetro di Murano.",
            "Le ricette storiche variavano nel tempo, nei luoghi e nelle fornaci: l’aspetto da solo non rivela tutta la composizione di un oggetto.",
          ],
        },
        { type: "h2", text: "Il cristallo veneziano non è cristallo al piombo" },
        {
          type: "p",
          text: "Nel lessico storico muranese, cristallo indica un vetro trasparente e brillante, ottenuto con materie selezionate e depurate. Il [glossario del Museo del Vetro](https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/) lo descrive come decolorato con biossido di manganese e ne distingue la composizione da quella dei cristalli boemi e inglesi. È facile fraintendere il termine oggi: il cristallo veneziano era un vetro sodico, non il cristallo al piombo a cui spesso ci si riferisce nel commercio contemporaneo.",
        },
        {
          type: "p",
          text: "Questa trasparenza era un risultato tecnico, non l’effetto di un unico ingrediente miracoloso. Il capitolo di Marco Verità sul [vetro sodico veneziano](https://doi.org/10.1002/9781118314234.ch24) confronta composizioni archeologiche e fonti storiche lungo molti secoli. La chimica del vetro diventa così una traccia variabile delle materie prime e delle pratiche di fornace. Anche le analisi dei vetri medievali di Murano identificano più fonti di silice, persino fra oggetti che condividono tracce di un probabile fondente a base di cenere vegetale levantina.",
        },
        { type: "h2", text: "Lattimo: il bianco opaco del vetro" },
        {
          type: "p",
          text: "Lattimo deriva da latte. È un vetro bianco opaco, la cui superficie può ricordare la porcellana, ma la somiglianza è visiva, non materiale. Il glossario del museo indica il biossido di stagno come agente opacizzante, introdotto attraverso composti contenenti stagno. La distinzione è importante: il “vetro bianco” non corrisponde a una sola ricetta, e il solo aspetto non permette di stabilire se un oggetto sia lattimo, vetro smaltato o un’altra composizione opaca senza studiarne struttura e documentazione.",
        },
        { type: "h2", text: "Ricette, documenti e i loro limiti" },
        {
          type: "p",
          text: "L’Arte Vetraria di Antonio Neri, stampata nel 1612, è uno dei primi libri importanti dedicati alla produzione e alla colorazione del vetro. L’edizione digitalizzata è consultabile presso lo [Science History Institute](https://digital.sciencehistory.org/works/hq37vp32z/viewer/5t34sk447). Il testo documenta conoscenze del mondo dell’autore: non va trattato come un ricettario universale delle fornaci di Murano valido per ogni secolo. Le ricette descrivono gli ingredienti, ma il risultato dipendeva anche dalla qualità delle materie prime, dal forno e dalle decisioni di lavoratori esperti.",
        },
        {
          type: "p",
          text: "Lo si vede anche nel lessico tecnico. La guida del Museo alle [lavorazioni e ai composti del vetro](https://museovetro.visitmuve.it/it/il-museo/approfondimenti/lavorazioni-e-composti-vetro/) definisce cristallo, filigrana e altri termini tenendo insieme composizione e metodo. Nel saggio scientifico [“The Nature of Glass”](https://doi.org/10.1086/724806), lo storico Sven Dupré propone una cornice più ampia: il vetro è una famiglia di materiali le cui proprietà dipendono da conoscenze, processi e reti di approvvigionamento.",
        },
        {
          type: "p",
          text: "Il nome di un materiale è dunque un punto di partenza, non un’attribuzione completa. Nel prossimo episodio passeremo dalla composizione alle lavorazioni per capire come si costruiscono [filigrana, reticello e murrine](/blog/murano-glassmaking-techniques-filigrana-murrine). Per la storia dell’isola e delle sue fornaci, torna al [primo episodio](/blog/history-of-murano-glass).",
        },
        {
          type: "products",
          title: "Vetro di Murano contemporaneo",
          slugs: [
            "collana-notte-stellata-92b5fd",
            "bracciale-fiore-di-onice-1c6c6e",
            "orecchini-goccia-di-ghiaccio-51362e",
          ],
        },
        { type: "cta", text: "Scopri i gioielli contemporanei in vetro di Murano", href: "/products" },
      ],
    },
  },
  sources: [
    {
      ...MUVE_GLOSSARY,
      usedFor:
        "The historical definition and composition of cristallo and lattimo, including the distinction from Bohemian and English crystal.",
      usedForIt:
        "La definizione storica e la composizione di cristallo e lattimo, compresa la distinzione dal cristallo boemo e inglese.",
    },
    {
      ...VERITA_SODA_GLASS,
      usedFor:
        "Comparative analysis of Venetian soda-glass compositions and the use of archaeological and historical evidence to study changing recipes.",
      usedForIt:
        "Confronto fra composizioni dei vetri sodici veneziani e uso di prove archeologiche e storiche per studiare il cambiamento delle ricette.",
    },
    {
      ...MEDIEVAL_GLASS_ANALYSIS,
      usedFor:
        "The chemical variation in medieval vessels from Murano and the limits of inferring an object’s workshop from composition alone.",
      usedForIt:
        "La variabilità chimica dei recipienti medievali di Murano e i limiti nell’individuare la fornace di un oggetto basandosi solo sulla composizione.",
    },
    {
      ...NERI_ART_OF_GLASS,
      usedFor:
        "A primary 1612 printed witness to early modern glassmaking knowledge; treated as period evidence rather than a timeless Murano formula book.",
      usedForIt:
        "Una fonte primaria a stampa del 1612 sulle conoscenze vetrarie della prima età moderna; considerata come testimonianza storica, non come ricettario muranese universale.",
    },
    {
      ...MUVE_GLASS_COMPOUNDS,
      usedFor:
        "The museum’s definitions of cristallo, filigree and other glass types by composition and process.",
      usedForIt:
        "Le definizioni museali di cristallo, filigrana e altri tipi di vetro secondo composizione e lavorazione.",
    },
    {
      ...DUPRE_GLASS,
      usedFor:
        "A peer-reviewed material-history framework for connecting glass properties, practical knowledge and supply networks.",
      usedForIt:
        "Una prospettiva scientifica di storia materiale che collega proprietà del vetro, saperi pratici e reti di approvvigionamento.",
    },
  ],
  related: ["history-of-murano-glass", "murano-glassmaking-techniques-filigrana-murrine"],
};
