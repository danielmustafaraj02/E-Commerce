// Long-form content for /personalised-gift-card (below the designer), for the
// digital card emailed once the order is paid: why a
// few words matter, who the card is for with ideas of what to write,
// occasions, how it works, tips and the FAQ. Kept apart from
// lib/i18n/dictionaries.ts like lib/murano-guide-content.ts, since it is
// page copy rather than UI labels. `{price}` is the card's price.
import type { Locale } from "./i18n/locale";

export type GiftCardPageContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lede: string;
  whyTitle: string;
  whyParagraphs: string[];
  lovedTitle: string;
  lovedPoints: { title: string; body: string }[];
  forWhomTitle: string;
  forWhomIntro: string;
  forWhom: { who: string; body: string; idea: string }[];
  ideaLabel: string;
  occasionsTitle: string;
  occasions: string[];
  howTitle: string;
  howSteps: { title: string; body: string }[];
  tipsTitle: string;
  tips: string[];
  faqTitle: string;
  faq: { question: string; answer: string }[];
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  shopLink: string;
};

const en: GiftCardPageContent = {
  metaTitle: "Personalised Gift Card with Your Message",
  metaDescription:
    "Add a personalised digital gift card to your Murano glass jewelry order for {price}: your message, your typeface and motifs, emailed once the order is paid.",
  h1: "Personalised Gift Card",
  lede: "Your words on a card we email to them as soon as your order is paid. Choose one of our messages or write your own, pick a typeface, add up to three little motifs and choose the colour of the back, all for {price}, added to your order.",
  whyTitle: "Why a few words make the gift",
  whyParagraphs: [
    "A piece of Murano glass jewelry is shaped by hand, bead by bead, from glass made on an island a few minutes by boat from Venice. It is beautiful on its own. But what turns a beautiful thing into a gift someone remembers is knowing that you chose it for them, and why.",
    "That is what the card is for. It reaches them by email, often before the parcel does: your words, in the typeface you picked, with their name at the top. The jewelry says Venice; the card says you.",
    "And long after the wrapping is gone, the card is still there: one tap on the link in their email opens it again, front and back, whenever they want to read it.",
  ],
  lovedTitle: "Why people love receiving one",
  lovedPoints: [
    {
      title: "It makes the moment personal",
      body: "A parcel becomes a letter. Their name, your name and a few chosen words turn an order from a shop into a gift from you, even when it is delivered straight to their door.",
    },
    {
      title: "It is something to keep",
      body: "Jewelry gets worn; cards get kept. Many of us still have a card from someone we love tucked away somewhere, long after the occasion has passed, because words are what we hold on to.",
    },
    {
      title: "It travels when you can't",
      body: "Far apart for a birthday or an anniversary? Send the jewelry directly to them. The card lands in their inbox as soon as the order is paid, so your message reaches them even if you can't.",
    },
    {
      title: "It is made only once",
      body: "Every card is made for a single order, with your message, your typeface, your motifs and your choice of back. No two are the same.",
    },
  ],
  forWhomTitle: "Who it's for, and what you might write",
  forWhomIntro:
    "A few ideas to start from. Choose one of our messages, or borrow a line below and make it your own.",
  forWhom: [
    {
      who: "For your girlfriend",
      body: "A Murano necklace in her favourite colour, and a card that says what you don't always say out loud. Add a heart, choose Venetian red for the back, and let a romantic script do some of the talking.",
      idea: "Every day with you feels a little like Venice.",
    },
    {
      who: "For your wife or partner",
      body: "For an anniversary, or for no reason at all. After years together, a few honest words can mean more than anything else in the box.",
      idea: "Ten years, and you still make everything beautiful.",
    },
    {
      who: "For your mum",
      body: "For Mother's Day or her birthday: something handmade, from someone she raised. Mums keep cards, so write the one she will want to keep.",
      idea: "Thank you for everything you never asked to be thanked for.",
    },
    {
      who: "For your best friend",
      body: "Matching bracelets, an inside joke, a thank-you for always picking up the phone. Friendship is easy to take for granted; a card says you don't.",
      idea: "For all the years, and all the ones still to come.",
    },
    {
      who: "For your sister",
      body: "The first friend you ever had. Earrings in her colour and a line only she will understand.",
      idea: "Same roots, different colours. Love you always.",
    },
    {
      who: "For your grandmother",
      body: "She has taught you more than she knows. A classic serif, a pearl on the front and words she can read again whenever she likes.",
      idea: "You are where all our best stories begin.",
    },
  ],
  ideaLabel: "Idea",
  occasionsTitle: "For every occasion",
  occasions: [
    "Birthdays",
    "Anniversaries",
    "Valentine's Day",
    "Mother's Day",
    "Christmas",
    "Graduations",
    "Weddings and engagements",
    "A thank-you",
    "Just because",
  ],
  howTitle: "How it works",
  howSteps: [
    {
      title: "Design it",
      body: "Add their name and yours, their email, choose a message or write your own, pick one of five typefaces, add up to three motifs and choose the colour of the back. The preview shows exactly what they will see.",
    },
    {
      title: "Add it to your order",
      body: "The card goes into your cart for {price}, alongside the jewelry you choose. You can edit it from the cart until you pay.",
    },
    {
      title: "We email it",
      body: "As soon as your order is paid, we email the card to the address you entered, with a link that opens it in full.",
    },
    {
      title: "They open it",
      body: "They read your words on their phone or computer, turn the card over, and can open it again whenever they like. The jewelry follows by post.",
    },
  ],
  tipsTitle: "A few tips for your message",
  tips: [
    "Keep it short. One or two sentences read best on the card, and often say more than a paragraph.",
    "Be specific. A shared place, a nickname or a memory makes a line unmistakably yours.",
    "Say why you chose it. \"Because blue is your colour\" makes the gift make sense.",
    "Read it aloud once. If it sounds like you, it's right.",
  ],
  faqTitle: "Questions about the gift card",
  faq: [
    {
      question: "How much does the personalised gift card cost?",
      answer: "{price}, added once to your order. That includes the digital card, your message, your typeface, up to three motifs and the colour of the back.",
    },
    {
      question: "Can I write my own message?",
      answer: "Yes. Choose one of our messages or write your own, up to 200 characters, with the recipient's name and yours if you like.",
    },
    {
      question: "Can I add hearts or other little icons?",
      answer: "Yes. Choose up to three motifs (a heart, a pearl, a star, a sparkle, a flower or a moon) and drag them anywhere on the front of the card. Three is the limit, so your words stay the heart of it.",
    },
    {
      question: "What is on the back of the card?",
      answer: "The Perla logo, on the colour you choose: ivory, lagoon teal, Venetian red or blush pink.",
    },
    {
      question: "How and when does the card reach them?",
      answer: "By email, at the address you enter when you design it, as soon as your order is paid. The email has a link that opens the card in full, front and back.",
    },
    {
      question: "Can I change the card after adding it to my cart?",
      answer: "Yes. Until you pay, open your cart and choose Edit to change anything, or Remove to take the card off your order.",
    },
    {
      question: "Does the card show a price?",
      answer: "No. The card carries only your message, the names you entered, your motifs and the Perla logo.",
    },
    {
      question: "Can I buy the card on its own?",
      answer: "No. The digital card is a small extra for an order: add at least one piece of jewelry to your cart, then add the card.",
    },
  ],
  ctaTitle: "Ready to write yours?",
  ctaBody: "It takes a minute to design, and it may be kept for years.",
  ctaButton: "Design your card",
  shopLink: "Choose the jewelry first",
};

const it: GiftCardPageContent = {
  metaTitle: "Biglietto regalo personalizzato con dedica",
  metaDescription:
    "Aggiungi al tuo ordine di gioielli in vetro di Murano un biglietto digitale personalizzato a {price}: la tua dedica, il tuo carattere, piccoli cuori o perle, inviato per email appena l'ordine è pagato.",
  h1: "Biglietto regalo personalizzato",
  lede: "Le tue parole su un biglietto che inviamo per email appena l'ordine è pagato. Scegli uno dei nostri messaggi o scrivi il tuo, scegli un carattere, aggiungi fino a tre piccoli simboli e il colore del retro, tutto a {price}, aggiunto all'ordine.",
  whyTitle: "Perché poche parole fanno il regalo",
  whyParagraphs: [
    "Un gioiello in vetro di Murano è modellato a mano, perla dopo perla, con il vetro di un'isola a pochi minuti di barca da Venezia. È bello già così. Ma ciò che trasforma una cosa bella in un regalo che si ricorda è sapere che l'hai scelta tu, per lei o per lui, e perché.",
    "A questo serve il biglietto. Arriva per email, spesso prima del pacco: le tue parole, nel carattere che hai scelto, con il suo nome in alto. Il gioiello parla di Venezia; il biglietto parla di te.",
    "E molto dopo che la carta da regalo è sparita, il biglietto resta: basta un tocco sul link nell'email per riaprirlo, fronte e retro, ogni volta che vuole rileggerlo.",
  ],
  lovedTitle: "Perché è così bello riceverlo",
  lovedPoints: [
    {
      title: "Rende il momento personale",
      body: "Un pacco diventa una lettera. Il suo nome, il tuo e poche parole scelte trasformano un ordine in un negozio in un regalo da parte tua, anche quando arriva direttamente a casa sua.",
    },
    {
      title: "È qualcosa da conservare",
      body: "I gioielli si indossano; i biglietti si conservano. Molti di noi custodiscono ancora un biglietto di una persona cara, molto dopo l'occasione, perché sono le parole ciò a cui ci aggrappiamo.",
    },
    {
      title: "Arriva dove tu non puoi",
      body: "Lontani per un compleanno o un anniversario? Spedisci il gioiello direttamente a lui o a lei. Il biglietto arriva nella sua casella email appena l'ordine è pagato, così le tue parole lo raggiungono anche se tu non puoi.",
    },
    {
      title: "Viene fatto una sola volta",
      body: "Ogni biglietto è creato per un solo ordine, con il tuo messaggio, il tuo carattere, i tuoi simboli e il retro che hai scelto. Non ce ne sono due uguali.",
    },
  ],
  forWhomTitle: "Per chi è, e cosa potresti scrivere",
  forWhomIntro:
    "Qualche idea da cui partire. Scegli uno dei nostri messaggi, oppure prendi in prestito una frase qui sotto e falla tua.",
  forWhom: [
    {
      who: "Per la tua ragazza",
      body: "Una collana di Murano nel suo colore preferito e un biglietto che dice ciò che non sempre dici ad alta voce. Aggiungi un cuore, scegli il rosso veneziano per il retro e lascia parlare un carattere romantico.",
      idea: "Ogni giorno con te sa un po' di Venezia.",
    },
    {
      who: "Per tua moglie o il tuo partner",
      body: "Per un anniversario, o senza un motivo preciso. Dopo anni insieme, poche parole sincere possono valere più di qualsiasi altra cosa nella scatola.",
      idea: "Dieci anni, e rendi ancora tutto più bello.",
    },
    {
      who: "Per la tua mamma",
      body: "Per la Festa della mamma o il suo compleanno: qualcosa di fatto a mano, da chi lei ha cresciuto. Le mamme conservano i biglietti, quindi scrivi quello che vorrà tenere.",
      idea: "Grazie per tutto ciò per cui non hai mai chiesto un grazie.",
    },
    {
      who: "Per la tua migliore amica",
      body: "Bracciali abbinati, una battuta che capite solo voi, un grazie per aver sempre risposto al telefono. L'amicizia si dà facilmente per scontata; un biglietto dice che tu non lo fai.",
      idea: "Per tutti gli anni passati, e per tutti quelli che verranno.",
    },
    {
      who: "Per tua sorella",
      body: "La prima amica che hai avuto. Orecchini nel suo colore e una frase che solo lei capirà.",
      idea: "Stesse radici, colori diversi. Ti voglio bene, sempre.",
    },
    {
      who: "Per tua nonna",
      body: "Ti ha insegnato più di quanto immagini. Un carattere classico, una perla sul fronte e parole che potrà rileggere ogni volta che vuole.",
      idea: "Da te cominciano tutte le nostre storie più belle.",
    },
  ],
  ideaLabel: "Idea",
  occasionsTitle: "Per ogni occasione",
  occasions: [
    "Compleanni",
    "Anniversari",
    "San Valentino",
    "Festa della mamma",
    "Natale",
    "Lauree",
    "Matrimoni e fidanzamenti",
    "Un grazie",
    "Senza un motivo",
  ],
  howTitle: "Come funziona",
  howSteps: [
    {
      title: "Crealo",
      body: "Aggiungi il suo nome e il tuo, la sua email, scegli un messaggio o scrivi il tuo, scegli uno dei cinque caratteri, aggiungi fino a tre simboli e il colore del retro. L'anteprima mostra esattamente ciò che vedrà.",
    },
    {
      title: "Aggiungilo all'ordine",
      body: "Il biglietto va nel carrello a {price}, insieme ai gioielli che scegli. Puoi modificarlo dal carrello fino al pagamento.",
    },
    {
      title: "Lo inviamo per email",
      body: "Appena l'ordine è pagato, inviamo il biglietto all'indirizzo che hai indicato, con un link che lo apre per intero.",
    },
    {
      title: "Lo aprono",
      body: "Legge le tue parole sul telefono o sul computer, gira il biglietto e può riaprirlo quando vuole. Il gioiello arriva per posta.",
    },
  ],
  tipsTitle: "Qualche consiglio per la dedica",
  tips: [
    "Sii breve. Una o due frasi si leggono meglio sul biglietto, e spesso dicono più di un paragrafo.",
    "Sii specifico. Un luogo condiviso, un soprannome o un ricordo rendono una frase inconfondibilmente tua.",
    "Di' perché l'hai scelto. «Perché il blu è il tuo colore» dà senso al regalo.",
    "Leggila ad alta voce una volta. Se suona come te, va bene così.",
  ],
  faqTitle: "Domande sul biglietto regalo",
  faq: [
    {
      question: "Quanto costa il biglietto regalo personalizzato?",
      answer: "{price}, aggiunto una sola volta all'ordine. Comprende il biglietto digitale, il tuo messaggio, il carattere, fino a tre simboli e il colore del retro.",
    },
    {
      question: "Posso scrivere un messaggio mio?",
      answer: "Sì. Scegli uno dei nostri messaggi o scrivi il tuo, fino a 200 caratteri, con il nome di chi lo riceve e il tuo, se vuoi.",
    },
    {
      question: "Posso aggiungere cuori o altri piccoli simboli?",
      answer: "Sì. Scegli fino a tre simboli (un cuore, una perla, una stella, una scintilla, un fiore o una luna) e trascinali dove vuoi sul fronte del biglietto. Il limite è tre, così le tue parole restano il cuore del biglietto.",
    },
    {
      question: "Cosa c'è sul retro del biglietto?",
      answer: "Il logo Perla, sul colore che scegli: avorio, laguna, rosso veneziano o rosa cipria.",
    },
    {
      question: "Come e quando arriva il biglietto?",
      answer: "Per email, all'indirizzo che inserisci quando lo crei, appena l'ordine è pagato. L'email contiene un link che apre il biglietto per intero, fronte e retro.",
    },
    {
      question: "Posso modificare il biglietto dopo averlo aggiunto al carrello?",
      answer: "Sì. Fino al pagamento, apri il carrello e scegli Modifica per cambiare qualsiasi cosa, oppure Rimuovi per togliere il biglietto dall'ordine.",
    },
    {
      question: "Sul biglietto compare il prezzo?",
      answer: "No. Il biglietto riporta solo il tuo messaggio, i nomi che hai inserito, i tuoi simboli e il logo Perla.",
    },
    {
      question: "Posso acquistare solo il biglietto?",
      answer: "No. Il biglietto digitale è un piccolo extra di un ordine: aggiungi almeno un gioiello al carrello, poi aggiungi il biglietto.",
    },
  ],
  ctaTitle: "Pronto a scrivere il tuo?",
  ctaBody: "Crearlo richiede un minuto, e potrebbe essere conservato per anni.",
  ctaButton: "Crea il tuo biglietto",
  shopLink: "Scegli prima il gioiello",
};

const fr: GiftCardPageContent = {
  metaTitle: "Carte cadeau personnalisée avec votre message",
  metaDescription:
    "Ajoutez à votre commande de bijoux en verre de Murano une carte cadeau numérique personnalisée pour {price} : votre message, votre police, des cœurs ou des perles, envoyée par e-mail une fois la commande payée.",
  h1: "Carte cadeau personnalisée",
  lede: "Vos mots sur une carte que nous lui envoyons par e-mail dès que votre commande est payée. Choisissez l'un de nos messages ou écrivez le vôtre, une police, jusqu'à trois motifs et la couleur du verso, le tout pour {price}, ajouté à votre commande.",
  whyTitle: "Pourquoi quelques mots font le cadeau",
  whyParagraphs: [
    "Un bijou en verre de Murano est façonné à la main, perle après perle, avec le verre d'une île à quelques minutes de bateau de Venise. Il est beau en soi. Mais ce qui transforme un bel objet en un cadeau dont on se souvient, c'est de savoir que vous l'avez choisi pour cette personne, et pourquoi.",
    "C'est à cela que sert la carte. Elle arrive par e-mail, souvent avant le colis : vos mots, dans la police que vous avez choisie, avec son prénom en haut. Le bijou dit Venise ; la carte dit vous.",
    "Et longtemps après que l'emballage a disparu, la carte est toujours là : un clic sur le lien de l'e-mail suffit pour la rouvrir, recto et verso, chaque fois qu'on veut la relire.",
  ],
  lovedTitle: "Pourquoi on aime tant la recevoir",
  lovedPoints: [
    {
      title: "Elle rend le moment personnel",
      body: "Un colis devient une lettre. Son prénom, le vôtre et quelques mots choisis transforment une commande en boutique en un cadeau de votre part, même livré directement chez la personne.",
    },
    {
      title: "C'est un objet que l'on garde",
      body: "Les bijoux se portent ; les cartes se gardent. Beaucoup d'entre nous conservent encore la carte d'un être cher, bien après l'occasion, parce que ce sont les mots auxquels on tient.",
    },
    {
      title: "Elle voyage quand vous ne pouvez pas",
      body: "Loin l'un de l'autre pour un anniversaire ? Envoyez le bijou directement chez la personne. La carte arrive dans sa boîte mail dès que la commande est payée, pour que vos mots lui parviennent même si vous ne pouvez pas être là.",
    },
    {
      title: "Elle n'est faite qu'une fois",
      body: "Chaque carte est créée pour une seule commande, avec votre message, votre police, vos motifs et le verso choisi. Il n'y en a pas deux pareilles.",
    },
  ],
  forWhomTitle: "Pour qui, et quoi écrire",
  forWhomIntro:
    "Quelques idées pour commencer. Choisissez l'un de nos messages, ou empruntez une phrase ci-dessous et faites-la vôtre.",
  forWhom: [
    {
      who: "Pour votre compagne",
      body: "Un collier de Murano dans sa couleur préférée, et une carte qui dit ce que vous ne dites pas toujours à voix haute. Ajoutez un cœur, choisissez le rouge vénitien pour le verso et laissez une écriture romantique parler pour vous.",
      idea: "Chaque jour avec toi a un petit air de Venise.",
    },
    {
      who: "Pour votre épouse ou votre partenaire",
      body: "Pour un anniversaire de mariage, ou sans raison particulière. Après des années ensemble, quelques mots sincères peuvent compter plus que tout le reste dans la boîte.",
      idea: "Dix ans, et tu rends encore tout plus beau.",
    },
    {
      who: "Pour votre maman",
      body: "Pour la fête des mères ou son anniversaire : un objet fait main, offert par quelqu'un qu'elle a élevé. Les mamans gardent les cartes ; écrivez celle qu'elle voudra garder.",
      idea: "Merci pour tout ce pour quoi tu n'as jamais demandé de merci.",
    },
    {
      who: "Pour votre meilleure amie",
      body: "Des bracelets assortis, une blague que vous seules comprenez, un merci d'avoir toujours décroché. L'amitié se tient facilement pour acquise ; une carte montre que ce n'est pas votre cas.",
      idea: "Pour toutes ces années, et toutes celles à venir.",
    },
    {
      who: "Pour votre sœur",
      body: "Votre toute première amie. Des boucles d'oreilles dans sa couleur et une phrase qu'elle seule comprendra.",
      idea: "Mêmes racines, couleurs différentes. Je t'aime, toujours.",
    },
    {
      who: "Pour votre grand-mère",
      body: "Elle vous a appris plus qu'elle ne le croit. Une police classique, une perle au recto et des mots qu'elle pourra relire quand elle le voudra.",
      idea: "C'est avec toi que commencent nos plus belles histoires.",
    },
  ],
  ideaLabel: "Idée",
  occasionsTitle: "Pour chaque occasion",
  occasions: [
    "Anniversaires",
    "Anniversaires de mariage",
    "Saint-Valentin",
    "Fête des mères",
    "Noël",
    "Remises de diplôme",
    "Mariages et fiançailles",
    "Un merci",
    "Juste comme ça",
  ],
  howTitle: "Comment ça marche",
  howSteps: [
    {
      title: "Créez-la",
      body: "Ajoutez son prénom et le vôtre, son e-mail, choisissez un message ou écrivez le vôtre, l'une des cinq polices, jusqu'à trois motifs et la couleur du verso. L'aperçu montre exactement ce qu'elle verra.",
    },
    {
      title: "Ajoutez-la à votre commande",
      body: "La carte rejoint votre panier pour {price}, avec les bijoux que vous choisissez. Vous pouvez la modifier depuis le panier jusqu'au paiement.",
    },
    {
      title: "Nous l'envoyons par e-mail",
      body: "Dès que votre commande est payée, nous envoyons la carte à l'adresse indiquée, avec un lien qui l'ouvre en entier.",
    },
    {
      title: "La personne l'ouvre",
      body: "Elle lit vos mots sur son téléphone ou son ordinateur, retourne la carte et peut la rouvrir quand elle veut. Le bijou suit par la poste.",
    },
  ],
  tipsTitle: "Quelques conseils pour votre message",
  tips: [
    "Restez bref. Une ou deux phrases se lisent mieux sur la carte, et en disent souvent plus qu'un paragraphe.",
    "Soyez précis. Un lieu partagé, un surnom ou un souvenir rendent une phrase inimitable.",
    "Dites pourquoi vous l'avez choisi. « Parce que le bleu est ta couleur » donne tout son sens au cadeau.",
    "Lisez-le une fois à voix haute. S'il vous ressemble, c'est le bon.",
  ],
  faqTitle: "Questions sur la carte cadeau",
  faq: [
    {
      question: "Combien coûte la carte cadeau personnalisée ?",
      answer: "{price}, ajouté une seule fois à votre commande. Cela comprend la carte numérique, votre message, votre police, jusqu'à trois motifs et la couleur du verso.",
    },
    {
      question: "Puis-je écrire mon propre message ?",
      answer: "Oui. Choisissez l'un de nos messages ou écrivez le vôtre, jusqu'à 200 caractères, avec le prénom du destinataire et le vôtre si vous le souhaitez.",
    },
    {
      question: "Puis-je ajouter des cœurs ou d'autres petits motifs ?",
      answer: "Oui. Choisissez jusqu'à trois motifs (un cœur, une perle, une étoile, une étincelle, une fleur ou une lune) et faites-les glisser où vous voulez au recto. La limite est de trois, pour que vos mots restent au cœur de la carte.",
    },
    {
      question: "Qu'y a-t-il au verso de la carte ?",
      answer: "Le logo Perla, sur la couleur de votre choix : ivoire, bleu lagune, rouge vénitien ou rose poudré.",
    },
    {
      question: "Comment et quand la carte arrive-t-elle ?",
      answer: "Par e-mail, à l'adresse que vous indiquez en la créant, dès que votre commande est payée. L'e-mail contient un lien qui ouvre la carte en entier, recto et verso.",
    },
    {
      question: "Puis-je modifier la carte après l'avoir ajoutée au panier ?",
      answer: "Oui. Jusqu'au paiement, ouvrez votre panier et choisissez Modifier pour tout changer, ou Retirer pour enlever la carte de la commande.",
    },
    {
      question: "Le prix figure-t-il sur la carte ?",
      answer: "Non. La carte ne porte que votre message, les prénoms saisis, vos motifs et le logo Perla.",
    },
    {
      question: "Puis-je acheter uniquement la carte ?",
      answer: "Non. La carte numérique est un petit plus d'une commande : ajoutez au moins un bijou à votre panier, puis la carte.",
    },
  ],
  ctaTitle: "Prêt à écrire la vôtre ?",
  ctaBody: "Une minute pour la créer, et elle sera peut-être gardée des années.",
  ctaButton: "Créer votre carte",
  shopLink: "Choisir d'abord le bijou",
};

const de: GiftCardPageContent = {
  metaTitle: "Personalisierte Grußkarte mit Ihrer Botschaft",
  metaDescription:
    "Ergänzen Sie Ihre Bestellung mit Schmuck aus Muranoglas um eine personalisierte digitale Grußkarte für {price}: Ihre Botschaft, Ihre Schrift, kleine Herzen oder Perlen, per E-Mail versandt, sobald die Bestellung bezahlt ist.",
  h1: "Personalisierte Grußkarte",
  lede: "Ihre Worte auf einer Karte, die wir per E-Mail senden, sobald Ihre Bestellung bezahlt ist. Wählen Sie eine unserer Botschaften oder schreiben Sie Ihre eigene, wählen Sie eine Schrift, bis zu drei Motive und die Farbe der Rückseite, alles für {price} zu Ihrer Bestellung.",
  whyTitle: "Warum ein paar Worte das Geschenk ausmachen",
  whyParagraphs: [
    "Ein Schmuckstück aus Muranoglas wird von Hand geformt, Perle für Perle, aus Glas von einer Insel wenige Bootsminuten von Venedig entfernt. Es ist schon für sich allein schön. Doch was aus etwas Schönem ein Geschenk macht, an das man sich erinnert, ist das Wissen, dass Sie es ausgesucht haben, und warum.",
    "Dafür ist die Karte da. Sie kommt per E-Mail, oft noch vor dem Paket: Ihre Worte, in der Schrift, die Sie gewählt haben, mit dem Namen ganz oben. Der Schmuck erzählt von Venedig; die Karte von Ihnen.",
    "Und lange nachdem das Geschenkpapier verschwunden ist, bleibt die Karte: Ein Klick auf den Link in der E-Mail öffnet sie wieder, Vorder- und Rückseite, wann immer man sie lesen möchte.",
  ],
  lovedTitle: "Warum man sie so gern bekommt",
  lovedPoints: [
    {
      title: "Sie macht den Moment persönlich",
      body: "Aus einem Paket wird ein Brief. Ein Name, Ihr Name und ein paar gewählte Worte machen aus einer Bestellung in einem Shop ein Geschenk von Ihnen, auch wenn es direkt an die Haustür geliefert wird.",
    },
    {
      title: "Sie ist etwas zum Aufbewahren",
      body: "Schmuck wird getragen; Karten werden aufbewahrt. Viele von uns haben noch irgendwo eine Karte von einem geliebten Menschen, lange nach dem Anlass, denn an Worten halten wir fest.",
    },
    {
      title: "Sie reist, wenn Sie es nicht können",
      body: "Zum Geburtstag oder Jahrestag weit voneinander entfernt? Senden Sie den Schmuck direkt dorthin. Die Karte landet im Postfach, sobald die Bestellung bezahlt ist, damit Ihre Worte ankommen, auch wenn Sie nicht dabei sein können.",
    },
    {
      title: "Sie entsteht nur ein einziges Mal",
      body: "Jede Karte entsteht für eine einzige Bestellung, mit Ihrer Botschaft, Ihrer Schrift, Ihren Motiven und der gewählten Rückseite. Keine gleicht der anderen.",
    },
  ],
  forWhomTitle: "Für wen sie ist, und was Sie schreiben könnten",
  forWhomIntro:
    "Ein paar Ideen für den Anfang. Wählen Sie eine unserer Botschaften, oder leihen Sie sich eine Zeile von unten und machen Sie sie zu Ihrer.",
  forWhom: [
    {
      who: "Für Ihre Freundin",
      body: "Eine Murano-Kette in ihrer Lieblingsfarbe und eine Karte, die sagt, was Sie nicht immer laut aussprechen. Fügen Sie ein Herz hinzu, wählen Sie Venezianisch Rot für die Rückseite und lassen Sie eine romantische Schrift für sich sprechen.",
      idea: "Jeder Tag mit dir fühlt sich ein bisschen an wie Venedig.",
    },
    {
      who: "Für Ihre Frau oder Ihren Partner",
      body: "Zum Hochzeitstag oder ganz ohne Anlass. Nach Jahren zu zweit bedeuten ein paar ehrliche Worte oft mehr als alles andere in der Schachtel.",
      idea: "Zehn Jahre, und du machst noch immer alles schöner.",
    },
    {
      who: "Für Ihre Mutter",
      body: "Zum Muttertag oder zu ihrem Geburtstag: etwas Handgemachtes, von jemandem, den sie großgezogen hat. Mütter heben Karten auf; schreiben Sie die, die sie behalten möchte.",
      idea: "Danke für alles, wofür du nie einen Dank verlangt hast.",
    },
    {
      who: "Für Ihre beste Freundin",
      body: "Passende Armbänder, ein Insiderwitz, ein Dankeschön, dass sie immer ans Telefon geht. Freundschaft nimmt man leicht als selbstverständlich hin; eine Karte zeigt, dass Sie es nicht tun.",
      idea: "Für all die Jahre, und für alle, die noch kommen.",
    },
    {
      who: "Für Ihre Schwester",
      body: "Die erste Freundin, die Sie je hatten. Ohrringe in ihrer Farbe und eine Zeile, die nur sie versteht.",
      idea: "Gleiche Wurzeln, verschiedene Farben. Hab dich immer lieb.",
    },
    {
      who: "Für Ihre Großmutter",
      body: "Sie hat Ihnen mehr beigebracht, als sie ahnt. Eine klassische Schrift, eine Perle auf der Vorderseite und Worte, die sie immer wieder lesen kann.",
      idea: "Bei dir beginnen all unsere schönsten Geschichten.",
    },
  ],
  ideaLabel: "Idee",
  occasionsTitle: "Für jeden Anlass",
  occasions: [
    "Geburtstage",
    "Jahrestage",
    "Valentinstag",
    "Muttertag",
    "Weihnachten",
    "Abschlussfeiern",
    "Hochzeiten und Verlobungen",
    "Ein Dankeschön",
    "Einfach so",
  ],
  howTitle: "So funktioniert es",
  howSteps: [
    {
      title: "Gestalten",
      body: "Fügen Sie beide Namen und die E-Mail-Adresse hinzu, wählen Sie eine Botschaft oder schreiben Sie Ihre eigene, eine von fünf Schriften, bis zu drei Motive und die Farbe der Rückseite. Die Vorschau zeigt genau, was ankommt.",
    },
    {
      title: "Zur Bestellung hinzufügen",
      body: "Die Karte kommt für {price} in Ihren Warenkorb, zusammen mit dem Schmuck Ihrer Wahl. Bis zur Zahlung können Sie sie im Warenkorb bearbeiten.",
    },
    {
      title: "Wir senden sie per E-Mail",
      body: "Sobald Ihre Bestellung bezahlt ist, senden wir die Karte an die angegebene Adresse, mit einem Link, der sie vollständig öffnet.",
    },
    {
      title: "Die Karte wird geöffnet",
      body: "Ihre Worte werden auf dem Handy oder Computer gelesen, die Karte umgedreht und jederzeit wieder geöffnet. Der Schmuck folgt per Post.",
    },
  ],
  tipsTitle: "Ein paar Tipps für Ihre Botschaft",
  tips: [
    "Fassen Sie sich kurz. Ein oder zwei Sätze lesen sich auf der Karte am schönsten und sagen oft mehr als ein ganzer Absatz.",
    "Werden Sie konkret. Ein gemeinsamer Ort, ein Spitzname oder eine Erinnerung machen eine Zeile unverwechselbar.",
    "Sagen Sie, warum Sie es gewählt haben. „Weil Blau deine Farbe ist“ gibt dem Geschenk seinen Sinn.",
    "Lesen Sie sie einmal laut vor. Wenn sie nach Ihnen klingt, ist sie richtig.",
  ],
  faqTitle: "Fragen zur Grußkarte",
  faq: [
    {
      question: "Was kostet die personalisierte Grußkarte?",
      answer: "{price}, einmal pro Bestellung. Enthalten sind die digitale Karte, Ihre Botschaft, Ihre Schrift, bis zu drei Motive und die Farbe der Rückseite.",
    },
    {
      question: "Kann ich eine eigene Botschaft schreiben?",
      answer: "Ja. Wählen Sie eine unserer Botschaften oder schreiben Sie Ihre eigene mit bis zu 200 Zeichen, auf Wunsch mit dem Namen der beschenkten Person und Ihrem.",
    },
    {
      question: "Kann ich Herzen oder andere kleine Motive hinzufügen?",
      answer: "Ja. Wählen Sie bis zu drei Motive (ein Herz, eine Perle, einen Stern, ein Funkeln, eine Blume oder einen Mond) und ziehen Sie sie an jede Stelle der Vorderseite. Mehr als drei sind es nicht, damit Ihre Worte im Mittelpunkt bleiben.",
    },
    {
      question: "Was steht auf der Rückseite der Karte?",
      answer: "Das Perla-Logo, in der Farbe Ihrer Wahl: Elfenbein, Lagunenblau, Venezianisch Rot oder Zartrosa.",
    },
    {
      question: "Wie und wann kommt die Karte an?",
      answer: "Per E-Mail an die Adresse, die Sie beim Gestalten angeben, sobald Ihre Bestellung bezahlt ist. Die E-Mail enthält einen Link, der die Karte vollständig öffnet, Vorder- und Rückseite.",
    },
    {
      question: "Kann ich die Karte ändern, nachdem ich sie in den Warenkorb gelegt habe?",
      answer: "Ja. Bis zur Zahlung öffnen Sie den Warenkorb und wählen Bearbeiten, um etwas zu ändern, oder Entfernen, um die Karte aus der Bestellung zu nehmen.",
    },
    {
      question: "Steht auf der Karte ein Preis?",
      answer: "Nein. Die Karte trägt nur Ihre Botschaft, die eingegebenen Namen, Ihre Motive und das Perla-Logo.",
    },
    {
      question: "Kann ich nur die Karte kaufen?",
      answer: "Nein. Die digitale Karte ist ein kleines Extra zu einer Bestellung: Legen Sie mindestens ein Schmuckstück in den Warenkorb und fügen Sie dann die Karte hinzu.",
    },
  ],
  ctaTitle: "Bereit, Ihre zu schreiben?",
  ctaBody: "Die Gestaltung dauert eine Minute, und vielleicht wird sie jahrelang aufbewahrt.",
  ctaButton: "Karte gestalten",
  shopLink: "Zuerst den Schmuck auswählen",
};

const es: GiftCardPageContent = {
  metaTitle: "Tarjeta regalo personalizada con tu mensaje",
  metaDescription:
    "Añade a tu pedido de joyas de cristal de Murano una tarjeta regalo digital personalizada por {price}: tu mensaje, tu tipografía, corazones o perlas, enviada por email en cuanto se pague el pedido.",
  h1: "Tarjeta regalo personalizada",
  lede: "Tus palabras en una tarjeta que enviamos por email en cuanto se paga tu pedido. Elige uno de nuestros mensajes o escribe el tuyo, elige tipografía, añade hasta tres motivos y el color del reverso, todo por {price} añadido a tu pedido.",
  whyTitle: "Por qué unas pocas palabras hacen el regalo",
  whyParagraphs: [
    "Una joya de vidrio de Murano se modela a mano, cuenta a cuenta, con vidrio de una isla a pocos minutos en barco de Venecia. Ya es bonita por sí sola. Pero lo que convierte algo bonito en un regalo que se recuerda es saber que tú lo elegiste para esa persona, y por qué.",
    "Para eso está la tarjeta. Llega por email, a menudo antes que el paquete: tus palabras, con la tipografía que elegiste y su nombre arriba. La joya habla de Venecia; la tarjeta habla de ti.",
    "Y mucho después de que desaparezca el envoltorio, la tarjeta sigue ahí: un toque en el enlace del email la vuelve a abrir, por delante y por detrás, siempre que quiera releerla.",
  ],
  lovedTitle: "Por qué encanta recibirla",
  lovedPoints: [
    {
      title: "Hace el momento personal",
      body: "Un paquete se convierte en una carta. Su nombre, el tuyo y unas palabras elegidas convierten un pedido en una tienda en un regalo tuyo, aunque llegue directamente a su puerta.",
    },
    {
      title: "Es algo para guardar",
      body: "Las joyas se llevan; las tarjetas se guardan. Muchos seguimos conservando la tarjeta de alguien a quien queremos, mucho después de la ocasión, porque las palabras son lo que atesoramos.",
    },
    {
      title: "Viaja cuando tú no puedes",
      body: "¿Lejos en un cumpleaños o un aniversario? Envía la joya directamente a su casa. La tarjeta llega a su bandeja de entrada en cuanto se paga el pedido, así tus palabras le llegan aunque tú no puedas.",
    },
    {
      title: "Se hace una sola vez",
      body: "Cada tarjeta se crea para un solo pedido, con tu mensaje, tu tipografía, tus motivos y el reverso que elijas. No hay dos iguales.",
    },
  ],
  forWhomTitle: "Para quién es, y qué podrías escribir",
  forWhomIntro:
    "Algunas ideas para empezar. Elige uno de nuestros mensajes, o toma prestada una frase de aquí abajo y hazla tuya.",
  forWhom: [
    {
      who: "Para tu novia",
      body: "Un collar de Murano en su color favorito y una tarjeta que dice lo que no siempre dices en voz alta. Añade un corazón, elige el rojo veneciano para el reverso y deja que una letra romántica hable por ti.",
      idea: "Cada día contigo sabe un poco a Venecia.",
    },
    {
      who: "Para tu esposa o tu pareja",
      body: "Para un aniversario, o sin motivo alguno. Después de años juntos, unas palabras sinceras pueden significar más que cualquier otra cosa de la caja.",
      idea: "Diez años, y sigues haciéndolo todo más bonito.",
    },
    {
      who: "Para tu madre",
      body: "Para el Día de la Madre o su cumpleaños: algo hecho a mano, de alguien a quien ella crio. Las madres guardan las tarjetas, así que escribe la que querrá conservar.",
      idea: "Gracias por todo aquello por lo que nunca pediste las gracias.",
    },
    {
      who: "Para tu mejor amiga",
      body: "Pulseras a juego, una broma que solo entendéis vosotras, un gracias por coger siempre el teléfono. La amistad se da fácilmente por hecha; una tarjeta dice que tú no lo haces.",
      idea: "Por todos estos años, y por todos los que vendrán.",
    },
    {
      who: "Para tu hermana",
      body: "La primera amiga que tuviste. Unos pendientes en su color y una frase que solo ella entenderá.",
      idea: "Mismas raíces, distintos colores. Te quiero siempre.",
    },
    {
      who: "Para tu abuela",
      body: "Te ha enseñado más de lo que cree. Una tipografía clásica, una perla en el anverso y palabras que podrá releer cuando quiera.",
      idea: "Contigo empiezan todas nuestras mejores historias.",
    },
  ],
  ideaLabel: "Idea",
  occasionsTitle: "Para cada ocasión",
  occasions: [
    "Cumpleaños",
    "Aniversarios",
    "San Valentín",
    "Día de la Madre",
    "Navidad",
    "Graduaciones",
    "Bodas y compromisos",
    "Un gracias",
    "Porque sí",
  ],
  howTitle: "Cómo funciona",
  howSteps: [
    {
      title: "Diséñala",
      body: "Añade su nombre y el tuyo, su email, elige un mensaje o escribe el tuyo, una de las cinco tipografías, hasta tres motivos y el color del reverso. La vista previa muestra exactamente lo que verá.",
    },
    {
      title: "Añádela a tu pedido",
      body: "La tarjeta va a tu carrito por {price}, junto a las joyas que elijas. Puedes editarla desde el carrito hasta que pagues.",
    },
    {
      title: "La enviamos por email",
      body: "En cuanto se paga tu pedido, enviamos la tarjeta a la dirección que indicaste, con un enlace que la abre entera.",
    },
    {
      title: "Lo abren",
      body: "Lee tus palabras en el móvil o el ordenador, gira la tarjeta y puede volver a abrirla cuando quiera. La joya llega por correo.",
    },
  ],
  tipsTitle: "Algunos consejos para tu mensaje",
  tips: [
    "Sé breve. Una o dos frases se leen mejor en la tarjeta, y a menudo dicen más que un párrafo.",
    "Sé concreto. Un lugar compartido, un apodo o un recuerdo hacen que una frase sea inconfundiblemente tuya.",
    "Di por qué la elegiste. «Porque el azul es tu color» da sentido al regalo.",
    "Léelo en voz alta una vez. Si suena a ti, está bien.",
  ],
  faqTitle: "Preguntas sobre la tarjeta regalo",
  faq: [
    {
      question: "¿Cuánto cuesta la tarjeta regalo personalizada?",
      answer: "{price}, una sola vez por pedido. Incluye la tarjeta digital, tu mensaje, tu tipografía, hasta tres motivos y el color del reverso.",
    },
    {
      question: "¿Puedo escribir mi propio mensaje?",
      answer: "Sí. Elige uno de nuestros mensajes o escribe el tuyo, de hasta 200 caracteres, con el nombre de quien lo recibe y el tuyo si quieres.",
    },
    {
      question: "¿Puedo añadir corazones u otros pequeños motivos?",
      answer: "Sí. Elige hasta tres motivos (un corazón, una perla, una estrella, un destello, una flor o una luna) y arrástralos a cualquier lugar del anverso. El límite es tres, para que tus palabras sigan siendo lo principal.",
    },
    {
      question: "¿Qué hay en el reverso de la tarjeta?",
      answer: "El logo de Perla, en el color que elijas: marfil, verde laguna, rojo veneciano o rosa empolvado.",
    },
    {
      question: "¿Cómo y cuándo llega la tarjeta?",
      answer: "Por email, a la dirección que indicas al diseñarla, en cuanto se paga tu pedido. El email incluye un enlace que abre la tarjeta entera, por delante y por detrás.",
    },
    {
      question: "¿Puedo cambiar la tarjeta después de añadirla al carrito?",
      answer: "Sí. Hasta que pagues, abre el carrito y elige Editar para cambiar lo que quieras, o Quitar para retirar la tarjeta del pedido.",
    },
    {
      question: "¿Aparece el precio en la tarjeta?",
      answer: "No. La tarjeta lleva solo tu mensaje, los nombres que escribiste, tus motivos y el logotipo de Perla.",
    },
    {
      question: "¿Puedo comprar solo la tarjeta?",
      answer: "No. La tarjeta digital es un pequeño extra de un pedido: añade al menos una joya al carrito y después la tarjeta.",
    },
  ],
  ctaTitle: "¿Listo para escribir la tuya?",
  ctaBody: "Diseñarla lleva un minuto, y puede que la guarden durante años.",
  ctaButton: "Diseña tu tarjeta",
  shopLink: "Elige primero la joya",
};

const pt: GiftCardPageContent = {
  metaTitle: "Cartão de oferta personalizado com a sua mensagem",
  metaDescription:
    "Adicione à sua encomenda de joias de vidro de Murano um cartão de oferta digital personalizado por {price}: a sua mensagem, o seu tipo de letra, corações ou pérolas, enviado por email assim que a encomenda for paga.",
  h1: "Cartão de oferta personalizado",
  lede: "As suas palavras num cartão que enviamos por email assim que a encomenda for paga. Escolha uma das nossas mensagens ou escreva a sua, escolha o tipo de letra, até três motivos e a cor do verso, tudo por {price}, adicionado à encomenda.",
  whyTitle: "Porque é que poucas palavras fazem o presente",
  whyParagraphs: [
    "Uma joia em vidro de Murano é moldada à mão, conta a conta, com vidro de uma ilha a poucos minutos de barco de Veneza. Já é bonita por si só. Mas o que transforma algo bonito num presente inesquecível é saber que foi escolhido a pensar nessa pessoa, e porquê.",
    "É para isso que serve o cartão. Chega por email, muitas vezes antes da encomenda: as suas palavras, no tipo de letra que escolheu, com o nome no topo. A joia fala de Veneza; o cartão fala de si.",
    "E muito depois de o embrulho desaparecer, o cartão continua lá: um toque no link do email volta a abri-lo, frente e verso, sempre que quiser relê-lo.",
  ],
  lovedTitle: "Porque é tão bom recebê-lo",
  lovedPoints: [
    {
      title: "Torna o momento pessoal",
      body: "Uma encomenda transforma-se numa carta. O nome da pessoa, o seu e algumas palavras escolhidas fazem de uma compra numa loja um presente seu, mesmo quando é entregue diretamente à porta dela.",
    },
    {
      title: "É algo para guardar",
      body: "As joias usam-se; os cartões guardam-se. Muitos de nós ainda temos o cartão de alguém de quem gostamos, muito depois da ocasião, porque são as palavras que guardamos.",
    },
    {
      title: "Viaja quando não pode ir",
      body: "Longe num aniversário? Envie a joia diretamente para a pessoa. O cartão chega à caixa de correio assim que a encomenda for paga, para que as suas palavras cheguem mesmo que não possa estar lá.",
    },
    {
      title: "É feito uma só vez",
      body: "Cada cartão é criado para uma única encomenda, com a sua mensagem, o seu tipo de letra, os seus motivos e o verso escolhido. Não há dois iguais.",
    },
  ],
  forWhomTitle: "Para quem é, e o que pode escrever",
  forWhomIntro:
    "Algumas ideias para começar. Escolha uma das nossas mensagens, ou use uma frase abaixo e torne-a sua.",
  forWhom: [
    {
      who: "Para a sua namorada",
      body: "Um colar de Murano na cor preferida dela e um cartão que diz o que nem sempre diz em voz alta. Acrescente um coração, escolha o vermelho veneziano para o verso e deixe uma letra romântica falar por si.",
      idea: "Cada dia contigo sabe um pouco a Veneza.",
    },
    {
      who: "Para a sua mulher ou companheira",
      body: "Para um aniversário de casamento, ou sem motivo nenhum. Depois de anos juntos, algumas palavras sinceras podem valer mais do que tudo o resto na caixa.",
      idea: "Dez anos, e continuas a tornar tudo mais bonito.",
    },
    {
      who: "Para a sua mãe",
      body: "Para o Dia da Mãe ou o aniversário dela: algo feito à mão, de alguém que ela criou. As mães guardam os cartões, por isso escreva aquele que ela vai querer guardar.",
      idea: "Obrigado por tudo aquilo por que nunca pediste agradecimento.",
    },
    {
      who: "Para a sua melhor amiga",
      body: "Pulseiras a condizer, uma piada que só vocês percebem, um obrigado por atender sempre o telefone. A amizade dá-se facilmente por garantida; um cartão mostra que não é o seu caso.",
      idea: "Por todos estes anos, e por todos os que ainda virão.",
    },
    {
      who: "Para a sua irmã",
      body: "A primeira amiga que teve. Uns brincos na cor dela e uma frase que só ela vai perceber.",
      idea: "As mesmas raízes, cores diferentes. Adoro-te, sempre.",
    },
    {
      who: "Para a sua avó",
      body: "Ensinou-lhe mais do que imagina. Um tipo de letra clássico, uma pérola na frente e palavras que ela pode reler sempre que quiser.",
      idea: "É contigo que começam as nossas melhores histórias.",
    },
  ],
  ideaLabel: "Ideia",
  occasionsTitle: "Para todas as ocasiões",
  occasions: [
    "Aniversários",
    "Aniversários de casamento",
    "Dia dos Namorados",
    "Dia da Mãe",
    "Natal",
    "Formaturas",
    "Casamentos e noivados",
    "Um obrigado",
    "Só porque sim",
  ],
  howTitle: "Como funciona",
  howSteps: [
    {
      title: "Crie-o",
      body: "Adicione o nome da pessoa e o seu, o email dela, escolha uma mensagem ou escreva a sua, um dos cinco tipos de letra, até três motivos e a cor do verso. A pré-visualização mostra exatamente o que vai ver.",
    },
    {
      title: "Junte-o à encomenda",
      body: "O cartão vai para o seu carrinho por {price}, com as joias que escolher. Pode editá-lo a partir do carrinho até pagar.",
    },
    {
      title: "Enviamo-lo por email",
      body: "Assim que a encomenda for paga, enviamos o cartão para o endereço indicado, com um link que o abre por inteiro.",
    },
    {
      title: "A pessoa abre-o",
      body: "Lê as suas palavras no telemóvel ou no computador, vira o cartão e pode abri-lo de novo quando quiser. A joia segue pelo correio.",
    },
  ],
  tipsTitle: "Algumas dicas para a sua mensagem",
  tips: [
    "Seja breve. Uma ou duas frases leem-se melhor no cartão e muitas vezes dizem mais do que um parágrafo.",
    "Seja concreto. Um lugar partilhado, uma alcunha ou uma recordação tornam uma frase inconfundivelmente sua.",
    "Diga porque a escolheu. «Porque o azul é a tua cor» dá sentido ao presente.",
    "Leia-a em voz alta uma vez. Se soar a si, está certa.",
  ],
  faqTitle: "Perguntas sobre o cartão de oferta",
  faq: [
    {
      question: "Quanto custa o cartão de oferta personalizado?",
      answer: "{price}, uma única vez por encomenda. Inclui o cartão digital, a sua mensagem, o tipo de letra, até três motivos e a cor do verso.",
    },
    {
      question: "Posso escrever a minha própria mensagem?",
      answer: "Sim. Escolha uma das nossas mensagens ou escreva a sua, até 200 caracteres, com o nome de quem recebe e o seu, se quiser.",
    },
    {
      question: "Posso acrescentar corações ou outros pequenos motivos?",
      answer: "Sim. Escolha até três motivos (um coração, uma pérola, uma estrela, um brilho, uma flor ou uma lua) e arraste-os para qualquer lugar da frente do cartão. O limite é três, para que as suas palavras continuem a ser o essencial.",
    },
    {
      question: "O que há no verso do cartão?",
      answer: "O logótipo Perla, na cor que escolher: marfim, verde laguna, vermelho veneziano ou rosa-claro.",
    },
    {
      question: "Como e quando chega o cartão?",
      answer: "Por email, para o endereço que indicar ao criá-lo, assim que a encomenda for paga. O email tem um link que abre o cartão por inteiro, frente e verso.",
    },
    {
      question: "Posso alterar o cartão depois de o pôr no carrinho?",
      answer: "Sim. Até pagar, abra o carrinho e escolha Editar para mudar o que quiser, ou Remover para retirar o cartão da encomenda.",
    },
    {
      question: "O cartão mostra o preço?",
      answer: "Não. O cartão tem apenas a sua mensagem, os nomes que escreveu, os seus motivos e o logótipo da Perla.",
    },
    {
      question: "Posso comprar só o cartão?",
      answer: "Não. O cartão digital é um pequeno extra de uma encomenda: adicione pelo menos uma joia ao carrinho e depois o cartão.",
    },
  ],
  ctaTitle: "Pronto para escrever o seu?",
  ctaBody: "Demora um minuto a criar, e pode ser guardado durante anos.",
  ctaButton: "Crie o seu cartão",
  shopLink: "Escolha primeiro a joia",
};

const ru: GiftCardPageContent = {
  metaTitle: "Именная открытка с вашим посланием",
  metaDescription:
    "Добавьте к заказу украшений из муранского стекла именную электронную открытку за {price}: ваше послание, ваш шрифт, сердечки или жемчужины, отправим по почте сразу после оплаты.",
  h1: "Именная открытка к подарку",
  lede: "Ваши слова на открытке, которую мы отправим по электронной почте сразу после оплаты заказа. Выберите одно из наших посланий или напишите своё, выберите шрифт, до трёх мотивов и цвет оборота, всё за {price} к вашему заказу.",
  whyTitle: "Почему несколько слов делают подарок",
  whyParagraphs: [
    "Украшение из муранского стекла создаётся вручную, бусина за бусиной, из стекла с острова в нескольких минутах на лодке от Венеции. Оно прекрасно само по себе. Но красивую вещь превращает в подарок, который запомнится, знание того, что его выбрали именно вы, и почему.",
    "Для этого и нужна открытка. Она приходит по электронной почте, часто раньше посылки: ваши слова, вашим шрифтом, с именем получателя вверху. Украшение говорит о Венеции; открытка — о вас.",
    "И даже когда упаковка давно исчезла, открытка остаётся: одно нажатие на ссылку в письме открывает её снова, с лицевой и оборотной стороны, когда захочется перечитать.",
  ],
  lovedTitle: "Почему её так приятно получать",
  lovedPoints: [
    {
      title: "Она делает момент личным",
      body: "Посылка превращается в письмо. Имя получателя, ваше имя и несколько выбранных слов превращают заказ в магазине в подарок от вас, даже если его доставят прямо к двери.",
    },
    {
      title: "Её хочется сохранить",
      body: "Украшения носят; открытки хранят. Многие из нас до сих пор держат где-то открытку от близкого человека, спустя годы после праздника, потому что именно слова мы бережём.",
    },
    {
      title: "Она приедет, даже если вы не можете",
      body: "Далеко друг от друга в день рождения или годовщину? Отправьте украшение прямо получателю. Открытка придёт на почту сразу после оплаты заказа, и ваши слова дойдут, даже если вы не сможете приехать.",
    },
    {
      title: "Она создаётся один раз",
      body: "Каждая открытка создаётся для одного заказа: с вашим посланием, шрифтом, мотивами и выбранным оборотом. Двух одинаковых не бывает.",
    },
  ],
  forWhomTitle: "Для кого она, и что можно написать",
  forWhomIntro:
    "Несколько идей для начала. Выберите одно из наших посланий или возьмите строку ниже и сделайте её своей.",
  forWhom: [
    {
      who: "Для любимой девушки",
      body: "Колье из Мурано её любимого цвета и открытка, в которой сказано то, что вы не всегда говорите вслух. Добавьте сердце, выберите венецианский красный для оборота, и пусть романтичный шрифт скажет остальное.",
      idea: "Каждый день с тобой немного похож на Венецию.",
    },
    {
      who: "Для жены или партнёра",
      body: "На годовщину или просто так. После многих лет вместе несколько искренних слов могут значить больше всего остального в коробке.",
      idea: "Десять лет, а ты всё так же делаешь всё красивее.",
    },
    {
      who: "Для мамы",
      body: "На День матери или день рождения: что-то сделанное вручную, от того, кого она вырастила. Мамы хранят открытки, так что напишите ту, которую ей захочется сохранить.",
      idea: "Спасибо за всё, за что ты никогда не просила благодарности.",
    },
    {
      who: "Для лучшей подруги",
      body: "Парные браслеты, шутка, понятная только вам, благодарность за то, что она всегда берёт трубку. Дружбу легко принимать как должное; открытка говорит, что вы так не делаете.",
      idea: "За все эти годы и за все, что ещё впереди.",
    },
    {
      who: "Для сестры",
      body: "Ваша самая первая подруга. Серьги её цвета и строка, которую поймёт только она.",
      idea: "Одни корни, разные цвета. Люблю тебя всегда.",
    },
    {
      who: "Для бабушки",
      body: "Она научила вас большему, чем думает. Классический шрифт, жемчужина на лицевой стороне и слова, которые она сможет перечитывать, когда захочет.",
      idea: "С тебя начинаются все наши лучшие истории.",
    },
  ],
  ideaLabel: "Идея",
  occasionsTitle: "Для любого повода",
  occasions: [
    "Дни рождения",
    "Годовщины",
    "День святого Валентина",
    "День матери",
    "Рождество и Новый год",
    "Выпускные",
    "Свадьбы и помолвки",
    "Слова благодарности",
    "Просто так",
  ],
  howTitle: "Как это работает",
  howSteps: [
    {
      title: "Создайте её",
      body: "Добавьте оба имени и email получателя, выберите послание или напишите своё, один из пяти шрифтов, до трёх мотивов и цвет оборота. Превью показывает именно то, что увидит получатель.",
    },
    {
      title: "Добавьте к заказу",
      body: "Открытка попадает в корзину за {price} вместе с выбранными украшениями. До оплаты её можно изменить в корзине.",
    },
    {
      title: "Мы отправляем её по почте",
      body: "Сразу после оплаты заказа мы отправляем открытку на указанный адрес со ссылкой, которая открывает её полностью.",
    },
    {
      title: "Её открывают",
      body: "Получатель читает ваши слова на телефоне или компьютере, переворачивает открытку и может открыть её снова в любое время. Украшение приходит по почте.",
    },
  ],
  tipsTitle: "Несколько советов для послания",
  tips: [
    "Будьте кратки. Одно-два предложения лучше всего смотрятся на открытке и часто говорят больше целого абзаца.",
    "Будьте конкретны. Общее место, прозвище или воспоминание делают строку безошибочно вашей.",
    "Скажите, почему вы выбрали именно это. «Потому что синий — твой цвет» придаёт подарку смысл.",
    "Прочитайте его вслух один раз. Если звучит как вы, значит, всё верно.",
  ],
  faqTitle: "Вопросы об именной открытке",
  faq: [
    {
      question: "Сколько стоит именная открытка?",
      answer: "{price}, один раз за заказ. Сюда входят электронная открытка, ваше послание, шрифт, до трёх мотивов и цвет оборота.",
    },
    {
      question: "Можно написать своё послание?",
      answer: "Да. Выберите одно из наших посланий или напишите своё, до 200 символов, при желании с именем получателя и вашим.",
    },
    {
      question: "Можно добавить сердечки или другие маленькие узоры?",
      answer: "Да. Выберите до трёх узоров (сердце, жемчужину, звезду, искру, цветок или луну) и перетащите их в любое место лицевой стороны. Не больше трёх, чтобы главными оставались ваши слова.",
    },
    {
      question: "Что на обороте открытки?",
      answer: "Логотип Perla на выбранном вами цвете: слоновая кость, лагуна, венецианский красный или пудрово-розовый.",
    },
    {
      question: "Как и когда приходит открытка?",
      answer: "По электронной почте на адрес, который вы укажете при создании, сразу после оплаты заказа. В письме есть ссылка, открывающая открытку полностью, с обеих сторон.",
    },
    {
      question: "Можно изменить открытку после добавления в корзину?",
      answer: "Да. До оплаты откройте корзину и выберите «Изменить», чтобы поменять что угодно, или «Удалить», чтобы убрать открытку из заказа.",
    },
    {
      question: "Указана ли на открытке цена?",
      answer: "Нет. На открытке только ваше послание, указанные имена, ваши узоры и логотип Perla.",
    },
    {
      question: "Можно купить только открытку?",
      answer: "Нет. Электронная открытка — небольшое дополнение к заказу: сначала добавьте в корзину хотя бы одно украшение, затем открытку.",
    },
  ],
  ctaTitle: "Готовы написать свою?",
  ctaBody: "Создать её — дело минуты, а хранить её могут годами.",
  ctaButton: "Создать открытку",
  shopLink: "Сначала выбрать украшение",
};

const ar: GiftCardPageContent = {
  metaTitle: "بطاقة إهداء مخصصة برسالتك",
  metaDescription:
    "أضف إلى طلب مجوهرات زجاج مورانو بطاقة إهداء رقمية مخصصة مقابل {price}: رسالتك وخطك وقلوب أو لآلئ صغيرة، تُرسل بالبريد الإلكتروني فور دفع الطلب.",
  h1: "بطاقة إهداء مخصصة",
  lede: "كلماتك على بطاقة نرسلها بالبريد الإلكتروني فور دفع طلبك. اختر إحدى رسائلنا أو اكتب رسالتك، واختر الخط، وأضف حتى ثلاثة رموز ولون الوجه الخلفي، كل ذلك مقابل {price} يضاف إلى طلبك.",
  whyTitle: "لماذا تصنع بضع كلمات الهدية",
  whyParagraphs: [
    "تُشكَّل قطعة مجوهرات زجاج مورانو باليد، حبة بعد حبة، من زجاج جزيرة تبعد دقائق بالقارب عن البندقية. إنها جميلة بحد ذاتها. لكن ما يحوّل الشيء الجميل إلى هدية لا تُنسى هو معرفة أنك اخترته لهذا الشخص، ولماذا.",
    "هذا ما وُجدت البطاقة من أجله. تصل بالبريد الإلكتروني، وغالبًا قبل الطرد: كلماتك بالخط الذي اخترته، واسمه في الأعلى. المجوهرات تحكي عن البندقية؛ والبطاقة تحكي عنك.",
    "وبعد زوال الغلاف بوقت طويل، تبقى البطاقة: نقرة واحدة على الرابط في البريد تعيد فتحها، بوجهيها، كلما أراد قراءتها.",
  ],
  lovedTitle: "لماذا يحب الناس تلقيها",
  lovedPoints: [
    {
      title: "تجعل اللحظة شخصية",
      body: "يتحول الطرد إلى رسالة. اسمه واسمك وبضع كلمات مختارة تجعل الطلب من متجر هدية منك، حتى عندما يصل مباشرة إلى بابه.",
    },
    {
      title: "إنها شيء يُحتفظ به",
      body: "المجوهرات تُلبس؛ والبطاقات تُحفظ. كثيرون منا ما زالوا يحتفظون ببطاقة من شخص عزيز، بعد المناسبة بزمن طويل، لأن الكلمات هي ما نتمسك به.",
    },
    {
      title: "تسافر حين لا تستطيع",
      body: "بعيدان في عيد ميلاد أو ذكرى؟ أرسل المجوهرات إليه مباشرة. تصل البطاقة إلى بريده فور دفع الطلب، فتبلغه كلماتك حتى لو لم تستطع الحضور.",
    },
    {
      title: "تُصنع مرة واحدة فقط",
      body: "كل بطاقة تُصنع لطلب واحد، برسالتك وخطك ورموزك والوجه الخلفي الذي اخترته. لا توجد بطاقتان متطابقتان.",
    },
  ],
  forWhomTitle: "لمن هي، وماذا يمكن أن تكتب",
  forWhomIntro: "بعض الأفكار للبداية. اختر إحدى رسائلنا، أو استعر سطرًا من الأسفل واجعله خاصًا بك.",
  forWhom: [
    {
      who: "لحبيبتك",
      body: "قلادة من مورانو بلونها المفضل، وبطاقة تقول ما لا تقوله دائمًا بصوت عالٍ. أضف قلبًا، واختر الأحمر البندقي للوجه الخلفي، ودع خطًا رومانسيًا يتحدث عنك.",
      idea: "كل يوم معكِ فيه شيء من البندقية.",
    },
    {
      who: "لزوجتك أو شريك حياتك",
      body: "لذكرى زواج، أو بلا سبب على الإطلاق. بعد سنوات معًا، قد تعني بضع كلمات صادقة أكثر من أي شيء آخر في العلبة.",
      idea: "عشر سنوات، وما زلتِ تجعلين كل شيء أجمل.",
    },
    {
      who: "لأمك",
      body: "لعيد الأم أو لعيد ميلادها: شيء مصنوع يدويًا، ممن ربّته. الأمهات يحتفظن بالبطاقات، فاكتب البطاقة التي سترغب في الاحتفاظ بها.",
      idea: "شكرًا على كل ما لم تطلبي عليه شكرًا قط.",
    },
    {
      who: "لصديقتك المقربة",
      body: "أساور متطابقة، ونكتة لا يفهمها غيركما، وشكر لأنها تجيب دائمًا على الهاتف. من السهل أن نعتبر الصداقة أمرًا مسلّمًا به؛ والبطاقة تقول إنك لا تفعل ذلك.",
      idea: "لكل السنوات الماضية، ولكل السنوات القادمة.",
    },
    {
      who: "لأختك",
      body: "أول صديقة عرفتها. أقراط بلونها وسطر لن يفهمه أحد سواها.",
      idea: "الجذور نفسها، والألوان مختلفة. أحبك دائمًا.",
    },
    {
      who: "لجدتك",
      body: "علّمتك أكثر مما تظن. خط كلاسيكي، ولؤلؤة على الوجه الأمامي، وكلمات يمكنها قراءتها كلما شاءت.",
      idea: "منكِ تبدأ أجمل حكاياتنا.",
    },
  ],
  ideaLabel: "فكرة",
  occasionsTitle: "لكل مناسبة",
  occasions: [
    "أعياد الميلاد",
    "الذكريات السنوية",
    "عيد الحب",
    "عيد الأم",
    "الأعياد ورأس السنة",
    "حفلات التخرج",
    "الأعراس والخطوبة",
    "كلمة شكر",
    "بلا مناسبة",
  ],
  howTitle: "كيف تعمل",
  howSteps: [
    {
      title: "صمّمها",
      body: "أضف اسمه واسمك وبريده الإلكتروني، واختر رسالة أو اكتب رسالتك، واختر أحد الخطوط الخمسة، وأضف حتى ثلاثة رموز ولون الوجه الخلفي. تُظهر المعاينة ما سيراه بالضبط.",
    },
    {
      title: "أضفها إلى طلبك",
      body: "تُضاف البطاقة إلى سلتك مقابل {price} مع المجوهرات التي تختارها. يمكنك تعديلها من السلة حتى الدفع.",
    },
    {
      title: "نرسلها بالبريد الإلكتروني",
      body: "فور دفع طلبك، نرسل البطاقة إلى العنوان الذي أدخلته، مع رابط يفتحها كاملة.",
    },
    {
      title: "يفتحها",
      body: "يقرأ كلماتك على هاتفه أو حاسوبه، ويقلب البطاقة، ويمكنه فتحها متى شاء. وتصل المجوهرات بالبريد.",
    },
  ],
  tipsTitle: "بعض النصائح لرسالتك",
  tips: [
    "اجعلها قصيرة. جملة أو جملتان تبدوان أجمل على البطاقة، وغالبًا ما تقولان أكثر من فقرة.",
    "كن محددًا. مكان مشترك أو لقب أو ذكرى تجعل السطر خاصًا بك بلا شك.",
    "قل لماذا اخترتها. «لأن الأزرق لونك» يمنح الهدية معناها.",
    "اقرأها بصوت عالٍ مرة واحدة. إن بدت مثلك، فهي الصحيحة.",
  ],
  faqTitle: "أسئلة عن بطاقة الإهداء",
  faq: [
    {
      question: "كم تكلف بطاقة الإهداء المخصصة؟",
      answer: "{price}، يضاف مرة واحدة إلى طلبك. ويشمل البطاقة الرقمية ورسالتك والخط وحتى ثلاثة رموز ولون الوجه الخلفي.",
    },
    {
      question: "هل يمكنني كتابة رسالتي الخاصة؟",
      answer: "نعم. اختر إحدى رسائلنا أو اكتب رسالتك بما يصل إلى 200 حرف، مع اسم المستلم واسمك إن شئت.",
    },
    {
      question: "هل يمكنني إضافة قلوب أو رموز صغيرة أخرى؟",
      answer: "نعم. اختر حتى ثلاثة رموز (قلب أو لؤلؤة أو نجمة أو بريق أو زهرة أو قمر) واسحبها إلى أي مكان على الوجه الأمامي. الحد ثلاثة، لتبقى كلماتك في قلب البطاقة.",
    },
    {
      question: "ماذا يوجد على الوجه الخلفي للبطاقة؟",
      answer: "شعار Perla على اللون الذي تختاره: العاجي أو أزرق البحيرة أو الأحمر البندقي أو الوردي الفاتح.",
    },
    {
      question: "كيف ومتى تصل البطاقة؟",
      answer: "بالبريد الإلكتروني إلى العنوان الذي تدخله عند تصميمها، فور دفع طلبك. يحتوي البريد على رابط يفتح البطاقة كاملة بوجهيها.",
    },
    {
      question: "هل يمكنني تغيير البطاقة بعد إضافتها إلى السلة؟",
      answer: "نعم. حتى الدفع، افتح السلة واختر تعديل لتغيير أي شيء، أو إزالة لحذف البطاقة من الطلب.",
    },
    {
      question: "هل يظهر السعر على البطاقة؟",
      answer: "لا. تحمل البطاقة رسالتك والأسماء التي أدخلتها ورموزك وشعار Perla فقط.",
    },
    {
      question: "هل يمكنني شراء البطاقة وحدها؟",
      answer: "لا. البطاقة الرقمية إضافة صغيرة إلى طلب: أضف قطعة واحدة على الأقل إلى سلتك، ثم أضف البطاقة.",
    },
  ],
  ctaTitle: "هل أنت مستعد لكتابة بطاقتك؟",
  ctaBody: "تصميمها يستغرق دقيقة، وقد يُحتفظ بها لسنوات.",
  ctaButton: "صمّم بطاقتك",
  shopLink: "اختر المجوهرات أولًا",
};

const zh: GiftCardPageContent = {
  metaTitle: "个性化礼品卡：写下您的寄语",
  metaDescription:
    "为您的穆拉诺玻璃饰品订单添加 {price} 的个性化电子礼品卡：您的寄语、您的字体、小爱心或珍珠图案，订单付款后通过电子邮件发送。",
  h1: "个性化礼品卡",
  lede: "您的话语写在一张卡片上，订单付款后我们立即通过电子邮件发送给对方。选择我们的寄语或亲自撰写，挑选字体，添加最多三个小图案并选择背面颜色，随订单仅需 {price}。",
  whyTitle: "为什么几句话就能成就一份礼物",
  whyParagraphs: [
    "每件穆拉诺玻璃首饰都是手工制作，一颗珠子接一颗珠子，所用的玻璃来自距威尼斯仅几分钟船程的小岛。它本身就很美。但让美好的物件成为令人难忘的礼物的，是知道这是您为对方挑选的，以及为什么。",
    "这正是卡片的意义。它通过电子邮件送达，往往比包裹更早：您的话语，用您挑选的字体，顶部写着对方的名字。饰品讲述威尼斯；卡片讲述您。",
    "包装纸早已不在，卡片依然还在：点一下邮件中的链接，就能随时重新打开，正反两面都能看到。",
  ],
  lovedTitle: "为什么人们喜欢收到它",
  lovedPoints: [
    {
      title: "让这一刻更有温度",
      body: "包裹变成了一封信。对方的名字、您的名字和几句用心挑选的话，让一次网上下单变成来自您的礼物，即使它直接送到对方门口。",
    },
    {
      title: "值得珍藏",
      body: "首饰用来佩戴；卡片用来珍藏。很多人至今仍留着所爱之人写的卡片，节日早已过去，因为我们最珍惜的是那些话语。",
    },
    {
      title: "您到不了，它替您到",
      body: "生日或纪念日无法相聚？把饰品直接寄给对方。订单付款后卡片即刻送达对方邮箱，即使您不在身边，心意也能抵达。",
    },
    {
      title: "独一无二",
      body: "每张卡片都为一个订单而制作，带有您的寄语、字体、图案和所选背面。没有两张是相同的。",
    },
  ],
  forWhomTitle: "送给谁，以及可以写什么",
  forWhomIntro: "以下是一些灵感。选择我们的寄语，或借用下面的一句话，把它变成您自己的。",
  forWhom: [
    {
      who: "送给女朋友",
      body: "一条她最爱颜色的穆拉诺项链，再配一张卡片，说出您平时不常说出口的话。加一颗爱心，背面选威尼斯红，让浪漫的字体替您表达。",
      idea: "和你在一起的每一天，都有一点威尼斯的味道。",
    },
    {
      who: "送给妻子或伴侣",
      body: "为了纪念日，或者不为什么。相伴多年之后，几句真诚的话，可能比盒子里的任何东西都更珍贵。",
      idea: "十年了，你依然让一切变得更美。",
    },
    {
      who: "送给妈妈",
      body: "母亲节或她的生日：一份手工制作的礼物，来自她养育的孩子。妈妈们会珍藏卡片，所以写一张她会想要留着的。",
      idea: "谢谢你为我做的一切，那些你从未要求感谢的事。",
    },
    {
      who: "送给闺蜜",
      body: "一对姐妹手链、一个只有你们懂的梗、一声谢谢她总会接你的电话。友情很容易被视为理所当然；一张卡片告诉她，您从未这样想。",
      idea: "为了过去的每一年，也为了未来的每一年。",
    },
    {
      who: "送给姐妹",
      body: "您人生中的第一个朋友。一对她喜欢颜色的耳环，和一句只有她懂的话。",
      idea: "同样的根，不同的颜色。永远爱你。",
    },
    {
      who: "送给奶奶或外婆",
      body: "她教会您的，比她自己知道的更多。经典的衬线字体，正面一颗珍珠，还有她随时可以重读的话语。",
      idea: "我们最美的故事，都从你开始。",
    },
  ],
  ideaLabel: "灵感",
  occasionsTitle: "适合各种场合",
  occasions: ["生日", "纪念日", "情人节", "母亲节", "圣诞节与新年", "毕业", "婚礼与订婚", "表达感谢", "无需理由"],
  howTitle: "如何使用",
  howSteps: [
    {
      title: "设计卡片",
      body: "填写对方和您的名字以及对方的邮箱，选择寄语或亲自撰写，从五种字体中挑选一种，添加最多三个图案并选择背面颜色。预览即对方将看到的样子。",
    },
    {
      title: "加入订单",
      body: "卡片以 {price} 加入购物车，与您挑选的首饰一起。付款前都可以在购物车中修改。",
    },
    {
      title: "通过电子邮件发送",
      body: "订单付款后，我们会立即将卡片发送到您填写的邮箱，并附上可完整打开卡片的链接。",
    },
    {
      title: "对方打开卡片",
      body: "对方在手机或电脑上阅读您的话语，翻转卡片，并可随时再次打开。饰品随后邮寄送达。",
    },
  ],
  tipsTitle: "写寄语的小建议",
  tips: [
    "简短为好。一两句话在卡片上最好看，往往比一整段话更有力量。",
    "具体一些。一个共同去过的地方、一个昵称或一段回忆，会让这句话只属于您。",
    "说说您为什么选它。“因为蓝色是你的颜色”会让礼物更有意义。",
    "大声读一遍。如果听起来像您，那就对了。",
  ],
  faqTitle: "关于礼品卡的常见问题",
  faq: [
    {
      question: "个性化礼品卡多少钱？",
      answer: "{price}，每个订单只收一次。包括电子卡片、您的寄语、字体、最多三个图案以及背面颜色。",
    },
    {
      question: "可以写自己的寄语吗？",
      answer: "可以。选择我们的寄语或亲自撰写，最多 200 个字符，如您愿意，还可以加上收礼人和您的名字。",
    },
    {
      question: "可以添加爱心或其他小图案吗？",
      answer: "可以。最多选择三个图案（爱心、珍珠、星星、闪光、花朵或月亮），拖到卡片正面的任意位置。限制为三个，是为了让您的话语始终是主角。",
    },
    {
      question: "卡片背面是什么？",
      answer: "Perla 标志，配以您选择的颜色：象牙白、泻湖蓝绿、威尼斯红或腮红粉。",
    },
    {
      question: "卡片如何、何时送达？",
      answer: "订单付款后，通过电子邮件发送到您设计时填写的邮箱。邮件中的链接可完整打开卡片的正反两面。",
    },
    {
      question: "加入购物车后还能修改卡片吗？",
      answer: "可以。付款前，打开购物车，选择“编辑”修改任何内容，或选择“移除”将卡片从订单中删除。",
    },
    {
      question: "卡片上会显示价格吗？",
      answer: "不会。卡片上只有您的寄语、您填写的名字、您的图案和 Perla 标志。",
    },
    {
      question: "可以单独购买卡片吗？",
      answer: "不可以。电子卡片是订单的小小附加项：请先将至少一件饰品加入购物车，再添加卡片。",
    },
  ],
  ctaTitle: "准备好写下您的寄语了吗？",
  ctaBody: "设计只需一分钟，却可能被珍藏多年。",
  ctaButton: "设计您的卡片",
  shopLink: "先挑选首饰",
};

const hi: GiftCardPageContent = {
  metaTitle: "आपके संदेश वाला व्यक्तिगत उपहार कार्ड",
  metaDescription:
    "अपने मुरानो ग्लास गहनों के ऑर्डर में {price} का व्यक्तिगत डिजिटल उपहार कार्ड जोड़ें: आपका संदेश, आपका फ़ॉन्ट, छोटे दिल या मोती, ऑर्डर का भुगतान होते ही ईमेल से भेजा जाता है।",
  h1: "व्यक्तिगत उपहार कार्ड",
  lede: "आपके शब्द एक कार्ड पर, जिसे हम ऑर्डर का भुगतान होते ही ईमेल करते हैं। हमारे संदेशों में से चुनें या अपना लिखें, फ़ॉन्ट चुनें, तीन तक छोटे चिह्न जोड़ें और पीछे का रंग चुनें, सब कुछ {price} में, आपके ऑर्डर के साथ।",
  whyTitle: "कुछ शब्द उपहार को खास क्यों बनाते हैं",
  whyParagraphs: [
    "मुरानो ग्लास का हर गहना हाथ से बनाया जाता है, मनका दर मनका, वेनिस से नाव से कुछ ही मिनट दूर एक द्वीप के काँच से। यह अपने आप में सुंदर है। लेकिन किसी सुंदर चीज़ को यादगार उपहार बनाता है यह जानना कि आपने इसे उनके लिए चुना, और क्यों।",
    "कार्ड इसी के लिए है। यह ईमेल से पहुँचता है, अक्सर पार्सल से पहले: आपके शब्द, आपके चुने फ़ॉन्ट में, सबसे ऊपर उनके नाम के साथ। गहना वेनिस की बात करता है; कार्ड आपकी।",
    "और रैपिंग हटने के बहुत बाद भी कार्ड बना रहता है: ईमेल में दिए लिंक पर एक टैप से यह फिर खुल जाता है, आगे और पीछे दोनों ओर से, जब भी वे इसे पढ़ना चाहें।",
  ],
  lovedTitle: "लोग इसे पाना क्यों पसंद करते हैं",
  lovedPoints: [
    {
      title: "यह पल को निजी बनाता है",
      body: "एक पार्सल चिट्ठी बन जाता है। उनका नाम, आपका नाम और कुछ चुने हुए शब्द किसी दुकान के ऑर्डर को आपकी ओर से उपहार बना देते हैं, भले ही वह सीधे उनके दरवाज़े पर पहुँचे।",
    },
    {
      title: "यह सँभालकर रखने की चीज़ है",
      body: "गहने पहने जाते हैं; कार्ड सँभाले जाते हैं। हममें से कई लोग आज भी किसी प्रिय का कार्ड कहीं सँभालकर रखते हैं, मौका बीत जाने के बहुत बाद भी, क्योंकि शब्द ही हम सहेजते हैं।",
    },
    {
      title: "जहाँ आप नहीं पहुँच सकते, यह पहुँचता है",
      body: "जन्मदिन या सालगिरह पर दूर हैं? गहना सीधे उन्हें भेजें। ऑर्डर का भुगतान होते ही कार्ड उनके इनबॉक्स में पहुँच जाता है, ताकि आपके शब्द उन तक पहुँचें, भले आप न पहुँच सकें।",
    },
    {
      title: "यह सिर्फ़ एक बार बनता है",
      body: "हर कार्ड एक ही ऑर्डर के लिए बनता है, आपके संदेश, फ़ॉन्ट, चिह्नों और चुने हुए पीछे के रंग के साथ। कोई दो एक जैसे नहीं होते।",
    },
  ],
  forWhomTitle: "यह किसके लिए है, और आप क्या लिख सकते हैं",
  forWhomIntro: "शुरुआत के लिए कुछ विचार। हमारे संदेशों में से कोई चुनें, या नीचे से कोई पंक्ति लेकर उसे अपना बना लें।",
  forWhom: [
    {
      who: "अपनी प्रेमिका के लिए",
      body: "उसके पसंदीदा रंग का मुरानो हार, और एक कार्ड जो वह कहे जो आप हमेशा ज़ोर से नहीं कहते। एक दिल जोड़ें, पीछे के लिए वेनिशियन लाल चुनें, और एक रोमांटिक फ़ॉन्ट को बोलने दें।",
      idea: "तुम्हारे साथ हर दिन थोड़ा-सा वेनिस लगता है।",
    },
    {
      who: "अपनी पत्नी या जीवनसाथी के लिए",
      body: "सालगिरह के लिए, या बिना किसी वजह के। बरसों साथ रहने के बाद, कुछ सच्चे शब्द डिब्बे की किसी भी चीज़ से ज़्यादा मायने रख सकते हैं।",
      idea: "दस साल हो गए, और तुम आज भी सब कुछ सुंदर बना देती हो।",
    },
    {
      who: "अपनी माँ के लिए",
      body: "मदर्स डे या उनके जन्मदिन पर: हाथ से बनी कोई चीज़, उनकी पाली-पोसी संतान की ओर से। माँएँ कार्ड सँभालकर रखती हैं, तो वह कार्ड लिखें जिसे वे रखना चाहें।",
      idea: "उन सब बातों के लिए धन्यवाद, जिनके लिए तुमने कभी धन्यवाद नहीं माँगा।",
    },
    {
      who: "अपनी सबसे अच्छी सहेली के लिए",
      body: "मिलते-जुलते ब्रेसलेट, एक ऐसा मज़ाक जो सिर्फ़ आप दोनों समझें, हमेशा फ़ोन उठाने के लिए एक धन्यवाद। दोस्ती को हल्के में लेना आसान है; कार्ड बताता है कि आप ऐसा नहीं करते।",
      idea: "बीते सभी सालों के लिए, और आने वाले सभी सालों के लिए।",
    },
    {
      who: "अपनी बहन के लिए",
      body: "आपकी सबसे पहली दोस्त। उसके रंग के झुमके और एक पंक्ति जिसे सिर्फ़ वही समझेगी।",
      idea: "एक ही जड़ें, अलग-अलग रंग। हमेशा प्यार।",
    },
    {
      who: "अपनी दादी या नानी के लिए",
      body: "उन्होंने आपको जितना वे सोचती हैं, उससे ज़्यादा सिखाया है। एक क्लासिक फ़ॉन्ट, सामने एक मोती और ऐसे शब्द जिन्हें वे जब चाहें दोबारा पढ़ सकें।",
      idea: "हमारी सबसे अच्छी कहानियाँ आपसे ही शुरू होती हैं।",
    },
  ],
  ideaLabel: "विचार",
  occasionsTitle: "हर मौके के लिए",
  occasions: [
    "जन्मदिन",
    "सालगिरह",
    "वैलेंटाइन डे",
    "मदर्स डे",
    "क्रिसमस और नया साल",
    "दीक्षांत",
    "शादी और सगाई",
    "धन्यवाद कहने के लिए",
    "बस यूँ ही",
  ],
  howTitle: "यह कैसे काम करता है",
  howSteps: [
    {
      title: "इसे डिज़ाइन करें",
      body: "उनका और अपना नाम तथा उनका ईमेल जोड़ें, संदेश चुनें या अपना लिखें, पाँच में से एक फ़ॉन्ट चुनें, तीन तक चिह्न जोड़ें और पीछे का रंग चुनें। पूर्वावलोकन ठीक वही दिखाता है जो वे देखेंगे।",
    },
    {
      title: "इसे ऑर्डर में जोड़ें",
      body: "कार्ड {price} में आपकी कार्ट में जाता है, आपके चुने गहनों के साथ। भुगतान से पहले आप इसे कार्ट से बदल सकते हैं।",
    },
    {
      title: "हम इसे ईमेल करते हैं",
      body: "ऑर्डर का भुगतान होते ही हम कार्ड आपके दिए पते पर भेजते हैं, एक लिंक के साथ जो इसे पूरा खोलता है।",
    },
    {
      title: "वे इसे खोलते हैं",
      body: "वे फ़ोन या कंप्यूटर पर आपके शब्द पढ़ते हैं, कार्ड पलटते हैं और जब चाहें फिर खोल सकते हैं। गहना डाक से आता है।",
    },
  ],
  tipsTitle: "आपके संदेश के लिए कुछ सुझाव",
  tips: [
    "छोटा रखें। कार्ड पर एक या दो वाक्य सबसे अच्छे लगते हैं, और अक्सर पूरे अनुच्छेद से ज़्यादा कहते हैं।",
    "खास बनें। कोई साझा जगह, कोई प्यार का नाम या कोई याद पंक्ति को पूरी तरह आपका बना देती है।",
    "बताएँ कि आपने इसे क्यों चुना। “क्योंकि नीला तुम्हारा रंग है” उपहार को अर्थ देता है।",
    "इसे एक बार ज़ोर से पढ़ें। अगर यह आप जैसा लगे, तो यही सही है।",
  ],
  faqTitle: "उपहार कार्ड के बारे में सवाल",
  faq: [
    {
      question: "व्यक्तिगत उपहार कार्ड की कीमत क्या है?",
      answer: "{price}, प्रति ऑर्डर एक बार। इसमें डिजिटल कार्ड, आपका संदेश, फ़ॉन्ट, तीन तक चिह्न और पीछे का रंग शामिल है।",
    },
    {
      question: "क्या मैं अपना संदेश लिख सकता हूँ?",
      answer: "हाँ। हमारे संदेशों में से कोई चुनें या 200 अक्षरों तक अपना लिखें, चाहें तो पाने वाले और अपने नाम के साथ।",
    },
    {
      question: "क्या मैं दिल या दूसरे छोटे चिह्न जोड़ सकता हूँ?",
      answer: "हाँ। तीन तक चिह्न चुनें (दिल, मोती, तारा, चमक, फूल या चाँद) और उन्हें कार्ड के सामने कहीं भी खींचकर रखें। सीमा तीन है, ताकि आपके शब्द ही केंद्र में रहें।",
    },
    {
      question: "कार्ड के पीछे क्या होता है?",
      answer: "Perla का लोगो, आपके चुने रंग पर: हाथीदाँत, लैगून नीला-हरा, वेनिस लाल या हल्का गुलाबी।",
    },
    {
      question: "कार्ड कैसे और कब पहुँचता है?",
      answer: "ईमेल से, उस पते पर जो आप इसे बनाते समय दर्ज करते हैं, ऑर्डर का भुगतान होते ही। ईमेल में एक लिंक होता है जो कार्ड को आगे-पीछे पूरा खोलता है।",
    },
    {
      question: "क्या कार्ट में जोड़ने के बाद मैं कार्ड बदल सकता हूँ?",
      answer: "हाँ। भुगतान से पहले, अपनी कार्ट खोलें और कुछ भी बदलने के लिए बदलें चुनें, या कार्ड को ऑर्डर से हटाने के लिए हटाएँ चुनें।",
    },
    {
      question: "क्या कार्ड पर कीमत दिखती है?",
      answer: "नहीं। कार्ड पर सिर्फ़ आपका संदेश, आपके डाले नाम, आपके चिह्न और Perla का लोगो होता है।",
    },
    {
      question: "क्या मैं केवल कार्ड खरीद सकता/सकती हूँ?",
      answer: "नहीं। डिजिटल कार्ड ऑर्डर के साथ एक छोटा अतिरिक्त है: पहले कार्ट में कम से कम एक गहना जोड़ें, फिर कार्ड।",
    },
  ],
  ctaTitle: "अपना कार्ड लिखने के लिए तैयार हैं?",
  ctaBody: "इसे बनाने में एक मिनट लगता है, और इसे बरसों सँभाला जा सकता है।",
  ctaButton: "अपना कार्ड बनाएँ",
  shopLink: "पहले गहना चुनें",
};

const ja: GiftCardPageContent = {
  metaTitle: "名入れメッセージカード｜あなたの言葉を添えて",
  metaDescription:
    "ムラーノガラスのアクセサリーのご注文に {price} のデジタルメッセージカードを。あなたのメッセージ、書体、小さなハートやパールを添えて、お支払い後にメールでお届けします。",
  h1: "名入れメッセージカード",
  lede: "ご注文のお支払いが済みしだい、メールでお届けするカードです。メッセージを選ぶか自分で書き、書体を選び、モチーフを3つまで加え、裏面の色を選べます。ご注文に {price} で追加できます。",
  whyTitle: "ひとことが、贈り物を完成させる理由",
  whyParagraphs: [
    "ムラーノガラスのジュエリーは、ヴェネツィアから船で数分の島のガラスを使い、ひと粒ずつ手作業で形づくられます。それだけでも美しいもの。けれど、美しいものを忘れられない贈り物に変えるのは、あなたがその人のために選んだこと、そしてその理由です。",
    "そのためのカードです。メールで届き、多くの場合は荷物より先に着きます。選んだ書体で、一番上に相手の名前が入ったあなたの言葉。アクセサリーはヴェネツィアを、カードはあなたを伝えます。",
    "包み紙がなくなったずっと後も、カードは残ります。メールのリンクをタップすれば、表も裏も、読み返したいときにいつでも開けます。",
  ],
  lovedTitle: "受け取った人に喜ばれる理由",
  lovedPoints: [
    {
      title: "その瞬間が、特別になる",
      body: "小包が手紙に変わります。相手の名前、あなたの名前、そして選び抜いた言葉が、お店からの荷物をあなたからの贈り物に変えます。相手の家に直接届く場合でも。",
    },
    {
      title: "ずっと手元に残るもの",
      body: "ジュエリーは身につけるもの、カードはしまっておくもの。大切な人からのカードを、その日が過ぎてもずっと持っている人は少なくありません。心に残るのは、言葉だからです。",
    },
    {
      title: "会えない日にも、届く",
      body: "誕生日や記念日に離れていても大丈夫。アクセサリーを直接お届けし、カードはお支払い後すぐに相手のメールに届くので、会えなくても言葉は届きます。",
    },
    {
      title: "世界にひとつだけ",
      body: "どのカードもひとつのご注文のためだけに作られます。メッセージ、書体、モチーフ、裏面の色まで、同じものはありません。",
    },
  ],
  forWhomTitle: "誰に贈る？何を書く？",
  forWhomIntro:
    "書き出しのヒントをいくつか。私たちのメッセージから選ぶか、下の一文を借りて、あなたらしくアレンジしてください。",
  forWhom: [
    {
      who: "恋人へ",
      body: "彼女の好きな色のムラーノネックレスと、ふだんは口にしない気持ちを伝えるカードを。ハートを添え、裏面はヴェネツィアンレッドに。ロマンティックな書体が想いを語ってくれます。",
      idea: "あなたといる毎日は、少しだけヴェネツィアみたい。",
    },
    {
      who: "妻・パートナーへ",
      body: "結婚記念日に、あるいは理由なんてなくても。長い年月を共にした後の、正直なひとことは、箱の中のどんなものよりも心に響くことがあります。",
      idea: "10年経っても、あなたはすべてを美しくしてくれる。",
    },
    {
      who: "お母さんへ",
      body: "母の日や誕生日に。育ててくれた人へ、手仕事の贈り物を。お母さんはカードを大切にとっておくもの。とっておきたくなる一枚を。",
      idea: "感謝されることを一度も求めなかった、たくさんのことに、ありがとう。",
    },
    {
      who: "親友へ",
      body: "おそろいのブレスレット、ふたりだけの冗談、いつも電話に出てくれることへのありがとう。友情は当たり前になりがち。カードは、あなたがそう思っていないことを伝えます。",
      idea: "これまでのすべての年と、これからのすべての年に。",
    },
    {
      who: "姉妹へ",
      body: "人生で最初の友だち。彼女の色のピアスと、彼女にしかわからない一文を。",
      idea: "同じ根っこ、違う色。いつまでも大好き。",
    },
    {
      who: "おばあちゃんへ",
      body: "本人が思う以上に、たくさんのことを教えてくれた人。クラシックな書体に、表面にはパールをひとつ。いつでも読み返せる言葉を。",
      idea: "私たちのいちばん素敵な物語は、いつもあなたから始まる。",
    },
  ],
  ideaLabel: "文例",
  occasionsTitle: "あらゆるシーンに",
  occasions: ["誕生日", "記念日", "バレンタインデー", "母の日", "クリスマス", "卒業", "結婚・婚約", "感謝の気持ち", "特別な理由がなくても"],
  howTitle: "ご利用の流れ",
  howSteps: [
    {
      title: "デザインする",
      body: "相手とあなたの名前、相手のメールアドレスを入力し、メッセージを選ぶか書き、5つの書体から選び、モチーフを3つまで加え、裏面の色を選びます。プレビューの通りに届きます。",
    },
    {
      title: "ご注文に追加する",
      body: "カードは{price}でカートに入り、お選びのジュエリーと一緒にご注文いただけます。お支払いまではカートから編集できます。",
    },
    {
      title: "メールでお届け",
      body: "ご注文のお支払いが済みしだい、入力されたアドレスにカード全体を開けるリンク付きでお送りします。",
    },
    {
      title: "相手が開ける",
      body: "スマートフォンやパソコンであなたの言葉を読み、カードを裏返し、いつでも開き直せます。アクセサリーは郵送でお届けします。",
    },
  ],
  tipsTitle: "メッセージを書くコツ",
  tips: [
    "短く。カードには一、二文がいちばん美しく、段落よりも多くを伝えることがあります。",
    "具体的に。ふたりの思い出の場所、呼び名、エピソードが、その一文をあなただけのものにします。",
    "選んだ理由を添えて。「青はあなたの色だから」のひとことで、贈り物に意味が生まれます。",
    "一度声に出して読んでみて。あなたらしく聞こえたら、それで完成です。",
  ],
  faqTitle: "メッセージカードについてのよくある質問",
  faq: [
    {
      question: "名入れメッセージカードはいくらですか？",
      answer: "{price}、ご注文ごとに一度だけ。デジタルカード、メッセージ、書体、モチーフ3つまで、裏面の色が含まれます。",
    },
    {
      question: "自分でメッセージを書けますか？",
      answer: "はい。私たちのメッセージから選ぶか、200文字までご自身で書けます。ご希望なら、受け取る方とあなたのお名前も入れられます。",
    },
    {
      question: "ハートなどの小さなアイコンを入れられますか？",
      answer: "はい。ハート、パール、スター、きらめき、フラワー、ムーンから3つまで選び、カードの表面のお好きな位置にドラッグできます。言葉が主役であり続けるよう、上限は3つです。",
    },
    {
      question: "カードの裏面には何が入りますか？",
      answer: "お選びいただいた色に Perla のロゴ：アイボリー、ラグーンティール、ヴェネツィアンレッド、ブラッシュピンク。",
    },
    {
      question: "カードはいつ、どのように届きますか？",
      answer: "ご注文のお支払いが済みしだい、作成時に入力したアドレスへメールでお届けします。メールのリンクから表裏ともにカードを開けます。",
    },
    {
      question: "カートに入れた後でカードを変更できますか？",
      answer: "はい。お支払いまでは、カートを開いて「編集」で変更、「削除」でカードを注文から外せます。",
    },
    {
      question: "カードに価格は記載されますか？",
      answer: "いいえ。カードに入るのは、メッセージ、入力したお名前、モチーフ、Perla のロゴだけです。",
    },
    {
      question: "カードだけを購入できますか？",
      answer: "いいえ。デジタルカードはご注文に添える小さなオプションです。まずアクセサリーを1点以上カートに入れてから、カードを追加してください。",
    },
  ],
  ctaTitle: "あなたの言葉を書いてみませんか？",
  ctaBody: "デザインは1分ほど。そして、何年も大切にしてもらえるかもしれません。",
  ctaButton: "カードをデザインする",
  shopLink: "先にジュエリーを選ぶ",
};

const content: Record<Locale, GiftCardPageContent> = { en, it, fr, de, ar, zh, ru, es, pt, hi, ja };

export function getGiftCardPageContent(locale: Locale): GiftCardPageContent {
  return content[locale];
}
