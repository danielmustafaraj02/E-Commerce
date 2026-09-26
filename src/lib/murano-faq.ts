import { db } from "@/lib/db";
import { deriveProductType, type ProductType } from "@/lib/gift-finder";
import { formatMoney } from "@/lib/format";
import type { FaqItem } from "@/lib/faq";

// The Murano questions page (app/murano-faq): from visiting the island to
// choosing a piece. Italian only for now, like the journal is English only,
// so every locale's copy names the Italian URL as canonical.
//
// Facts: the history, techniques and authenticity signs restate the Murano
// guide (lib/murano-guide-content.ts); vaporetto lines, times and fares were
// checked against ACTV (actv.avmspa.it, Sept 2026); the Vetro Artistico®
// Murano mark against Regione Veneto / Consorzio Promovetro (L.R. 70/1994).
// Prices come from the live catalogue. Never suggest this store's pieces
// carry the Vetro Artistico® Murano mark (launch-checklist.ts).

export const MURANO_FAQ_PATH = "/murano-faq";
export const MURANO_FAQ_LOCALE = "it" as const;
export const MURANO_FAQ_NAV_LABEL = "Domande su Murano";
const ACTV_FARES_URL = "https://actv.avmspa.it/it/content/urbano-venezia-0";

export const muranoFaqCopy = {
  metaTitle: "Domande su Murano, il vetro e i gioielli",
  metaDescription:
    "Come arrivare a Murano, quanto costa il vaporetto, come riconoscere il vero vetro di Murano e quanto costano collane, bracciali e orecchini: le risposte.",
  title: "Domande su Murano e sul suo vetro",
  lede: "Dalla visita all'isola alle tecniche dei maestri vetrai, fino alla scelta di un gioiello: le risposte alle domande che ci fate più spesso, in poche righe.",
  tocLabel: "Argomenti",
  count: (n: number) => `${n} domande`,
  more: "Altre domande",
  fewer: "Meno domande",
  endTitle: "Non hai trovato la tua domanda?",
  endBody: "Scrivici: ti rispondiamo il prima possibile, anche per un consiglio su un regalo.",
  endContact: "Contattaci",
  endShop: "Scopri i gioielli",
  italianOnly: "This page is available in Italian only.",
};

export type MuranoFaqGroup = { id: string; title: string; intro: string; items: FaqItem[] };

type Range = { min: number; max: number; href: string };
export type MuranoFaqFacts = {
  jewelry: { min: number; max: number } | null;
  byKind: Partial<Record<ProductType, Range>>;
  currency: string;
  storeName: string;
  giftCardPrice: number | null; // null when the gift card is off
};

// Live price ranges per kind of piece (necklaces, bracelets, earrings), and
// where each kind's collection lives.
export async function getMuranoFaqFacts(settings: {
  storeName: string;
  defaultCurrency: string;
  giftCardEnabled: boolean;
  giftCardPrice: number;
}): Promise<MuranoFaqFacts> {
  const products = await db.product.findMany({
    where: { active: true },
    select: { price: true, category: { select: { name: true, nameEn: true, slug: true } } },
  });
  const byKind: Partial<Record<ProductType, Range>> = {};
  let jewelry: { min: number; max: number } | null = null;
  for (const product of products) {
    const kind = deriveProductType(product.category ?? null);
    if (!kind || !product.category) continue;
    const range = byKind[kind];
    byKind[kind] = range
      ? { ...range, min: Math.min(range.min, product.price), max: Math.max(range.max, product.price) }
      : { min: product.price, max: product.price, href: `/category/${product.category.slug}` };
    jewelry = jewelry
      ? { min: Math.min(jewelry.min, product.price), max: Math.max(jewelry.max, product.price) }
      : { min: product.price, max: product.price };
  }
  return {
    jewelry,
    byKind,
    currency: settings.defaultCurrency,
    storeName: settings.storeName,
    giftCardPrice: settings.giftCardEnabled ? settings.giftCardPrice : null,
  };
}

export function buildMuranoFaq(facts: MuranoFaqFacts): MuranoFaqGroup[] {
  const money = (cents: number) => formatMoney(cents, facts.currency, "it-IT");
  const span = (r: { min: number; max: number } | null | undefined) =>
    r ? (r.min === r.max ? money(r.min) : `da ${money(r.min)} a ${money(r.max)}`) : null;
  const necklaces = facts.byKind.necklace;
  const bracelets = facts.byKind.bracelet;
  const earrings = facts.byKind.earrings;
  const jewelrySpan = span(facts.jewelry);
  const guide = (hash: string, label: string) => ({ href: `/murano-glass${hash}`, label });
  const collection = (range: Range | undefined, label: string) =>
    range ? [{ href: range.href, label }] : [];

  return [
    {
      id: "visitare-murano",
      title: "Visitare Murano",
      intro: "Come arrivare sull'isola, quanto costa il vaporetto e quanto tempo dedicarle.",
      items: [
        {
          id: "come-arrivare-a-murano",
          question: "Come si arriva a Murano da Venezia?",
          answer:
            "Il modo più semplice è il vaporetto ACTV: da Fondamente Nove le linee 4.1 e 4.2 arrivano alla fermata Murano Colonna in circa 9 minuti, con una corsa più o meno ogni dieci minuti. Dalla stazione di Santa Lucia e da Piazzale Roma c'è anche la linea 3, diretta, che impiega una ventina di minuti. Il taxi acqueo è più rapido, ma costa decisamente di più.",
        },
        {
          id: "biglietto-vaporetto-murano",
          question: "Quanto costa il biglietto per andare a Murano?",
          answer:
            "Un biglietto ordinario ACTV costa 9,50 € ed è valido 75 minuti dalla convalida, il tempo giusto per arrivare a Murano da Venezia. Se in giornata prevedi più tragitti, per esempio Murano e poi Burano, conviene un abbonamento turistico: 25 € per 24 ore, 35 € per 48 ore, 45 € per 72 ore. Le tariffe possono cambiare, quindi controllale sul sito ufficiale prima di partire.",
          links: [{ href: ACTV_FARES_URL, label: "Tariffe aggiornate sul sito ACTV", external: true }],
        },
        {
          id: "quanto-tempo-visitare-murano",
          question: "Quanto tempo serve per visitare Murano?",
          answer:
            "Per farsi un'idea bastano due o tre ore: il tempo di passeggiare lungo la Fondamenta dei Vetrai, assistere a una dimostrazione in fornace e visitare il Museo del Vetro. Se vuoi vedere anche la Basilica dei Santi Maria e Donato, girare con calma tra botteghe e gallerie e pranzare sull'isola, calcola mezza giornata. Una giornata intera ha senso soprattutto se la abbini a Burano.",
        },
        {
          id: "cosa-vedere-murano-poche-ore",
          question: "Cosa vedere a Murano in poche ore?",
          answer:
            "In poche ore concentrati sull'essenziale: una fornace dove vedere il vetro lavorato dal vivo, il Museo del Vetro a Palazzo Giustinian e una passeggiata lungo il Rio dei Vetrai, il canale su cui si affacciano molte vetrerie storiche. Se resta tempo, fermati alla Basilica dei Santi Maria e Donato, famosa per il suo pavimento a mosaico del XII secolo.",
        },
        {
          id: "cosa-vedere-murano-un-giorno",
          question: "Cosa vedere a Murano in un giorno?",
          answer:
            "Con una giornata a disposizione puoi vedere Murano senza fretta e poi proseguire verso Burano. Comincia dalle fornaci e dal Museo del Vetro, poi visita la Basilica dei Santi Maria e Donato e la chiesa di San Pietro Martire, che custodisce opere di Giovanni Bellini. Nel pomeriggio, dalla fermata Murano Faro, la linea 12 ti porta a Burano in circa mezz'ora.",
        },
        {
          id: "vale-la-pena-visitare-murano",
          question: "Vale la pena visitare Murano?",
          answer:
            "Sì, soprattutto se ti interessa l'artigianato. Murano è uno dei pochi luoghi al mondo dove si può vedere il vetro soffiato e lavorato a mano con tecniche tramandate da secoli, a pochi minuti di vaporetto dal centro di Venezia. È più tranquilla delle zone intorno a San Marco e aiuta a capire, da vicino, che cosa distingue il vetro di Murano dalle imitazioni.",
        },
        {
          id: "murano-o-burano",
          question: "Che differenza c'è tra Murano e Burano?",
          answer:
            "Murano è l'isola del vetro, Burano quella del merletto e delle case colorate. A Murano si visitano fornaci, gallerie e il Museo del Vetro; Burano è più piccola e più lontana, conosciuta per le facciate dipinte in colori vivaci e per la tradizione del merletto, raccontata dal Museo del Merletto. Da Fondamente Nove, Murano è a una decina di minuti, Burano a circa tre quarti d'ora.",
        },
        {
          id: "murano-e-burano-in-un-giorno",
          question: "Si possono visitare Murano e Burano nello stesso giorno?",
          answer:
            "Sì, ed è il modo più comune di vederle. Dedica la mattina al vetro di Murano, poi prendi la linea 12 dalla fermata Murano Faro: in circa 30 minuti sei a Burano. Un abbonamento ACTV da 24 ore (25 €) copre tutti gli spostamenti. Le corse per Burano partono ogni 20 o 30 minuti a seconda dell'ora, quindi controlla l'orario del ritorno.",
        },
      ],
    },
    {
      id: "vetro-di-murano",
      title: "Il vetro di Murano",
      intro: "Perché è famoso, come si lavora e come distinguerlo da un'imitazione.",
      items: [
        {
          id: "perche-murano-famosa-vetro",
          question: "Perché Murano è famosa per il vetro?",
          answer:
            "Perché nel 1291 la Repubblica di Venezia trasferì sull'isola tutte le fornaci della città, ufficialmente per ridurre il rischio di incendi in una Venezia costruita in gran parte di legno. Concentrare i vetrai in un solo luogo permise anche di proteggerne i segreti, e dal Rinascimento Murano divenne la principale fonte europea di specchi e lampadari di pregio. Molte fornaci sono ancora attive sull'isola.",
        },
        {
          id: "storia-vetro-di-murano",
          question: "Qual è la storia del vetro di Murano?",
          answer:
            "In breve: le fornaci arrivano sull'isola nel 1291, il Rinascimento porta l'età d'oro, con il cristallo trasparente messo a punto da Angelo Barovier intorno alla metà del Quattrocento, poi la crisi del Settecento e la caduta della Repubblica nel 1797. Nell'Ottocento Antonio Salviati rilancia la produzione e nel 1861 nasce il Museo del Vetro; nel 1921 Paolo Venini fonda una delle fornaci più influenti del Novecento.",
          links: [guide("", "La storia completa nella Guida al vetro di Murano")],
        },
        {
          id: "come-si-produce-vetro-di-murano",
          question: "Come viene prodotto il vetro di Murano?",
          answer:
            "Si parte da una miscela di sabbia silicea, soda e calce fusa in fornace; il vetro incandescente viene poi prelevato e modellato a mano, soffiandolo con la canna o lavorandolo con pinze e ferri finché è morbido. Per le perle dei gioielli si usa soprattutto la lavorazione a lume: il maestro scioglie sulla fiamma una bacchetta di vetro colorato e la avvolge attorno a un'asta metallica.",
          links: [guide("#techniques", "Le tecniche spiegate nella Guida")],
        },
        {
          id: "tecniche-vetro-di-murano",
          question: "Quali sono le tecniche del vetro di Murano?",
          answer:
            "Le principali sono la soffiatura, la lavorazione a lume, le murrine e i millefiori, la filigrana, il sommerso, il vetro avventurina e la foglia d'oro o d'argento. Ognuna crea un effetto diverso: il sommerso sovrappone strati di colore, la murrina porta un disegno che attraversa tutto il vetro, l'avventurina brilla grazie a minuscoli cristalli di rame sospesi al suo interno.",
          links: [guide("#techniques", "Come funziona ogni tecnica")],
        },
        {
          id: "perche-vetro-di-murano-famoso",
          question: "Perché il vetro di Murano è così famoso?",
          answer:
            "Per un insieme raro di storia, tecnica e colore. Da oltre sette secoli i maestri dell'isola lavorano il vetro a mano, e alcune invenzioni nate qui, come il cristallo rinascimentale e il vetro avventurina, sono diventate riferimenti per tutta l'arte vetraria. Ogni pezzo passa dalle mani di una persona, quindi due oggetti non sono mai identici: anche questa unicità fa parte del suo valore.",
        },
        {
          id: "dove-vedere-lavorazione-vetro",
          question: "Dove vedere la lavorazione del vetro a Murano?",
          answer:
            "Direttamente nelle fornaci dell'isola: diverse vetrerie accolgono i visitatori e organizzano brevi dimostrazioni in cui un maestro modella un pezzo davanti al pubblico, alcune gratuite, altre a pagamento. Per capire il contesto storico, abbina la visita al Museo del Vetro di Palazzo Giustinian, che racconta secoli di produzione dell'isola attraverso le sue collezioni.",
        },
        {
          id: "riconoscere-vero-vetro-di-murano",
          question: "Come riconoscere il vero vetro di Murano?",
          answer:
            "Guarda il vetro da vicino: piccole bolle d'aria, leggere asimmetrie e colori che variano appena da un pezzo all'altro sono segni di una lavorazione a mano, mentre una perfezione uniforme fa pensare a uno stampo. Negli oggetti soffiati cerca il segno del pontello, il punto in cui il pezzo è stato staccato dall'asta. Anche il peso conta: il vetro lavorato a mano risulta di solito più consistente.",
          links: [guide("#authenticity", "Tutti i segni di autenticità nella Guida")],
        },
        {
          id: "capire-se-e-vetro-di-murano",
          question: "Come capire se un prodotto è veramente vetro di Murano?",
          answer:
            "Oltre all'aspetto del vetro, verifica chi lo vende e cosa dichiara. Le fornaci dell'isola possono usare il marchio Vetro Artistico® Murano, istituito dalla Regione del Veneto e gestito dal Consorzio Promovetro, riservato a chi produce a Murano; molti lavori artigianali autentici, però, non lo hanno. Diffida delle diciture vaghe come «stile Murano» e dei prezzi troppo bassi: un maestro dedica tempo vero a ogni pezzo.",
        },
      ],
    },
    {
      id: "gioielli-di-murano",
      title: "Gioielli di Murano",
      intro: "Come riconoscerli, come sceglierli e quanto costano davvero.",
      items: [
        {
          id: "riconoscere-gioiello-murano-autentico",
          question: "Come riconoscere un gioiello di Murano autentico?",
          answer:
            "Osserva le perle una per una: in un gioiello autentico ognuna è leggermente diversa per forma, sfumatura o posizione delle bolle, perché è stata modellata singolarmente a lume. Le decorazioni, come la foglia d'argento, le murrine o l'avventurina, sono lavorate dentro il vetro e non dipinte in superficie. Un venditore serio indica con chiarezza dove e come sono realizzati i pezzi.",
        },
        {
          id: "come-scegliere-gioiello-murano",
          question: "Come scegliere un gioiello in vetro di Murano?",
          answer:
            "Parti dal colore e da come verrà indossato. Una collana è il pezzo più visibile e valorizza lo scollo, un bracciale si porta ogni giorno e si abbina facilmente, gli orecchini sono leggeri e discreti. Guarda anche le misure: le nostre collane sono lunghe 45–48 cm, i bracciali 18–20 cm e regolabili. Se è un regalo e non sai da dove cominciare, il Trova Regalo ti guida con poche domande.",
          links: [{ href: "/gift-finder", label: "Prova il Trova Regalo" }],
        },
        {
          id: "quanto-costa-gioiello-murano",
          question: "Quanto costa un gioiello in vetro di Murano?",
          answer: [
            "Dipende dalla tecnica, dalle dimensioni e dal numero di perle, ma un gioiello artigianale autentico parte da qualche decina di euro.",
            jewelrySpan
              ? `Nel nostro catalogo i prezzi vanno ${jewelrySpan}, per collane, bracciali e orecchini con perle lavorate a mano.`
              : null,
            "Un prezzo molto più basso, soprattutto per un pezzo con tante perle, è spesso il segnale che il gioiello non è stato fatto a mano.",
          ]
            .filter(Boolean)
            .join(" "),
          links: [{ href: "/products", label: "Tutti i gioielli con i prezzi" }],
        },
        {
          id: "quanto-costa-collana-murano",
          question: "Quanto costa una collana di Murano?",
          answer: [
            necklaces
              ? `Nel nostro catalogo una collana in vetro di Murano costa ${span(necklaces)}.`
              : "Una collana in vetro di Murano costa in genere da qualche decina di euro in su.",
            "Il prezzo dipende dalla lunghezza, dal numero e dalla grandezza delle perle e dalla tecnica: le collane che alternano perle di forme diverse o usano la foglia d'argento richiedono più ore di lavoro al maestro. I pezzi unici firmati dalle grandi fornaci dell'isola possono costare molto di più.",
          ].join(" "),
          links: collection(necklaces, "Scopri le collane"),
        },
        {
          id: "quanto-costa-bracciale-murano",
          question: "Quanto costa un bracciale di Murano?",
          answer: [
            bracelets
              ? `Da noi un bracciale in vetro di Murano costa ${span(bracelets)}.`
              : "Un bracciale in vetro di Murano costa in genere da qualche decina di euro in su.",
            "A fare la differenza sono soprattutto il numero di perle, la loro dimensione e la tecnica: poche perle grandi lavorate a lume richiedono un lavoro diverso da un filo di tante perline. I nostri bracciali misurano 18–20 cm e sono regolabili, quindi si adattano alla maggior parte dei polsi.",
          ].join(" "),
          links: collection(bracelets, "Scopri i bracciali"),
        },
        {
          id: "quanto-costano-orecchini-murano",
          question: "Quanto costano gli orecchini in vetro di Murano?",
          answer: [
            earrings
              ? `Nel nostro catalogo gli orecchini in vetro di Murano costano ${span(earrings)}.`
              : "Gli orecchini in vetro di Murano costano in genere da qualche decina di euro in su.",
            "Sono pezzi leggeri, lunghi circa 4 cm, e ogni perla è modellata a mano: le due metà di una coppia possono differire appena nelle sfumature, un dettaglio tipico del vetro lavorato artigianalmente. Si abbinano facilmente a una collana o a un bracciale dello stesso colore.",
          ].join(" "),
          links: collection(earrings, "Scopri gli orecchini"),
        },
        {
          id: "dove-comprare-gioielli-murano",
          question: "Dove comprare gioielli in vetro di Murano?",
          answer:
            "Puoi comprarli a Murano e a Venezia, nelle botteghe che vendono gioielli fatti sull'isola, oppure online da venditori che dichiarano chiaramente l'origine dei pezzi. Sull'isola hai il vantaggio di vedere la lavorazione; online puoi confrontare con calma colori, misure e prezzi e ricevere il gioiello a casa. Nel nostro negozio online trovi collane, bracciali e orecchini in vetro di Murano lavorati a mano.",
          links: [{ href: "/products", label: "Scopri la collezione" }],
        },
        {
          id: "dove-comprare-gioielli-murano-originali",
          question: "Dove comprare gioielli di Murano originali?",
          answer:
            "Da chi sa dirti con precisione dove e come è stato fatto ogni pezzo. Che tu compri sull'isola, a Venezia o online, chiedi l'origine del vetro, la tecnica usata e le condizioni di reso: un venditore serio risponde senza esitare. Fai attenzione alle bancarelle con centinaia di pezzi identici a prezzi molto bassi, spesso vetro prodotto in serie altrove e venduto con il nome di Murano.",
          links: [
            { href: "/about", label: "Chi siamo e come lavoriamo" },
            { href: "/legal/returns", label: "Resi e rimborsi" },
          ],
        },
        {
          id: "gioielli-murano-online",
          question: "Dove acquistare gioielli di Murano online?",
          answer: `Online conviene scegliere un negozio che mostri foto reali dei pezzi, indichi misure e materiali e renda chiari spedizione, pagamento e resi. Su ${facts.storeName} trovi collane, bracciali e orecchini in vetro di Murano, con pagamento sicuro, spedizione dall'Italia in una confezione pronta da regalare e 14 giorni per il diritto di recesso. Puoi anche comporre il tuo look scegliendo tre pezzi abbinati.`,
          links: [
            { href: "/#shipping-cost", label: "Costi e tempi di spedizione" },
            { href: "/looks/compose", label: "Componi il tuo look" },
          ],
        },
      ],
    },
    {
      id: "regali-e-acquisti",
      title: "Regali e acquisti",
      intro: "Idee regalo, souvenir da Venezia e dove comprare il vetro originale.",
      items: [
        {
          id: "miglior-souvenir-venezia",
          question: "Qual è il miglior souvenir da comprare a Venezia?",
          answer:
            "Un oggetto legato all'artigianato della laguna, come il vetro di Murano o il merletto di Burano, racconta Venezia molto meglio di un souvenir generico. Tra i due, un gioiello in vetro di Murano è facile da portare in valigia, si indossa ogni giorno e ricorda il viaggio a ogni uso. L'importante è comprarlo da chi ne garantisce l'origine, evitando le imitazioni vendute nelle zone più turistiche.",
        },
        {
          id: "migliori-regali-vetro-murano",
          question: "Quali sono i migliori regali in vetro di Murano?",
          answer:
            "Tra i regali in vetro di Murano, i gioielli sono i più personali: una collana per un'occasione importante, un bracciale per un pensiero da portare ogni giorno, un paio di orecchini se non conosci bene i gusti di chi li riceve. Un set abbinato di collana, bracciale e orecchini fa effetto per anniversari e compleanni. Per la casa, i classici dell'isola restano vasi, bicchieri e oggetti soffiati.",
          links: [
            { href: "/looks", label: "Scopri i look abbinati" },
            { href: "/gift-finder", label: "Trova il regalo giusto" },
          ],
        },
        {
          id: "gioielli-murano-regalo",
          question: "I gioielli in vetro di Murano sono un buon regalo?",
          answer: [
            "Sì, perché uniscono un valore artigianale reale a un prezzo accessibile e vanno bene per molte occasioni, dal compleanno alla festa della mamma. Ogni pezzo è fatto a mano, quindi è unico, e porta con sé la storia di Venezia.",
            facts.giftCardPrice !== null
              ? `Da noi arrivano già nella scatola firmata, pronti da regalare, e con ${money(facts.giftCardPrice)} puoi aggiungere un biglietto con il tuo messaggio, stampato e inserito nel pacco.`
              : "Da noi arrivano già nella scatola firmata, pronti da regalare.",
          ].join(" "),
          links:
            facts.giftCardPrice !== null
              ? [{ href: "/personalised-gift-card", label: "Crea il biglietto personalizzato" }]
              : [{ href: "/gift-finder", label: "Trova il regalo giusto" }],
        },
        {
          id: "quanto-costa-vetro-murano",
          question: "Quanto costa il vetro di Murano?",
          answer: [
            "Il prezzo varia moltissimo: da qualche decina di euro per un gioiello o un piccolo oggetto fino a migliaia di euro per un'opera firmata da un maestro. Dipende dalla tecnica, dalle dimensioni e dalle ore di lavoro.",
            jewelrySpan ? `I nostri gioielli costano ${jewelrySpan}.` : null,
            "Un prezzo sorprendentemente basso per un pezzo elaborato è quasi sempre il segno di un'imitazione.",
          ]
            .filter(Boolean)
            .join(" "),
          links: [guide("#faq", "Perché l'originale costa di più")],
        },
        {
          id: "dove-comprare-vetro-murano-originale",
          question: "Dove comprare vetro di Murano originale?",
          answer:
            "Il posto più sicuro è Murano stessa, nelle fornaci e nelle loro gallerie, dove spesso puoi vedere il pezzo nascere e trovare il marchio Vetro Artistico® Murano. Fuori dall'isola, a Venezia o online, scegli venditori che indicano chiaramente provenienza e tecnica e che accettano il reso. Per i gioielli, il nostro negozio online propone perle lavorate a mano a Murano, spedite dall'Italia.",
          links: [{ href: "/products", label: "Scopri i gioielli" }],
        },
      ],
    },
  ];
}
