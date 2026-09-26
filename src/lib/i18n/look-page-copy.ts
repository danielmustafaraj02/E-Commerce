import type { Locale } from "./locale";

// Copy for the looks listing and the sections under one look: the reasons,
// questions, piece details and "learn more" links. Italian and English only
// for now; every other locale reads the English text, the same way product
// stories fall back (lib/product-i18n.ts). Discount claims restate the rules
// in lib/looks.ts, so keep them aligned when editing.
const en = {
  listingWhyTitle: "A look, already in harmony",
  listingWhyIntro:
    "Each combination is chosen to make Murano glass easy to wear, give or collect.",
  listingWhy: [
    {
      title: "Colours that belong together",
      body: "Necklace, bracelet and earrings are paired for their colours and shapes, so the whole look feels considered while every piece still works on its own.",
    },
    {
      title: "Made by hand in Murano",
      body: "Each piece is crafted in Murano glass. Small differences in colour and form are part of the character of handmade work.",
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
    "Every piece in this look is handmade in Murano glass. Wear them together, or each on its own.",
  storyLabel: "Why choose it",
  available: "Available",
  viewPiece: "View the piece",

  whyTitle: "Why choose this look",
  whyIntro: "What comes with these pieces, beyond the glass itself.",
  why: [
    {
      title: "Handmade in Murano",
      body: "Every piece is hand-worked glass from Murano, using traditional lampworking techniques: never molded, never mass-produced.",
    },
    {
      title: "Made to be worn together",
      body: "Colors and shapes were chosen to match, so the set reads as one look, and each piece still stands on its own.",
    },
    {
      title: "The set costs less",
      body: "The complete set saves {set}%, any two pieces save {pair}%. The saving appears in your cart on its own, no code needed.",
    },
    {
      title: "Ready to give",
      body: "Each piece arrives in our signature box, ready to be given as it is.",
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
    "Very close, but not identical: small variations in color, bubbles and shape aren't flaws, they're what a hand-blown piece looks like, and no two are ever quite the same.",

  learnTitle: "Learn more",
  learn: {
    guide: "How Murano glass is made, and how to tell it from imitations.",
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
  listingWhyTitle: "Un look già in armonia",
  listingWhyIntro:
    "Ogni abbinamento è pensato per rendere il vetro di Murano facile da indossare, regalare e collezionare.",
  listingWhy: [
    {
      title: "Colori che stanno bene insieme",
      body: "Collana, bracciale e orecchini sono abbinati per colori e forme: il look è curato nel suo insieme, ma ogni pezzo si porta bene anche da solo.",
    },
    {
      title: "Lavorati a mano a Murano",
      body: "Ogni gioiello è realizzato in vetro di Murano. Le piccole differenze di colore e forma fanno parte del carattere del lavoro artigianale.",
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
    "Ogni pezzo di questo look è lavorato a mano in vetro di Murano. Indossali insieme, oppure uno alla volta.",
  storyLabel: "Perché sceglierlo",
  available: "Disponibile",
  viewPiece: "Vedi il pezzo",

  whyTitle: "Perché scegliere questo look",
  whyIntro: "Cosa arriva con questi pezzi, oltre al vetro.",
  why: [
    {
      title: "Fatti a mano a Murano",
      body: "Ogni pezzo è vetro lavorato a mano a Murano con le tecniche tradizionali della lavorazione a lume: mai stampato, mai prodotto in serie.",
    },
    {
      title: "Pensati per stare insieme",
      body: "Colori e forme sono stati scelti per abbinarsi: il set si legge come un unico look, e ogni pezzo sta bene anche da solo.",
    },
    {
      title: "Il set costa meno",
      body: "Il set completo ti fa risparmiare il {set}%, due pezzi qualsiasi il {pair}%. Lo sconto compare da solo nel carrello, senza codici.",
    },
    {
      title: "Pronti da regalare",
      body: "Ogni pezzo arriva nella nostra scatola firmata, pronto da regalare così com'è.",
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
    "Molto simili, ma non identici: le piccole variazioni di colore, le bolle e le forme non sono difetti, sono ciò che rende unico un pezzo soffiato a mano, mai identico a un altro.",

  learnTitle: "Per saperne di più",
  learn: {
    guide: "Come nasce il vetro di Murano, e come riconoscerlo dalle imitazioni.",
    careTitle: "Come curare i tuoi gioielli",
    care: "Poche semplici abitudini per mantenere colore e brillantezza.",
    giftTitle: "Trova Regalo",
    gift: "Qualche domanda per trovare il pezzo giusto per qualcuno.",
    returns: "14 giorni per recedere dall'acquisto, con rimborso sul metodo di pagamento originale.",
    about: "Chi siamo e come lavoriamo.",
    contact: "Una domanda su un pezzo o su un ordine? Scrivici.",
  },
};

export function getLookPageCopy(locale: Locale): LookPageCopy {
  return locale === "it" ? it : en;
}
