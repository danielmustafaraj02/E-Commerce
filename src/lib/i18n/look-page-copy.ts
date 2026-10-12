import type { Locale } from "./locale";
import type { Dictionary } from "./dictionaries";

// Copy for the looks listing and the sections under one look: the reasons,
// questions, piece details and "learn more" links. Italian and English only
// for now; every other locale reads the English text, the same way product
// stories fall back (lib/product-i18n.ts). Discount claims restate the rules
// in lib/looks.ts, so keep them aligned when editing.
const en = {
  editorialIntro:
    "A look brings together a necklace, a bracelet and earrings, selected for the way their colours and shapes complement one another. Wear the complete composition, or let a single piece set the tone.",
  editorialDescription:
    "Three pieces drawn from the same colours of glass, chosen to sit well together. Each one also holds its own.",
  editorialIncluded: "In this look",
  editorialPrice: "The complete look",
  listingWhyTitle: "A look, already in harmony",
  listingWhyIntro: "Each combination is chosen to make Murano glass easy to wear, give or collect.",
  listingWhy: [
    {
      title: "Colours that belong together",
      body: "Necklace, bracelet and earrings are paired for their colours and shapes, so the whole look feels considered while every piece still works on its own.",
    },
    {
      title: "Glass worth a closer look",
      body: "Every piece is in Murano glass. Small differences in colour and form from one piece to the next are part of the material's character.",
    },
    {
      title: "A better price as a set",
      body: "Buy all the pieces in a look together and its displayed saving is applied automatically in your cart. No code needed.",
    },
  ],
  listingFaq: [
    {
      id: "look-list-pieces",
      question: "What comes in a look?",
      answer:
        "Each look brings together three pieces chosen to complement one another. Open a look to see exactly what is included.",
    },
    {
      id: "look-list-discount",
      question: "How does the look discount work?",
      answer:
        "The saving shown on each look is for that complete set. Add all its pieces to the same order and the discount is calculated automatically in your cart and applied at checkout. No code is needed; the percentage can vary by look.",
    },
    {
      id: "look-list-single",
      question: "Can I buy the pieces separately?",
      answer:
        "Yes. Every piece can be purchased on its own. The displayed set saving applies when you buy all the pieces in that look together.",
    },
    {
      id: "look-list-mix",
      question: "Can I create a look with pieces from different sets?",
      answer:
        "Yes. Choose any necklace, bracelet and pair of earrings with Compose your own look, add all three to one order, and save {composed}%.",
    },
  ],
  piecesTitle: "The pieces, one by one",
  piecesIntro:
    "Every piece in this look is in Murano glass. Wear them together, or each on its own.",
  storyLabel: "Why choose it",
  available: "Available",
  viewPiece: "View the piece",

  whyTitle: "Why choose this look",
  whyIntro: "What comes with these pieces, beyond the glass itself.",
  why: [
    {
      title: "Murano glass",
      body: "Every piece is in Murano glass, from the island where Venice has worked glass since 1291.",
    },
    {
      title: "Chosen to be worn together",
      body: "Colors and shapes were chosen to match, so the set reads as one look, and each piece still stands on its own.",
    },
    {
      title: "The set costs less",
      body: "The complete set saves {set}%, any two pieces save {pair}%. The saving appears in your cart on its own, no code needed.",
    },
    {
      title: "Ready to give",
      body: "Each piece arrives in our gift box, ready to be given as it is.",
    },
    {
      title: "Shipped from Italy",
      body: "Your order ships from Italy, and you have 14 days from delivery to change your mind.",
    },
  ],

  someQ: "Can I buy only some pieces of the look?",
  someA:
    "Yes. Every piece can be bought on its own. Two pieces of the same look together save {pair}%, and the complete set saves {set}%.",
  codeQ: "Do I need a code for the look discount?",
  codeA:
    "No. The saving is worked out in your cart and applied at checkout whenever the pieces are in the same order.",
  mixQ: "Can I mix pieces from different looks?",
  mixA: "Yes. With Compose your own look you choose any necklace, bracelet and earrings, and save {composed}% on the three.",
  variesQ: "Will my pieces look exactly like the photos?",
  variesA:
    "Very close, though not identical: glass varies slightly in colour, bubbles and shape from one piece to the next, so no two are ever quite the same.",

  learnTitle: "Learn more",
  learn: {
    guide: "How Murano glass is worked, and how to tell it from imitations.",
    careTitle: "Caring for your jewelry",
    care: "A few simple habits that keep the color and shine.",
    giftTitle: "Gift Finder",
    gift: "A few questions to find the right piece for someone.",
    returns: "14 days to withdraw from your purchase, refunded to your original payment method.",
    about: "Who we are and how we work.",
    contact: "A question about a piece or an order? Write to us.",
  },
};

export type LookPageCopy = typeof en;

const it: LookPageCopy = {
  editorialIntro:
    "Un look riunisce collana, bracciale e orecchini, scelti per l’armonia dei colori e delle forme. Indossa l’abbinamento completo, oppure lascia che un solo gioiello racconti il tuo stile.",
  editorialDescription:
    "Tre pezzi nati dagli stessi colori di vetro, scelti per stare bene insieme. E ognuno, da solo, ha il suo carattere.",
  editorialIncluded: "In questo look",
  editorialPrice: "Il look completo",
  listingWhyTitle: "Un look già in armonia",
  listingWhyIntro:
    "Ogni abbinamento è pensato per rendere il vetro di Murano facile da indossare, regalare e collezionare.",
  listingWhy: [
    {
      title: "Colori che stanno bene insieme",
      body: "Collana, bracciale e orecchini sono abbinati per colori e forme: il look è curato nel suo insieme, ma ogni pezzo si porta bene anche da solo.",
    },
    {
      title: "Vetro da guardare da vicino",
      body: "Ogni gioiello è in vetro di Murano. Le piccole differenze di colore e di forma tra un pezzo e l'altro fanno parte del carattere del materiale.",
    },
    {
      title: "Un prezzo migliore insieme",
      body: "Acquistando tutti i pezzi di un look, il risparmio indicato si applica automaticamente nel carrello. Non serve alcun codice.",
    },
  ],
  listingFaq: [
    {
      id: "look-list-pieces",
      question: "Quali pezzi comprende un look?",
      answer:
        "Ogni look abbina tre pezzi scelti per stare bene insieme. Apri il look per vedere nel dettaglio cosa comprende.",
    },
    {
      id: "look-list-discount",
      question: "Come funziona lo sconto sul look?",
      answer:
        "Il risparmio indicato su ogni look vale per il set completo. Aggiungi tutti i suoi pezzi allo stesso ordine: lo sconto viene calcolato automaticamente nel carrello e applicato al checkout. Non serve un codice; la percentuale può variare da un look all'altro.",
    },
    {
      id: "look-list-single",
      question: "Posso acquistare i pezzi separatamente?",
      answer:
        "Sì. Ogni pezzo si può acquistare da solo. Il risparmio indicato per il set si applica quando acquisti insieme tutti i pezzi di quel look.",
    },
    {
      id: "look-list-mix",
      question: "Posso creare un look con pezzi di set diversi?",
      answer:
        "Sì. Scegli una collana, un bracciale e un paio di orecchini qualsiasi con Crea il tuo look, aggiungili allo stesso ordine e risparmia il {composed}%.",
    },
  ],
  piecesTitle: "I pezzi, uno per uno",
  piecesIntro:
    "Ogni pezzo di questo look è in vetro di Murano. Indossali insieme, oppure uno alla volta.",
  storyLabel: "Perché sceglierlo",
  available: "Disponibile",
  viewPiece: "Vedi il pezzo",

  whyTitle: "Perché scegliere questo look",
  whyIntro: "Cosa arriva con questi pezzi, oltre al vetro.",
  why: [
    {
      title: "Vetro di Murano",
      body: "Ogni pezzo è in vetro di Murano, l'isola dove Venezia lavora il vetro dal 1291.",
    },
    {
      title: "Scelti per stare insieme",
      body: "Colori e forme sono stati scelti per abbinarsi: il set si legge come un unico look, e ogni pezzo sta bene anche da solo.",
    },
    {
      title: "Il set costa meno",
      body: "Il set completo ti fa risparmiare il {set}%, due pezzi qualsiasi il {pair}%. Lo sconto compare da solo nel carrello, senza codici.",
    },
    {
      title: "Pronti da regalare",
      body: "Ogni pezzo arriva nella nostra confezione regalo, pronto da regalare così com'è.",
    },
    {
      title: "Spediti dall'Italia",
      body: "Il tuo ordine parte dall'Italia, e hai 14 giorni dalla consegna per ripensarci.",
    },
  ],

  someQ: "Posso comprare solo alcuni pezzi del look?",
  someA:
    "Sì. Ogni pezzo si può acquistare da solo. Due pezzi dello stesso look insieme ti fanno risparmiare il {pair}%, il set completo il {set}%.",
  codeQ: "Serve un codice per lo sconto del look?",
  codeA:
    "No. Lo sconto viene calcolato nel carrello e applicato al checkout, ogni volta che i pezzi sono nello stesso ordine.",
  mixQ: "Posso abbinare pezzi di look diversi?",
  mixA: "Sì. Con Componi il tuo look scegli una collana, un bracciale e degli orecchini qualsiasi, e risparmi il {composed}% sui tre.",
  variesQ: "I miei pezzi saranno identici alle foto?",
  variesA:
    "Molto simili, ma non identici: il vetro varia leggermente per colore, bolle e forma da un pezzo all'altro, e due gioielli non sono mai del tutto uguali.",

  learnTitle: "Per saperne di più",
  learn: {
    guide: "Come si lavora il vetro di Murano, e come riconoscerlo dalle imitazioni.",
    careTitle: "Come curare i tuoi gioielli",
    care: "Poche semplici abitudini per mantenere colore e brillantezza.",
    giftTitle: "Trova Regalo",
    gift: "Qualche domanda per trovare il pezzo giusto per qualcuno.",
    returns:
      "14 giorni per recedere dall'acquisto, con rimborso sul metodo di pagamento originale.",
    about: "Chi siamo e come lavoriamo.",
    contact: "Una domanda su un pezzo o su un ordine? Scrivici.",
  },
};

export function getLookPageCopy(locale: Locale): LookPageCopy {
  return locale === "it" ? it : en;
}

export function getLookEditorialDescription(name: string, locale: Locale): string {
  const descriptions: Record<string, { en: string; it: string }> = {
    "rosso rubino": {
      en: "Ruby red, across three pieces. Wear them together for a coordinated look, or let one take the lead.",
      it: "Il rosso rubino, in tre gioielli. Indossali insieme per un look coordinato, oppure lascia protagonista un solo pezzo.",
    },
    "rosa e salvia": {
      en: "Soft pink and sage green, in balance. Wear the three together, or choose a single accent for every day.",
      it: "Rosa e verde salvia, in equilibrio. Indossa i tre gioielli insieme, oppure scegli un solo dettaglio per ogni giorno.",
    },
  };
  const description = descriptions[name.trim().toLowerCase()];
  return (
    description?.[locale === "it" ? "it" : "en"] ?? getLookPageCopy(locale).editorialDescription
  );
}

/** The labels one look row (components/look-editorial.tsx LookRow) shows, in
 *  the visitor's language. Shared by the home page, the Looks page and the
 *  page builder's live "looks" block. */
export function lookRowLabels(
  lookName: string,
  dict: Pick<Dictionary, "looks" | "look" | "giftFinder">,
  locale: Locale
) {
  const copy = getLookPageCopy(locale);
  return {
    view: dict.looks.viewLook,
    save: dict.look.save,
    pieces: dict.looks.pieces,
    description: getLookEditorialDescription(lookName, locale),
    included: copy.editorialIncluded,
    viewPiece: copy.viewPiece,
    price: copy.editorialPrice,
    kinds: dict.giftFinder.preference,
  };
}
