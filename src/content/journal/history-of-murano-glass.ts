import type { Article } from "@/lib/journal/types";
import { OWN_PHOTO } from "./sources";

const series = {
  key: "murano-glass-reader",
  title: "Murano Glass: A Historical and Technical Reader",
  titleIt: "Il vetro di Murano: un percorso storico e tecnico",
  episode: 1,
  total: 6,
};

export const historyOfMuranoGlass: Article = {
  slug: "history-of-murano-glass",
  title: "Murano Glass, Part I: How the Island Became Its Home",
  seoTitle: "History of Murano Glass: Why the Island Matters",
  description:
    "A source-led history of Murano glass: what the 1291 decree did, what medieval glass can tell us, and why the island was not the craft’s starting point.",
  category: "history",
  published: "2026-09-24",
  updated: "2026-09-27",
  primaryKeyword: "history of murano glass",
  secondaryKeywords: [
    "Murano glass origins",
    "1291 Murano glass decree",
    "medieval Venetian glass",
    "glassmaking in Venice",
  ],
  hero: {
    kind: "file",
    src: "/blog/venice-canal-bridge-gondola-lion-flag.jpg",
    alt: "A Venice canal with a brick bridge and the red-and-gold flag of the Lion of Saint Mark",
    altIt: "Un canale veneziano con un ponte in mattoni e la bandiera rosso-oro del Leone di San Marco",
    rights: OWN_PHOTO,
  },
  series,
  intro:
    "Murano did not invent glass, and 1291 was not the beginning of Venetian glassmaking. It was a turning point in where the city permitted furnaces to operate. Read alongside archaeology and the legal record, that familiar date opens a more interesting story: one about regulation, materials moving across the Mediterranean, and an island whose craft grew through both local skill and long-distance exchange.",
  body: [
    {
      type: "facts",
      title: "What the evidence supports",
      items: [
        "Glassmaking was already established in the Venetian lagoon before the late thirteenth century.",
        "The 1291 measure targeted furnaces in Venice; it did not create glassmaking on Murano.",
        "Chemical analyses of 61 vessels found at the Basilica of Santi Maria e Donato show several raw-material signatures, including likely Levantine ash.",
        "The analyses cannot, by themselves, prove that every vessel was made on Murano.",
      ],
    },
    { type: "h2", text: "Murano was a centre, not a beginning" },
    {
      type: "p",
      text: "Glass was an old technology by the time Murano became its best-known European centre. The more specific question is when glassmaking took root in the Venetian lagoon, and how it developed there. A useful correction to the popular origin story comes from a [2021 archaeometric study](https://doi.org/10.1016/j.jasrep.2021.102981) of 61 glass vessels recovered at the Basilica of Santi Maria e Donato. The vessels date from the twelfth to fifteenth centuries. Their chemical composition points to the use of Levantine plant ash and more than one silica source; the authors consider both local production and the movement of raw glass or finished vessels possible.",
    },
    {
      type: "p",
      text: "That distinction matters. The study offers material evidence of glass circulating through Murano over a period that straddles 1291, but chemistry does not identify a workshop or a glassmaker. The authors explicitly leave open whether particular pieces were made on the island or arrived through trade. This is a stronger historical account than assigning every surviving medieval object to a named furnace without evidence.",
    },
    { type: "h2", text: "What changed in 1291?" },
    {
      type: "p",
      text: "The date is commonly shortened to “Venice moved all its glassmakers to Murano to prevent fires.” W. Patrick McCray’s [doctoral study of Renaissance Venetian glass](https://fieldnotes.makingandknowing.org/mainSpace/files/mccray%20venetian%20glass%20diss.pdf) gives a more precise account of the measure of 8 November 1291: furnaces operating in Venice, especially around Rialto, were to be destroyed, while furnaces could be established elsewhere in the lagoon. His account also notes that the following year brought an exception for small furnaces making non-blown objects, under distance conditions. The legal record therefore describes a restriction on furnaces, not a single mass relocation of every worker or every kind of glass production.",
    },
    {
      type: "p",
      text: "Fire risk is the standard explanation for the restriction, and it is plausible in a dense city where furnaces ran at high heat. Yet the decree also belongs to a wider system of rules around a valuable craft: where production could take place, what could be exported, and how the state oversaw a skilled industry. McCray’s broader [study of glassmaking as a social and economic system](https://books.google.com/books?id=i3NBDgAAQBAJ) is useful here because it treats technical change, consumer demand and regulation together, rather than as separate stories.",
    },
    { type: "h2", text: "A lagoon connected to distant materials" },
    {
      type: "p",
      text: "The laboratory evidence also complicates the idea of Murano as a self-contained tradition. The medieval vessels studied by Occari, Freestone and Fenwick share a likely Levantine ash source, while their silica signatures vary. This does not mean that Venetian glass was simply imported or copied. It shows that local production could depend on materials, knowledge and objects moving through Mediterranean networks. Historian Sven Dupré makes a related point in [“The Nature of Glass”](https://doi.org/10.1086/724806): glass is not one fixed substance, and its history follows the supply chains and practical knowledge that make different kinds of glass possible.",
    },
    {
      type: "p",
      text: "Murano’s historical importance lies in how a specialised community developed within those networks: working materials, refining techniques, responding to markets and passing on skills. The next episode looks more closely at the material itself, from [cristallo and lattimo to the limits of the word “crystal”](/blog/murano-glass-materials-cristallo-lattimo). For the practical side of the craft, continue to [the island’s glassmaking techniques](/blog/murano-glassmaking-techniques-filigrana-murrine).",
    },
    {
      type: "products",
      title: "Contemporary pieces in Murano glass",
      slugs: [
        "collana-turchese-sfaccettato-8e4504",
        "bracciale-laguna-azzurra-5ae8cc",
        "orecchini-blu-profondo-fa4c96",
      ],
    },
    {
      type: "cta",
      text: "Explore contemporary Murano glass jewellery",
      href: "/products",
    },
  ],
  translations: {
    it: {
      title: "Vetro di Murano, I: perché il vetro arrivò sull’isola",
      seoTitle: "Storia del vetro di Murano: perché conta l’isola",
      description:
        "Una storia documentata del vetro di Murano: cosa stabilì il decreto del 1291, cosa rivela il vetro medievale e perché l’isola non fu l’inizio dell’arte vetraria.",
      primaryKeyword: "storia del vetro di Murano",
      secondaryKeywords: [
        "origini del vetro di Murano",
        "decreto del 1291 vetro di Murano",
        "vetro veneziano medievale",
        "storia delle fornaci veneziane",
      ],
      intro:
        "Murano non ha inventato il vetro, e il 1291 non segna l’inizio della produzione vetraria veneziana. Fu un passaggio decisivo per stabilire dove potessero lavorare le fornaci della città. Letta insieme all’archeologia e ai documenti normativi, quella data apre una storia più interessante: fatta di regolamenti, materiali che attraversavano il Mediterraneo e di un’isola la cui arte crebbe grazie alle competenze locali e agli scambi a lunga distanza.",
      body: [
        {
          type: "facts",
          title: "Cosa documentano le fonti",
          items: [
            "Nella laguna veneziana si lavorava il vetro già prima della fine del XIII secolo.",
            "Il provvedimento del 1291 riguardava le fornaci di Venezia: non diede origine alla lavorazione del vetro a Murano.",
            "Le analisi chimiche di 61 recipienti rinvenuti nella Basilica dei Santi Maria e Donato mostrano diverse firme delle materie prime, fra cui probabile cenere vegetale levantina.",
            "Le analisi, da sole, non dimostrano che ogni recipiente sia stato prodotto a Murano.",
          ],
        },
        { type: "h2", text: "Murano fu un centro, non l’inizio" },
        {
          type: "p",
          text: "Quando Murano divenne il centro vetrario europeo più noto, la lavorazione del vetro era già una tecnologia antica. La domanda storica più precisa è quando si radicò nella laguna veneziana e come si sviluppò. Una correzione utile alla storia delle origini più ripetuta viene da uno [studio archeometrico del 2021](https://doi.org/10.1016/j.jasrep.2021.102981), basato su 61 recipienti in vetro rinvenuti nella Basilica dei Santi Maria e Donato. Gli oggetti risalgono fra il XII e il XV secolo. La loro composizione chimica indica l’uso di cenere vegetale levantina e di più fonti di silice; gli autori considerano possibili sia la produzione locale sia la circolazione di vetro grezzo o di recipienti finiti.",
        },
        {
          type: "p",
          text: "La distinzione è importante. Lo studio documenta materiali in vetro circolati a Murano in un periodo che comprende il 1291, ma la chimica non identifica una fornace né un maestro. Gli autori lasciano esplicitamente aperta la possibilità che alcuni oggetti siano stati prodotti sull’isola e che altri vi siano arrivati attraverso il commercio. È una ricostruzione storica più solida che attribuire ogni reperto medievale a una fornace precisa senza prove.",
        },
        { type: "h2", text: "Che cosa cambiò nel 1291?" },
        {
          type: "p",
          text: "La data viene spesso riassunta così: “Venezia trasferì tutti i vetrai a Murano per evitare gli incendi”. Lo [studio dottorale di W. Patrick McCray sulla vetraria veneziana rinascimentale](https://fieldnotes.makingandknowing.org/mainSpace/files/mccray%20venetian%20glass%20diss.pdf) descrive con maggiore precisione il provvedimento dell’8 novembre 1291: le fornaci attive a Venezia, soprattutto nella zona di Rialto, dovevano essere distrutte; nuove fornaci potevano essere costruite in altre parti della laguna. McCray segnala inoltre che l’anno successivo fu introdotta un’eccezione per le piccole fornaci che producevano oggetti non soffiati, a determinate distanze dalle abitazioni. I documenti parlano quindi di una restrizione sulle fornaci, non del trasferimento in blocco di ogni lavoratore o di ogni tipo di lavorazione del vetro.",
        },
        {
          type: "p",
          text: "Il rischio d’incendio è la spiegazione più diffusa del provvedimento ed è plausibile in una città densa, dove le fornaci lavoravano ad alte temperature. Ma il decreto appartiene anche a un sistema più ampio di regole su un’attività preziosa: dove si poteva produrre, quali materiali si potevano esportare e come lo Stato controllava un settore specializzato. Il più ampio [studio di McCray sulla vetraria come sistema sociale ed economico](https://books.google.com/books?id=i3NBDgAAQBAJ) è utile proprio perché considera insieme cambiamento tecnico, domanda e regolamentazione.",
        },
        { type: "h2", text: "Una laguna legata a materie prime lontane" },
        {
          type: "p",
          text: "Anche le analisi di laboratorio complicano l’idea di una tradizione muranese isolata. I vetri medievali studiati da Occari, Freestone e Fenwick condividono una probabile fonte di cenere levantina, mentre le firme della silice variano. Questo non significa che il vetro veneziano fosse semplicemente importato o copiato. Indica che la produzione locale poteva dipendere da materiali, conoscenze e oggetti in movimento attraverso le reti mediterranee. In [“The Nature of Glass”](https://doi.org/10.1086/724806), lo storico Sven Dupré formula un’idea affine: il vetro non è una sostanza unica e immutabile, e la sua storia segue le filiere e i saperi pratici che rendono possibili tipi diversi di vetro.",
        },
        {
          type: "p",
          text: "L’importanza storica di Murano sta nel modo in cui una comunità specializzata si sviluppò all’interno di queste reti: lavorando i materiali, perfezionando le tecniche, rispondendo ai mercati e trasmettendo competenze. Nel prossimo episodio approfondiamo la materia, dal [cristallo e dal lattimo ai significati del termine “cristallo”](/blog/murano-glass-materials-cristallo-lattimo). Per le tecniche di bottega, continua con [filigrana, murrine e altre lavorazioni](/blog/murano-glassmaking-techniques-filigrana-murrine).",
        },
        {
          type: "products",
          title: "Creazioni contemporanee in vetro di Murano",
          slugs: [
            "collana-turchese-sfaccettato-8e4504",
            "bracciale-laguna-azzurra-5ae8cc",
            "orecchini-blu-profondo-fa4c96",
          ],
        },
        {
          type: "cta",
          text: "Scopri i gioielli contemporanei in vetro di Murano",
          href: "/products",
        },
      ],
    },
  },
  sources: [
    {
      title: "Vetro di Murano",
      publisher: "Wikipedia, l’enciclopedia libera",
      url: "https://it.wikipedia.org/wiki/Vetro_di_Murano",
      usedFor:
        "Used as a map of topics and bibliography only; historical claims in this article were checked against the research and museum sources below.",
      usedForIt:
        "Usata solo come mappa dei temi e della bibliografia; le affermazioni storiche dell’articolo sono state verificate sulle ricerche e sulle fonti museali elencate sotto.",
      accessed: "2026-09-27",
      kind: "reference",
    },
    {
      title: "The Culture and Technology of Glass in Renaissance Venice",
      publisher: "PhD dissertation, University of Arizona",
      url: "https://fieldnotes.makingandknowing.org/mainSpace/files/mccray%20venetian%20glass%20diss.pdf",
      author: "W. Patrick McCray",
      published: "1996",
      locator: "pp. 167–168",
      usedFor:
        "The 8 November 1291 furnace measure, its scope, the following year’s exception for small furnaces, and evidence of glassmaking on Murano before the decree.",
      usedForIt:
        "Il provvedimento sulle fornaci dell’8 novembre 1291, la sua portata, l’eccezione dell’anno successivo per le piccole fornaci e le prove di lavorazioni a Murano precedenti al decreto.",
      accessed: "2026-09-27",
      kind: "scholarly",
    },
    {
      title: "Raw materials and technology of Medieval Glass from Venice: The Basilica of SS. Maria e Donato in Murano",
      publisher: "Journal of Archaeological Science: Reports, 37, article 102981",
      url: "https://doi.org/10.1016/j.jasrep.2021.102981",
      author: "Veronica Occari, Ian C. Freestone and Corisande Fenwick",
      published: "2021",
      usedFor:
        "Electron-microprobe analyses of 61 twelfth- to fifteenth-century vessels, likely Levantine plant ash, multiple silica sources, and the limits on identifying where each vessel was made.",
      usedForIt:
        "Analisi con microsonda elettronica di 61 recipienti fra XII e XV secolo, probabile cenere vegetale levantina, diverse fonti di silice e limiti nell’identificare il luogo di produzione di ogni oggetto.",
      accessed: "2026-09-27",
      kind: "scholarly",
    },
    {
      title: "Glassmaking in Renaissance Venice: The Fragile Craft",
      publisher: "Routledge",
      url: "https://books.google.com/books?id=i3NBDgAAQBAJ",
      author: "W. Patrick McCray",
      published: "2017",
      usedFor:
        "The wider framing of glassmaking as an interaction among technology, regulation, consumer demand, production and distribution.",
      usedForIt:
        "Il quadro generale della lavorazione del vetro come intreccio fra tecnologia, regolamentazione, domanda, produzione e distribuzione.",
      accessed: "2026-09-27",
      kind: "scholarly",
    },
    {
      title: "The Nature of Glass: Technologies of Transparency, Materials on the Move",
      publisher: "Isis, 114(2), 393–399",
      url: "https://doi.org/10.1086/724806",
      author: "Sven Dupré",
      published: "2023",
      usedFor:
        "A material-history framework for understanding glass as several formulations shaped by practical knowledge and supply networks.",
      usedForIt:
        "Una prospettiva di storia materiale per comprendere il vetro come insieme di composizioni diverse, formate da saperi pratici e reti di approvvigionamento.",
      accessed: "2026-09-27",
      kind: "scholarly",
    },
  ],
  related: ["murano-glass-materials-cristallo-lattimo", "venetian-glass-beads"],
};
