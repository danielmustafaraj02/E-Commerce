import type { Locale } from "./locale";

// Copy for the sections under a look (app/looks/[id]): the pieces one by one,
// why to choose them, the look questions and the "learn more" links. Italian
// and English only for now; every other locale reads the English text, the
// same way product stories fall back (lib/product-i18n.ts). Every claim here
// restates something the site already says or does — the discounts are the
// ones lib/looks.ts applies at checkout, the returns and packaging lines
// repeat dictionaries.ts — so keep it that way when editing.
const en = {
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
