import type { Locale } from "./locale";
import type { Dictionary } from "./dictionaries";

// Copy for the looks listing and the sections under one look. Discount claims
// restate the rules in lib/looks.ts, so keep them aligned when editing.
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

const fr: LookPageCopy = {
  editorialIntro:
    "Un look réunit un collier, un bracelet et des boucles d’oreilles, choisis pour l’harmonie de leurs couleurs et de leurs formes. Portez l’ensemble ou laissez une seule pièce donner le ton.",
  editorialDescription:
    "Trois pièces choisies dans une même palette de verre pour bien s’accorder. Chacune a aussi son caractère.",
  editorialIncluded: "Dans ce look",
  editorialPrice: "Le look complet",
  listingWhyTitle: "Un look déjà harmonieux",
  listingWhyIntro: "Chaque association est pensée pour porter, offrir ou collectionner le verre de Murano en toute simplicité.",
  listingWhy: [
    {
      title: "Des couleurs qui s’accordent",
      body: "Collier, bracelet et boucles d’oreilles sont associés par leurs couleurs et leurs formes : l’ensemble est équilibré, et chaque pièce se porte aussi seule.",
    },
    {
      title: "Un verre à regarder de près",
      body: "Chaque bijou est en verre de Murano. Les petites variations de couleur et de forme entre les pièces font partie du caractère du matériau.",
    },
    {
      title: "Un prix avantageux en parure",
      body: "Achetez ensemble toutes les pièces d’un look : la remise affichée s’applique automatiquement dans votre panier, sans code.",
    },
  ],
  listingFaq: [
    {
      id: "look-list-pieces",
      question: "Que comprend un look ?",
      answer: "Chaque look réunit trois pièces choisies pour s’accorder. Ouvrez-le pour voir exactement ce qu’il comprend.",
    },
    {
      id: "look-list-discount",
      question: "Comment fonctionne la remise sur un look ?",
      answer: "La remise affichée vaut pour la parure complète. Ajoutez toutes ses pièces à la même commande : la remise est calculée automatiquement dans le panier et appliquée au paiement. Aucun code n’est nécessaire ; le pourcentage peut varier selon le look.",
    },
    {
      id: "look-list-single",
      question: "Puis-je acheter les pièces séparément ?",
      answer: "Oui. Chaque pièce peut être achetée séparément. La remise affichée s’applique lorsque vous achetez ensemble toutes les pièces du look.",
    },
    {
      id: "look-list-mix",
      question: "Puis-je composer un look avec des pièces de parures différentes ?",
      answer: "Oui. Avec Composez votre look, choisissez un collier, un bracelet et une paire de boucles d’oreilles, ajoutez-les à la même commande et économisez {composed} %.",
    },
  ],
  piecesTitle: "Les pièces, une à une",
  piecesIntro: "Chaque bijou de ce look est en verre de Murano. Portez-les ensemble ou séparément.",
  storyLabel: "Pourquoi le choisir",
  available: "Disponible",
  viewPiece: "Voir le bijou",
  whyTitle: "Pourquoi choisir ce look",
  whyIntro: "Ce qui accompagne ces bijoux, au-delà du verre.",
  why: [
    {
      title: "Verre de Murano",
      body: "Chaque bijou est en verre de Murano, sur l’île où Venise travaille le verre depuis 1291.",
    },
    {
      title: "Choisis pour être portés ensemble",
      body: "Les couleurs et les formes s’accordent pour composer un ensemble cohérent, tandis que chaque pièce garde son caractère.",
    },
    {
      title: "La parure à prix réduit",
      body: "La parure complète vous fait économiser {set} %, et deux pièces {pair} %. La remise apparaît automatiquement dans votre panier, sans code.",
    },
    {
      title: "Prêts à offrir",
      body: "Chaque bijou arrive dans notre boîte cadeau, prêt à être offert.",
    },
    {
      title: "Expédié depuis l’Italie",
      body: "Votre commande est expédiée depuis l’Italie. Vous disposez de 14 jours après sa livraison pour changer d’avis.",
    },
  ],
  someQ: "Puis-je acheter seulement quelques pièces du look ?",
  someA: "Oui. Chaque pièce peut être achetée séparément. Deux pièces du même look vous font économiser {pair} %, et la parure complète {set} %.",
  codeQ: "Faut-il un code pour bénéficier de la remise ?",
  codeA: "Non. La remise est calculée dans votre panier et appliquée au paiement lorsque les pièces se trouvent dans la même commande.",
  mixQ: "Puis-je associer des pièces de looks différents ?",
  mixA: "Oui. Avec Composez votre look, choisissez un collier, un bracelet et des boucles d’oreilles, puis économisez {composed} % sur les trois.",
  variesQ: "Mes bijoux seront-ils identiques aux photos ?",
  variesA: "Très proches, mais pas identiques : la couleur, les bulles et la forme du verre varient légèrement d’une pièce à l’autre. Chaque bijou a ainsi ses petites particularités.",
  learnTitle: "Pour en savoir plus",
  learn: {
    guide: "Comment le verre de Murano est travaillé et comment le distinguer des imitations.",
    careTitle: "Prendre soin de vos bijoux",
    care: "Quelques gestes simples pour préserver leur couleur et leur éclat.",
    giftTitle: "Trouvez le cadeau idéal",
    gift: "Quelques questions pour trouver le bijou qui lui plaira.",
    returns: "14 jours pour exercer votre droit de rétractation ; remboursement sur votre moyen de paiement initial.",
    about: "Qui nous sommes et comment nous travaillons.",
    contact: "Une question sur un bijou ou une commande ? Écrivez-nous.",
  },
};

const de: LookPageCopy = {
  editorialIntro:
    "Ein Look vereint eine Kette, ein Armband und Ohrringe, deren Farben und Formen gut zusammenpassen. Tragen Sie das Set komplett oder lassen Sie ein einzelnes Schmuckstück den Ton angeben.",
  editorialDescription:
    "Drei Schmuckstücke aus einer gemeinsamen Farbpalette, die zusammen gut wirken. Jedes hat auch für sich seinen eigenen Charakter.",
  editorialIncluded: "In diesem Look",
  editorialPrice: "Der komplette Look",
  listingWhyTitle: "Ein Look, der bereits harmoniert",
  listingWhyIntro: "Jede Kombination macht Muranoglas unkompliziert tragbar, verschenkbar und sammelbar.",
  listingWhy: [
    {
      title: "Farben, die zusammenpassen",
      body: "Kette, Armband und Ohrringe sind nach Farbe und Form zusammengestellt. Zusammen wirkt der Look stimmig, und jedes Schmuckstück lässt sich auch einzeln tragen.",
    },
    {
      title: "Glas, das einen genaueren Blick verdient",
      body: "Jedes Schmuckstück besteht aus Muranoglas. Kleine Unterschiede in Farbe und Form gehören zum Charakter des Materials.",
    },
    {
      title: "Als Set günstiger",
      body: "Wenn Sie alle Schmuckstücke eines Looks zusammen kaufen, wird der angezeigte Preisvorteil automatisch im Warenkorb abgezogen. Ein Code ist nicht nötig.",
    },
  ],
  listingFaq: [
    {
      id: "look-list-pieces",
      question: "Was gehört zu einem Look?",
      answer: "Jeder Look vereint drei Schmuckstücke, die gut zusammenpassen. Öffnen Sie einen Look, um genau zu sehen, was dazugehört.",
    },
    {
      id: "look-list-discount",
      question: "Wie funktioniert der Preisvorteil für einen Look?",
      answer: "Der angezeigte Preisvorteil gilt für das komplette Set. Legen Sie alle Schmuckstücke in eine Bestellung: Der Rabatt wird automatisch im Warenkorb berechnet und an der Kasse abgezogen. Sie benötigen keinen Code; der Prozentsatz kann je nach Look variieren.",
    },
    {
      id: "look-list-single",
      question: "Kann ich die Schmuckstücke einzeln kaufen?",
      answer: "Ja. Jedes Schmuckstück ist auch einzeln erhältlich. Der angezeigte Set-Rabatt gilt, wenn Sie alle Stücke des Looks zusammen kaufen.",
    },
    {
      id: "look-list-mix",
      question: "Kann ich einen Look aus Stücken verschiedener Sets zusammenstellen?",
      answer: "Ja. Wählen Sie mit Stellen Sie Ihren eigenen Look zusammen eine Kette, ein Armband und ein Paar Ohrringe, legen Sie alle drei in dieselbe Bestellung und sparen Sie {composed} %.",
    },
  ],
  piecesTitle: "Die Schmuckstücke im Einzelnen",
  piecesIntro: "Jedes Schmuckstück dieses Looks besteht aus Muranoglas. Tragen Sie sie zusammen oder einzeln.",
  storyLabel: "Warum dieses Stück",
  available: "Verfügbar",
  viewPiece: "Schmuckstück ansehen",
  whyTitle: "Warum diesen Look wählen?",
  whyIntro: "Was diese Schmuckstücke neben dem Glas auszeichnet.",
  why: [
    {
      title: "Muranoglas",
      body: "Jedes Schmuckstück besteht aus Muranoglas von der Insel, auf der Venedig seit 1291 Glas verarbeitet.",
    },
    {
      title: "Gemeinsam ausgewählt",
      body: "Farben und Formen passen zusammen. So wirkt das Set als ein Look, und jedes Stück steht zugleich für sich.",
    },
    {
      title: "Das Set kostet weniger",
      body: "Beim kompletten Set sparen Sie {set} %, bei zwei Stücken {pair} %. Der Rabatt erscheint automatisch im Warenkorb, ganz ohne Code.",
    },
    {
      title: "Bereit zum Verschenken",
      body: "Jedes Schmuckstück kommt in unserer Geschenkbox und ist direkt bereit zum Verschenken.",
    },
    {
      title: "Versand aus Italien",
      body: "Ihre Bestellung wird aus Italien versandt. Nach der Lieferung haben Sie 14 Tage Zeit, es sich anders zu überlegen.",
    },
  ],
  someQ: "Kann ich nur einige Stücke des Looks kaufen?",
  someA: "Ja. Jedes Stück kann einzeln gekauft werden. Zwei Stücke desselben Looks zusammen sparen Ihnen {pair} %, das komplette Set {set} %.",
  codeQ: "Brauche ich einen Code für den Look-Rabatt?",
  codeA: "Nein. Der Rabatt wird im Warenkorb berechnet und an der Kasse abgezogen, wenn sich die Stücke in derselben Bestellung befinden.",
  mixQ: "Kann ich Stücke aus verschiedenen Looks kombinieren?",
  mixA: "Ja. Mit Stellen Sie Ihren eigenen Look zusammen wählen Sie eine Kette, ein Armband und Ohrringe und sparen {composed} % auf alle drei.",
  variesQ: "Sehen meine Schmuckstücke genauso aus wie auf den Fotos?",
  variesA: "Sehr ähnlich, aber nicht ganz gleich: Farbe, Bläschen und Form des Glases unterscheiden sich leicht von Stück zu Stück. So hat jedes Schmuckstück seine eigenen kleinen Besonderheiten.",
  learnTitle: "Mehr erfahren",
  learn: {
    guide: "Wie Muranoglas verarbeitet wird und wie Sie es von Imitaten unterscheiden.",
    careTitle: "Schmuck richtig pflegen",
    care: "Ein paar einfache Gewohnheiten bewahren Farbe und Glanz.",
    giftTitle: "Geschenkfinder",
    gift: "Mit ein paar Fragen finden Sie das passende Schmuckstück.",
    returns: "14 Tage Widerrufsrecht; die Erstattung erfolgt auf Ihr ursprüngliches Zahlungsmittel.",
    about: "Wer wir sind und wie wir arbeiten.",
    contact: "Fragen zu einem Schmuckstück oder einer Bestellung? Schreiben Sie uns.",
  },
};

const hi: LookPageCopy = {
  editorialIntro:
    "एक लुक में हार, कंगन और झुमके शामिल हैं—इनके रंग और आकार एक-दूसरे के साथ अच्छे लगते हैं। पूरा सेट पहनें या किसी एक आभूषण को अपने लुक की पहचान बनने दें।",
  editorialDescription:
    "काँच के मिलते-जुलते रंगों से चुने गए तीन आभूषण, जो साथ में भी अच्छे लगते हैं और अकेले भी अपनी पहचान रखते हैं।",
  editorialIncluded: "इस लुक में",
  editorialPrice: "पूरा लुक",
  listingWhyTitle: "पहले से मेल खाता लुक",
  listingWhyIntro: "हर जोड़ी को मुरानो ग्लास को पहनने, उपहार देने और संग्रह करने के लिए सहज बनाने के लिए चुना गया है।",
  listingWhy: [
    {
      title: "एक-दूसरे से मेल खाते रंग",
      body: "हार, कंगन और झुमके रंग और आकार के आधार पर चुने गए हैं। पूरा लुक सधा हुआ लगता है, और हर आभूषण अकेले भी पहना जा सकता है।",
    },
    {
      title: "काँच को करीब से देखें",
      body: "हर आभूषण मुरानो ग्लास का है। एक आभूषण से दूसरे में रंग और आकार के छोटे अंतर इस सामग्री की खासियत हैं।",
    },
    {
      title: "सेट में खरीदने पर बेहतर कीमत",
      body: "एक लुक के सभी आभूषण साथ खरीदें और दिखाई गई बचत आपके कार्ट में अपने आप जुड़ जाएगी। किसी कोड की ज़रूरत नहीं।",
    },
  ],
  listingFaq: [
    {
      id: "look-list-pieces",
      question: "एक लुक में क्या शामिल है?",
      answer: "हर लुक में एक-दूसरे से मेल खाते तीन आभूषण हैं। क्या-क्या शामिल है, यह देखने के लिए लुक खोलें।",
    },
    {
      id: "look-list-discount",
      question: "लुक पर मिलने वाली छूट कैसे काम करती है?",
      answer: "दिखाई गई बचत पूरे सेट के लिए है। सभी आभूषण एक ही ऑर्डर में जोड़ें: छूट कार्ट में अपने आप गणना होकर भुगतान के समय लागू हो जाएगी। कोड की ज़रूरत नहीं; हर लुक पर छूट अलग हो सकती है।",
    },
    {
      id: "look-list-single",
      question: "क्या मैं आभूषण अलग-अलग खरीद सकता/सकती हूँ?",
      answer: "हाँ। हर आभूषण अलग से खरीदा जा सकता है। दिखाई गई सेट छूट तभी लागू होती है जब आप उस लुक के सभी आभूषण साथ खरीदते हैं।",
    },
    {
      id: "look-list-mix",
      question: "क्या मैं अलग-अलग सेट के आभूषणों से अपना लुक बना सकता/सकती हूँ?",
      answer: "हाँ। अपना लुक बनाएँ विकल्प से कोई भी हार, कंगन और एक जोड़ी झुमके चुनें, तीनों को एक ऑर्डर में जोड़ें और {composed}% बचाएँ।",
    },
  ],
  piecesTitle: "हर आभूषण, एक-एक करके",
  piecesIntro: "इस लुक का हर आभूषण मुरानो ग्लास का है। इन्हें साथ पहनें या अलग-अलग।",
  storyLabel: "इसे क्यों चुनें",
  available: "उपलब्ध",
  viewPiece: "आभूषण देखें",
  whyTitle: "यह लुक क्यों चुनें",
  whyIntro: "काँच के अलावा, इन आभूषणों में और क्या खास है।",
  why: [
    {
      title: "मुरानो ग्लास",
      body: "हर आभूषण मुरानो ग्लास का है—वह द्वीप जहाँ वेनिस में 1291 से काँच का काम होता आया है।",
    },
    {
      title: "साथ पहनने के लिए चुने गए",
      body: "रंग और आकार मेल खाते हैं, इसलिए सेट एक पूरा लुक बनाता है और हर आभूषण की अपनी पहचान भी बनी रहती है।",
    },
    {
      title: "पूरा सेट कम कीमत में",
      body: "पूरा सेट लेने पर {set}% और कोई भी दो आभूषण लेने पर {pair}% की बचत करें। छूट कार्ट में अपने आप जुड़ती है; कोड की ज़रूरत नहीं।",
    },
    {
      title: "उपहार देने के लिए तैयार",
      body: "हर आभूषण हमारे गिफ़्ट बॉक्स में आता है और सीधे उपहार देने के लिए तैयार है।",
    },
    {
      title: "इटली से शिपिंग",
      body: "आपका ऑर्डर इटली से भेजा जाता है। डिलीवरी के बाद आपके पास अपना मन बदलने के लिए 14 दिन हैं।",
    },
  ],
  someQ: "क्या मैं लुक के कुछ ही आभूषण खरीद सकता/सकती हूँ?",
  someA: "हाँ। हर आभूषण अलग से खरीदा जा सकता है। एक ही लुक के दो आभूषण साथ लेने पर {pair}% और पूरा सेट लेने पर {set}% बचाएँ।",
  codeQ: "क्या लुक की छूट के लिए कोई कोड चाहिए?",
  codeA: "नहीं। सभी आभूषण एक ही ऑर्डर में होने पर छूट कार्ट में अपने आप गणना होकर भुगतान के समय लागू होती है।",
  mixQ: "क्या मैं अलग-अलग लुक के आभूषण मिला सकता/सकती हूँ?",
  mixA: "हाँ। अपना लुक बनाएँ विकल्प से कोई भी हार, कंगन और झुमके चुनें और तीनों पर {composed}% बचाएँ।",
  variesQ: "क्या मेरे आभूषण तस्वीरों जैसे ही दिखेंगे?",
  variesA: "काफ़ी मिलते-जुलते, लेकिन बिल्कुल एक जैसे नहीं: काँच के रंग, बुलबुलों और आकार में थोड़ा अंतर होता है। इसी वजह से हर आभूषण की अपनी छोटी-छोटी विशेषताएँ होती हैं।",
  learnTitle: "और जानें",
  learn: {
    guide: "मुरानो ग्लास कैसे बनाया जाता है और असली काँच को नक़ल से कैसे पहचानें।",
    careTitle: "अपने आभूषणों की देखभाल",
    care: "रंग और चमक बनाए रखने के कुछ आसान तरीके।",
    giftTitle: "गिफ़्ट फ़ाइंडर",
    gift: "कुछ सवालों के जवाब देकर किसी के लिए सही आभूषण खोजें।",
    returns: "खरीदारी रद्द करने के लिए 14 दिन; रिफ़ंड आपके मूल भुगतान तरीके पर मिलेगा।",
    about: "हम कौन हैं और कैसे काम करते हैं।",
    contact: "आभूषण या ऑर्डर के बारे में कोई सवाल है? हमें लिखें।",
  },
};

const zh: LookPageCopy = {
  editorialIntro:
    "一套造型由项链、手链和耳环组成，按彼此相衬的颜色与造型精心搭配。您可以整套佩戴，也可以让其中一件成为造型亮点。",
  editorialDescription:
    "三件首饰来自相近的玻璃色调，搭配起来和谐，每一件单独佩戴也各有风格。",
  editorialIncluded: "这套造型包含",
  editorialPrice: "整套造型",
  listingWhyTitle: "搭配好的完整造型",
  listingWhyIntro: "每种组合都经过挑选，让穆拉诺玻璃首饰更容易佩戴、赠送和收藏。",
  listingWhy: [
    {
      title: "彼此相衬的颜色",
      body: "项链、手链和耳环按颜色与造型搭配，整体协调，每件首饰单独佩戴也很合适。",
    },
    {
      title: "值得细看的玻璃",
      body: "每件首饰都采用穆拉诺玻璃。不同首饰之间细微的颜色和形状差异，正是这种材质的特点。",
    },
    {
      title: "成套购买更划算",
      body: "将一套造型中的首饰一起购买，显示的优惠会自动在购物车中计算，无需优惠码。",
    },
  ],
  listingFaq: [
    {
      id: "look-list-pieces",
      question: "一套造型包含哪些首饰？",
      answer: "每套造型包含三件彼此相衬的首饰。打开造型即可查看具体内容。",
    },
    {
      id: "look-list-discount",
      question: "造型套装优惠如何计算？",
      answer: "每套造型显示的优惠适用于整套商品。将套装中的所有首饰加入同一订单，优惠会在购物车中自动计算，并在结账时应用。无需优惠码；不同造型的优惠比例可能不同。",
    },
    {
      id: "look-list-single",
      question: "可以单独购买其中的首饰吗？",
      answer: "可以。每件首饰都可单独购买。只有同时购买该造型中的全部首饰，才可享受显示的套装优惠。",
    },
    {
      id: "look-list-mix",
      question: "可以从不同套装中挑选首饰来搭配吗？",
      answer: "可以。使用打造专属搭配功能，任意选择一条项链、一条手链和一对耳环，将三件加入同一订单即可节省 {composed}%。",
    },
  ],
  piecesTitle: "逐件欣赏",
  piecesIntro: "这套造型中的每件首饰都采用穆拉诺玻璃。您可以搭配佩戴，也可以单独佩戴。",
  storyLabel: "选择它的理由",
  available: "有货",
  viewPiece: "查看这件首饰",
  whyTitle: "选择这套造型的理由",
  whyIntro: "除了玻璃本身，这些首饰还有哪些值得喜欢之处。",
  why: [
    {
      title: "穆拉诺玻璃",
      body: "每件首饰都采用穆拉诺玻璃。自 1291 年起，威尼斯便在这座岛上从事玻璃制作。",
    },
    {
      title: "搭配佩戴的组合",
      body: "颜色与造型经过搭配，组成完整造型；每件首饰单独佩戴也很出彩。",
    },
    {
      title: "整套购买更优惠",
      body: "购买整套可节省 {set}%，任选两件可节省 {pair}%。优惠会自动显示在购物车中，无需优惠码。",
    },
    {
      title: "适合直接送礼",
      body: "每件首饰都装在我们的礼盒中，收到后即可赠送。",
    },
    {
      title: "从意大利发货",
      body: "您的订单从意大利发出。商品送达后，您有 14 天时间考虑是否保留。",
    },
  ],
  someQ: "可以只购买这套造型中的部分首饰吗？",
  someA: "可以。每件首饰都可单独购买。同一套造型中任选两件可节省 {pair}%，购买整套可节省 {set}%。",
  codeQ: "享受造型优惠需要输入优惠码吗？",
  codeA: "不需要。只要首饰在同一订单中，优惠就会在购物车中自动计算，并在结账时应用。",
  mixQ: "可以混搭不同造型中的首饰吗？",
  mixA: "可以。使用打造专属搭配功能，任意选择一条项链、一条手链和耳环，三件一起可节省 {composed}%。",
  variesQ: "收到的首饰会和照片完全一样吗？",
  variesA: "会很相似，但不会完全相同：玻璃的颜色、气泡和形状会有细微差异，因此每件首饰都有自己的特点。",
  learnTitle: "了解更多",
  learn: {
    guide: "了解穆拉诺玻璃的制作方式，以及如何辨别仿制品。",
    careTitle: "首饰保养",
    care: "几个简单习惯，帮助保持色彩与光泽。",
    giftTitle: "礼物推荐工具",
    gift: "回答几个问题，为对方找到合适的首饰。",
    returns: "您有 14 天时间撤回购买；退款将退回原支付方式。",
    about: "了解我们是谁，以及我们的选品方式。",
    contact: "对首饰或订单有疑问？欢迎联系我们。",
  },
};

const ru: LookPageCopy = {
  editorialIntro:
    "В каждом образе сочетаются колье, браслет и серьги, подобранные по цвету и форме. Носите их вместе или позвольте одному украшению стать главным акцентом.",
  editorialDescription:
    "Три украшения в близких оттенках стекла, которые хорошо смотрятся вместе. У каждого есть и свой характер.",
  editorialIncluded: "В этот образ входят",
  editorialPrice: "Полный образ",
  listingWhyTitle: "Образ, в котором всё сочетается",
  listingWhyIntro: "Каждое сочетание подобрано так, чтобы украшения из муранского стекла было легко носить, дарить и коллекционировать.",
  listingWhy: [
    { title: "Гармоничные цвета", body: "Колье, браслет и серьги подобраны по цвету и форме: вместе они создают цельный образ, а по отдельности каждое украшение тоже хорошо смотрится." },
    { title: "Стекло, которое хочется рассмотреть", body: "Все украшения выполнены из муранского стекла. Небольшие различия в цвете и форме от изделия к изделию — часть его характера." },
    { title: "Выгоднее комплектом", body: "При покупке всех украшений из образа скидка, указанная на странице, автоматически рассчитывается в корзине. Промокод не нужен." },
  ],
  listingFaq: [
    { id: "look-list-pieces", question: "Какие украшения входят в образ?", answer: "В каждом образе — три украшения, подобранные друг к другу. Откройте страницу образа, чтобы посмотреть состав." },
    { id: "look-list-discount", question: "Как действует скидка на образ?", answer: "Указанная скидка действует на полный комплект. Добавьте все его украшения в один заказ: скидка автоматически рассчитаетcя в корзине и применится при оформлении. Промокод не нужен; размер скидки зависит от образа." },
    { id: "look-list-single", question: "Можно купить украшения по отдельности?", answer: "Да. Каждое украшение продаётся отдельно. Указанная скидка на комплект действует при покупке всех украшений одного образа вместе." },
    { id: "look-list-mix", question: "Можно собрать образ из украшений разных комплектов?", answer: "Да. В разделе «Соберите свой образ» выберите любые колье, браслет и пару серёг, добавьте все три в один заказ и сэкономьте {composed}%." },
  ],
  piecesTitle: "Каждое украшение отдельно",
  piecesIntro: "Все украшения в этом образе выполнены из муранского стекла. Носите их вместе или по отдельности.",
  storyLabel: "Почему стоит выбрать этот образ",
  available: "В наличии",
  viewPiece: "Посмотреть украшение",
  whyTitle: "Почему стоит выбрать этот образ",
  whyIntro: "Что делает эти украшения особенными помимо самого стекла.",
  why: [
    { title: "Муранское стекло", body: "Все украшения выполнены из муранского стекла. Венеция занимается стеклоделием на этом острове с 1291 года." },
    { title: "Подобраны друг к другу", body: "Цвета и формы сочетаются, создавая цельный образ, а каждое украшение сохраняет свою выразительность." },
    { title: "Комплект выгоднее", body: "Сэкономьте {set}% при покупке полного комплекта или {pair}% при покупке любых двух украшений. Скидка автоматически появится в корзине; промокод не нужен." },
    { title: "Можно сразу подарить", body: "Каждое украшение приходит в нашей подарочной коробке и готово стать подарком." },
    { title: "Доставка из Италии", body: "Заказ отправляется из Италии. После доставки у вас есть 14 дней, чтобы передумать." },
  ],
  someQ: "Можно купить только часть украшений из образа?",
  someA: "Да. Каждое украшение можно купить отдельно. При покупке двух украшений из одного образа вы сэкономите {pair}%, а полного комплекта — {set}%.",
  codeQ: "Нужен ли промокод для скидки на образ?",
  codeA: "Нет. Если украшения находятся в одном заказе, скидка автоматически рассчитывается в корзине и применяется при оформлении.",
  mixQ: "Можно сочетать украшения из разных образов?",
  mixA: "Да. В разделе «Соберите свой образ» выберите любые колье, браслет и серьги и сэкономьте {composed}% на трёх украшениях.",
  variesQ: "Будут ли украшения точно такими же, как на фото?",
  variesA: "Они будут очень похожи, но не идентичны: оттенок, пузырьки и форма стекла могут немного различаться. Поэтому у каждого украшения есть свои особенности.",
  learnTitle: "Узнать больше",
  learn: {
    guide: "Как обрабатывают муранское стекло и как отличить его от имитации.",
    careTitle: "Уход за украшениями",
    care: "Несколько простых правил, которые помогут сохранить цвет и блеск.",
    giftTitle: "Подбор подарка",
    gift: "Ответьте на несколько вопросов, чтобы найти подходящее украшение.",
    returns: "У вас есть 14 дней, чтобы отказаться от покупки; возврат средств поступит на исходный способ оплаты.",
    about: "Кто мы и как работаем.",
    contact: "Есть вопрос об украшении или заказе? Напишите нам.",
  },
};

const es: LookPageCopy = {
  editorialIntro:
    "Cada look reúne un collar, una pulsera y unos pendientes, seleccionados para que sus colores y formas combinen. Llévalos juntos o deja que una sola pieza marque el estilo.",
  editorialDescription:
    "Tres piezas en tonos de vidrio que combinan entre sí. Cada una también tiene personalidad propia.",
  editorialIncluded: "Este look incluye",
  editorialPrice: "El look completo",
  listingWhyTitle: "Un look que ya combina",
  listingWhyIntro: "Cada combinación está pensada para que las joyas de vidrio de Murano sean fáciles de llevar, regalar y coleccionar.",
  listingWhy: [
    { title: "Colores que combinan", body: "El collar, la pulsera y los pendientes se combinan por sus colores y formas: juntos crean un look cuidado y cada pieza también queda bien por separado." },
    { title: "Vidrio que merece una mirada de cerca", body: "Todas las piezas son de vidrio de Murano. Las pequeñas diferencias de color y forma entre una pieza y otra son parte de su carácter." },
    { title: "Mejor precio en conjunto", body: "Al comprar juntas todas las piezas de un look, el descuento indicado se calcula automáticamente en el carrito. No necesitas ningún código." },
  ],
  listingFaq: [
    { id: "look-list-pieces", question: "¿Qué incluye un look?", answer: "Cada look reúne tres piezas seleccionadas para combinar entre sí. Abre un look para ver exactamente qué incluye." },
    { id: "look-list-discount", question: "¿Cómo funciona el descuento del look?", answer: "El descuento indicado se aplica al conjunto completo. Añade todas sus piezas al mismo pedido: el descuento se calcula automáticamente en el carrito y se aplica al pagar. No necesitas un código; el porcentaje puede variar según el look." },
    { id: "look-list-single", question: "¿Puedo comprar las piezas por separado?", answer: "Sí. Cada pieza se puede comprar por separado. El descuento indicado para el conjunto se aplica al comprar juntas todas las piezas de ese look." },
    { id: "look-list-mix", question: "¿Puedo crear un look con piezas de distintos conjuntos?", answer: "Sí. En «Crea tu propio look», elige cualquier collar, pulsera y par de pendientes, añádelos al mismo pedido y ahorra un {composed} %." },
  ],
  piecesTitle: "Las piezas, una a una",
  piecesIntro: "Todas las piezas de este look son de vidrio de Murano. Llévalas juntas o por separado.",
  storyLabel: "Por qué elegirlo",
  available: "Disponible",
  viewPiece: "Ver la pieza",
  whyTitle: "Por qué elegir este look",
  whyIntro: "Qué hace especiales estas piezas, además del vidrio.",
  why: [
    { title: "Vidrio de Murano", body: "Todas las piezas son de vidrio de Murano, de la isla donde Venecia trabaja el vidrio desde 1291." },
    { title: "Seleccionadas para llevarlas juntas", body: "Los colores y las formas combinan y crean un look completo, aunque cada pieza también destaca por sí sola." },
    { title: "El conjunto cuesta menos", body: "Ahorra un {set} % al comprar el conjunto completo o un {pair} % al elegir dos piezas. El descuento aparece automáticamente en el carrito, sin código." },
    { title: "Listo para regalar", body: "Cada pieza llega en nuestra caja de regalo, lista para regalar tal cual." },
    { title: "Envío desde Italia", body: "Tu pedido se envía desde Italia. Tienes 14 días desde la entrega para cambiar de opinión." },
  ],
  someQ: "¿Puedo comprar solo algunas piezas del look?",
  someA: "Sí. Puedes comprar cada pieza por separado. Al comprar juntas dos piezas del mismo look ahorras un {pair} %, y con el conjunto completo ahorras un {set} %.",
  codeQ: "¿Necesito un código para el descuento del look?",
  codeA: "No. El descuento se calcula automáticamente en el carrito y se aplica al pagar cuando las piezas están en el mismo pedido.",
  mixQ: "¿Puedo combinar piezas de distintos looks?",
  mixA: "Sí. En «Crea tu propio look», elige cualquier collar, pulsera y pendientes y ahorra un {composed} % en las tres piezas.",
  variesQ: "¿Mis piezas serán exactamente iguales que en las fotos?",
  variesA: "Muy parecidas, aunque no idénticas: el vidrio puede variar ligeramente en color, burbujas y forma. Por eso cada pieza tiene sus propios detalles.",
  learnTitle: "Más información",
  learn: {
    guide: "Cómo se trabaja el vidrio de Murano y cómo distinguirlo de las imitaciones.",
    careTitle: "Cómo cuidar tus joyas",
    care: "Unos hábitos sencillos para conservar el color y el brillo.",
    giftTitle: "Buscador de regalos",
    gift: "Responde a unas preguntas para encontrar la pieza adecuada para alguien.",
    returns: "Tienes 14 días para desistir de la compra; el reembolso se hará en el método de pago original.",
    about: "Quiénes somos y cómo trabajamos.",
    contact: "¿Tienes alguna pregunta sobre una pieza o un pedido? Escríbenos.",
  },
};

const ar: LookPageCopy = {
  editorialIntro:
    "يجمع كل تنسيق عقدًا وسوارًا وأقراطًا اختيرت لتتناغم ألوانها وأشكالها. ارتديها معًا أو دعي قطعة واحدة تكون محور الإطلالة.",
  editorialDescription:
    "ثلاث قطع بألوان زجاج متقاربة اختيرت لتنسجم معًا، ولكل قطعة طابعها الخاص أيضًا.",
  editorialIncluded: "يتضمن هذا التنسيق",
  editorialPrice: "التنسيق الكامل",
  listingWhyTitle: "تنسيق متكامل ومتناسق",
  listingWhyIntro: "اختير كل تنسيق ليسهل ارتداء مجوهرات زجاج مورانو أو إهداؤها أو اقتناؤها.",
  listingWhy: [
    { title: "ألوان تنسجم معًا", body: "اختير العقد والسوار والأقراط لتتناسب ألوانها وأشكالها، فتبدو الإطلالة متكاملة وتليق كل قطعة بمفردها أيضًا." },
    { title: "زجاج يستحق التأمل", body: "كل قطعة من زجاج مورانو. والاختلافات البسيطة في اللون والشكل من قطعة إلى أخرى جزء من طابعه." },
    { title: "سعر أفضل عند شراء الطقم", body: "عند شراء قطع التنسيق معًا، يُحتسب الخصم المعروض تلقائيًا في سلتك. لا حاجة إلى رمز خصم." },
  ],
  listingFaq: [
    { id: "look-list-pieces", question: "ما القطع التي يتضمنها التنسيق؟", answer: "يجمع كل تنسيق ثلاث قطع اختيرت لتتناسب معًا. افتحي التنسيق لمعرفة القطع المشمولة بالتحديد." },
    { id: "look-list-discount", question: "كيف يعمل خصم التنسيق؟", answer: "يسري الخصم الموضح عند شراء الطقم كاملًا. أضيفي كل قطعه إلى الطلب نفسه، وسيُحتسب الخصم تلقائيًا في السلة ويُطبّق عند إتمام الشراء. لا حاجة إلى رمز خصم، وقد تختلف النسبة من تنسيق إلى آخر." },
    { id: "look-list-single", question: "هل يمكنني شراء القطع منفردة؟", answer: "نعم. يمكن شراء كل قطعة على حدة. ويسري خصم الطقم الموضح عند شراء جميع قطع التنسيق معًا." },
    { id: "look-list-mix", question: "هل يمكنني تنسيق قطع من أطقم مختلفة؟", answer: "نعم. اختاري أي عقد وسوار وزوج من الأقراط باستخدام خيار «نسّقي إطلالتك بنفسك»، وأضيفي القطع الثلاث إلى طلب واحد لتوفّري {composed}%." },
  ],
  piecesTitle: "القطع واحدة تلو الأخرى",
  piecesIntro: "كل قطعة في هذا التنسيق من زجاج مورانو. ارتديها معًا أو منفردة.",
  storyLabel: "لماذا تختارينه؟",
  available: "متوفر",
  viewPiece: "عرض القطعة",
  whyTitle: "لماذا تختارين هذا التنسيق؟",
  whyIntro: "ما يميز هذه القطع إلى جانب الزجاج نفسه.",
  why: [
    { title: "زجاج مورانو", body: "كل قطعة من زجاج مورانو، من الجزيرة التي تعمل فيها البندقية بالزجاج منذ عام 1291." },
    { title: "اختيرت لتُرتدى معًا", body: "تتناغم الألوان والأشكال لتكوّن إطلالة متكاملة، مع احتفاظ كل قطعة بحضورها الخاص." },
    { title: "الطقم أوفر", body: "وفّري {set}% عند شراء الطقم كاملًا، أو {pair}% عند اختيار أي قطعتين. يظهر الخصم تلقائيًا في السلة، من دون رمز خصم." },
    { title: "جاهزة للإهداء", body: "تصل كل قطعة في علبة الهدايا الخاصة بنا، جاهزة لتقديمها كما هي." },
    { title: "الشحن من إيطاليا", body: "يُشحن طلبك من إيطاليا، ولديك 14 يومًا من تاريخ التسليم لتغيير رأيك." },
  ],
  someQ: "هل يمكنني شراء بعض قطع التنسيق فقط؟",
  someA: "نعم. يمكن شراء كل قطعة منفردة. وفّري {pair}% عند شراء قطعتين من التنسيق نفسه معًا، أو {set}% عند شراء الطقم كاملًا.",
  codeQ: "هل أحتاج إلى رمز خصم لتنسيق الإطلالة؟",
  codeA: "لا. يُحتسب الخصم تلقائيًا في السلة ويُطبّق عند إتمام الشراء ما دامت القطع ضمن الطلب نفسه.",
  mixQ: "هل يمكنني تنسيق قطع من إطلالات مختلفة؟",
  mixA: "نعم. اختاري أي عقد وسوار وأقراط باستخدام خيار «نسّقي إطلالتك بنفسك» ووفّري {composed}% على القطع الثلاث.",
  variesQ: "هل ستبدو قطعي مطابقة تمامًا للصور؟",
  variesA: "ستكون قريبة جدًا، لكنها ليست متطابقة تمامًا: قد يختلف لون الزجاج وفقاعاته وشكله قليلًا. ولهذا تحمل كل قطعة تفاصيلها الخاصة.",
  learnTitle: "اكتشفي المزيد",
  learn: {
    guide: "كيف يُشكّل زجاج مورانو وكيف تميّزينه عن الزجاج المقلّد.",
    careTitle: "العناية بمجوهراتك",
    care: "عادات بسيطة تساعد على الحفاظ على اللون واللمعان.",
    giftTitle: "اختيار الهدية",
    gift: "أجيبي عن بضعة أسئلة للعثور على القطعة المناسبة لشخص عزيز.",
    returns: "لديك 14 يومًا للانسحاب من الشراء؛ ويُعاد المبلغ إلى وسيلة الدفع الأصلية.",
    about: "من نحن وكيف نعمل.",
    contact: "هل لديك سؤال عن قطعة أو طلب؟ راسلينا.",
  },
};

const ja: LookPageCopy = {
  editorialIntro:
    "ネックレス、ブレスレット、ピアスを、色や形の相性を考えて組み合わせました。セットで着けても、一点を主役にしても楽しめます。",
  editorialDescription:
    "同系色のガラスから選んだ3点のセット。それぞれ単品でも個性が光ります。",
  editorialIncluded: "このコーディネートの内容",
  editorialPrice: "セット価格",
  listingWhyTitle: "相性のよい組み合わせ",
  listingWhyIntro: "ムラーノガラスのジュエリーを、身に着けたり、贈ったり、集めたりしやすい組み合わせにしました。",
  listingWhy: [
    { title: "調和する色合い", body: "ネックレス、ブレスレット、ピアスを色と形で組み合わせました。全体に統一感があり、それぞれ単品でも楽しめます。" },
    { title: "ガラスの表情を楽しむ", body: "すべてムラーノガラスを使っています。色や形のわずかな違いも、素材ならではの個性です。" },
    { title: "セットならお得", body: "セット内のジュエリーをまとめて購入すると、表示された割引がカートで自動計算されます。コードは不要です。" },
  ],
  listingFaq: [
    { id: "look-list-pieces", question: "セットには何が含まれますか？", answer: "それぞれのセットには、組み合わせて楽しめる3点が含まれます。セットを開くと内容をご確認いただけます。" },
    { id: "look-list-discount", question: "セット割引はどのように適用されますか？", answer: "表示された割引はセット全体に適用されます。セット内のすべてのジュエリーを同じ注文に追加すると、カートで割引が自動計算され、決済時に適用されます。コードは不要です。割引率はセットによって異なります。" },
    { id: "look-list-single", question: "ジュエリーを一点ずつ購入できますか？", answer: "はい、それぞれ単品でご購入いただけます。表示されたセット割引は、同じセット内の全商品をまとめて購入した場合に適用されます。" },
    { id: "look-list-mix", question: "異なるセットから選んでコーディネートできますか？", answer: "はい。「自分でコーディネート」からネックレス、ブレスレット、ピアスをそれぞれ選び、3点を同じ注文に追加すると{composed}%お得になります。" },
  ],
  piecesTitle: "アイテムを一点ずつ",
  piecesIntro: "このセットのジュエリーはすべてムラーノガラス製です。合わせて着けても、単品でもお楽しみいただけます。",
  storyLabel: "おすすめの理由",
  available: "在庫あり",
  viewPiece: "商品を見る",
  whyTitle: "このコーディネートを選ぶ理由",
  whyIntro: "ガラスの魅力に加えて、セットならではのポイントをご紹介します。",
  why: [
    { title: "ムラーノガラス", body: "すべてのアイテムにムラーノガラスを使用しています。ヴェネツィアでは1291年からこの島でガラスが作られてきました。" },
    { title: "一緒に楽しめる組み合わせ", body: "色と形を合わせてセットにしました。それぞれ単品でも存在感があります。" },
    { title: "セットでお得に", body: "セット購入で{set}%、2点購入で{pair}%お得になります。割引はカートに自動で反映され、コードは不要です。" },
    { title: "そのまま贈れる", body: "どのアイテムもギフトボックスに入れてお届けするため、そのまま贈り物にできます。" },
    { title: "イタリアから発送", body: "ご注文はイタリアから発送します。商品到着後14日以内であれば、購入を取り消せます。" },
  ],
  someQ: "セットの一部だけを購入できますか？",
  someA: "はい、各アイテムは単品でも購入できます。同じセットから2点購入すると{pair}%、セット全体なら{set}%お得です。",
  codeQ: "セット割引にコードは必要ですか？",
  codeA: "いいえ。対象のアイテムを同じ注文に入れると、割引はカートで自動計算され、決済時に適用されます。",
  mixQ: "異なるコーディネートのアイテムを組み合わせられますか？",
  mixA: "はい。「自分でコーディネート」からネックレス、ブレスレット、ピアスを選ぶと、3点で{composed}%お得になります。",
  variesQ: "届く商品は写真とまったく同じですか？",
  variesA: "とてもよく似ていますが、まったく同じではありません。ガラスの色や気泡、形にはわずかな違いがあり、それぞれの表情を生み出します。",
  learnTitle: "詳しく見る",
  learn: {
    guide: "ムラーノガラスの作り方と、模造品との見分け方をご紹介します。",
    careTitle: "ジュエリーのお手入れ",
    care: "色と輝きを保つための簡単なお手入れ方法をご案内します。",
    giftTitle: "ギフト選び",
    gift: "いくつかの質問に答えて、贈る相手にぴったりのアイテムを見つけましょう。",
    returns: "購入から14日以内は契約を撤回できます。返金は元のお支払い方法に行われます。",
    about: "Perlaについて、私たちの取り組みをご紹介します。",
    contact: "商品や注文についてご質問がありますか？お気軽にお問い合わせください。",
  },
};

const nl: LookPageCopy = {
  editorialIntro: "Deze looks combineren een ketting, armband en oorbellen op basis van hun kleuren en vormen. Draag ze samen of laat één sieraad de toon zetten.",
  editorialDescription: "Drie sieraden in bij elkaar passende glastinten. Elk sieraad komt ook afzonderlijk goed tot zijn recht.",
  editorialIncluded: "In deze look",
  editorialPrice: "De complete look",
  listingWhyTitle: "Een look die al klopt",
  listingWhyIntro: "Elke combinatie maakt Murano-glas eenvoudig te dragen, cadeau te geven of te verzamelen.",
  listingWhy: [
    { title: "Kleuren die bij elkaar passen", body: "Ketting, armband en oorbellen zijn op kleur en vorm gecombineerd. Samen vormen ze een geheel, maar elk sieraad is ook apart mooi." },
    { title: "Glas om van dichtbij te bekijken", body: "Elk sieraad is van Murano-glas. Kleine verschillen in kleur en vorm horen bij het karakter van het materiaal." },
    { title: "Voordeel als set", body: "Koop alle sieraden uit een look samen en de getoonde korting wordt automatisch in uw winkelwagen toegepast. Een code is niet nodig." },
  ],
  listingFaq: [
    { id: "look-list-pieces", question: "Wat zit er in een look?", answer: "Elke look bestaat uit drie sieraden die bij elkaar passen. Open een look om precies te zien wat erbij hoort." },
    { id: "look-list-discount", question: "Hoe werkt de korting op een look?", answer: "De getoonde korting geldt voor de complete set. Voeg alle sieraden uit die look toe aan dezelfde bestelling; de korting wordt automatisch in uw winkelwagen berekend en bij het afrekenen toegepast. U hebt geen code nodig. Het percentage kan per look verschillen." },
    { id: "look-list-single", question: "Kan ik de sieraden ook apart kopen?", answer: "Ja. Elk sieraad is ook afzonderlijk verkrijgbaar. De getoonde setkorting geldt wanneer u alle sieraden uit dezelfde look samen koopt." },
    { id: "look-list-mix", question: "Kan ik zelf sieraden uit verschillende sets combineren?", answer: "Ja. Stel uw eigen look samen met een ketting, armband en paar oorbellen. Voeg ze alle drie aan één bestelling toe en bespaar {composed}%." },
  ],
  piecesTitle: "De sieraden afzonderlijk",
  piecesIntro: "Elk sieraad in deze look is van Murano-glas. Draag ze samen of afzonderlijk.",
  storyLabel: "Waarom deze look kiezen",
  available: "Beschikbaar",
  viewPiece: "Bekijk het sieraad",
  whyTitle: "Waarom deze look kiezen",
  whyIntro: "Dit krijgt u bij deze sieraden, naast het glas zelf.",
  why: [
    { title: "Murano-glas", body: "Elk sieraad is van Murano-glas, van het eiland waar Venetië sinds 1291 glas bewerkt." },
    { title: "Geselecteerd om samen te dragen", body: "De kleuren en vormen passen bij elkaar, zodat de set één geheel vormt en elk sieraad ook afzonderlijk mooi staat." },
    { title: "Voordeliger als set", body: "De complete set geeft {set}% korting; twee sieraden geven {pair}% korting. De korting verschijnt automatisch in uw winkelwagen. Een code is niet nodig." },
    { title: "Klaar om cadeau te geven", body: "Elk sieraad wordt geleverd in onze geschenkdoos en is meteen klaar om cadeau te geven." },
    { title: "Verzonden vanuit Italië", body: "Uw bestelling wordt vanuit Italië verzonden. Na bezorging heeft u 14 dagen bedenktijd." },
  ],
  someQ: "Kan ik maar een deel van de look kopen?",
  someA: "Ja. Elk sieraad is afzonderlijk verkrijgbaar. Twee sieraden uit dezelfde look geven {pair}% korting; de complete set geeft {set}% korting.",
  codeQ: "Heb ik een code nodig voor de korting op een look?",
  codeA: "Nee. De korting wordt automatisch in uw winkelwagen berekend en bij het afrekenen toegepast zodra de sieraden samen in één bestelling staan.",
  mixQ: "Kan ik sieraden uit verschillende looks combineren?",
  mixA: "Ja. Stel zelf een look samen met een ketting, armband en oorbellen en bespaar {composed}% op de drie samen.",
  variesQ: "Zien mijn sieraden er precies zo uit als op de foto's?",
  variesA: "Ze lijken er sterk op, maar zijn niet identiek. De kleur, luchtbelletjes en vorm van glas kunnen per sieraad iets verschillen.",
  learnTitle: "Meer ontdekken",
  learn: {
    guide: "Hoe Murano-glas wordt bewerkt en hoe u het van imitaties herkent.",
    careTitle: "Uw sieraden verzorgen",
    care: "Een paar eenvoudige gewoontes helpen de kleur en glans te behouden.",
    giftTitle: "Cadeauvinder",
    gift: "Beantwoord een paar vragen en vind het passende sieraad.",
    returns: "U heeft 14 dagen om uw aankoop te herroepen. We betalen terug via uw oorspronkelijke betaalmethode.",
    about: "Wie we zijn en hoe we werken.",
    contact: "Een vraag over een sieraad of bestelling? Neem contact met ons op.",
  },
};

const pl: LookPageCopy = {
  ...en,
  editorialIntro: "Każda stylizacja łączy naszyjnik, bransoletkę i kolczyki dobrane tak, by ich kolory i kształty do siebie pasowały. Noś je razem albo pozwól, by jedna ozdoba grała główną rolę.",
  editorialDescription: "Trzy ozdoby ze szkła w podobnej palecie barw, wybrane tak, by dobrze wyglądały razem. Każda pięknie prezentuje się także osobno.",
  editorialIncluded: "W tej stylizacji",
  editorialPrice: "Cała stylizacja",
  listingWhyTitle: "Stylizacja, która tworzy całość",
  listingWhyIntro: "Każde połączenie ułatwia noszenie, podarowanie i kolekcjonowanie szkła z Murano.",
  listingWhy: [
    { title: "Kolory, które do siebie pasują", body: "Naszyjnik, bransoletka i kolczyki są dobrane pod względem kolorów i kształtów. Razem tworzą spójną całość, a każda ozdoba pasuje też do innych stylizacji." },
    { title: "Szkło, któremu warto przyjrzeć się z bliska", body: "Każda ozdoba jest wykonana ze szkła z Murano. Niewielkie różnice w kolorze i formie są częścią jego charakteru." },
    { title: "Korzystniejsza cena w zestawie", body: "Kup wszystkie ozdoby ze stylizacji razem, a widoczny rabat naliczy się automatycznie w koszyku. Nie potrzebujesz kodu." },
  ],
  listingFaq: [
    { id: "look-list-pieces", question: "Co zawiera stylizacja?", answer: "Każda stylizacja obejmuje trzy pasujące do siebie ozdoby. Otwórz jej stronę, aby zobaczyć dokładny zestaw." },
    { id: "look-list-discount", question: "Jak działa rabat na stylizację?", answer: "Podany rabat dotyczy całego zestawu. Dodaj wszystkie ozdoby z tej stylizacji do jednego zamówienia, a rabat zostanie automatycznie obliczony w koszyku i naliczony przy płatności. Kod nie jest potrzebny; wysokość rabatu zależy od stylizacji." },
    { id: "look-list-single", question: "Czy mogę kupić ozdoby osobno?", answer: "Tak. Każdą ozdobę można kupić osobno. Rabat na zestaw obowiązuje przy zakupie wszystkich elementów tej samej stylizacji." },
    { id: "look-list-mix", question: "Czy mogę połączyć ozdoby z różnych zestawów?", answer: "Tak. Wybierz naszyjnik, bransoletkę i kolczyki w opcji Stwórz własną stylizację, dodaj je do jednego zamówienia i oszczędź {composed}%." },
  ],
  piecesTitle: "Każda ozdoba osobno",
  piecesIntro: "Wszystkie elementy tej stylizacji są ze szkła z Murano. Noś je razem lub osobno.",
  storyLabel: "Dlaczego warto ją wybrać",
  available: "Dostępna",
  viewPiece: "Zobacz ozdobę",
  whyTitle: "Dlaczego warto wybrać tę stylizację",
  whyIntro: "Co zyskujesz oprócz piękna szkła.",
  why: [
    { title: "Szkło z Murano", body: "Każda ozdoba jest wykonana ze szkła z Murano, wyspy, na której Wenecjanie obrabiają szkło od 1291 roku." },
    { title: "Dobrane do wspólnego noszenia", body: "Kolory i kształty pasują do siebie, dzięki czemu zestaw tworzy spójną całość, a każda ozdoba dobrze wygląda również osobno." },
    { title: "Niższa cena zestawu", body: "Kompletny zestaw oznacza {set}% oszczędności, a dwie ozdoby — {pair}%. Rabat pojawi się automatycznie w koszyku; kod nie jest potrzebny." },
    { title: "Gotowe na prezent", body: "Każda ozdoba jest zapakowana w pudełko prezentowe i gotowa do wręczenia." },
    { title: "Wysyłka z Włoch", body: "Zamówienie wysyłamy z Włoch. Po dostawie masz 14 dni na zmianę decyzji." },
  ],
  someQ: "Czy mogę kupić tylko część stylizacji?",
  someA: "Tak. Każdą ozdobę można kupić osobno. Dwie ozdoby z tej samej stylizacji dają {pair}% rabatu, a cały zestaw — {set}%.",
  codeQ: "Czy do rabatu na stylizację potrzebuję kodu?",
  codeA: "Nie. Rabat naliczy się automatycznie w koszyku i przy płatności, gdy wszystkie elementy stylizacji znajdą się w jednym zamówieniu.",
  mixQ: "Czy mogę połączyć ozdoby z różnych stylizacji?",
  mixA: "Tak. Stwórz własny zestaw z naszyjnika, bransoletki i kolczyków, a przy zakupie wszystkich trzech oszczędzisz {composed}%.",
  variesQ: "Czy moja biżuteria będzie wyglądać dokładnie jak na zdjęciach?",
  variesA: "Będzie bardzo podobna, ale nie identyczna. Kolor, pęcherzyki powietrza i kształt szkła mogą nieznacznie różnić się między ozdobami.",
  learnTitle: "Odkryj więcej",
  learn: { guide: "Poznaj techniki obróbki szkła z Murano i dowiedz się, jak odróżnić oryginały od imitacji.", careTitle: "Pielęgnacja biżuterii", care: "Kilka prostych nawyków pomoże zachować kolor i blask.", giftTitle: "Wybierz prezent", gift: "Odpowiedz na kilka pytań i znajdź odpowiednią ozdobę.", returns: "Masz 14 dni na odstąpienie od zakupu. Zwrot środków otrzymasz tą samą metodą płatności.", about: "Poznaj Perla i dowiedz się, jak pracujemy.", contact: "Masz pytanie o produkt lub zamówienie? Napisz do nas." },
};

const cs: LookPageCopy = {
  ...en,
  editorialIntro: "Každý look spojuje náhrdelník, náramek a náušnice vybrané tak, aby jejich barvy a tvary ladily. Noste celý set, nebo nechte vyniknout jediný šperk.",
  editorialDescription: "Tři šperky v podobných barvách skla, vybrané tak, aby spolu ladily. Každý vynikne i samostatně.", editorialIncluded: "V tomto looku", editorialPrice: "Celý look",
  listingWhyTitle: "Look, který spolu ladí", listingWhyIntro: "Každou kombinaci vybíráme tak, aby se muránské sklo snadno nosilo, darovalo i sbíralo.",
  listingWhy: [{ title: "Barvy, které k sobě patří", body: "Náhrdelník, náramek a náušnice ladí barvami i tvary. Společně tvoří promyšlený celek a každý šperk funguje i samostatně." }, { title: "Sklo, které stojí za bližší pohled", body: "Každý šperk je z muránského skla. Drobné rozdíly v barvě a tvaru jsou součástí jeho charakteru." }, { title: "Výhodnější cena v setu", body: "Kupte všechny šperky z looku společně a sleva se automaticky uplatní v košíku. Kód není potřeba." }],
  listingFaq: [{ id: "look-list-pieces", question: "Co obsahuje look?", answer: "Každý look spojuje tři vzájemně sladěné šperky. Otevřete jeho stránku a podívejte se na přesný obsah." }, { id: "look-list-discount", question: "Jak funguje sleva na look?", answer: "Uvedená sleva platí pro celý set. Přidejte všechny jeho šperky do jedné objednávky a sleva se automaticky vypočítá v košíku. Kód není potřeba; výše slevy se může lišit." }, { id: "look-list-single", question: "Lze koupit šperky samostatně?", answer: "Ano. Každý šperk lze koupit samostatně. Sleva platí při nákupu celého setu." }, { id: "look-list-mix", question: "Mohu kombinovat šperky z různých looků?", answer: "Ano. Vyberte náhrdelník, náramek a náušnice v možnosti Sestavte si vlastní look, přidejte je do jedné objednávky a ušetřete {composed} %." }],
  piecesTitle: "Každý šperk zvlášť", piecesIntro: "Všechny šperky v tomto looku jsou z muránského skla. Noste je společně nebo samostatně.", storyLabel: "Proč si ho vybrat", available: "Skladem", viewPiece: "Zobrazit šperk",
  whyTitle: "Proč si vybrat tento look", whyIntro: "Co vám set nabízí kromě krásy samotného skla.",
  why: [{ title: "Muránské sklo", body: "Každý šperk je z muránského skla z ostrova, kde se sklo zpracovává od roku 1291." }, { title: "Vybrané k nošení společně", body: "Barvy a tvary k sobě ladí, ale každý šperk vypadá skvěle i samostatně." }, { title: "Výhodnější cena setu", body: "Celý set ušetří {set} %, dva šperky {pair} %. Sleva se automaticky zobrazí v košíku." }, { title: "Připraveno k darování", body: "Každý šperk dorazí v dárkové krabičce." }, { title: "Odesíláme z Itálie", body: "Objednávku odesíláme z Itálie a po doručení máte 14 dní na rozmyšlenou." }],
  someQ: "Mohu koupit jen část looku?", someA: "Ano. Každý šperk lze koupit samostatně. Dva šperky z jednoho looku ušetří {pair} %, celý set {set} %.", codeQ: "Potřebuji na slevu kód?", codeA: "Ne. Sleva se vypočítá v košíku a uplatní při placení, když jsou šperky ve stejné objednávce.", mixQ: "Mohu kombinovat šperky z různých looků?", mixA: "Ano. Sestavte si vlastní look z náhrdelníku, náramku a náušnic a při nákupu všech tří ušetříte {composed} %.", variesQ: "Bude můj šperk vypadat přesně jako na fotografii?", variesA: "Bude velmi podobný, ale ne úplně stejný. Barva, bublinky i tvar skla se mohou mírně lišit.",
  learnTitle: "Zjistit více", learn: { guide: "Jak se zpracovává muránské sklo a jak poznat napodobeniny.", careTitle: "Péče o šperky", care: "Několik jednoduchých návyků pomůže zachovat barvu i lesk.", giftTitle: "Průvodce dárky", gift: "Odpovězte na několik otázek a najděte ten pravý šperk.", returns: "Na odstoupení od nákupu máte 14 dní.", about: "Kdo jsme a jak pracujeme.", contact: "Máte dotaz ke šperku nebo objednávce? Napište nám." },
};
const sv: LookPageCopy = {
  ...en,
  editorialIntro: "En look samlar ett halsband, ett armband och örhängen som valts för att färger och former ska passa ihop. Bär hela kombinationen eller låt ett smycke stå i centrum.", editorialDescription: "Tre smycken i glasets gemensamma färgskala, valda för att passa ihop. Varje smycke är fint även för sig.", editorialIncluded: "I den här looken", editorialPrice: "Hela looken",
  listingWhyTitle: "En look i harmoni", listingWhyIntro: "Varje kombination gör Muranoglas enkelt att bära, ge bort och samla på.",
  listingWhy: [{ title: "Färger som hör ihop", body: "Halsband, armband och örhängen matchas i färg och form. Tillsammans bildar de en genomtänkt helhet, men varje smycke fungerar också för sig." }, { title: "Glas värt en närmare titt", body: "Alla smycken är i Muranoglas. Små skillnader i färg och form är en del av materialets karaktär." }, { title: "Bättre pris som set", body: "Köp alla smycken i en look tillsammans så dras den visade rabatten automatiskt av i varukorgen. Ingen kod behövs." }],
  listingFaq: [{ id: "look-list-pieces", question: "Vad ingår i en look?", answer: "Varje look består av tre smycken som valts för att passa ihop. Öppna en look för att se exakt vad som ingår." }, { id: "look-list-discount", question: "Hur fungerar rabatten?", answer: "Rabatten gäller för hela setet. Lägg alla smycken i samma beställning så beräknas den automatiskt i varukorgen. Ingen kod behövs; rabatten varierar mellan olika looks." }, { id: "look-list-single", question: "Kan jag köpa smyckena var för sig?", answer: "Ja. Alla smycken går att köpa separat. Setrabatten gäller när du köper hela looken." }, { id: "look-list-mix", question: "Kan jag kombinera smycken från olika looks?", answer: "Ja. Välj ett halsband, ett armband och örhängen med Skapa din egen look, lägg alla tre i samma beställning och spara {composed} %." }],
  piecesTitle: "Smyckena var för sig", piecesIntro: "Alla smycken i den här looken är i Muranoglas. Bär dem tillsammans eller var för sig.", storyLabel: "Därför passar den", available: "Tillgänglig", viewPiece: "Visa smycket",
  whyTitle: "Därför välja den här looken", whyIntro: "Det här får du utöver själva glaset.",
  why: [{ title: "Muranoglas", body: "Alla smycken är i Muranoglas från ön där glas har bearbetats sedan 1291." }, { title: "Utvalda att bäras tillsammans", body: "Färger och former passar ihop, samtidigt som varje smycke fungerar på egen hand." }, { title: "Lägre pris för setet", body: "Hela setet ger {set} % rabatt och två smycken {pair} %. Rabatten dras av automatiskt i varukorgen." }, { title: "Redo att ge bort", body: "Varje smycke kommer i vår presentask." }, { title: "Skickas från Italien", body: "Din beställning skickas från Italien och du har 14 dagar från leveransen att ångra dig." }],
  someQ: "Kan jag köpa bara några delar?", someA: "Ja. Alla smycken säljs separat. Två smycken från samma look ger {pair} % rabatt och hela setet {set} %.", codeQ: "Behöver jag en rabattkod?", codeA: "Nej. Rabatten räknas ut automatiskt i varukorgen och tillämpas i kassan när smyckena ligger i samma beställning.", mixQ: "Kan jag kombinera smycken från olika looks?", mixA: "Ja. Skapa din egen look med ett halsband, ett armband och örhängen och spara {composed} % när du köper alla tre.", variesQ: "Kommer mitt smycke att se exakt ut som på bilden?", variesA: "Det kommer att likna bilden mycket, men är inte identiskt. Glasets färg, bubblor och form kan variera lite.",
  learnTitle: "Läs mer", learn: { guide: "Så bearbetas Muranoglas och så känner du igen imitationer.", careTitle: "Ta hand om smyckena", care: "Några enkla vanor hjälper till att bevara färg och lyster.", giftTitle: "Presentguide", gift: "Svara på några frågor och hitta rätt smycke.", returns: "Du har 14 dagar på dig att ångra köpet.", about: "Vilka vi är och hur vi arbetar.", contact: "Frågor om ett smycke eller en beställning? Skriv till oss." },
};
const ro: LookPageCopy = {
  ...en,
  editorialIntro: "Un look reunește un colier, o brățară și cercei aleși pentru armonia culorilor și formelor. Poartă întregul set sau lasă o singură bijuterie să iasă în evidență.", editorialDescription: "Trei bijuterii în nuanțe de sticlă complementare, alese să se potrivească împreună. Fiecare arată bine și separat.", editorialIncluded: "În acest look", editorialPrice: "Look-ul complet",
  listingWhyTitle: "Un look în armonie", listingWhyIntro: "Fiecare combinație face sticla de Murano ușor de purtat, de oferit și de colecționat.",
  listingWhy: [{ title: "Culori care se potrivesc", body: "Colierul, brățara și cerceii sunt asortați ca nuanțe și forme. Împreună alcătuiesc un ansamblu armonios, iar fiecare piesă se poartă frumos și singură." }, { title: "Sticlă care merită privită de aproape", body: "Fiecare bijuterie este din sticlă de Murano. Micile diferențe de culoare și formă fac parte din farmecul materialului." }, { title: "Un preț mai bun pentru set", body: "Cumpără toate piesele dintr-un look, iar reducerea afișată se aplică automat în coș. Nu ai nevoie de cod." }],
  listingFaq: [{ id: "look-list-pieces", question: "Ce conține un look?", answer: "Fiecare look reunește trei bijuterii alese să se completeze. Deschide pagina look-ului pentru a vedea exact ce include." }, { id: "look-list-discount", question: "Cum funcționează reducerea?", answer: "Reducerea afișată este pentru setul complet. Adaugă toate bijuteriile în aceeași comandă și reducerea se calculează automat în coș. Nu este necesar un cod; procentul poate varia." }, { id: "look-list-single", question: "Pot cumpăra bijuteriile separat?", answer: "Da. Fiecare bijuterie poate fi cumpărată separat. Reducerea pentru set se aplică la cumpărarea tuturor pieselor din look." }, { id: "look-list-mix", question: "Pot combina bijuterii din seturi diferite?", answer: "Da. Alege un colier, o brățară și cercei cu Creează-ți propriul look, adaugă-le în aceeași comandă și economisești {composed}%." }],
  piecesTitle: "Bijuteriile, pe rând", piecesIntro: "Fiecare piesă din acest look este din sticlă de Murano. Poartă-le împreună sau separat.", storyLabel: "De ce să-l alegi", available: "Disponibil", viewPiece: "Vezi bijuteria",
  whyTitle: "De ce să alegi acest look", whyIntro: "Ce primești în plus față de frumusețea sticlei.",
  why: [{ title: "Sticlă de Murano", body: "Fiecare bijuterie este din sticlă de Murano, insula unde sticla se lucrează din 1291." }, { title: "Alese să fie purtate împreună", body: "Culorile și formele se completează, iar fiecare bijuterie arată bine și separat." }, { title: "Preț mai bun pentru set", body: "Setul complet oferă o reducere de {set}%, iar două piese de {pair}%. Reducerea apare automat în coș." }, { title: "Gata de oferit", body: "Fiecare bijuterie ajunge în cutia noastră de cadou." }, { title: "Expediat din Italia", body: "Comanda pleacă din Italia, iar după livrare ai 14 zile să te răzgândești." }],
  someQ: "Pot cumpăra doar câteva piese?", someA: "Da. Fiecare piesă se cumpără separat. Două bijuterii din același look oferă {pair}% reducere, iar setul complet {set}%.", codeQ: "Am nevoie de un cod pentru reducere?", codeA: "Nu. Reducerea se calculează în coș și se aplică la plată dacă piesele sunt în aceeași comandă.", mixQ: "Pot combina piese din look-uri diferite?", mixA: "Da. Creează-ți propriul look cu un colier, o brățară și cercei și economisești {composed}% când le cumperi pe toate trei.", variesQ: "Bijuteria va arăta exact ca în fotografie?", variesA: "Va fi foarte asemănătoare, dar nu identică. Culoarea, bulele și forma sticlei pot varia puțin.",
  learnTitle: "Află mai multe", learn: { guide: "Cum se prelucrează sticla de Murano și cum recunoști imitațiile.", careTitle: "Îngrijirea bijuteriilor", care: "Câteva obiceiuri simple păstrează culoarea și strălucirea.", giftTitle: "Ghid de cadouri", gift: "Răspunde la câteva întrebări și găsește bijuteria potrivită.", returns: "Ai la dispoziție 14 zile pentru a te răzgândi.", about: "Cine suntem și cum lucrăm.", contact: "Ai o întrebare despre o bijuterie sau o comandă? Scrie-ne." },
};

export function getLookPageCopy(locale: Locale): LookPageCopy {
  return locale === "it"
    ? it
    : locale === "fr"
      ? fr
      : locale === "de"
        ? de
        : locale === "hi"
          ? hi
          : locale === "zh"
            ? zh
            : locale === "ru"
              ? ru
              : locale === "es"
                ? es
                : locale === "ar"
                  ? ar
                : locale === "ja"
                  ? ja
                  : locale === "nl"
                    ? nl
                    : locale === "pl"
                      ? pl
                      : locale === "cs"
                        ? cs
                        : locale === "sv"
                          ? sv
                          : locale === "ro"
                            ? ro
                  : en;
}

/**
 * Each look's own reason to choose it, keyed by the look's name without the
 * collection suffix (" · Ottobre 2026"). "Handmade in Murano" is said only of
 * the October 2026 looks, whose provenance is verified; discounts are left to
 * the price badge beside the text.
 */
const LOOK_DESCRIPTIONS: Record<
  string,
  { en: string; it: string; fr: string; de: string; es: string; ar: string; hi: string; ja: string; nl: string; pl: string; cs: string; sv: string; ro: string; zh: string; ru: string }
> = {
  "rosso rubino": {
    en: "A red that reads from across the room, with gold veining that catches candlelight. The set for an anniversary, a dinner out or the December parties, and each piece holds its own when worn alone.",
    it: "Un rosso che si nota da lontano, con venature d'oro che catturano la luce delle candele. Il set per un anniversario, una cena fuori o le feste di dicembre, e ogni pezzo sta benissimo anche da solo.",
    fr: "Un rouge qui attire le regard de loin, avec des veinures dorées qui captent la lumière des bougies. Une parure pour un anniversaire, un dîner ou les fêtes de fin d’année ; chaque pièce se porte aussi très bien seule.",
    de: "Ein Rotton, der schon von Weitem auffällt, mit goldenen Linien, die das Kerzenlicht einfangen. Ein Set für einen Jahrestag, ein Abendessen oder die Festtage – jedes Stück wirkt auch allein.",
    hi: "दूर से नज़र आने वाला लाल रंग और सोने की महीन लकीरें, जो मोमबत्ती की रोशनी पकड़ती हैं। सालगिरह, साथ में खाने या त्योहारों के लिए बना सेट—हर आभूषण अकेले भी खूबसूरत लगता है।",
    zh: "醒目的红色搭配金色纹理，在烛光下格外动人。适合纪念日、晚餐约会或年末节庆；每件单品单独佩戴也很出彩。",
    ru: "Яркий красный оттенок и золотые прожилки, мерцающие при свете свечей. Комплект для годовщины, ужина вне дома или декабрьских праздников; каждое украшение хорошо смотрится и отдельно.",
    ar: "أحمر يلفت الأنظار من بعيد، تتخلله عروق ذهبية تلتقط ضوء الشموع. طقم يناسب ذكرى سنوية أو عشاءً في الخارج أو احتفالات ديسمبر، وتبرز كل قطعة بمفردها أيضًا.",
    ja: "遠くからも目を引く赤に、キャンドルの光を受けて輝くゴールドの筋。記念日やディナー、冬のパーティーに。ひとつずつ身に着けても映えます。",
    nl: "Een rood dat meteen opvalt, met gouden aders die het kaarslicht vangen. Mooi voor een jubileum, diner of feest, en elk sieraad draagt ook solo prachtig.",
    pl: "Czerwień widoczna z daleka i złote żyłki, które łapią blask świec. Zestaw na rocznicę, kolację lub świąteczne spotkanie — każda ozdoba pięknie wygląda także solo.",
    cs: "Výrazná červená se zlatými žilkami, které zachycují světlo svíček. Skvělá volba na výročí, večeři i sváteční setkání; každý šperk vynikne také samostatně.",
    sv: "Ett rött som syns på håll, med gyllene ådror som fångar ljuset från levande ljus. Passar till jubileum, middag och fest; varje smycke är fint även för sig.",
    ro: "Un roșu care se remarcă, cu vinișoare aurii ce prind lumina lumânărilor. Potrivit pentru aniversări, cine și sărbători; fiecare piesă se poartă frumos și separat.",
    es: "Un rojo que se ve desde lejos, con vetas doradas que captan la luz de las velas. Un conjunto para un aniversario, una cena o las fiestas de diciembre; cada pieza también destaca por separado.",
  },
  "rosa e salvia": {
    en: "Quiet enough for the office, soft enough for every day: pink and sage that sit kindly beside linen, denim and grey wool. An easy first set, and a gift that is hard to get wrong.",
    it: "Discreto in ufficio, morbido ogni giorno: rosa e salvia che stanno bene con lino, denim e lana grigia. Un primo set facile da portare, e un regalo difficile da sbagliare.",
    fr: "Discret au bureau, doux au quotidien : le rose et le vert sauge s’accordent au lin, au denim et à la laine grise. Une première parure facile à porter et un cadeau qui fait mouche.",
    de: "Zurückhaltend im Büro und sanft im Alltag: Rosa und Salbeigrün passen zu Leinen, Denim und grauer Wolle. Ein unkompliziertes erstes Set und ein Geschenk, mit dem Sie kaum falschliegen.",
    hi: "ऑफ़िस के लिए सादा, रोज़ पहनने के लिए नर्म रंग: गुलाबी और सेज हरा लिनन, डेनिम और ग्रे ऊन के साथ अच्छे लगते हैं। पहनने में आसान पहला सेट और एक प्यारा उपहार।",
    zh: "适合办公室的低调配色，也适合日常佩戴：粉色与鼠尾草绿搭配亚麻、牛仔布和灰色羊毛都很协调。作为第一套搭配很容易上手，也是贴心的礼物。",
    ru: "Сдержанная палитра для офиса и мягкие оттенки на каждый день: розовый и шалфейный сочетаются с льном, денимом и серой шерстью. Удобный первый комплект и удачный подарок.",
    ar: "هادئ بما يكفي للمكتب، وناعم بما يناسب كل يوم: الوردي والأخضر المريمي ينسجمان مع الكتان والدنيم والصوف الرمادي. طقم أول سهل الارتداء وهدية يصعب أن تخطئي في اختيارها.",
    ja: "オフィスにもなじむ落ち着きと、毎日に寄り添う柔らかさ。ピンクとセージグリーンはリネンやデニム、グレーのウールと好相性です。初めてのセットにも、贈り物にもおすすめです。",
    nl: "Rustig genoeg voor kantoor en zacht genoeg voor elke dag: roze en saliegroen passen bij linnen, denim en grijze wol. Een fijne eerste set en een mooi cadeau.",
    pl: "Róż i szałwia są na tyle stonowane do biura i delikatne na co dzień, że pasują do lnu, dżinsu i szarej wełny. Dobry pierwszy zestaw i trafiony prezent.",
    cs: "Jemná růžová a šalvějová se hodí do kanceláře i na každý den. Krásně ladí se lnem, džínovinou i šedou vlnou a jsou také milým dárkem.",
    sv: "Mjuk rosa och salviagrönt passar både på kontoret och till vardags. Färgerna går fint ihop med linne, denim och grå ull och blir en uppskattad present.",
    ro: "Rozul delicat și verdele salvie se potrivesc la birou și zi de zi. Arată bine cu in, denim și lână gri și sunt o idee frumoasă de cadou.",
    es: "Discreto para la oficina y suave para cada día: el rosa y el verde salvia combinan con lino, denim y lana gris. Un primer conjunto fácil de llevar y un regalo que siempre encaja.",
  },
  "medaglioni rosa e sabbia": {
    en: "Rose and sand, the colours of a Venetian wall at sunset. Warm neutrals that go with camel, cream and denim, handmade in Murano and made to be worn daily rather than saved for best.",
    it: "Rosa e sabbia, i colori di un muro veneziano al tramonto. Neutri caldi che si abbinano a cammello, panna e denim, fatti a mano a Murano e pensati per ogni giorno, non per il cassetto.",
    fr: "Rose et sable, les couleurs d’un mur vénitien au coucher du soleil. Des tons chauds qui s’accordent au camel, à l’écru et au denim, à porter tous les jours plutôt qu’à réserver aux grandes occasions.",
    de: "Rosa und Sand, die Farben einer venezianischen Mauer im Abendlicht. Warme Naturtöne zu Camel, Creme und Denim – für jeden Tag, nicht nur für besondere Anlässe.",
    hi: "गुलाबी और रेतिया रंग—शाम की रोशनी में वेनिस की दीवार जैसे। कैमेल, क्रीम और डेनिम के साथ जँचने वाले गर्म रंग, जिन्हें रोज़ पहना जा सकता है।",
    zh: "玫瑰粉与沙色，如同夕阳下的威尼斯墙面。温暖的中性色调，适合搭配驼色、奶油色和牛仔布，日常佩戴也很合适。",
    ru: "Розовый и песочный — как венецианская стена в лучах заката. Тёплые нейтральные оттенки сочетаются с цветом верблюжьей шерсти, кремовым и денимом; носите их каждый день.",
    ar: "الوردي والرملي، كلون جدار في البندقية عند الغروب. درجات دافئة ومحايدة تنسجم مع ألوان الجملي والكريمي والدنيم، صُنعت يدويًا في مورانو لتُرتدى كل يوم لا للمناسبات وحدها.",
    ja: "夕暮れのヴェネツィアの壁を思わせるローズとサンドの色合い。キャメルやクリーム、デニムに合う暖かなニュートラルカラーで、ムラーノで手作りされ、特別な日だけでなく毎日楽しめます。",
    nl: "Roze en zandtinten doen denken aan de Venetiaanse gevels in de avondzon. Deze warme neutrale kleuren passen bij camel, crème en denim, voor bijzondere dagen en alledaags gebruik.",
    pl: "Róż i piaskowe odcienie przywodzą na myśl weneckie fasady w wieczornym słońcu. Pasują do karmelu, kremu i dżinsu — na wyjątkowe okazje i na co dzień.",
    cs: "Růžové a pískové tóny připomínají benátské fasády zalité večerním sluncem. Hodí se ke karamelové, krémové i džínové barvě.",
    sv: "Rosa och sandfärgade toner för tankarna till venetianska fasader i kvällssol. De passar till karamell, krämvitt och denim.",
    ro: "Nuanțele de roz și nisip amintesc de fațadele venețiene în lumina serii. Se potrivesc cu tonuri caramel, crem și denim.",
    es: "Rosa y arena, los tonos de una pared veneciana al atardecer. Colores neutros y cálidos que combinan con camel, crema y denim; para llevar a diario, no solo en ocasiones especiales.",
  },
  "medaglioni turchesi": {
    en: "The lagoon in summer: turquoise and azure that light up a white shirt or sun-warmed skin. A holiday set, handmade in Murano, that keeps the feeling going once you are home.",
    it: "La laguna d'estate: turchese e azzurro che illuminano una camicia bianca o la pelle abbronzata. Un set da vacanza, fatto a mano a Murano, che porta quella sensazione anche a casa.",
    fr: "La lagune en été : le turquoise et l’azur illuminent une chemise blanche ou une peau hâlée. Une parure aux airs de vacances, qui prolonge l’été une fois rentré.",
    de: "Die Lagune im Sommer: Türkis und Azurblau bringen ein weißes Hemd oder sonnengebräunte Haut zum Leuchten. Ein Set mit Urlaubsgefühl, das Sie mit nach Hause nehmen.",
    hi: "गर्मियों का लैगून: फ़िरोज़ी और आसमानी नीला, सफ़ेद कमीज़ या धूप में दमकती त्वचा के साथ खिल उठते हैं। छुट्टियों की याद साथ लाने वाला सेट।",
    zh: "夏日泻湖般的色彩：绿松石色与湛蓝色，为白衬衫或晒暖的肌肤增添光彩。这套首饰带着度假气息，也能把这份感觉带回日常。",
    ru: "Летняя лагуна: бирюзовый и лазурный оттенки оживят белую рубашку и загорелую кожу. Комплект с настроением отпуска, которое останется с вами и дома.",
    ar: "ألوان البحيرة في الصيف: الفيروزي والأزرق اللازوردي يضفيان إشراقة على قميص أبيض أو بشرة اكتسبت سمرة الشمس. طقم صيفي صُنع يدويًا في مورانو ليبقي أجواء العطلة معك بعد العودة.",
    ja: "夏のラグーンを思わせるターコイズとアズール。白いシャツや日差しを浴びた肌を明るく彩ります。ムラーノで手作りされた、旅の余韻を日常にも連れて帰れるセットです。",
    nl: "Turkoois en azuurblauw roepen de zomerse lagune op. Ze geven een wit overhemd of een zongebruinde huid extra kleur; een set die een vleugje vakantie aan elke dag toevoegt.",
    pl: "Turkus i błękit przywołują letnią lagunę. Ożywią białą koszulę i opaloną skórę, dodając codziennym stylizacjom wakacyjnego akcentu.",
    cs: "Tyrkysová a modrá připomínají letní lagunu. Rozjasní bílou košili i opálenou pokožku a dodají každodennímu outfitu nádech dovolené.",
    sv: "Turkos och blått för tankarna till en sommarlagun. De lyser upp en vit skjorta och solbränd hud och ger vardagsstilen en semesterkänsla.",
    ro: "Turcoazul și albastrul evocă o lagună de vară. Înviorază o cămașă albă și pielea bronzată, adăugând ținutelor de zi cu zi un aer de vacanță.",
    es: "La laguna en verano: el turquesa y el azul iluminan una camisa blanca o la piel bronceada. Un conjunto de aire vacacional que te acompaña también al volver a casa.",
  },
  "arabeschi sabbia e nero": {
    en: "Black arabesques on sand, worked into the glass by hand on Murano. Graphic enough for black and white, warm enough for autumn: for someone who likes jewellery with a signature.",
    it: "Arabeschi neri su fondo sabbia, lavorati a mano nel vetro a Murano. Abbastanza grafico per il bianco e nero, abbastanza caldo per l'autunno: per chi ama un gioiello con carattere.",
    fr: "Des arabesques noires sur fond sable, dessinées dans le verre. Graphique avec du noir et blanc, chaleureux en automne : pour celles et ceux qui aiment les bijoux de caractère.",
    de: "Schwarze Arabesken auf sandfarbenem Grund, ins Glas gearbeitet. Grafisch zu Schwarz und Weiß, warm genug für den Herbst – für alle, die Schmuck mit Charakter mögen.",
    hi: "रेतिया रंग की पृष्ठभूमि पर काँच में बनी काली बेल-बूटियाँ। काले-सफ़ेद कपड़ों के साथ सधा हुआ और पतझड़ के लिए गर्माहट भरा—खास अंदाज़ पसंद करने वालों के लिए।",
    zh: "沙色底上的黑色卷纹，融入玻璃之中。搭配黑白服饰显得利落，秋日佩戴又添温暖，适合喜欢有个性首饰的人。",
    ru: "Чёрные арабески на песочном фоне. Графичный акцент к чёрно-белому образу и тёплая деталь осенью — для тех, кто любит украшения с характером.",
    ar: "زخارف سوداء على خلفية رملية، نُقشت يدويًا في زجاج مورانو. رسومية بما يكفي للأبيض والأسود، ودافئة للخريف؛ لمن تحب المجوهرات ذات الطابع المميز.",
    ja: "砂色のガラスに黒いアラベスク模様をムラーノで手作業で描きました。モノトーンにはシャープに、秋の装いには温かみを添えます。個性のあるジュエリーをお探しの方に。",
    nl: "Zandkleurig glas met zwarte arabesken. Een krachtig accent bij zwart-wit en een warme toets bij herfstkleuren, voor wie van uitgesproken sieraden houdt.",
    pl: "Piaskowe szkło z czarnymi ornamentami. Wyrazisty akcent do czerni i bieli oraz ciepły dodatek do jesiennych kolorów — dla miłośników charakternej biżuterii.",
    cs: "Pískové sklo s černými ornamenty vytvoří výrazný kontrast k černé a bílé a teplý akcent k podzimním barvám.",
    sv: "Sandfärgat glas med svarta ornament ger en tydlig kontrast till svart och vitt och en varm ton till höstens färger.",
    ro: "Sticlă în nuanța nisipului cu ornamente negre: un accent puternic lângă alb și negru și o notă caldă pentru culorile toamnei.",
    es: "Arabescos negros sobre fondo arena, trabajados a mano en el vidrio de Murano. Gráfico con blanco y negro y cálido para el otoño: para quien busca una joya con personalidad.",
  },
  "arabeschi turchese e corallo": {
    en: "Coral and turquoise swirls, handmade in Murano, so no two beads are quite alike. A statement set for someone who loves colour, and a conversation starter every time it is worn.",
    it: "Volute corallo e turchese, fatte a mano a Murano, così nessuna perla è uguale all'altra. Un set che si fa notare, per chi ama il colore, e che fa conversazione ogni volta che si indossa.",
    fr: "Des volutes corail et turquoise. Une parure qui affirme son goût pour la couleur et ne passe pas inaperçue.",
    de: "Korallfarbene und türkise Wirbel. Ein Set für alle, die Farbe lieben und gern auffallen.",
    hi: "मूंगे और फ़िरोज़ी रंग की लहरें। रंग पसंद करने वालों के लिए ऐसा सेट जो सबका ध्यान खींचे।",
    zh: "珊瑚色与绿松石色的旋纹。为喜爱色彩的人打造，一戴上便引人注目。",
    ru: "Завитки кораллового и бирюзового оттенков. Яркий комплект для тех, кто любит цвет и хочет привлечь внимание.",
    ar: "تموجات مرجانية وفيروزية صُنعت يدويًا في مورانو، لذلك لا تتطابق خرزتان تمامًا. طقم لافت لمن تحب الألوان ويصبح حديثًا كلما ارتدته.",
    ja: "コーラルとターコイズの渦模様をムラーノで手作りしました。ビーズは一つひとつ表情が異なります。色を楽しみたい方におすすめの、目を引くセットです。",
    nl: "Koraal en turkoois in wervelende patronen. Elke kraal heeft een eigen uitstraling; een opvallende set voor wie graag kleur draagt.",
    pl: "Koral i turkus układają się w wirujące wzory. Każdy koralik ma własny charakter; to wyrazisty zestaw dla osób, które lubią kolor.",
    cs: "Korálové a tyrkysové víry, v nichž má každý korálek vlastní charakter. Výrazná souprava pro ty, kdo mají rádi barvy.",
    sv: "Korall och turkos i virvlande mönster där varje pärla har sin egen karaktär. Ett uttrycksfullt set för den som tycker om färg.",
    ro: "Modele ondulate în coral și turcoaz, fiecare mărgea având personalitatea ei. Un set expresiv pentru iubitorii de culoare.",
    es: "Espirales coral y turquesa, trabajadas a mano en Murano; por eso no hay dos cuentas exactamente iguales. Un conjunto llamativo para quien ama el color y no pasa desapercibido.",
  },
  "sfere notte": {
    en: "Lustrous black glass in simple round shapes: the little black dress of jewellery. It goes from a work blazer to evening wear, and makes an easy gift for someone with a minimal style. Handmade in Murano.",
    it: "Vetro nero lucente in forme rotonde e semplici: il tubino nero dei gioielli. Passa dalla giacca da lavoro all'abito da sera, ed è un regalo facile per chi ha uno stile essenziale. Fatto a mano a Murano.",
    fr: "Du verre noir brillant aux formes rondes et épurées : la petite robe noire du bijou. Cette parure accompagne aussi bien une veste de travail qu’une tenue de soirée, et plaira aux amateurs de style minimaliste.",
    de: "Glänzendes schwarzes Glas in schlichten runden Formen: das kleine Schwarze unter den Schmuckstücken. Passt zum Blazer im Büro ebenso wie zum Abendlook und gefällt allen, die es gern minimalistisch mögen.",
    hi: "सादे गोल आकार में चमकता काला काँच—आभूषणों की छोटी काली पोशाक। ऑफ़िस के ब्लेज़र से लेकर शाम के कपड़ों तक, सादा अंदाज़ पसंद करने वालों के लिए।",
    zh: "简洁圆润的造型，搭配光泽黑玻璃，宛如首饰中的小黑裙。从上班西装到晚间装扮都能驾驭，适合偏爱简约风格的人。",
    ru: "Блестящее чёрное стекло простых округлых форм — маленькое чёрное платье в мире украшений. Подойдёт и к деловому жакету, и к вечернему образу, а также станет подарком для поклонников минимализма.",
    ar: "زجاج أسود لامع بأشكال مستديرة وبسيطة: الفستان الأسود الصغير في عالم المجوهرات. يناسب سترة العمل والإطلالة المسائية، ويصلح هدية سهلة لمن تفضل الأسلوب البسيط. صُنع يدويًا في مورانو.",
    ja: "シンプルな丸いフォルムに、艶やかな黒いガラス。ジュエリーの「リトルブラックドレス」のように、仕事のジャケットにも夜のお出かけにも合います。ミニマルなスタイルがお好きな方への贈り物にも。ムラーノで手作りされています。",
    nl: "Glanzend zwart glas in een eenvoudige ronde vorm. Het kleine zwarte jurkje onder de sieraden: passend bij een colbert op het werk en bij een avondje uit. Ook mooi voor liefhebbers van een minimalistische stijl.",
    pl: "Lśniące czarne szkło w prostej, okrągłej formie. Mała czarna wśród ozdób: pasuje do marynarki w pracy i na wieczorne wyjście. Dla miłośników minimalizmu.",
    cs: "Lesklé černé sklo v jednoduchých kulatých tvarech. Nadčasový doplněk, který se hodí k pracovnímu saku i na večer.",
    sv: "Glänsande svart glas i enkla, runda former. Ett tidlöst smycke som passar till kavajen på jobbet och till kvällen.",
    ro: "Sticlă neagră lucioasă în forme rotunde și simple. Un accesoriu atemporal, potrivit atât la sacoul de birou, cât și seara.",
    es: "Vidrio negro brillante en formas redondas y sencillas: el pequeño vestido negro de la joyería. Va del blazer de trabajo a un look de noche y es un regalo fácil para quien prefiere un estilo minimalista. Hecho a mano en Murano.",
  },
  "sfere rosso": {
    en: "Glossy red spheres with gold-tone clasps and hooks: a confident touch of colour for a festive table, Valentine's Day, or simply a grey Monday. Light, easy to wear, handmade in Murano.",
    it: "Sfere rosse lucide con chiusure e ganci dorati: un tocco di colore deciso per una tavola di festa, San Valentino o semplicemente un lunedì grigio. Leggeri, facili da portare, fatti a mano a Murano.",
    fr: "Des sphères rouge brillant et des fermoirs dorés : une touche de couleur pour une soirée de fête, la Saint-Valentin ou un lundi gris. Légère et facile à porter.",
    de: "Glänzend rote Kugeln mit goldfarbenen Verschlüssen: ein kräftiger Farbakzent für eine Feier, den Valentinstag oder einen grauen Montag. Leicht und angenehm zu tragen.",
    hi: "चमकती लाल गोलियाँ और सुनहरे रंग के क्लैस्प—किसी जश्न, वैलेंटाइन डे या उदास सोमवार के लिए रंग का एक चटख स्पर्श। हल्के और पहनने में आसान।",
    zh: "亮泽红色圆珠搭配金色调扣件，为节日聚会、情人节或平淡的周一增添一抹鲜明色彩。轻巧易戴。",
    ru: "Глянцевые красные сферы с застёжками и крючками золотистого оттенка — яркий акцент для праздника, Дня святого Валентина или просто серого понедельника. Лёгкие и удобные.",
    ar: "كرات حمراء لامعة مع مشابك وخطافات بلون ذهبي: لمسة لون واثقة لمائدة احتفالية أو عيد الحب أو حتى يوم اثنين رمادي. خفيفة وسهلة الارتداء، وصُنعت يدويًا في مورانو.",
    ja: "艶やかな赤い球体に、ゴールドカラーの留め具とフック。お祝いの席やバレンタイン、何気ない月曜日にも色を添えます。軽くて着けやすく、ムラーノで手作りされています。",
    nl: "Glanzende rode kralen met goudkleurige sluitingen en haakjes. Een kleurrijk accent voor een feest, Valentijnsdag of een gewone maandag. Licht en prettig om te dragen.",
    pl: "Lśniące czerwone koraliki i zapięcia w złotym kolorze. Barwny akcent na przyjęcie, walentynki albo zwykły poniedziałek. Lekki i wygodny w noszeniu.",
    cs: "Lesklé červené korálky se zlatými sponami dodají barvu oslavě i obyčejnému pondělí. Jsou lehké a pohodlné na nošení.",
    sv: "Glansiga röda pärlor med guldfärgade fästen sätter färg på både fest och en vanlig måndag. De är lätta och bekväma att bära.",
    ro: "Mărgele roșii lucioase cu închizători aurii adaugă culoare unei petreceri sau unei zile obișnuite. Sunt ușoare și comode.",
    es: "Esferas rojas brillantes con cierres y ganchos dorados: un toque de color para una celebración, San Valentín o un lunes gris. Ligeras y fáciles de llevar; hechas a mano en Murano.",
  },
  "perle salvia": {
    en: "Sage green in different sizes, like sea glass gathered on a Venetian shore. A calm, natural colour for linen and knitwear, and a thoughtful gift for someone who prefers understatement. Handmade in Murano.",
    it: "Verde salvia in misure diverse, come vetro di mare raccolto su una riva veneziana. Un colore calmo e naturale per lino e maglieria, e un regalo pensato per chi ama la discrezione. Fatto a mano a Murano.",
    fr: "Des perles vert sauge de tailles variées, comme des morceaux de verre polis par la mer sur une rive vénitienne. Une teinte douce et naturelle, idéale avec du lin ou de la maille.",
    de: "Salbeigrüne Perlen in verschiedenen Größen, wie vom Meer geschliffenes Glas am venezianischen Ufer. Ein ruhiger, natürlicher Farbton zu Leinen und Strick.",
    hi: "अलग-अलग आकार के सेज हरे मनके, जैसे वेनिस के किनारे समुद्र से घिसकर चिकने हुए काँच के टुकड़े। लिनन और बुने हुए कपड़ों के साथ जँचने वाला शांत, प्राकृतिक रंग।",
    zh: "不同尺寸的鼠尾草绿珠子，如同威尼斯岸边被海水磨圆的玻璃。柔和自然的色调，适合搭配亚麻和针织衣物。",
    ru: "Шалфейно-зелёные бусины разных размеров напоминают морское стекло на венецианском берегу. Спокойный природный оттенок хорошо сочетается с льном и трикотажем и подойдёт тому, кто ценит сдержанность.",
    ar: "خرز أخضر مريمي بأحجام مختلفة، يشبه زجاج البحر الذي جمعته أمواج البندقية على الشاطئ. لون هادئ وطبيعي ينسجم مع الكتان والملابس المحاكة، وهدية مدروسة لمن تفضل البساطة. صُنع يدويًا في مورانو.",
    ja: "ヴェネツィアの海岸で拾ったシーグラスのような、大小さまざまなセージグリーン。リネンやニットに合う穏やかな自然の色で、控えめな装いがお好きな方への贈り物にも。ムラーノで手作りされています。",
    nl: "Saliegroene kralen in verschillende formaten, als zeeglas aan de Venetiaanse kust. Een rustige natuurtint bij linnen en breiwerk, en een mooi cadeau voor wie van subtiele sieraden houdt.",
    pl: "Koraliki w odcieniu szałwii o różnych rozmiarach przypominają szkło morskie z weneckiego wybrzeża. Spokojny, naturalny kolor do lnu i dzianin oraz piękny prezent dla miłośników subtelnej biżuterii.",
    cs: "Šalvějově zelené korálky různých velikostí připomínají mořské sklo na benátském pobřeží. Klidná přírodní barva k lnu i pleteninám.",
    sv: "Salviagröna pärlor i olika storlekar påminner om havsglas från den venetianska kusten. En lugn naturfärg till linne och stickat.",
    ro: "Mărgele verde salvie, de dimensiuni diferite, amintesc de sticla șlefuită de mare pe țărmul venețian. O nuanță naturală, liniștită, pentru in și tricotaje.",
    es: "Verde salvia en distintos tamaños, como el vidrio marino recogido en la costa veneciana. Un tono natural y sereno para combinar con lino y punto, y un regalo pensado para quien prefiere la discreción. Hecho a mano en Murano.",
  },
  "perle rosa": {
    en: "Rose pink with a soft, pearly shine: romantic without being sweet. Lovely for a wedding guest or a bridesmaid, and gentle enough to wear every day after. Handmade in Murano.",
    it: "Rosa con una luce morbida e perlata: romantico senza essere stucchevole. Perfetto per un'invitata a un matrimonio o una damigella, e delicato abbastanza da portarlo ogni giorno, dopo. Fatto a mano a Murano.",
    fr: "Un rose doux aux reflets nacrés, romantique sans être mièvre. À porter pour un mariage comme au quotidien, bien après la cérémonie.",
    de: "Zartes Rosa mit perlmuttartigem Schimmer: romantisch, ohne kitschig zu wirken. Für Hochzeitsgäste und Brautjungfern – und auch im Alltag nach der Feier.",
    hi: "मोती-सी हल्की चमक वाला गुलाबी रंग—रोमांटिक, पर ज़रूरत से ज़्यादा मीठा नहीं। शादी में पहनने के बाद रोज़मर्रा में भी जँचेगा।",
    zh: "柔和的玫瑰粉带着珍珠般的光泽，浪漫却不甜腻。适合婚礼佩戴，庆典过后也能融入日常。",
    ru: "Нежный розовый с мягким перламутровым блеском: романтичный, но не приторный. Подойдёт гостье свадьбы или подружке невесты, а после торжества — и на каждый день.",
    ar: "وردي بلمعة لؤلؤية ناعمة: رومانسي من دون مبالغة. يناسب ضيفة حفل زفاف أو وصيفة العروس، ويمكن ارتداؤه كل يوم بعد المناسبة. صُنع يدويًا في مورانو.",
    ja: "柔らかなパールの輝きをまとったローズピンク。甘くなりすぎないロマンティックな色合いです。結婚式のお呼ばれやブライズメイドに、その後は毎日の装いにも。ムラーノで手作りされています。",
    nl: "Zacht roze met een parelmoeren glans: romantisch zonder zoet te worden. Mooi voor een bruiloft of als bruidsmeisje, en daarna ook bij alledaagse outfits.",
    pl: "Delikatny róż z perłowym połyskiem: romantyczny, ale nie przesłodzony. Piękny na ślub i dla druhny, a później także do codziennych stylizacji.",
    cs: "Jemná růžová s perleťovým leskem působí romanticky, ale ne přeslazeně. Hodí se na svatbu i pro každodenní nošení.",
    sv: "Mjuk rosa med pärlemorskimrande glans: romantisk utan att bli söt. Fin till bröllop och lätt att bära även till vardags.",
    ro: "Roz delicat cu luciu sidefat: romantic, fără să fie prea dulce. Frumos la o nuntă și ușor de purtat apoi zi de zi.",
    es: "Rosa con un brillo nacarado y suave: romántico sin resultar empalagoso. Ideal para una invitada de boda o una dama de honor, y también para llevar a diario después. Hecho a mano en Murano.",
  },
};

export function getLookEditorialDescription(name: string, locale: Locale): string {
  // "Perle Rosa · Ottobre 2026" → "perle rosa"
  const key = name.split("·")[0].trim().toLowerCase();
  const description = LOOK_DESCRIPTIONS[key];
  return (
    description?.[
      locale === "it"
        ? "it"
        : locale === "fr"
          ? "fr"
          : locale === "de"
            ? "de"
            : locale === "hi"
              ? "hi"
              : locale === "zh"
                ? "zh"
                : locale === "ru"
                  ? "ru"
                  : locale === "es"
                    ? "es"
                    : locale === "nl"
                      ? "nl"
                      : locale === "pl"
                        ? "pl"
                        : locale === "cs"
                          ? "cs"
                          : locale === "sv"
                            ? "sv"
                            : locale === "ro"
                              ? "ro"
                    : "en"
    ] ??
    getLookPageCopy(locale).editorialDescription
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
