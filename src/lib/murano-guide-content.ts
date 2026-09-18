// Content for the /murano-glass pillar page — deliberately kept separate
// from src/lib/i18n/dictionaries.ts (small, shared UI chrome strings)
// since this is a large block of page-specific long-form content, not a
// handful of interpolated labels.
import type { Locale } from "./i18n/locale";

export type MuranoGuideContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  historyTitle: string;
  historyParagraphs: string[];
  beadsTitle: string;
  beadsBody: string;
  techniquesTitle: string;
  techniques: { name: string; body: string }[];
  authenticityTitle: string;
  authenticityIntro: string;
  authenticitySigns: string[];
  careTitle: string;
  careIntro: string;
  careSteps: { name: string; body: string }[];
  shopCtaTitle: string;
  shopCtaBody: string;
  faqTitle: string;
  faq: { question: string; answer: string }[];
};

const en: MuranoGuideContent = {
  metaTitle: "Murano Glass: History, Techniques & How to Spot the Real Thing",
  metaDescription:
    "A complete guide to Murano glass — its 700-year history, the techniques behind lampworking, murrine and sommerso, how to tell genuine hand-blown glass from imitations, and how to care for it.",
  title: "The Complete Guide to Murano Glass",
  intro:
    "Murano glass is glass made on Murano, a small island in the Venetian lagoon that has been Venice's glassmaking center for over 700 years. The name is protected by an Italian trademark for a reason: it describes a specific place, a specific set of hand techniques, and a level of skill that mass-produced glass jewelry sold under the same name usually doesn't have. This guide covers where it comes from, how it's actually made, and how to tell the genuine article from an imitation.",
  historyTitle: "A short history",
  historyParagraphs: [
    "In 1291, the Republic of Venice ordered every glass furnace in the city moved to the island of Murano. The official reason was fire safety — furnaces ran day and night in a city built almost entirely of wood — but it also had the effect of concentrating every glassmaker in one place the Republic could control. Glassmaking on the island was governed by its own guild, the Arte dei Fioleri, and for centuries afterward Murano's glassmakers held a genuinely privileged status (some were even permitted to marry into Venetian nobility) in exchange for rules that restricted where they could travel and who they could train — leaving the island to practice the trade elsewhere was, for a long stretch of that history, treated as an act of treason.",
    "The Renaissance was Murano's golden age. Around the 1450s, a glassmaker named Angelo Barovier developed cristallo — a glass clear and colorless enough to rival rock crystal, a genuine technical breakthrough at the time — and Murano became Europe's main source of fine mirrors and chandeliers for the next three centuries. Murrine and millefiori (glass canes with a mosaic-like cross-section, an ancient technique with roots in Roman and Egyptian glasswork) were revived and refined on the island. In the 17th century, one of Murano's furnaces is said to have discovered aventurine glass — glass flecked with tiny copper crystals — by accident, and it's been a signature Murano material ever since.",
    "It nearly ended twice. Cheaper glass from Bohemia and France ate into Murano's market through the 1700s, and then in 1797 Napoleon's occupation dissolved the Republic of Venice and, with it, the glassmakers' guild — production collapsed to a fraction of what it had been. The revival that followed is unusually well documented: Antonio Salviati relaunched large-scale mosaic and glass production in the 1860s and helped found the Murano Glass Museum in 1861 to preserve and showcase the island's own history; Paolo Venini founded what became one of the island's most influential furnaces in 1921. Murano glass is still made by hand today, in working furnaces on the island, using largely the same core techniques as seven centuries ago.",
  ],
  beadsTitle: "Beads, trade, and a complicated history",
  beadsBody:
    "Individually lamp-worked beads like the ones in this catalog are one Murano tradition — but for a long stretch of its history, the island's biggest export by volume wasn't art glass at all. It was conterie: small, cheaply-made glass beads, produced by the millions and shipped out through Venice's trading networks from the 16th century onward to Africa, Asia and the Americas, where they were used as a form of currency — including, uncomfortably, within the transatlantic slave trade. That mass-production tradition had its own separate guild and its own workers, distinct from the furnace maestri making cristallo and chandeliers. It's a different craft from the individually shaped pieces in this guide, but it's part of the same island's history, and it's a large part of why Venetian glass beads still turn up in museum collections and archaeological digs on four continents today.",
  techniquesTitle: "The techniques, explained",
  techniques: [
    {
      name: "Lampworking (lavorazione a lume)",
      body: "Shaping a glass rod over an open flame rather than a furnace — the technique behind most individual beads. A glassworker heats the tip of a colored glass rod until it's molten, winds it around a metal mandrel to form a bead, and shapes it with tools and gravity while it's still soft.",
    },
    {
      name: "Glassblowing (soffiatura)",
      body: "Gathering molten glass from a furnace on the end of a blowpipe and shaping it by blowing air into it while turning — the technique behind larger hollow forms like vases and larger beads.",
    },
    {
      name: "Murrine and millefiori",
      body: "A murrina is a slice cut from a long glass cane that was built up, layer by layer, so its cross-section shows a pattern — a flower, a star, a face. Millefiori (\"thousand flowers\") is the best-known style of murrine. Slices are arranged on the surface of a bead or vase and fused in with heat, so the pattern runs all the way through the glass rather than sitting on top of it.",
    },
    {
      name: "Filigrana (filigree)",
      body: "Thin canes of white or colored glass, sometimes twisted (retortoli) or crossed into a fine net (reticello), are embedded in clear glass before it's shaped — visible as delicate threads running through the piece.",
    },
    {
      name: "Sommerso",
      body: 'Italian for "submerged." Layers of different-colored glass are dipped one over another, each fully encasing the last, so a piece shows depth and a gradient between colors rather than a single flat tone.',
    },
    {
      name: "Avventurina (aventurine glass)",
      body: "Glass with tiny copper crystals suspended inside it, giving it a metallic sparkle. A genuine Murano invention, traditionally kept as one of the island's more closely guarded formulas.",
    },
    {
      name: "Gold and silver leaf",
      body: "Thin sheets of real gold or silver leaf are laid onto the glass while it's still hot and worked in, so the metal becomes part of the surface rather than sitting on top of it — the source of the metallic flecks and veining seen in many pieces.",
    },
    {
      name: "Craquelé (ice glass)",
      body: "Hot glass is plunged briefly into cold water, which shatters its surface into a fine network of cracks, then it goes back into the furnace just long enough to fuse a smooth layer over the top and seal the pattern in without melting it away.",
    },
    {
      name: "Sandblasting (sabbiatura)",
      body: "Done cold, after the piece has fully formed — a fine abrasive is blown at the surface to soften its shine into a matte, frosted finish.",
    },
    {
      name: "The pontil mark",
      body: "The rough (or carefully polished) mark left on a piece where it was broken off the punty rod that held it during shaping. Mass-produced glass, formed in a mold, doesn't have one — a genuine pontil mark is one of the more reliable signs of hand-blown glass.",
    },
  ],
  authenticityTitle: "How to recognize genuine Murano glass",
  authenticityIntro:
    "\"Murano glass\" is one of the most imitated names in jewelry and decorative glass — mass-produced beads made in factories elsewhere (often at a fraction of the cost) are routinely sold under the same label, especially to tourists in Venice itself. There's an actual trademark, Vetro Artistico® Murano, registered by the Consorzio Promovetro Murano, that furnaces on the island can apply to their work to certify where it was really made — but plenty of genuine small-batch work isn't formally certified, and plenty of certified-sounding claims are made up. The more reliable check is the glass itself:",
  authenticitySigns: [
    "Small air bubbles and slight asymmetry — signs a human shaped it, not a mold.",
    "Color that shifts subtly from piece to piece in the same set, rather than being perfectly uniform.",
    "A pontil mark where applicable (see above) — a mold-made piece won't have one.",
    "Weight and thickness that feel substantial rather than thin and light — hand-gathered glass tends to carry more of it than a machine-formed piece.",
    "A price that reflects real labor. A skilled lampworker spends real time on every single bead; a price that looks too low for that usually means it wasn't made that way.",
  ],
  careTitle: "Caring for Murano glass jewelry",
  careIntro:
    "Glass is more forgiving than people expect, but it's still glass — a few habits make it last.",
  careSteps: [
    {
      name: "Put it on last",
      body: "Perfume, hairspray and lotion can dull glass's surface over time — apply them first, then put your jewelry on.",
    },
    {
      name: "Take it off for water and sleep",
      body: "Remove it before showering, swimming or sleeping, so it isn't knocked around or exposed to chlorine/salt water for hours at a time.",
    },
    {
      name: "Wipe it down after wearing",
      body: "A soft, dry cloth is enough to keep it clean — no need for jewelry cleaner or water.",
    },
    {
      name: "Store pieces separately",
      body: "A soft pouch or a lined box keeps beads from knocking against each other or against harder jewelry, which is the most common way a piece gets chipped.",
    },
    {
      name: "Avoid sudden temperature changes",
      body: "Leaving glass jewelry somewhere very hot (a car dashboard, direct sun) and then handling it while cold can stress the glass — the same thermal-shock principle that cracks a cold glass filled with hot water.",
    },
  ],
  shopCtaTitle: "Shop the collection",
  shopCtaBody:
    "Every piece in each of these collections is made using the techniques above — browse by category to see them.",
  faqTitle: "Frequently asked questions",
  faq: [
    {
      question: "Is Murano glass real glass, or something synthetic?",
      answer:
        "Real glass — a mix of silica sand, soda and lime melted at high temperature in a furnace, the same base recipe glass has used for centuries. What makes it \"Murano glass\" specifically is where and how it's worked, not a different raw material.",
    },
    {
      question: "What's the difference between Murano glass and ordinary glass jewelry?",
      answer:
        "Mostly the process: Murano glass is shaped by hand, bead by bead, using techniques like lampworking, murrine and sommerso, rather than cast or pressed in a mold. That's also why two \"identical\" Murano pieces are never perfectly identical.",
    },
    {
      question: "Why is genuine Murano glass more expensive than lookalikes?",
      answer:
        "Because it takes real skilled labor and time — a lampworker shapes each bead individually over an open flame. Mass-produced imitation glass, formed in molds in a factory, skips almost all of that labor, which is exactly why it costs less.",
    },
    {
      question: "What is a pontil mark, and should I be able to see one?",
      answer:
        "It's the mark left where a hand-blown piece was broken off the rod that held it during shaping — sometimes visible as a small rough or polished spot. Not every technique leaves an obvious one, but where it's present, it's a strong sign of hand work.",
    },
    {
      question: "Why do beads in the same set look slightly different from each other?",
      answer:
        "Because each one passed through a person's hands, not a mold. Small differences in color, bubbles and shape are what hand-blown glass looks like — not a defect.",
    },
    {
      question: "How do I clean and store Murano glass jewelry?",
      answer:
        'Wipe it with a soft, dry cloth after wearing, put it on after (not before) perfume or lotion, and store pieces separately so they don\'t knock against each other. See "Caring for Murano glass jewelry" above for the full list.',
    },
    {
      question: "Is glass jewelry eco-friendly?",
      answer:
        "Glass itself is one of the most recyclable materials that exists — it can be melted down and reworked indefinitely without losing quality, which is part of how Murano furnaces have kept working the same raw material for seven centuries.",
    },
    {
      question: "Can a cracked or chipped bead be repaired?",
      answer:
        "Not invisibly, in most cases — a repair usually shows. That's the practical reason to avoid impact and sudden temperature changes (see the care section above) rather than count on fixing damage after the fact.",
    },
  ],
};

const it: MuranoGuideContent = {
  metaTitle: "Vetro di Murano: Storia, Tecniche e Come Riconoscere l'Originale",
  metaDescription:
    "Una guida completa al vetro di Murano — la sua storia di 700 anni, le tecniche di lavorazione a lume, murrine e sommerso, come distinguere il vetro autentico soffiato a mano dalle imitazioni, e come prendersene cura.",
  title: "La Guida Completa al Vetro di Murano",
  intro:
    "Il vetro di Murano è il vetro lavorato a Murano, una piccola isola della laguna veneziana che da oltre 700 anni è il centro della lavorazione del vetro veneziana. Il nome è tutelato da un marchio italiano per un motivo preciso: descrive un luogo specifico, un insieme specifico di tecniche manuali e un livello di abilità che la bigiotteria in vetro prodotta in serie e venduta con lo stesso nome, di solito, non ha. Questa guida racconta da dove viene, come viene davvero realizzato e come riconoscere il pezzo autentico da un'imitazione.",
  historyTitle: "Una breve storia",
  historyParagraphs: [
    "Nel 1291 la Repubblica di Venezia ordinò che tutte le fornaci vetrarie della città fossero trasferite sull'isola di Murano. Il motivo ufficiale era la sicurezza antincendio — le fornaci restavano accese giorno e notte in una città costruita quasi interamente in legno — ma l'effetto fu anche quello di concentrare tutti i vetrai in un luogo che la Repubblica poteva controllare più facilmente. La lavorazione del vetro sull'isola era regolata da una corporazione propria, l'Arte dei Fioleri, e per secoli i vetrai muranesi godettero di uno status davvero privilegiato (ad alcuni fu persino concesso di sposare nobildonne veneziane), in cambio di regole che limitavano dove potevano viaggiare e chi potevano formare — lasciare l'isola per esercitare il mestiere altrove fu, per un lungo periodo, considerato un vero e proprio tradimento.",
    "Il Rinascimento fu l'epoca d'oro di Murano. Intorno alla metà del Quattrocento, un vetraio di nome Angelo Barovier mise a punto il cristallo — un vetro trasparente e incolore capace di rivaleggiare con il cristallo di rocca, una vera svolta tecnica per l'epoca — e per i tre secoli successivi Murano divenne la principale fonte europea di specchi e lampadari raffinati. Le murrine e i millefiori (canne di vetro che, in sezione, mostrano un disegno a mosaico — una tecnica antica, con radici nella lavorazione del vetro romana ed egizia) furono ripresi e perfezionati proprio sull'isola. Nel XVII secolo, si racconta che una delle fornaci scoprì per caso il vetro avventurina — vetro punteggiato di minuscoli cristalli di rame — che da allora è diventato un materiale distintivo di Murano.",
    "L'industria rischiò di scomparire, e non una sola volta. La concorrenza del vetro più economico prodotto in Boemia e in Francia eroso il mercato di Murano nel corso del Settecento, poi nel 1797 l'occupazione napoleonica sciolse la Repubblica di Venezia e, con essa, la corporazione dei vetrai — la produzione crollò a una frazione di quella di un tempo. La rinascita che seguì è insolitamente ben documentata: Antonio Salviati rilanciò la produzione di mosaici e vetri su larga scala negli anni 1860 e contribuì a fondare il Museo del Vetro di Murano nel 1861, per preservare e raccontare la storia dell'isola; Paolo Venini fondò nel 1921 quella che sarebbe diventata una delle fornaci più influenti dell'isola. Ancora oggi il vetro di Murano viene lavorato a mano, nelle fornaci attive sull'isola, con tecniche di base rimaste in gran parte le stesse di sette secoli fa.",
  ],
  beadsTitle: "Perle, commercio e una storia complicata",
  beadsBody:
    "Le perle lavorate a lume una per una, come quelle di questo catalogo, sono una tradizione muranese — ma per un lungo periodo della sua storia, la principale esportazione dell'isola per volume non fu affatto il vetro d'arte. Furono le conterie: piccole perle di vetro prodotte a basso costo, realizzate a milioni e spedite attraverso le rotte commerciali di Venezia a partire dal XVI secolo verso Africa, Asia e Americhe, dove venivano usate come forma di moneta di scambio — anche, con disagio, all'interno della tratta transatlantica degli schiavi. Quella tradizione di produzione in serie aveva una propria corporazione e propri lavoratori, distinti dai maestri di fornace che realizzavano cristallo e lampadari. È un mestiere diverso dai pezzi lavorati singolarmente descritti in questa guida, ma fa parte della stessa storia dell'isola, ed è in buona parte il motivo per cui le perle di vetro veneziane si trovano ancora oggi in collezioni museali e siti archeologici in quattro continenti.",
  techniquesTitle: "Le tecniche, spiegate",
  techniques: [
    {
      name: "Lavorazione a lume",
      body: "Consiste nel modellare una bacchetta di vetro sulla fiamma libera, anziché in fornace — è la tecnica dietro la maggior parte delle perle singole. Il maestro scalda la punta di una bacchetta di vetro colorato fino a renderla incandescente, la avvolge attorno a un mandrino metallico per formare la perla e la modella con gli attrezzi e con la forza di gravità mentre è ancora morbida.",
    },
    {
      name: "Soffiatura",
      body: "Si preleva vetro fuso dalla fornace sulla punta di una canna da soffio e lo si modella soffiando aria al suo interno mentre lo si fa ruotare — è la tecnica dietro le forme cave più grandi, come vasi e perle di dimensioni maggiori.",
    },
    {
      name: "Murrine e millefiori",
      body: 'Una murrina è una fetta tagliata da una lunga canna di vetro costruita a strati, in modo che la sua sezione mostri un disegno — un fiore, una stella, un volto. Il millefiori ("mille fiori") è lo stile di murrina più conosciuto. Le fette vengono disposte sulla superficie di una perla o di un vaso e fuse con il calore, così il motivo attraversa tutto lo spessore del vetro invece di restare in superficie.',
    },
    {
      name: "Filigrana",
      body: "Sottili canne di vetro bianco o colorato, a volte attorcigliate (retortoli) o incrociate a formare una rete fine (reticello), vengono inglobate nel vetro trasparente prima che venga modellato — restano visibili come delicati fili che attraversano il pezzo.",
    },
    {
      name: "Sommerso",
      body: "Strati di vetro di colori diversi vengono immersi uno sopra l'altro, ciascuno avvolgendo completamente il precedente, così il pezzo mostra profondità e una sfumatura tra i colori invece di un unico tono piatto.",
    },
    {
      name: "Vetro avventurina",
      body: "Vetro con minuscoli cristalli di rame sospesi al suo interno, che gli conferiscono un luccichio metallico. Un'invenzione autenticamente muranese, tradizionalmente custodita come una delle formule più gelosamente protette dell'isola.",
    },
    {
      name: "Foglia d'oro e d'argento",
      body: "Sottili fogli di oro o argento vero vengono adagiati sul vetro ancora caldo e lavorati al suo interno, così il metallo diventa parte della superficie invece di restare sopra di essa — è da qui che nascono i riflessi e le venature metalliche visibili in molti pezzi.",
    },
    {
      name: "Craquelé (vetro a ghiaccio)",
      body: "Il vetro caldo viene immerso brevemente in acqua fredda, che ne screpola la superficie in una fitta rete di crepe; poi torna in fornace giusto il tempo necessario a fondere uno strato liscio sopra il motivo e sigillarlo, senza farlo sparire.",
    },
    {
      name: "Sabbiatura",
      body: "Si esegue a freddo, a pezzo già formato — un abrasivo fine viene spruzzato sulla superficie per trasformarne la lucentezza in una finitura opaca e vellutata.",
    },
    {
      name: "Il segno del pontello",
      body: "Il segno, ruvido o accuratamente levigato, che resta sul pezzo nel punto in cui è stato staccato dal pontello che lo sosteneva durante la lavorazione. Il vetro prodotto in serie, formato in uno stampo, non ne ha uno — un vero segno di pontello è uno degli indizi più affidabili di una lavorazione a mano.",
    },
  ],
  authenticityTitle: "Come riconoscere il vero vetro di Murano",
  authenticityIntro:
    "\"Vetro di Murano\" è uno dei nomi più imitati nella bigiotteria e negli oggetti in vetro: perle prodotte in serie in fabbriche altrove (spesso a una frazione del costo) vengono regolarmente vendute con la stessa dicitura, specialmente ai turisti a Venezia. Esiste un vero e proprio marchio, Vetro Artistico® Murano, registrato dal Consorzio Promovetro Murano, che le fornaci dell'isola possono apporre sui propri lavori per certificarne la reale provenienza — ma molti lavori autentici realizzati in piccole quantità non sono certificati formalmente, e molte dichiarazioni che sembrano una certificazione sono inventate. Il controllo più affidabile resta il vetro stesso:",
  authenticitySigns: [
    "Piccole bolle d'aria e una leggera asimmetria — segno che è stato modellato da una persona, non da uno stampo.",
    "Un colore che varia impercettibilmente da un pezzo all'altro dello stesso set, invece di essere perfettamente uniforme.",
    "Un segno di pontello dove applicabile (vedi sopra) — un pezzo stampato non ne avrà uno.",
    "Un peso e uno spessore che si sentono sostanziosi, non sottili e leggeri — il vetro raccolto a mano tende a pesare di più di un pezzo formato a macchina.",
    "Un prezzo che rispecchia il lavoro reale. Un maestro dedica tempo vero a ogni singola perla; un prezzo troppo basso di solito significa che non è stata realizzata così.",
  ],
  careTitle: "Come prendersi cura dei gioielli in vetro di Murano",
  careIntro:
    "Il vetro è più resistente di quanto si pensi, ma resta vetro — poche abitudini bastano a farlo durare più a lungo.",
  careSteps: [
    {
      name: "Indossalo per ultimo",
      body: "Profumo, lacca e creme possono opacizzare la superficie del vetro nel tempo — applicali prima, poi indossa i gioielli.",
    },
    {
      name: "Toglilo prima dell'acqua e del sonno",
      body: "Rimuovilo prima della doccia, del bagno o del sonno, così non viene urtato o esposto per ore a cloro o acqua salata.",
    },
    {
      name: "Puliscilo dopo l'uso",
      body: "Basta un panno morbido e asciutto per tenerlo pulito — non serve un detergente per gioielli né acqua.",
    },
    {
      name: "Conserva i pezzi separati",
      body: "Un sacchetto morbido o una scatola foderata evitano che le perle si urtino tra loro o con gioielli più duri, la causa più comune di scheggiature.",
    },
    {
      name: "Evita sbalzi termici improvvisi",
      body: "Lasciare un gioiello in vetro in un posto molto caldo (il cruscotto dell'auto, il sole diretto) e poi maneggiarlo mentre è freddo può mettere sotto stress il vetro — lo stesso principio di shock termico che incrina un bicchiere freddo riempito d'acqua calda.",
    },
  ],
  shopCtaTitle: "Scopri la collezione",
  shopCtaBody: "Ogni pezzo di queste collezioni è realizzato con le tecniche descritte sopra — sfoglia per categoria per vederli.",
  faqTitle: "Domande frequenti",
  faq: [
    {
      question: "Il vetro di Murano è vetro vero o un materiale sintetico?",
      answer:
        'È vetro vero — un mix di sabbia silicea, soda e calce fuso ad alta temperatura in fornace, la stessa ricetta di base usata da secoli. Ciò che lo rende "vetro di Murano" è dove e come viene lavorato, non una materia prima diversa.',
    },
    {
      question: "Che differenza c'è tra il vetro di Murano e la normale bigiotteria in vetro?",
      answer:
        'Soprattutto il processo: il vetro di Murano viene modellato a mano, perla per perla, con tecniche come la lavorazione a lume, le murrine e il sommerso, invece di essere colato o pressato in uno stampo. È anche per questo che due pezzi "identici" di Murano non sono mai perfettamente uguali.',
    },
    {
      question: "Perché il vero vetro di Murano costa più delle imitazioni?",
      answer:
        "Perché richiede manodopera qualificata e tempo reale — un maestro modella ogni perla individualmente sulla fiamma libera. Il vetro d'imitazione prodotto in serie, formato in stampi in fabbrica, salta quasi tutto questo lavoro, ed è proprio per questo che costa meno.",
    },
    {
      question: "Cos'è il segno del pontello e dovrei riuscire a vederlo?",
      answer:
        "È il segno lasciato nel punto in cui un pezzo soffiato a mano è stato staccato dall'asta che lo sosteneva durante la lavorazione — a volte visibile come una piccola zona ruvida o levigata. Non tutte le tecniche ne lasciano uno evidente, ma dove è presente è un forte indizio di lavorazione manuale.",
    },
    {
      question: "Perché le perle di uno stesso set sembrano leggermente diverse tra loro?",
      answer:
        "Perché ognuna è passata dalle mani di una persona, non da uno stampo. Le piccole differenze di colore, le bolle e la forma sono ciò che caratterizza il vetro soffiato a mano — non un difetto.",
    },
    {
      question: "Come pulisco e conservo i gioielli in vetro di Murano?",
      answer:
        'Puliscili con un panno morbido e asciutto dopo l\'uso, indossali dopo (non prima) profumo o creme, e conservali separati per evitare che si urtino tra loro. Vedi "Come prendersi cura dei gioielli in vetro di Murano" sopra per l\'elenco completo.',
    },
    {
      question: "La bigiotteria in vetro è ecologica?",
      answer:
        "Il vetro in sé è uno dei materiali più riciclabili che esistano — può essere fuso e rilavorato all'infinito senza perdere qualità, ed è anche per questo che le fornaci di Murano lavorano la stessa materia prima da sette secoli.",
    },
    {
      question: "Una perla incrinata o scheggiata può essere riparata?",
      answer:
        "Nella maggior parte dei casi, non in modo invisibile — la riparazione di solito si vede. È il motivo pratico per cui vale la pena evitare urti e sbalzi termici improvvisi (vedi la sezione cura sopra), piuttosto che contare di poter rimediare al danno in un secondo momento.",
    },
  ],
};

const fr: MuranoGuideContent = {
  metaTitle: "Verre de Murano : histoire, techniques et comment reconnaître l'authentique",
  metaDescription:
    "Un guide complet du verre de Murano — ses 700 ans d'histoire, les techniques du travail au chalumeau, des murrine et du sommerso, comment distinguer le verre authentique soufflé à la main des imitations, et comment en prendre soin.",
  title: "Le guide complet du verre de Murano",
  intro:
    "Le verre de Murano est un verre fabriqué à Murano, une petite île de la lagune vénitienne qui est le centre de la verrerie vénitienne depuis plus de 700 ans. Le nom est protégé par une marque italienne, et pour une bonne raison : il décrit un lieu précis, un ensemble précis de techniques manuelles, et un niveau de savoir-faire que la bijouterie en verre produite en série et vendue sous le même nom n'a généralement pas. Ce guide explique d'où il vient, comment il est réellement fabriqué, et comment distinguer une pièce authentique d'une imitation.",
  historyTitle: "Une brève histoire",
  historyParagraphs: [
    "En 1291, la République de Venise ordonna que tous les fours à verre de la ville soient transférés sur l'île de Murano. La raison officielle était la sécurité incendie — les fours fonctionnaient jour et nuit dans une ville construite presque entièrement en bois — mais cela eut aussi pour effet de concentrer tous les verriers dans un lieu que la République pouvait contrôler. La verrerie sur l'île était régie par sa propre corporation, l'Arte dei Fioleri, et pendant des siècles les verriers de Murano jouirent d'un statut réellement privilégié (certains furent même autorisés à épouser des nobles vénitiennes) en échange de règles qui limitaient où ils pouvaient voyager et qui ils pouvaient former — quitter l'île pour exercer le métier ailleurs fut, pendant une longue période, considéré comme un acte de trahison.",
    "La Renaissance fut l'âge d'or de Murano. Vers 1450, un verrier nommé Angelo Barovier mit au point le cristallo — un verre suffisamment clair et incolore pour rivaliser avec le cristal de roche, une véritable percée technique pour l'époque — et Murano devint la principale source européenne de miroirs et de lustres raffinés pour les trois siècles suivants. Les murrine et les millefiori (des cannes de verre dont la section transversale révèle un motif en mosaïque, une technique ancienne aux racines dans la verrerie romaine et égyptienne) furent revisitées et perfectionnées sur l'île. Au XVIIe siècle, l'un des fours de Murano aurait découvert par accident le verre aventurine — un verre parsemé de minuscules cristaux de cuivre — qui est resté depuis un matériau emblématique de Murano.",
    "L'industrie faillit disparaître à deux reprises. Le verre moins cher de Bohême et de France grignota le marché de Murano tout au long du XVIIIe siècle, puis en 1797 l'occupation napoléonienne dissout la République de Venise et, avec elle, la corporation des verriers — la production s'effondra à une fraction de ce qu'elle avait été. La renaissance qui suivit est exceptionnellement bien documentée : Antonio Salviati relança la production de mosaïques et de verre à grande échelle dans les années 1860 et contribua à fonder le Musée du verre de Murano en 1861 pour préserver et faire connaître l'histoire de l'île ; Paolo Venini fonda en 1921 ce qui deviendra l'un des fours les plus influents de l'île. Le verre de Murano est encore fabriqué à la main aujourd'hui, dans des fours en activité sur l'île, selon des techniques de base largement inchangées depuis sept siècles.",
  ],
  beadsTitle: "Perles, commerce et une histoire compliquée",
  beadsBody:
    "Les perles travaillées individuellement au chalumeau, comme celles de ce catalogue, sont une tradition muranaise — mais pendant une longue période de son histoire, la plus grande exportation de l'île en volume n'était pas du tout du verre d'art. C'était les conterie : de petites perles de verre bon marché, produites par millions et expédiées via les réseaux commerciaux de Venise à partir du XVIe siècle vers l'Afrique, l'Asie et les Amériques, où elles étaient utilisées comme une forme de monnaie — y compris, ce qui est inconfortable à rappeler, dans le cadre de la traite transatlantique des esclaves. Cette production de masse avait sa propre corporation et ses propres ouvriers, distincts des maîtres verriers des fours qui fabriquaient le cristallo et les lustres. C'est un artisanat différent des pièces façonnées individuellement présentées dans ce guide, mais cela fait partie de la même histoire de l'île, et c'est en grande partie pourquoi les perles de verre vénitiennes se retrouvent encore aujourd'hui dans des collections de musées et des sites archéologiques sur quatre continents.",
  techniquesTitle: "Les techniques expliquées",
  techniques: [
    {
      name: "Travail au chalumeau (lavorazione a lume)",
      body: "Façonner une tige de verre à la flamme libre plutôt qu'au four — la technique derrière la plupart des perles individuelles. Un verrier chauffe l'extrémité d'une tige de verre coloré jusqu'à ce qu'elle soit en fusion, l'enroule autour d'un mandrin métallique pour former une perle, et la façonne avec des outils et la gravité pendant qu'elle est encore molle.",
    },
    {
      name: "Soufflage (soffiatura)",
      body: "Prélever du verre en fusion dans un four au bout d'une canne à souffler et le façonner en soufflant de l'air à l'intérieur tout en le faisant tourner — la technique derrière les plus grandes formes creuses comme les vases et les perles de plus grande taille.",
    },
    {
      name: "Murrine et millefiori",
      body: "Une murrina est une tranche coupée dans une longue canne de verre construite couche par couche, de sorte que sa section transversale révèle un motif — une fleur, une étoile, un visage. Le millefiori (« mille fleurs ») est le style de murrine le plus connu. Les tranches sont disposées à la surface d'une perle ou d'un vase et fusionnées sous l'effet de la chaleur, de sorte que le motif traverse tout le verre plutôt que de rester en surface.",
    },
    {
      name: "Filigrana (filigrane)",
      body: "De fines cannes de verre blanc ou coloré, parfois torsadées (retortoli) ou croisées en un fin réseau (reticello), sont intégrées dans du verre transparent avant qu'il ne soit façonné — visibles comme de délicats filaments traversant la pièce.",
    },
    {
      name: "Sommerso",
      body: "Italien pour « submergé ». Des couches de verre de couleurs différentes sont trempées l'une par-dessus l'autre, chacune enveloppant entièrement la précédente, de sorte qu'une pièce présente de la profondeur et un dégradé entre les couleurs plutôt qu'un ton unique et plat.",
    },
    {
      name: "Avventurina (verre aventurine)",
      body: "Du verre contenant de minuscules cristaux de cuivre en suspension, lui donnant un éclat métallique. Une véritable invention de Murano, traditionnellement gardée comme l'une des formules les plus jalousement protégées de l'île.",
    },
    {
      name: "Feuille d'or et d'argent",
      body: "De fines feuilles d'or ou d'argent véritable sont posées sur le verre encore chaud et incorporées, de sorte que le métal devient partie intégrante de la surface plutôt que de rester au-dessus — c'est la source des reflets et veinures métalliques visibles sur de nombreuses pièces.",
    },
    {
      name: "Craquelé (verre glacé)",
      body: "Le verre chaud est brièvement plongé dans l'eau froide, ce qui fait éclater sa surface en un fin réseau de fissures, puis il retourne au four juste assez longtemps pour fusionner une couche lisse par-dessus et sceller le motif sans le faire disparaître.",
    },
    {
      name: "Sablage (sabbiatura)",
      body: "Effectué à froid, une fois la pièce entièrement formée — un abrasif fin est projeté sur la surface pour transformer son éclat en une finition mate et dépolie.",
    },
    {
      name: "La marque du pontil",
      body: "La marque, brute ou soigneusement polie, laissée sur une pièce à l'endroit où elle a été détachée de la canne qui la soutenait pendant le façonnage. Le verre produit en série, moulé, n'en a pas — une véritable marque de pontil est l'un des signes les plus fiables du verre soufflé à la main.",
    },
  ],
  authenticityTitle: "Comment reconnaître le véritable verre de Murano",
  authenticityIntro:
    "« Verre de Murano » est l'un des noms les plus imités dans la bijouterie et le verre décoratif — des perles produites en série dans des usines ailleurs (souvent pour une fraction du coût) sont régulièrement vendues sous la même appellation, en particulier aux touristes à Venise même. Il existe une véritable marque, Vetro Artistico® Murano, déposée par le Consorzio Promovetro Murano, que les fours de l'île peuvent apposer sur leurs œuvres pour certifier leur véritable provenance — mais de nombreuses pièces authentiques produites en petites séries ne sont pas certifiées officiellement, et de nombreuses affirmations qui semblent être une certification sont inventées. Le contrôle le plus fiable reste le verre lui-même :",
  authenticitySigns: [
    "De petites bulles d'air et une légère asymétrie — signes qu'un être humain l'a façonné, pas un moule.",
    "Une couleur qui varie subtilement d'une pièce à l'autre dans le même ensemble, plutôt que d'être parfaitement uniforme.",
    "Une marque de pontil le cas échéant (voir ci-dessus) — une pièce moulée n'en aura pas.",
    "Un poids et une épaisseur qui semblent substantiels plutôt que fins et légers — le verre travaillé à la main a tendance à peser plus qu'une pièce formée à la machine.",
    "Un prix qui reflète un travail réel. Un verrier qualifié consacre un temps réel à chaque perle ; un prix qui semble trop bas pour cela signifie généralement qu'elle n'a pas été fabriquée ainsi.",
  ],
  careTitle: "Prendre soin des bijoux en verre de Murano",
  careIntro:
    "Le verre est plus résistant qu'on ne le pense, mais cela reste du verre — quelques habitudes le font durer plus longtemps.",
  careSteps: [
    {
      name: "Mettez-le en dernier",
      body: "Le parfum, la laque et les lotions peuvent ternir la surface du verre avec le temps — appliquez-les d'abord, puis mettez vos bijoux.",
    },
    {
      name: "Retirez-le pour l'eau et le sommeil",
      body: "Retirez-le avant de prendre une douche, de nager ou de dormir, afin qu'il ne soit pas cogné ou exposé au chlore/à l'eau salée pendant des heures.",
    },
    {
      name: "Essuyez-le après le port",
      body: "Un chiffon doux et sec suffit à le garder propre — inutile d'utiliser un nettoyant pour bijoux ou de l'eau.",
    },
    {
      name: "Rangez les pièces séparément",
      body: "Une pochette souple ou une boîte doublée évite que les perles ne s'entrechoquent entre elles ou avec des bijoux plus durs, la cause la plus courante d'éclats.",
    },
    {
      name: "Évitez les changements de température brusques",
      body: "Laisser un bijou en verre dans un endroit très chaud (tableau de bord d'une voiture, plein soleil) puis le manipuler à froid peut stresser le verre — le même principe de choc thermique qui fait craquer un verre froid rempli d'eau chaude.",
    },
  ],
  shopCtaTitle: "Découvrez la collection",
  shopCtaBody:
    "Chaque pièce de ces collections est réalisée selon les techniques ci-dessus — parcourez par catégorie pour les découvrir.",
  faqTitle: "Questions fréquentes",
  faq: [
    {
      question: "Le verre de Murano est-il du vrai verre, ou un matériau synthétique ?",
      answer:
        "Du vrai verre — un mélange de sable de silice, de soude et de chaux fondu à haute température dans un four, la même recette de base utilisée depuis des siècles. Ce qui en fait spécifiquement du « verre de Murano », c'est où et comment il est travaillé, pas une matière première différente.",
    },
    {
      question: "Quelle est la différence entre le verre de Murano et une bijouterie en verre ordinaire ?",
      answer:
        "Surtout le procédé : le verre de Murano est façonné à la main, perle par perle, avec des techniques comme le travail au chalumeau, les murrine et le sommerso, plutôt que coulé ou pressé dans un moule. C'est aussi pourquoi deux pièces « identiques » de Murano ne sont jamais parfaitement identiques.",
    },
    {
      question: "Pourquoi le véritable verre de Murano coûte-t-il plus cher que les imitations ?",
      answer:
        "Parce qu'il requiert un vrai savoir-faire qualifié et du temps réel — un verrier façonne chaque perle individuellement à la flamme libre. Le verre d'imitation produit en série, moulé en usine, saute presque tout ce travail, ce qui explique précisément son coût inférieur.",
    },
    {
      question: "Qu'est-ce qu'une marque de pontil, et devrais-je pouvoir en voir une ?",
      answer:
        "C'est la marque laissée à l'endroit où une pièce soufflée à la main a été détachée de la canne qui la soutenait pendant le façonnage — parfois visible comme une petite zone rugueuse ou polie. Toutes les techniques n'en laissent pas une évidente, mais lorsqu'elle est présente, c'est un signe fort de travail manuel.",
    },
    {
      question: "Pourquoi les perles d'un même ensemble semblent-elles légèrement différentes les unes des autres ?",
      answer:
        "Parce que chacune est passée entre les mains d'une personne, pas d'un moule. Les petites différences de couleur, de bulles et de forme sont ce à quoi ressemble le verre soufflé à la main — pas un défaut.",
    },
    {
      question: "Comment nettoyer et ranger des bijoux en verre de Murano ?",
      answer:
        "Essuyez-les avec un chiffon doux et sec après le port, mettez-les après (pas avant) le parfum ou la lotion, et rangez les pièces séparément pour qu'elles ne s'entrechoquent pas. Voir « Prendre soin des bijoux en verre de Murano » ci-dessus pour la liste complète.",
    },
    {
      question: "La bijouterie en verre est-elle écologique ?",
      answer:
        "Le verre lui-même est l'un des matériaux les plus recyclables qui existent — il peut être fondu et retravaillé indéfiniment sans perdre en qualité, ce qui explique en partie comment les fours de Murano travaillent la même matière première depuis sept siècles.",
    },
    {
      question: "Une perle fissurée ou ébréchée peut-elle être réparée ?",
      answer:
        "Pas de manière invisible, dans la plupart des cas — une réparation se voit généralement. C'est la raison pratique pour éviter les chocs et les changements de température brusques (voir la section entretien ci-dessus) plutôt que de compter réparer les dégâts après coup.",
    },
  ],
};

const de: MuranoGuideContent = {
  metaTitle: "Murano-Glas: Geschichte, Techniken und wie man Echtes erkennt",
  metaDescription:
    "Ein vollständiger Leitfaden zu Murano-Glas — seine 700-jährige Geschichte, die Techniken hinter Lampenglas, Murrine und Sommerso, wie man echtes handgeblasenes Glas von Imitaten unterscheidet, und wie man es pflegt.",
  title: "Der vollständige Leitfaden zu Murano-Glas",
  intro:
    "Murano-Glas ist Glas, das auf Murano hergestellt wird, einer kleinen Insel in der venezianischen Lagune, die seit über 700 Jahren das Zentrum der venezianischen Glasherstellung ist. Der Name ist aus gutem Grund durch eine italienische Marke geschützt: Er beschreibt einen bestimmten Ort, eine bestimmte Reihe von Handtechniken und ein Können, das massenproduzierter Glasschmuck, der unter demselben Namen verkauft wird, meist nicht besitzt. Dieser Leitfaden erklärt, woher es kommt, wie es tatsächlich hergestellt wird, und wie man das Original von einer Imitation unterscheidet.",
  historyTitle: "Eine kurze Geschichte",
  historyParagraphs: [
    "Im Jahr 1291 ordnete die Republik Venedig an, alle Glasöfen der Stadt auf die Insel Murano zu verlegen. Der offizielle Grund war Brandschutz — die Öfen liefen Tag und Nacht in einer Stadt, die fast vollständig aus Holz gebaut war —, aber es hatte auch den Effekt, alle Glasmacher an einem Ort zu konzentrieren, den die Republik kontrollieren konnte. Die Glasherstellung auf der Insel wurde von einer eigenen Zunft geregelt, der Arte dei Fioleri, und über Jahrhunderte genossen Muranos Glasmacher einen wirklich privilegierten Status (einige durften sogar in den venezianischen Adel einheiraten) — im Austausch gegen Regeln, die einschränkten, wohin sie reisen und wen sie ausbilden durften. Die Insel zu verlassen, um das Handwerk anderswo auszuüben, galt über weite Strecken dieser Geschichte als Verrat.",
    "Die Renaissance war Muranos goldenes Zeitalter. Um 1450 entwickelte ein Glasmacher namens Angelo Barovier das Cristallo — ein Glas, klar und farblos genug, um mit Bergkristall zu konkurrieren, ein echter technischer Durchbruch für die damalige Zeit — und Murano wurde für die nächsten drei Jahrhunderte Europas wichtigste Quelle für feine Spiegel und Kronleuchter. Murrine und Millefiori (Glasstäbe mit einem mosaikartigen Querschnitt, eine alte Technik mit Wurzeln in römischer und ägyptischer Glaskunst) wurden auf der Insel wiederbelebt und verfeinert. Im 17. Jahrhundert soll einer der Öfen Muranos das Avventurina-Glas — Glas mit winzigen Kupferkristallen — durch Zufall entdeckt haben, und es ist seither ein charakteristisches Material Muranos.",
    "Zweimal stand die Industrie kurz vor dem Ende. Günstigeres Glas aus Böhmen und Frankreich zehrte im Laufe des 18. Jahrhunderts an Muranos Marktanteil, und 1797 löste die napoleonische Besatzung die Republik Venedig und mit ihr die Zunft der Glasmacher auf — die Produktion brach auf einen Bruchteil ihres früheren Umfangs ein. Die darauffolgende Wiederbelebung ist ungewöhnlich gut dokumentiert: Antonio Salviati brachte in den 1860er-Jahren die großangelegte Mosaik- und Glasproduktion wieder in Gang und half 1861 mit, das Murano-Glasmuseum zu gründen, um die eigene Geschichte der Insel zu bewahren und zu zeigen; Paolo Venini gründete 1921 einen der später einflussreichsten Öfen der Insel. Murano-Glas wird noch heute von Hand hergestellt, in aktiven Öfen auf der Insel, mit weitgehend denselben Kerntechniken wie vor sieben Jahrhunderten.",
  ],
  beadsTitle: "Perlen, Handel und eine komplizierte Geschichte",
  beadsBody:
    "Einzeln am Brenner gearbeitete Perlen wie die in diesem Katalog sind eine Tradition Muranos — aber über weite Strecken seiner Geschichte war der größte Exportartikel der Insel dem Volumen nach gar kein Kunstglas. Es waren die Conterie: kleine, billig hergestellte Glasperlen, millionenfach produziert und ab dem 16. Jahrhundert über Venedigs Handelsnetze nach Afrika, Asien und Amerika verschifft, wo sie als eine Form von Zahlungsmittel dienten — unangenehmerweise auch im Rahmen des transatlantischen Sklavenhandels. Diese Massenproduktion hatte ihre eigene, separate Zunft und eigene Arbeiter, getrennt von den Ofenmeistern, die Cristallo und Kronleuchter herstellten. Es ist ein anderes Handwerk als die einzeln geformten Stücke in diesem Leitfaden, aber es ist Teil derselben Inselgeschichte — und ein wesentlicher Grund, warum venezianische Glasperlen noch heute in Museumssammlungen und archäologischen Fundstätten auf vier Kontinenten auftauchen.",
  techniquesTitle: "Die Techniken erklärt",
  techniques: [
    {
      name: "Lampenglasarbeit (lavorazione a lume)",
      body: "Das Formen eines Glasstabs über einer offenen Flamme statt in einem Ofen — die Technik hinter den meisten einzelnen Perlen. Ein Glasmacher erhitzt die Spitze eines farbigen Glasstabs, bis sie schmilzt, wickelt sie um einen Metalldorn, um eine Perle zu formen, und formt sie mit Werkzeugen und der Schwerkraft, während sie noch weich ist.",
    },
    {
      name: "Glasblasen (soffiatura)",
      body: "Geschmolzenes Glas wird auf das Ende einer Glasmacherpfeife aufgenommen und durch Hineinblasen von Luft geformt, während es gedreht wird — die Technik hinter größeren hohlen Formen wie Vasen und größeren Perlen.",
    },
    {
      name: "Murrine und Millefiori",
      body: "Eine Murrina ist eine Scheibe, geschnitten von einem langen, Schicht für Schicht aufgebauten Glasstab, sodass sein Querschnitt ein Muster zeigt — eine Blume, einen Stern, ein Gesicht. Millefiori („tausend Blumen“) ist der bekannteste Murrine-Stil. Die Scheiben werden auf der Oberfläche einer Perle oder Vase angeordnet und mit Hitze verschmolzen, sodass sich das Muster durch das gesamte Glas zieht, statt nur an der Oberfläche zu liegen.",
    },
    {
      name: "Filigrana (Filigran)",
      body: "Dünne Stäbe aus weißem oder farbigem Glas, manchmal gedreht (retortoli) oder zu einem feinen Netz gekreuzt (reticello), werden vor dem Formen in klares Glas eingebettet — sichtbar als feine Fäden, die das Stück durchziehen.",
    },
    {
      name: "Sommerso",
      body: "Italienisch für „untergetaucht“. Schichten aus unterschiedlich gefärbtem Glas werden nacheinander übereinander getaucht, jede umhüllt die vorherige vollständig, sodass ein Stück Tiefe und einen Farbverlauf zeigt statt eines einzigen flachen Tons.",
    },
    {
      name: "Avventurina (Aventuringlas)",
      body: "Glas mit winzigen, darin schwebenden Kupferkristallen, die ihm einen metallischen Glanz verleihen. Eine echte Erfindung Muranos, traditionell als eine der am strengsten gehüteten Formeln der Insel bewahrt.",
    },
    {
      name: "Gold- und Silberblattauflage",
      body: "Dünne Blätter aus echtem Gold oder Silber werden auf das noch heiße Glas gelegt und eingearbeitet, sodass das Metall Teil der Oberfläche wird, statt darauf zu liegen — die Quelle der metallischen Sprenkel und Maserungen, die bei vielen Stücken zu sehen sind.",
    },
    {
      name: "Craquelé (Eisglas)",
      body: "Heißes Glas wird kurz in kaltes Wasser getaucht, wodurch seine Oberfläche in ein feines Netz aus Rissen zerspringt; dann kommt es gerade lange genug zurück in den Ofen, um eine glatte Schicht darüber zu verschmelzen und das Muster zu versiegeln, ohne es zu verschmelzen.",
    },
    {
      name: "Sandstrahlen (sabbiatura)",
      body: "Wird kalt durchgeführt, nachdem das Stück vollständig geformt ist — ein feines Schleifmittel wird auf die Oberfläche geblasen, um ihren Glanz in ein mattes, mattiertes Finish zu verwandeln.",
    },
    {
      name: "Die Pontil-Marke",
      body: "Die raue (oder sorgfältig polierte) Markierung, die an einem Stück zurückbleibt, wo es von der Fangeisenstange gelöst wurde, die es während der Formgebung hielt. Massenproduziertes, in einer Form gegossenes Glas hat keine — eine echte Pontil-Marke ist eines der zuverlässigeren Zeichen für handgeblasenes Glas.",
    },
  ],
  authenticityTitle: "So erkennen Sie echtes Murano-Glas",
  authenticityIntro:
    "„Murano-Glas“ ist einer der am häufigsten imitierten Namen in der Schmuck- und Dekoglasbranche — massenproduzierte Perlen aus Fabriken anderswo (oft zu einem Bruchteil der Kosten) werden regelmäßig unter demselben Namen verkauft, besonders an Touristen in Venedig selbst. Es gibt eine echte Marke, Vetro Artistico® Murano, registriert vom Consorzio Promovetro Murano, die Öfen auf der Insel auf ihre Arbeiten anbringen können, um deren tatsächliche Herkunft zu bestätigen — aber viele echte, in kleinen Mengen gefertigte Arbeiten sind nicht formell zertifiziert, und viele scheinbare Zertifizierungsangaben sind erfunden. Der zuverlässigere Test ist das Glas selbst:",
  authenticitySigns: [
    "Kleine Luftblasen und leichte Asymmetrie — Zeichen, dass ein Mensch es geformt hat, keine Gussform.",
    "Farbe, die von Stück zu Stück im selben Set leicht variiert, statt perfekt einheitlich zu sein.",
    "Eine Pontil-Marke, wo zutreffend (siehe oben) — ein gegossenes Stück hat keine.",
    "Gewicht und Dicke, die sich substanziell anfühlen statt dünn und leicht — von Hand gesammeltes Glas trägt tendenziell mehr davon als ein maschinell geformtes Stück.",
    "Ein Preis, der echte Arbeit widerspiegelt. Ein erfahrener Glasmacher verbringt echte Zeit mit jeder einzelnen Perle; ein zu niedrig erscheinender Preis bedeutet meist, dass sie nicht so hergestellt wurde.",
  ],
  careTitle: "Pflege von Murano-Glasschmuck",
  careIntro:
    "Glas ist nachsichtiger, als man denkt, aber es bleibt Glas — ein paar Gewohnheiten lassen es länger halten.",
  careSteps: [
    {
      name: "Zuletzt anlegen",
      body: "Parfüm, Haarspray und Lotion können die Oberfläche von Glas mit der Zeit stumpf machen — tragen Sie diese zuerst auf, dann erst den Schmuck.",
    },
    {
      name: "Vor Wasser und Schlaf ablegen",
      body: "Legen Sie ihn vor dem Duschen, Schwimmen oder Schlafen ab, damit er nicht stundenlang angestoßen oder Chlor-/Salzwasser ausgesetzt wird.",
    },
    {
      name: "Nach dem Tragen abwischen",
      body: "Ein weiches, trockenes Tuch genügt, um ihn sauber zu halten — kein Schmuckreiniger oder Wasser nötig.",
    },
    {
      name: "Stücke getrennt aufbewahren",
      body: "Ein weicher Beutel oder eine ausgekleidete Box verhindert, dass Perlen aneinander oder gegen härteren Schmuck stoßen — die häufigste Ursache für Absplitterungen.",
    },
    {
      name: "Plötzliche Temperaturwechsel vermeiden",
      body: "Glasschmuck an einem sehr heißen Ort liegen zu lassen (Armaturenbrett, direkte Sonne) und ihn dann kalt anzufassen, kann das Glas belasten — dasselbe Thermoschock-Prinzip, das ein kaltes, mit heißem Wasser gefülltes Glas zerspringen lässt.",
    },
  ],
  shopCtaTitle: "Kollektion entdecken",
  shopCtaBody:
    "Jedes Stück in diesen Kollektionen wird mit den oben genannten Techniken hergestellt — stöbern Sie nach Kategorie, um sie zu sehen.",
  faqTitle: "Häufig gestellte Fragen",
  faq: [
    {
      question: "Ist Murano-Glas echtes Glas oder ein synthetisches Material?",
      answer:
        "Echtes Glas — eine Mischung aus Quarzsand, Soda und Kalk, bei hoher Temperatur in einem Ofen geschmolzen, dasselbe Grundrezept, das Glas seit Jahrhunderten verwendet. Was es speziell zu „Murano-Glas“ macht, ist, wo und wie es verarbeitet wird, nicht ein anderer Rohstoff.",
    },
    {
      question: "Was ist der Unterschied zwischen Murano-Glas und gewöhnlichem Glasschmuck?",
      answer:
        "Vor allem der Prozess: Murano-Glas wird von Hand geformt, Perle für Perle, mit Techniken wie Lampenglasarbeit, Murrine und Sommerso, statt gegossen oder in eine Form gepresst zu werden. Deshalb sind auch zwei „identische“ Murano-Stücke nie ganz identisch.",
    },
    {
      question: "Warum ist echtes Murano-Glas teurer als Imitationen?",
      answer:
        "Weil es echte, qualifizierte Arbeit und Zeit erfordert — ein Glasmacher formt jede Perle einzeln über offener Flamme. Massenproduziertes Imitationsglas, in einer Fabrik gegossen, überspringt fast diese gesamte Arbeit, weshalb es genau deshalb weniger kostet.",
    },
    {
      question: "Was ist eine Pontil-Marke, und sollte ich eine sehen können?",
      answer:
        "Es ist die Markierung, die zurückbleibt, wo ein handgeblasenes Stück von der Stange gelöst wurde, die es während der Formgebung hielt — manchmal als kleine raue oder polierte Stelle sichtbar. Nicht jede Technik hinterlässt eine offensichtliche, aber wo sie vorhanden ist, ist sie ein starkes Zeichen für Handarbeit.",
    },
    {
      question: "Warum sehen Perlen im selben Set leicht unterschiedlich aus?",
      answer:
        "Weil jede durch Menschenhand gegangen ist, nicht durch eine Form. Kleine Unterschiede in Farbe, Blasen und Form sind es, wie handgeblasenes Glas aussieht — kein Mangel.",
    },
    {
      question: "Wie reinige und lagere ich Murano-Glasschmuck?",
      answer:
        "Wischen Sie ihn nach dem Tragen mit einem weichen, trockenen Tuch ab, legen Sie ihn nach (nicht vor) Parfüm oder Lotion an, und bewahren Sie Stücke getrennt auf, damit sie nicht aneinanderstoßen. Die vollständige Liste finden Sie oben unter „Pflege von Murano-Glasschmuck“.",
    },
    {
      question: "Ist Glasschmuck umweltfreundlich?",
      answer:
        "Glas selbst ist eines der am besten recycelbaren Materialien überhaupt — es kann unbegrenzt eingeschmolzen und neu verarbeitet werden, ohne an Qualität zu verlieren, was auch mit erklärt, wie Muranos Öfen seit sieben Jahrhunderten denselben Rohstoff verarbeiten.",
    },
    {
      question: "Kann eine gesprungene oder angeschlagene Perle repariert werden?",
      answer:
        "In den meisten Fällen nicht unsichtbar — eine Reparatur ist meist sichtbar. Das ist der praktische Grund, Stöße und plötzliche Temperaturwechsel zu vermeiden (siehe Pflegeabschnitt oben), statt darauf zu setzen, Schäden im Nachhinein beheben zu können.",
    },
  ],
};

const ar: MuranoGuideContent = {
  metaTitle: "زجاج مورانو: التاريخ والتقنيات وكيفية التعرف على الأصلي",
  metaDescription:
    "دليل شامل لزجاج مورانو — تاريخه الممتد لسبعة قرون، وتقنيات اللهب والمورّينا والسوميرسو، وكيفية تمييز الزجاج الأصيل المنفوخ يدويًا عن التقليد، وكيفية العناية به.",
  title: "الدليل الشامل لزجاج مورانو",
  intro:
    "زجاج مورانو هو الزجاج المصنوع في مورانو، وهي جزيرة صغيرة في بحيرة البندقية كانت مركز صناعة الزجاج في البندقية لأكثر من 700 عام. الاسم محمي بعلامة تجارية إيطالية لسبب وجيه: فهو يصف مكانًا محددًا، ومجموعة محددة من التقنيات اليدوية، ومستوى من المهارة لا تمتلكه عادةً مجوهرات الزجاج المُنتَجة بكميات كبيرة والمباعة تحت الاسم نفسه. يتناول هذا الدليل من أين يأتي هذا الزجاج، وكيف يُصنع فعليًا، وكيف يمكن تمييز القطعة الأصيلة عن التقليد.",
  historyTitle: "لمحة تاريخية موجزة",
  historyParagraphs: [
    "في عام 1291، أمرت جمهورية البندقية بنقل جميع أفران صناعة الزجاج في المدينة إلى جزيرة مورانو. كان السبب الرسمي هو السلامة من الحرائق — إذ كانت الأفران تعمل ليلاً ونهارًا في مدينة مبنية بالكامل تقريبًا من الخشب — لكن ذلك أدى أيضًا إلى تجميع جميع صنّاع الزجاج في مكان واحد يسهل على الجمهورية التحكم فيه. كانت صناعة الزجاج على الجزيرة تخضع لنقابة خاصة بها، هي Arte dei Fioleri، وعلى مدى قرون تمتع صنّاع زجاج مورانو بمكانة مميزة حقًا (بل سُمح لبعضهم بالزواج من نبلاء البندقية)، مقابل قواعد صارمة تقيّد أماكن سفرهم ومن يمكنهم تدريبهم — وكانت مغادرة الجزيرة لممارسة الحرفة في مكان آخر تُعامَل، لفترة طويلة من هذا التاريخ، على أنها خيانة.",
    "كان عصر النهضة هو العصر الذهبي لمورانو. فحوالي عام 1450، طوّر صانع الزجاج أنجيلو باروفييه نوعًا يُعرف بـ«الكريستالو» — زجاج شفاف وعديم اللون بما يكفي لينافس البلور الصخري، وهو إنجاز تقني حقيقي في ذلك الوقت — وأصبحت مورانو على مدى القرون الثلاثة التالية المصدر الأوروبي الرئيسي للمرايا والثريّات الفاخرة. وأُحيِيت في الجزيرة وأُتقِنت تقنيتا المورّينا والميلفيوري (قضبان زجاجية يُظهر مقطعها العرضي نمطًا يشبه الفسيفساء، وهي تقنية قديمة تمتد جذورها إلى صناعة الزجاج الرومانية والمصرية). وفي القرن السابع عشر، يُقال إن أحد أفران مورانو اكتشف بالصدفة زجاج الأفنتورينا — زجاج مرصّع بجزيئات نحاسية دقيقة — وظل منذ ذلك الحين مادة مميزة لمورانو.",
    "كادت هذه الصناعة تنتهي مرتين. فقد أكل الزجاج الأرخص القادم من بوهيميا وفرنسا حصة مورانو من السوق خلال القرن الثامن عشر، ثم في عام 1797 أدى احتلال نابليون إلى حلّ جمهورية البندقية، ومعها نقابة صنّاع الزجاج — فانهار الإنتاج إلى جزء يسير مما كان عليه. والإحياء الذي تلا ذلك موثّق بشكل جيد بشكل غير معتاد: فقد أعاد أنطونيو سالفياتي إطلاق إنتاج الفسيفساء والزجاج على نطاق واسع في ستينيات القرن التاسع عشر، وساهم في تأسيس متحف زجاج مورانو عام 1861 للحفاظ على تاريخ الجزيرة وعرضه؛ وأسس باولو فينيني عام 1921 ما أصبح لاحقًا أحد أكثر الأفران تأثيرًا في الجزيرة. وما زال زجاج مورانو يُصنع يدويًا حتى اليوم، في أفران تعمل على الجزيرة، باستخدام التقنيات الأساسية نفسها تقريبًا التي كانت تُستخدم قبل سبعة قرون.",
  ],
  beadsTitle: "الخرز والتجارة وتاريخ معقّد",
  beadsBody:
    "الخرز المصنوع فرديًا بتقنية اللهب، مثل القطع الموجودة في هذا الكتالوج، هو أحد تقاليد مورانو — لكن لفترة طويلة من تاريخها، لم يكن أكبر صادرات الجزيرة من حيث الحجم زجاجًا فنيًا على الإطلاق. بل كان «الكونتيريه»: خرز زجاجي صغير رخيص الصنع، أُنتج بالملايين وشُحن عبر شبكات تجارة البندقية ابتداءً من القرن السادس عشر إلى أفريقيا وآسيا والأمريكتين، حيث استُخدم كشكل من أشكال العملة — بما في ذلك، وهو أمر مقلق، ضمن تجارة الرقيق عبر الأطلسي. كان لهذا التقليد الإنتاجي الجماعي نقابته الخاصة وعماله الخاصون، وهم مختلفون عن معلمي الأفران الذين كانوا يصنعون الكريستالو والثريّات. إنها حرفة مختلفة عن القطع المُشكَّلة فرديًا الواردة في هذا الدليل، لكنها جزء من تاريخ الجزيرة نفسها، وهي سبب رئيسي في أن خرز الزجاج الفينيسي ما زال يُعثر عليه في مجموعات المتاحف والمواقع الأثرية في أربع قارات حتى اليوم.",
  techniquesTitle: "التقنيات موضّحة",
  techniques: [
    {
      name: "اللهب (lavorazione a lume)",
      body: "تشكيل قضيب زجاجي فوق لهب مكشوف بدلاً من الفرن — وهي التقنية وراء معظم الخرز الفردي. يُسخّن الحرفي طرف قضيب زجاجي ملوّن حتى يصبح منصهرًا، ثم يلفّه حول قالب معدني لتشكيل الخرزة، ويُشكّلها بالأدوات والجاذبية بينما لا تزال طرية.",
    },
    {
      name: "النفخ (soffiatura)",
      body: "جمع الزجاج المنصهر من الفرن على طرف أنبوب النفخ وتشكيله بنفخ الهواء فيه أثناء تدويره — وهي التقنية وراء الأشكال المجوّفة الأكبر حجمًا مثل المزهريات والخرز الأكبر.",
    },
    {
      name: "المورّينا والميلفيوري",
      body: 'المورّينا هي شريحة مقطوعة من قضيب زجاجي طويل بُني طبقة فوق طبقة، بحيث يُظهر مقطعها العرضي نمطًا — زهرة، نجمة، وجهًا. الميلفيوري ("ألف زهرة") هو النمط الأكثر شهرة من المورّينا. تُرتَّب الشرائح على سطح خرزة أو مزهرية وتُدمَج بالحرارة، بحيث يمتد النمط عبر الزجاج بالكامل بدلاً من أن يبقى على السطح فقط.',
    },
    {
      name: "الفيليغرانا (التخريم)",
      body: "قضبان رفيعة من الزجاج الأبيض أو الملوّن، مفتولة أحيانًا (retortoli) أو متقاطعة في شبكة دقيقة (reticello)، تُدمَج داخل الزجاج الشفاف قبل تشكيله — وتظهر كخيوط رقيقة تمتد عبر القطعة.",
    },
    {
      name: "السوميرسو",
      body: 'كلمة إيطالية تعني "المغمور". تُغمس طبقات من الزجاج بألوان مختلفة الواحدة فوق الأخرى، وتُحيط كل طبقة بالسابقة إحاطة كاملة، بحيث تُظهر القطعة عمقًا وتدرجًا بين الألوان بدلاً من لون واحد مسطح.',
    },
    {
      name: "الأفنتورينا (زجاج الأفنتورين)",
      body: "زجاج تتعلق داخله بلورات نحاسية دقيقة، ما يمنحه بريقًا معدنيًا. اختراع مورانوي أصيل، ظل تقليديًا واحدًا من أكثر التركيبات حراسةً في الجزيرة.",
    },
    {
      name: "رقائق الذهب والفضة",
      body: "توضع رقائق رفيعة من الذهب أو الفضة الحقيقية على الزجاج وهو لا يزال ساخنًا وتُدمج فيه، بحيث يصبح المعدن جزءًا من السطح بدلاً من أن يبقى فوقه — وهو مصدر البريق المعدني والعروق التي تظهر في العديد من القطع.",
    },
    {
      name: "الكراكليه (زجاج الجليد)",
      body: "يُغمس الزجاج الساخن لفترة وجيزة في ماء بارد، ما يشقق سطحه إلى شبكة دقيقة من الشروخ، ثم يعود إلى الفرن لوقت يكفي فقط لدمج طبقة ناعمة فوق السطح وتثبيت النمط دون إذابته.",
    },
    {
      name: "الرمل (sabbiatura)",
      body: "تُنفَّذ باردةً، بعد اكتمال تشكيل القطعة — يُنفخ مادة كاشطة دقيقة على السطح لتحويل لمعانه إلى لمسة نهائية غير لامعة وضبابية.",
    },
    {
      name: "علامة القنطلة (pontil)",
      body: "الأثر الخشن (أو المصقول بعناية) المتروك على القطعة في المكان الذي فُصلت فيه عن قضيب القنطلة الذي كان يحملها أثناء التشكيل. الزجاج المُنتَج بكميات كبيرة، المُشكَّل في قالب، لا يحمل هذا الأثر — وعلامة القنطلة الحقيقية من أكثر علامات الزجاج المنفوخ يدويًا موثوقية.",
    },
  ],
  authenticityTitle: "كيفية التعرف على زجاج مورانو الأصلي",
  authenticityIntro:
    '"زجاج مورانو" هو أحد أكثر الأسماء تقليدًا في عالم المجوهرات والزجاج الزخرفي — إذ يُباع خرز مُنتَج بكميات كبيرة في مصانع في أماكن أخرى (غالبًا بجزء يسير من التكلفة) بانتظام تحت الاسم نفسه، خاصةً للسياح في البندقية نفسها. توجد علامة تجارية فعلية، Vetro Artistico® Murano، مسجَّلة لدى Consorzio Promovetro Murano، يمكن للأفران في الجزيرة وضعها على أعمالها للتصديق على مكان صنعها الحقيقي — لكن الكثير من الأعمال الأصيلة المصنوعة بكميات صغيرة غير معتمدة رسميًا، والكثير من الادعاءات التي تبدو معتمدة مُختلَقة. الفحص الأكثر موثوقية يبقى الزجاج نفسه:',
  authenticitySigns: [
    "فقاعات هواء صغيرة وعدم تناظر طفيف — علامات على أن إنسانًا شكّله، لا قالب.",
    "لون يتغيّر بشكل طفيف من قطعة إلى أخرى في المجموعة نفسها، بدلاً من أن يكون موحدًا تمامًا.",
    "علامة قنطلة حيثما ينطبق ذلك (انظر أعلاه) — القطعة المصنوعة بقالب لن تحملها.",
    "وزن وسماكة يُشعران بالثقل بدلاً من الرقة والخفة — الزجاج المُجمَّع يدويًا يميل لأن يحمل وزنًا أكبر من القطعة المُشكَّلة آليًا.",
    "سعر يعكس عملاً حقيقيًا. يقضي الحرفي الماهر وقتًا حقيقيًا في كل خرزة على حدة؛ وسعر يبدو منخفضًا جدًا لذلك عادةً ما يعني أنها لم تُصنع بهذه الطريقة.",
  ],
  careTitle: "العناية بمجوهرات زجاج مورانو",
  careIntro: "الزجاج أكثر تسامحًا مما يتوقع الناس، لكنه يبقى زجاجًا — بضع عادات بسيطة تجعله يدوم طويلاً.",
  careSteps: [
    {
      name: "ارتده أخيرًا",
      body: "يمكن للعطور ورذاذ الشعر والمستحضرات أن تُفقد سطح الزجاج بريقه مع الوقت — ضعها أولاً، ثم ارتدِ مجوهراتك.",
    },
    {
      name: "انزعه قبل الماء والنوم",
      body: "انزعه قبل الاستحمام أو السباحة أو النوم، حتى لا يصطدم بشيء أو يتعرض للكلور أو الماء المالح لساعات متواصلة.",
    },
    {
      name: "امسحه بعد الارتداء",
      body: "تكفي قطعة قماش ناعمة وجافة للحفاظ على نظافته — لا حاجة لمنظف مجوهرات أو ماء.",
    },
    {
      name: "خزّن القطع منفصلة",
      body: "كيس ناعم أو صندوق مبطّن يمنع اصطدام الخرز ببعضه أو بمجوهرات أصلب، وهو السبب الأكثر شيوعًا لتشقق القطع.",
    },
    {
      name: "تجنّب التغيرات المفاجئة في درجة الحرارة",
      body: "ترك مجوهرات الزجاج في مكان حار جدًا (لوحة قيادة السيارة، أشعة الشمس المباشرة) ثم التعامل معها وهي باردة قد يُجهد الزجاج — وهو مبدأ الصدمة الحرارية نفسه الذي يشقق كأسًا باردًا مُلئ بماء ساخن.",
    },
  ],
  shopCtaTitle: "تسوّق المجموعة",
  shopCtaBody: "كل قطعة في هذه المجموعات مصنوعة باستخدام التقنيات المذكورة أعلاه — تصفّح حسب الفئة لرؤيتها.",
  faqTitle: "أسئلة شائعة",
  faq: [
    {
      question: "هل زجاج مورانو زجاج حقيقي، أم مادة اصطناعية؟",
      answer:
        'زجاج حقيقي — مزيج من رمل السيليكا والصودا والجير يُصهر بدرجة حرارة عالية في الفرن، وهي الوصفة الأساسية نفسها التي استُخدمت لصناعة الزجاج منذ قرون. ما يجعله "زجاج مورانو" تحديدًا هو مكان وطريقة تشكيله، وليس مادة خام مختلفة.',
    },
    {
      question: "ما الفرق بين زجاج مورانو ومجوهرات الزجاج العادية؟",
      answer:
        'الفرق الأساسي هو طريقة التصنيع: يُشكَّل زجاج مورانو يدويًا، خرزة بخرزة، باستخدام تقنيات مثل اللهب والمورّينا والسوميرسو، بدلاً من الصب أو الكبس في قالب. ولهذا السبب أيضًا لا تتطابق قطعتان "متماثلتان" من مورانو تمامًا أبدًا.',
    },
    {
      question: "لماذا يُعد زجاج مورانو الأصلي أغلى من التقليد؟",
      answer:
        "لأنه يتطلب عملاً حرفيًا ماهرًا ووقتًا حقيقيًا — إذ يُشكّل الحرفي كل خرزة على حدة فوق لهب مكشوف. أما الزجاج المقلَّد المُنتَج بكميات كبيرة، والمُشكَّل في قوالب داخل مصنع، فيتخطى تقريبًا كل هذا العمل، وهذا بالضبط سبب انخفاض سعره.",
    },
    {
      question: "ما هي علامة القنطلة، وهل يجب أن أتمكن من رؤيتها؟",
      answer:
        "هي الأثر المتروك في المكان الذي فُصلت فيه قطعة منفوخة يدويًا عن القضيب الذي كان يحملها أثناء التشكيل — وتظهر أحيانًا كبقعة صغيرة خشنة أو مصقولة. لا تترك كل تقنية أثرًا واضحًا، لكن حيثما وُجد، فهو دليل قوي على العمل اليدوي.",
    },
    {
      question: "لماذا يبدو الخرز في المجموعة نفسها مختلفًا قليلاً عن بعضه؟",
      answer:
        "لأن كل خرزة مرّت بين يدي إنسان، لا عبر قالب. الاختلافات الطفيفة في اللون والفقاعات والشكل هي ما يبدو عليه الزجاج المنفوخ يدويًا — وليست عيبًا.",
    },
    {
      question: "كيف أنظّف وأخزّن مجوهرات زجاج مورانو؟",
      answer:
        'امسحها بقطعة قماش ناعمة وجافة بعد الارتداء، وارتدِها بعد (لا قبل) العطر أو المستحضرات، وخزّن القطع منفصلة حتى لا تصطدم ببعضها. راجع "العناية بمجوهرات زجاج مورانو" أعلاه للحصول على القائمة الكاملة.',
    },
    {
      question: "هل مجوهرات الزجاج صديقة للبيئة؟",
      answer:
        "الزجاج نفسه من أكثر المواد قابلية لإعادة التدوير — يمكن صهره وإعادة تشكيله إلى ما لا نهاية دون أن يفقد جودته، وهو جزء من سبب استمرار أفران مورانو في العمل بالمادة الخام نفسها منذ سبعة قرون.",
    },
    {
      question: "هل يمكن إصلاح خرزة متشققة أو مكسورة؟",
      answer:
        "ليس دون أن يظهر ذلك، في معظم الحالات — إذ يظهر الإصلاح عادةً. وهذا هو السبب العملي لتجنب الصدمات والتغيرات المفاجئة في درجة الحرارة (انظر قسم العناية أعلاه) بدلاً من الاعتماد على إصلاح الضرر لاحقًا.",
    },
  ],
};

const zh: MuranoGuideContent = {
  metaTitle: "穆拉诺玻璃：历史、工艺与真伪辨别指南",
  metaDescription:
    "一份关于穆拉诺玻璃的完整指南——700 年的悠久历史，灯工、马赛克嵌花（murrine）与套色（sommerso）等工艺，如何辨别手工吹制的真品与仿制品，以及如何保养。",
  title: "穆拉诺玻璃完整指南",
  intro:
    "穆拉诺玻璃是在穆拉诺岛制作的玻璃制品——这座威尼斯潟湖中的小岛，700 多年来一直是威尼斯的玻璃制造中心。这个名称受到意大利商标法保护，理由充分：它指代一个特定的地点、一整套特定的手工技艺，以及一种以相同名义出售的批量生产玻璃饰品通常并不具备的高超技艺水平。本指南将介绍它的起源、真正的制作方式，以及如何辨别真品与仿制品。",
  historyTitle: "简史",
  historyParagraphs: [
    "1291 年，威尼斯共和国下令将城内所有玻璃炉窑迁至穆拉诺岛。官方给出的理由是防火安全——在这座几乎全由木材建造的城市中，炉窑昼夜不停地运转——但这一举措同时也把所有玻璃工匠集中到了一个共和国便于管控的地方。岛上的玻璃制造由专门的行会 Arte dei Fioleri 管理，此后数个世纪，穆拉诺的玻璃工匠享有真正的特殊地位（有些人甚至获准与威尼斯贵族联姻），但代价是严格限制他们的出行范围以及可以传授技艺的对象——在很长一段历史时期内，擅自离岛到别处从业会被视为叛国行为。",
    "文艺复兴时期是穆拉诺的黄金时代。约 1450 年，一位名叫安杰洛·巴罗维耶（Angelo Barovier）的玻璃工匠研制出了 cristallo（水晶玻璃）——一种清澈无色、足以媲美天然水晶的玻璃，在当时堪称真正的技术突破——此后的三个世纪里，穆拉诺成为欧洲精美镜子与吊灯的主要产地。马赛克嵌花（murrine）与千花（millefiori，横截面呈马赛克图案的玻璃棒，一项源自古罗马和古埃及玻璃工艺的古老技艺）也在岛上得到复兴与精进。据说 17 世纪时，穆拉诺的一座炉窑偶然发现了金星玻璃（avventurina）——内含细小铜晶体的玻璃——此后它一直是穆拉诺的标志性材料。",
    "这个产业曾两度濒临消亡。18 世纪，来自波希米亚和法国的廉价玻璃不断蚕食穆拉诺的市场；1797 年，拿破仑占领威尼斯，威尼斯共和国及其玻璃工匠行会随之解体，产量骤降至昔日的一小部分。此后的复兴过程有着异常详实的记录：安东尼奥·萨尔维亚蒂（Antonio Salviati）在 19 世纪 60 年代重启了大规模马赛克与玻璃生产，并于 1861 年协助创立穆拉诺玻璃博物馆，以保存和展示这座岛屿自身的历史；保罗·维尼尼（Paolo Venini）于 1921 年创立了后来成为岛上最具影响力的炉窑之一的工坊。时至今日，穆拉诺玻璃仍在岛上运转的炉窑中手工制作，所用的核心工艺与七个世纪前大体相同。",
  ],
  beadsTitle: "玻璃珠、贸易与一段复杂的历史",
  beadsBody:
    "像本目录中这样单独以灯工工艺制作的玻璃珠，是穆拉诺的传统之一——但在其历史的很长一段时期里，这座岛屿按数量计算的最大出口商品其实根本不是艺术玻璃，而是 conterie：一种廉价批量生产的小玻璃珠，数以百万计地被制造出来，自 16 世纪起经由威尼斯的贸易网络运往非洲、亚洲和美洲，在那里被用作一种货币——其中令人不安的是，也包括跨大西洋奴隶贸易。这种批量生产传统有着自己独立的行会和工人群体，与制作水晶玻璃和吊灯的炉窑大师们截然不同。这与本指南中介绍的单件手工成型作品是不同的技艺，但同属这座岛屿历史的一部分，也在很大程度上解释了为何威尼斯玻璃珠至今仍出现在四大洲的博物馆藏品和考古发掘现场中。",
  techniquesTitle: "工艺详解",
  techniques: [
    {
      name: "灯工（lavorazione a lume）",
      body: "在明火而非炉窑上塑形玻璃棒的工艺——大多数单颗玻璃珠都以此工艺制成。工匠将彩色玻璃棒的一端加热至熔融状态，绕在金属芯棒上形成珠形，然后趁玻璃仍柔软时借助工具和重力进行塑形。",
    },
    {
      name: "吹制（soffiatura）",
      body: "用吹管从炉窑中蘸取熔融玻璃，一边转动一边向内吹气使其成型——花瓶等较大的中空器型以及较大的玻璃珠都采用这种工艺。",
    },
    {
      name: "马赛克嵌花与千花（murrine e millefiori）",
      body: "murrina 是从一根逐层堆叠而成的长玻璃棒上切下的薄片，其横截面会呈现出花朵、星星、面孔等图案。千花（“千朵花”）是最广为人知的马赛克嵌花风格。这些薄片被排列在玻璃珠或花瓶表面，再经高温熔合，使图案贯穿玻璃内部，而不只是浮在表面。",
    },
    {
      name: "细丝工艺（filigrana）",
      body: "白色或彩色的细玻璃条，有时被拧成绞丝状（retortoli）或交织成细网状（reticello），在成型前被嵌入透明玻璃中——成品中可见细腻的丝线纹理贯穿其间。",
    },
    {
      name: "套色玻璃（sommerso）",
      body: "意大利语意为“浸没”。将不同颜色的玻璃层一层层依次浸蘸叠加，每一层都完全包裹前一层，使成品呈现出层次感和色彩渐变，而非单一的平面色调。",
    },
    {
      name: "金星玻璃（avventurina）",
      body: "内部悬浮着细小铜晶体的玻璃，因而带有金属般的闪光效果。这是穆拉诺的独创发明，其配方传统上是岛上守护最严密的秘密之一。",
    },
    {
      name: "金箔与银箔",
      body: "在玻璃仍炽热时，将真正的金箔或银箔薄片贴附其上并融入其中，使金属成为表面的一部分，而不只是覆盖其上——这正是许多作品中金属光斑与纹理的来源。",
    },
    {
      name: "冰裂纹（craquelé，冰纹玻璃）",
      body: "将热玻璃短暂浸入冷水，使其表面炸裂形成细密的裂纹网络，随后送回炉中，仅需足够的时间在表面熔合出一层光滑釉面，将裂纹图案封存其中而不使其消失。",
    },
    {
      name: "喷砂（sabbiatura）",
      body: "在作品完全成型后于冷态下进行——用细腻的研磨材料喷射表面，使其光泽转变为哑光的磨砂质感。",
    },
    {
      name: "彭提尔痕（pontil mark）",
      body: "作品从支撑其塑形过程的彭提尔杆上断开处留下的痕迹，可能是粗糙的，也可能经过精心打磨。模具铸造的批量生产玻璃不会留下这种痕迹——真正的彭提尔痕是手工吹制玻璃较为可靠的标志之一。",
    },
  ],
  authenticityTitle: "如何辨别正宗的穆拉诺玻璃",
  authenticityIntro:
    "“穆拉诺玻璃”是珠宝与装饰玻璃领域被仿冒最多的名称之一——产自其他地方工厂、批量生产的玻璃珠（成本往往只是正品的一小部分）经常以同样的名义出售，尤其是卖给威尼斯本地的游客。确实存在一个正式商标 Vetro Artistico® Murano，由 Consorzio Promovetro Murano 注册，岛上的炉窑可以将其标注在作品上以证明真实产地——但许多货真价实的小批量作品并未经过正式认证，而许多听起来像是认证的说法其实是编造的。更可靠的辨别方法，是看玻璃本身：",
  authenticitySigns: [
    "细小的气泡和轻微的不对称——表明是人手塑形，而非模具铸造。",
    "同一系列中不同作品之间色彩存在细微差异，而非完全一致。",
    "适用情况下带有彭提尔痕（见上文）——模具铸造的作品不会有这种痕迹。",
    "分量与厚度让人感觉扎实，而非轻薄——手工聚料的玻璃通常比机器成型的作品更有分量。",
    "价格能够反映真实的人工成本。一位熟练的灯工工匠会为每一颗玻璃珠投入真正的时间；如果价格低得不合常理，通常意味着它并非以这种方式制成。",
  ],
  careTitle: "穆拉诺玻璃珠宝的保养方法",
  careIntro: "玻璃其实比人们想象的更耐用，但它终究是玻璃——养成几个小习惯就能让它使用得更久。",
  careSteps: [
    {
      name: "最后佩戴",
      body: "香水、发胶和乳液久而久之会使玻璃表面失去光泽——请先使用这些护理品，再佩戴首饰。",
    },
    {
      name: "沐浴和睡觉前摘下",
      body: "淋浴、游泳或睡觉前请摘下首饰，以免长时间受到碰撞或接触氯水/盐水。",
    },
    {
      name: "佩戴后擦拭干净",
      body: "用柔软的干布擦拭即可保持清洁——无需使用珠宝清洁剂或清水。",
    },
    {
      name: "分开存放各件首饰",
      body: "使用柔软的首饰袋或带衬里的首饰盒，避免玻璃珠相互碰撞或与较硬的首饰碰撞，这是造成崩裂最常见的原因。",
    },
    {
      name: "避免温度骤变",
      body: "将玻璃首饰长时间放在非常炎热的地方（如车内仪表盘上、阳光直射处），随后在其仍冷的状态下把玩，可能会使玻璃承受应力——这与装满热水的冷玻璃杯会因热胀冷缩而破裂是同样的原理。",
    },
  ],
  shopCtaTitle: "选购系列产品",
  shopCtaBody: "这些系列中的每件作品都采用上述工艺制作——按分类浏览即可一探究竟。",
  faqTitle: "常见问题",
  faq: [
    {
      question: "穆拉诺玻璃是真正的玻璃，还是某种合成材料？",
      answer:
        "是真正的玻璃——由硅砂、纯碱和石灰在炉窑中高温熔融而成，这是玻璃沿用了数个世纪的基本配方。真正让它成为“穆拉诺玻璃”的，是制作的地点和方式，而非不同的原材料。",
    },
    {
      question: "穆拉诺玻璃与普通玻璃饰品有什么区别？",
      answer:
        "主要区别在于制作工艺：穆拉诺玻璃是逐颗手工塑形的，采用灯工、马赛克嵌花、套色等工艺，而不是浇铸或压制于模具中。这也是为什么两件“相同”的穆拉诺作品永远不会完全一模一样。",
    },
    {
      question: "为什么正宗的穆拉诺玻璃比仿制品更贵？",
      answer:
        "因为它需要真正熟练的手艺和实实在在的时间——灯工工匠要在明火上逐颗手工塑形每一颗玻璃珠。而在工厂模具中批量生产的仿制玻璃几乎省去了这全部工序，这正是其价格更低的原因。",
    },
    {
      question: "什么是彭提尔痕？我应该能看到它吗？",
      answer:
        "这是手工吹制作品从支撑其塑形的支杆上断开处留下的痕迹，有时表现为一小块粗糙或经打磨的区域。并非每种工艺都会留下明显的痕迹，但如果存在，就是手工制作的有力证明。",
    },
    {
      question: "为什么同一套装中的玻璃珠看起来略有不同？",
      answer: "因为每一颗都经过人手制作，而非模具铸造。色彩、气泡和形状上的细微差异正是手工吹制玻璃的本色所在——而不是瑕疵。",
    },
    {
      question: "如何清洁和存放穆拉诺玻璃首饰？",
      answer:
        "佩戴后用柔软的干布擦拭，先喷香水或涂抹乳液，之后再佩戴首饰，并将各件分开存放以避免相互碰撞。完整说明请参见上文“穆拉诺玻璃珠宝的保养方法”。",
    },
    {
      question: "玻璃饰品环保吗？",
      answer:
        "玻璃本身是可回收性最强的材料之一——可以无限次熔化重塑而不损失品质，这也是穆拉诺的炉窑能够用同一种原材料持续制作了七个世纪的部分原因。",
    },
    {
      question: "破裂或崩角的玻璃珠可以修复吗？",
      answer:
        "在大多数情况下无法做到不留痕迹——修复痕迹通常都能看出来。因此更实际的做法是避免碰撞和温度骤变（参见上文保养部分），而不是指望事后修复损伤。",
    },
  ],
};

const ru: MuranoGuideContent = {
  metaTitle: "Муранское стекло: история, техники и как отличить подлинник",
  metaDescription:
    "Полный гид по муранскому стеклу — его 700-летняя история, техники работы на горелке, изготовления мурринов и сомерсо, как отличить подлинное стекло ручной выдувки от подделок и как за ним ухаживать.",
  title: "Полный гид по муранскому стеклу",
  intro:
    "Муранское стекло — это стекло, изготовленное на Мурано, небольшом острове в Венецианской лагуне, который уже более 700 лет остаётся центром венецианского стеклоделия. Это название не просто так защищено итальянским товарным знаком: оно обозначает конкретное место, конкретный набор ручных техник и уровень мастерства, которого обычно нет у массово производимых стеклянных украшений, продающихся под тем же именем. Этот гид расскажет, откуда оно взялось, как изготавливается на самом деле и как отличить подлинное изделие от подделки.",
  historyTitle: "Краткая история",
  historyParagraphs: [
    "В 1291 году Венецианская республика приказала перенести все стекольные печи города на остров Мурано. Официальной причиной была пожарная безопасность — печи работали днём и ночью в городе, построенном почти целиком из дерева, — но это решение имело и другой эффект: все стеклодувы оказались сосредоточены в одном месте, которое республика могла контролировать. Стеклоделие на острове регулировалось собственной гильдией, Arte dei Fioleri, и на протяжении веков мастера Мурано пользовались поистине привилегированным статусом (некоторым даже разрешалось жениться на венецианской знати) — в обмен на строгие правила, ограничивающие, куда они могут выезжать и кого могут обучать: покидать остров, чтобы заниматься ремеслом в другом месте, долгое время считалось едва ли не государственной изменой.",
    "Эпоха Возрождения стала золотым веком Мурано. Примерно в 1450 году стеклодув по имени Анджело Баровьер разработал кристалло — стекло настолько прозрачное и бесцветное, что могло соперничать с горным хрусталём; для своего времени это было настоящим технологическим прорывом, — и на следующие три столетия Мурано стал главным источником изысканных зеркал и люстр в Европе. На острове были возрождены и доведены до совершенства техники мурринов и миллефиори (стеклянных тростей с мозаичным узором в поперечном срезе — древняя техника, уходящая корнями в римское и египетское стеклоделие). В XVII веке, как гласит предание, в одной из печей Мурано случайно открыли авантюриновое стекло — стекло с вкраплениями крошечных медных кристаллов, — и с тех пор оно остаётся фирменным материалом острова.",
    "Дважды эта отрасль оказывалась на грани исчезновения. На протяжении XVIII века более дешёвое стекло из Богемии и Франции теснило Мурано на рынке, а в 1797 году наполеоновская оккупация упразднила Венецианскую республику, а вместе с ней и гильдию стеклодувов — производство сократилось до малой доли прежнего объёма. Последовавшее возрождение задокументировано на удивление хорошо: Антонио Сальвиати в 1860-х годах возобновил масштабное производство мозаики и стекла и помог основать в 1861 году Музей стекла Мурано, чтобы сохранить и показать историю острова; Паоло Венини в 1921 году основал мастерскую, ставшую впоследствии одной из самых влиятельных печей острова. Муранское стекло и сегодня изготавливается вручную, в действующих печах на острове, в основном теми же базовыми техниками, что и семь веков назад.",
  ],
  beadsTitle: "Бусины, торговля и непростая история",
  beadsBody:
    "Бусины, изготовленные поштучно на горелке — такие, как в этом каталоге, — одна из традиций Мурано, но на протяжении долгого периода своей истории главным экспортным товаром острова по объёму было вовсе не художественное стекло. Это были контерие: маленькие, дёшево изготовленные стеклянные бусины, которые производились миллионами и с XVI века поставлялись через торговые сети Венеции в Африку, Азию и Америку, где использовались как своего рода валюта — в том числе, что неприятно признавать, в рамках трансатлантической работорговли. У этого массового производства была своя отдельная гильдия и свои работники, отличные от мастеров печей, создававших кристалло и люстры. Это иное ремесло, чем отдельно формируемые изделия, о которых рассказывает этот гид, но оно — часть истории того же острова, и во многом именно поэтому венецианские стеклянные бусины до сих пор находят в музейных коллекциях и при археологических раскопках на четырёх континентах.",
  techniquesTitle: "Техники: подробный разбор",
  techniques: [
    {
      name: "Работа на горелке (lavorazione a lume)",
      body: "Формирование стеклянного стержня над открытым пламенем, а не в печи — техника, лежащая в основе большинства отдельных бусин. Мастер разогревает кончик цветного стеклянного стержня до расплавленного состояния, наматывает его на металлический стержень-оправку, формируя бусину, и придаёт ей форму инструментами и силой тяжести, пока стекло ещё мягкое.",
    },
    {
      name: "Выдувание (soffiatura)",
      body: "Набор расплавленного стекла из печи на конец стеклодувной трубки и формирование изделия за счёт вдувания воздуха при одновременном вращении — техника, лежащая в основе более крупных полых форм, таких как вазы и более крупные бусины.",
    },
    {
      name: "Муррины и миллефиори",
      body: "Муррина — это срез, сделанный с длинной стеклянной трости, собранной слой за слоем так, что в поперечном сечении виден узор — цветок, звезда, лицо. Миллефиори («тысяча цветов») — самый известный стиль мурринов. Срезы размещают на поверхности бусины или вазы и соединяют при помощи нагрева, так что узор проходит сквозь всю толщу стекла, а не остаётся только на поверхности.",
    },
    {
      name: "Филигрень (filigrana)",
      body: "Тонкие трости из белого или цветного стекла, иногда скрученные (retortoli) или перекрещенные в тонкую сетку (reticello), вплавляются в прозрачное стекло до того, как оно принимает форму, — они видны как изящные нити, пронизывающие изделие.",
    },
    {
      name: "Сомерсо",
      body: "С итальянского — «погружённый». Слои стекла разных цветов поочерёдно обмакиваются один поверх другого, полностью охватывая предыдущий слой, так что изделие приобретает глубину и плавный переход между цветами, а не один плоский тон.",
    },
    {
      name: "Авентурина (авантюриновое стекло)",
      body: "Стекло с крошечными медными кристаллами внутри, придающими ему металлический блеск. Подлинное изобретение Мурано, традиционно хранившееся как одна из самых тщательно оберегаемых формул острова.",
    },
    {
      name: "Сусальное золото и серебро",
      body: "Тонкие листы настоящего золота или серебра накладываются на ещё горячее стекло и вплавляются в него, так что металл становится частью поверхности, а не лежит поверх неё, — именно отсюда берутся металлические вкрапления и прожилки, заметные на многих изделиях.",
    },
    {
      name: "Кракле (ледяное стекло)",
      body: "Горячее стекло ненадолго погружают в холодную воду, отчего его поверхность покрывается тонкой сеткой трещин, после чего изделие возвращают в печь ровно настолько, чтобы сплавить сверху гладкий слой, запечатав узор, не расплавив его.",
    },
    {
      name: "Пескоструйная обработка (sabbiatura)",
      body: "Выполняется в холодном состоянии, после того как изделие полностью сформировано, — тонкий абразив направляют на поверхность, превращая её блеск в матовую, «морозную» текстуру.",
    },
    {
      name: "След понтии",
      body: "Грубый (или тщательно отполированный) след, остающийся на изделии в месте, где оно было отделено от понтии — стержня, удерживавшего его во время формовки. У массово производимого литого в форме стекла такого следа нет — подлинный след понтии считается одним из наиболее надёжных признаков стекла ручной выдувки.",
    },
  ],
  authenticityTitle: "Как распознать подлинное муранское стекло",
  authenticityIntro:
    "«Муранское стекло» — одно из самых подделываемых названий в ювелирном деле и декоративном стекле: бусины массового производства, изготовленные на фабриках в других местах (зачастую за малую долю стоимости), регулярно продаются под тем же названием, особенно туристам в самой Венеции. Существует официальный товарный знак, Vetro Artistico® Murano, зарегистрированный Consorzio Promovetro Murano, который печи острова могут наносить на свои изделия, подтверждая их подлинное происхождение, — однако многие подлинные изделия мелких партий формально не сертифицированы, а многие заявления, звучащие как сертификация, попросту выдуманы. Более надёжная проверка — само стекло:",
  authenticitySigns: [
    "Мелкие пузырьки воздуха и лёгкая асимметрия — признак того, что изделие формировал человек, а не форма.",
    "Цвет, который слегка меняется от изделия к изделию в пределах одного набора, а не абсолютно однороден.",
    "След понтии там, где это применимо (см. выше) — у литого в форме изделия его не будет.",
    "Вес и толщина, ощущающиеся весомо, а не тонко и легко — стекло, собранное вручную, как правило, весит больше, чем изделие машинной формовки.",
    "Цена, отражающая реальный труд. Опытный мастер тратит реальное время на каждую отдельную бусину; слишком низкая для этого цена обычно означает, что изделие изготовлено иначе.",
  ],
  careTitle: "Уход за украшениями из муранского стекла",
  careIntro: "Стекло прочнее, чем принято думать, но оно остаётся стеклом — несколько простых привычек продлят срок его службы.",
  careSteps: [
    {
      name: "Надевайте в последнюю очередь",
      body: "Духи, лак для волос и лосьон со временем могут притупить блеск стекла — сначала наносите их, а уже потом надевайте украшение.",
    },
    {
      name: "Снимайте перед водой и сном",
      body: "Снимайте украшение перед душем, плаванием или сном, чтобы оно не подвергалось ударам и не контактировало часами с хлорированной или солёной водой.",
    },
    {
      name: "Протирайте после ношения",
      body: "Достаточно мягкой сухой ткани, чтобы сохранить его чистым — не нужны ни средства для чистки украшений, ни вода.",
    },
    {
      name: "Храните изделия по отдельности",
      body: "Мягкий мешочек или футляр с мягкой подкладкой не позволит бусинам стучать друг о друга или о более твёрдые украшения — это самая частая причина сколов.",
    },
    {
      name: "Избегайте резких перепадов температуры",
      body: "Если оставить стеклянное украшение в очень горячем месте (на приборной панели автомобиля, под прямыми солнечными лучами), а затем взять его холодным, стекло может испытать нагрузку — тот же принцип термического шока, из-за которого трескается холодный стакан, наполненный горячей водой.",
    },
  ],
  shopCtaTitle: "Смотреть коллекцию",
  shopCtaBody: "Каждое изделие в этих коллекциях создано с использованием описанных выше техник — просмотрите товары по категориям, чтобы увидеть их.",
  faqTitle: "Часто задаваемые вопросы",
  faq: [
    {
      question: "Муранское стекло — это настоящее стекло или синтетический материал?",
      answer:
        "Настоящее стекло — смесь кварцевого песка, соды и извести, расплавленная при высокой температуре в печи; это тот же базовый рецепт, который используется веками. То, что делает его именно «муранским стеклом», — это место и способ обработки, а не другое сырьё.",
    },
    {
      question: "В чём разница между муранским стеклом и обычными стеклянными украшениями?",
      answer:
        "Прежде всего в процессе: муранское стекло формируется вручную, бусина за бусиной, с использованием таких техник, как работа на горелке, муррины и сомерсо, а не отливается или прессуется в форме. Именно поэтому два «одинаковых» изделия из Мурано никогда не бывают полностью идентичными.",
    },
    {
      question: "Почему подлинное муранское стекло дороже подделок?",
      answer:
        "Потому что требует настоящего квалифицированного труда и реального времени — мастер формирует каждую бусину индивидуально над открытым пламенем. Массово производимое имитационное стекло, отлитое в формах на фабрике, пропускает почти всю эту работу, и именно поэтому стоит дешевле.",
    },
    {
      question: "Что такое след понтии и должен ли я его видеть?",
      answer:
        "Это след, остающийся там, где изделие ручной выдувки было отделено от стержня, удерживавшего его во время формовки, — иногда он виден как небольшое шероховатое или отполированное пятно. Не каждая техника оставляет явный след, но там, где он присутствует, это весомый признак ручной работы.",
    },
    {
      question: "Почему бусины в одном наборе выглядят немного по-разному?",
      answer: "Потому что каждая из них прошла через руки человека, а не через форму. Небольшие различия в цвете, пузырьках и форме — это естественный вид стекла ручной выдувки, а не дефект.",
    },
    {
      question: "Как чистить и хранить украшения из муранского стекла?",
      answer:
        "Протирайте их мягкой сухой тканью после ношения, надевайте уже после (а не до) нанесения духов или лосьона и храните изделия отдельно друг от друга, чтобы они не соприкасались. Полный список см. в разделе «Уход за украшениями из муранского стекла» выше.",
    },
    {
      question: "Экологичны ли стеклянные украшения?",
      answer:
        "Само стекло — один из наиболее перерабатываемых материалов: его можно бесконечно переплавлять и обрабатывать заново без потери качества, и отчасти именно поэтому печи Мурано работают с одним и тем же сырьём уже семь столетий.",
    },
    {
      question: "Можно ли отремонтировать треснувшую или сколотую бусину?",
      answer:
        "В большинстве случаев — не незаметно: следы ремонта обычно видны. Именно поэтому практичнее избегать ударов и резких перепадов температуры (см. раздел об уходе выше), чем рассчитывать на исправление повреждений впоследствии.",
    },
  ],
};

const content: Record<Locale, MuranoGuideContent> = { en, it, fr, de, ar, zh, ru };

export function getMuranoGuideContent(locale: Locale): MuranoGuideContent {
  return content[locale];
}
