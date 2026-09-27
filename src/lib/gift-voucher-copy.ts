import type { Locale } from "@/lib/i18n/locale-constants";

export type GiftVoucherCopy = {
  title: string;
  intro: string;
  selectAmount: string;
  buyerEmail: string;
  recipientEmail: string;
  deliveryNote: string;
  balanceTerms: string;
  formError: string;
  metaDescription: string;
  purchaseLabel: string;
  pendingTitle: string;
  pendingText: string;
  recipientLabel: string;
  senderLabel: string;
  messageLabel: string;
  codeLabel: string;
  amountLabel: string;
  remainingBalance: string;
  redeemInstruction: string;
  checkoutCode: string;
  purchaseButton: string;
  voucherApplied: string;
  emailSubject: string;
  emailTitle: string;
  emailIntro: string;
  emailCode: string;
  emailBalance: string;
  emailRedeem: string;
  emailButton: string;
};

const COPY: Record<Locale, GiftVoucherCopy> = {
  en: {
    title: "A little piece of Murano, chosen by them.",
    intro:
      "Give them the pleasure of choosing their own piece of Venetian glass, handmade in Murano.",
    selectAmount: "Choose an amount",
    buyerEmail: "Your email address",
    recipientEmail: "Recipient’s email address",
    deliveryNote: "We’ll email the voucher to its recipient as soon as your payment is confirmed.",
    balanceTerms: "No expiry date. Any remaining balance stays on the voucher for another order.",
    formError: "We couldn’t create the gift voucher. Please check the details and try again.",
    metaDescription:
      "Send a digital Perla Murano Glass gift voucher for €100, €200 or €500. Delivered by email and redeemable at checkout.",
    purchaseLabel: "Digital gift voucher",
    pendingTitle: "Your gift is almost ready",
    pendingText: "Complete payment and we’ll send the voucher code to its recipient by email.",
    recipientLabel: "Recipient",
    senderLabel: "From",
    messageLabel: "Your message",
    codeLabel: "Gift voucher code",
    amountLabel: "Voucher value",
    remainingBalance: "Remaining balance",
    redeemInstruction:
      "Enter this code in the gift voucher field at checkout. Any unused balance stays on the voucher.",
    checkoutCode: "Gift voucher code",
    purchaseButton: "Purchase this gift voucher",
    voucherApplied: "Gift voucher credit",
    emailSubject: "A Murano glass gift from {sender}",
    emailTitle: "A gift, chosen just for you",
    emailIntro: "{sender} has sent you a Perla gift voucher for {amount}.",
    emailCode: "Your gift voucher code",
    emailBalance: "Voucher value",
    emailRedeem:
      "Enter this code in the gift voucher field at checkout. If you spend less than its value, the remaining balance will stay available for another order.",
    emailButton: "Discover the collection",
  },
  it: {
    title: "Un piccolo pezzo di Murano, scelto da chi lo riceve.",
    intro:
      "Regala la libertà di scegliere il proprio gioiello in vetro veneziano, realizzato a mano a Murano.",
    selectAmount: "Scegli l’importo",
    buyerEmail: "La tua email",
    recipientEmail: "Email del destinatario",
    deliveryNote:
      "Invieremo il buono al destinatario via email appena il pagamento sarà confermato.",
    balanceTerms:
      "Senza scadenza. L’eventuale importo residuo resta disponibile per un altro ordine.",
    formError: "Non siamo riusciti a creare il buono regalo. Controlla i dati e riprova.",
    metaDescription:
      "Regala un buono digitale Perla Murano Glass da 100 €, 200 € o 500 €. Arriva via email e si usa al checkout.",
    purchaseLabel: "Buono regalo digitale",
    pendingTitle: "Il tuo regalo è quasi pronto",
    pendingText: "Completa il pagamento e invieremo il codice al destinatario via email.",
    recipientLabel: "Destinatario",
    senderLabel: "Da parte di",
    messageLabel: "Il tuo messaggio",
    codeLabel: "Codice del buono regalo",
    amountLabel: "Valore del buono",
    remainingBalance: "Credito residuo",
    redeemInstruction:
      "Inserisci il codice nel campo buono regalo al checkout. L’eventuale credito residuo resta disponibile.",
    checkoutCode: "Codice del buono regalo",
    purchaseButton: "Acquista questo buono regalo",
    voucherApplied: "Credito del buono regalo",
    emailSubject: "Un regalo in vetro di Murano da {sender}",
    emailTitle: "Un regalo scelto proprio per te",
    emailIntro: "{sender} ti ha inviato un buono regalo Perla del valore di {amount}.",
    emailCode: "Il codice del tuo buono regalo",
    emailBalance: "Valore del buono",
    emailRedeem:
      "Inserisci il codice nel campo buono regalo al checkout. Se spendi meno del valore, il credito residuo resta disponibile per un altro ordine.",
    emailButton: "Scopri la collezione",
  },
  fr: {
    title: "Un petit morceau de Murano, à choisir soi-même.",
    intro:
      "Offrez-lui la liberté de choisir son bijou en verre vénitien, façonné à la main à Murano.",
    selectAmount: "Choisir un montant",
    buyerEmail: "Votre adresse e-mail",
    recipientEmail: "Adresse e-mail du destinataire",
    deliveryNote: "Nous enverrons le bon par e-mail dès confirmation du paiement.",
    balanceTerms:
      "Sans date d’expiration. Le solde restant pourra servir pour une prochaine commande.",
    formError: "Impossible de créer le bon cadeau. Vérifiez les informations puis réessayez.",
    metaDescription:
      "Offrez un bon cadeau numérique Perla Murano Glass de 100 €, 200 € ou 500 €, envoyé par e-mail et utilisable au paiement.",
    purchaseLabel: "Bon cadeau numérique",
    pendingTitle: "Votre cadeau est presque prêt",
    pendingText: "Après le paiement, nous enverrons le code au destinataire par e-mail.",
    recipientLabel: "Destinataire",
    senderLabel: "De la part de",
    messageLabel: "Votre message",
    codeLabel: "Code du bon cadeau",
    amountLabel: "Valeur du bon",
    remainingBalance: "Solde restant",
    redeemInstruction:
      "Saisissez ce code dans le champ bon cadeau au paiement. Le solde restant reste disponible.",
    checkoutCode: "Code du bon cadeau",
    purchaseButton: "Acheter ce bon cadeau",
    voucherApplied: "Crédit du bon cadeau",
    emailSubject: "Un cadeau en verre de Murano de la part de {sender}",
    emailTitle: "Un cadeau choisi rien que pour vous",
    emailIntro: "{sender} vous a envoyé un bon cadeau Perla de {amount}.",
    emailCode: "Votre code cadeau",
    emailBalance: "Valeur du bon",
    emailRedeem:
      "Saisissez ce code dans le champ bon cadeau au paiement. Le solde non utilisé restera disponible pour une prochaine commande.",
    emailButton: "Découvrir la collection",
  },
  de: {
    title: "Ein kleines Stück Murano, selbst ausgewählt.",
    intro:
      "Schenke die Freude, ein handgefertigtes Schmuckstück aus venezianischem Glas selbst auszuwählen.",
    selectAmount: "Betrag auswählen",
    buyerEmail: "Deine E-Mail-Adresse",
    recipientEmail: "E-Mail-Adresse des Empfängers",
    deliveryNote: "Wir senden den Gutschein per E-Mail, sobald deine Zahlung bestätigt ist.",
    balanceTerms: "Ohne Ablaufdatum. Ein Restguthaben bleibt für eine weitere Bestellung erhalten.",
    formError:
      "Der Geschenkgutschein konnte nicht erstellt werden. Bitte prüfe die Angaben und versuche es erneut.",
    metaDescription:
      "Digitaler Perla Murano Glass Gutschein über 100 €, 200 € oder 500 €, per E-Mail zugestellt und an der Kasse einlösbar.",
    purchaseLabel: "Digitaler Geschenkgutschein",
    pendingTitle: "Dein Geschenk ist fast fertig",
    pendingText:
      "Nach Abschluss der Zahlung senden wir den Gutscheincode per E-Mail an den Empfänger.",
    recipientLabel: "Empfänger",
    senderLabel: "Von",
    messageLabel: "Deine Nachricht",
    codeLabel: "Gutscheincode",
    amountLabel: "Gutscheinwert",
    remainingBalance: "Restguthaben",
    redeemInstruction:
      "Gib diesen Code an der Kasse im Gutschein-Feld ein. Restguthaben bleibt verfügbar.",
    checkoutCode: "Gutscheincode",
    purchaseButton: "Diesen Gutschein kaufen",
    voucherApplied: "Gutscheinguthaben",
    emailSubject: "Ein Geschenk aus Murano-Glas von {sender}",
    emailTitle: "Ein Geschenk, nur für dich ausgewählt",
    emailIntro: "{sender} hat dir einen Perla-Gutschein im Wert von {amount} gesendet.",
    emailCode: "Dein Gutscheincode",
    emailBalance: "Gutscheinwert",
    emailRedeem:
      "Gib diesen Code an der Kasse im Gutschein-Feld ein. Nicht verwendetes Guthaben bleibt für eine weitere Bestellung verfügbar.",
    emailButton: "Kollektion entdecken",
  },
  ar: {
    title: "قطعة صغيرة من مورانو، تختارها بنفسك.",
    intro: "امنحهم متعة اختيار قطعة مجوهرات من زجاج البندقية، مصنوعة يدويًا في مورانو.",
    selectAmount: "اختر القيمة",
    buyerEmail: "بريدك الإلكتروني",
    recipientEmail: "البريد الإلكتروني للمستلم",
    deliveryNote: "سنرسل القسيمة إلى المستلم عبر البريد الإلكتروني بعد تأكيد الدفع.",
    balanceTerms: "لا يوجد تاريخ انتهاء. يبقى أي رصيد متبقٍ متاحًا لطلب آخر.",
    formError: "تعذر إنشاء قسيمة الهدية. تحقق من البيانات وحاول مرة أخرى.",
    metaDescription:
      "قسيمة هدية رقمية من Perla Murano Glass بقيمة 100 أو 200 أو 500 يورو، تصل بالبريد الإلكتروني وتُستخدم عند الدفع.",
    purchaseLabel: "قسيمة هدية رقمية",
    pendingTitle: "أصبحت هديتك جاهزة تقريبًا",
    pendingText: "أكمل الدفع وسنرسل الرمز إلى المستلم عبر البريد الإلكتروني.",
    recipientLabel: "المستلم",
    senderLabel: "من",
    messageLabel: "رسالتك",
    codeLabel: "رمز قسيمة الهدية",
    amountLabel: "قيمة القسيمة",
    remainingBalance: "الرصيد المتبقي",
    redeemInstruction:
      "أدخل هذا الرمز في خانة قسيمة الهدية عند الدفع. يبقى أي رصيد غير مستخدم متاحًا.",
    checkoutCode: "رمز قسيمة الهدية",
    purchaseButton: "اشترِ قسيمة الهدية",
    voucherApplied: "رصيد قسيمة الهدية",
    emailSubject: "هدية من زجاج مورانو من {sender}",
    emailTitle: "هدية اختيرت لك وحدك",
    emailIntro: "أرسل لك {sender} قسيمة هدية من Perla بقيمة {amount}.",
    emailCode: "رمز قسيمة هديتك",
    emailBalance: "قيمة القسيمة",
    emailRedeem:
      "أدخل هذا الرمز في خانة قسيمة الهدية عند الدفع. يبقى الرصيد غير المستخدم متاحًا لطلب آخر.",
    emailButton: "اكتشف المجموعة",
  },
  zh: {
    title: "一份穆拉诺心意，由你亲自挑选。",
    intro: "赠予对方挑选威尼斯玻璃珠宝的自由，每件作品均在穆拉诺手工制作。",
    selectAmount: "选择金额",
    buyerEmail: "你的电子邮箱",
    recipientEmail: "收件人的电子邮箱",
    deliveryNote: "付款确认后，我们会通过电子邮件将礼品卡发送给收件人。",
    balanceTerms: "无有效期。未使用的余额可留待下次订单使用。",
    formError: "无法创建礼品卡。请检查信息后重试。",
    metaDescription:
      "赠送 €100、€200 或 €500 的 Perla Murano Glass 电子礼品卡，付款后通过电子邮件送达，可在结账时使用。",
    purchaseLabel: "电子礼品卡",
    pendingTitle: "礼物即将准备好",
    pendingText: "完成付款后，我们会通过电子邮件将礼品卡代码发送给收件人。",
    recipientLabel: "收件人",
    senderLabel: "赠送人",
    messageLabel: "你的留言",
    codeLabel: "礼品卡代码",
    amountLabel: "礼品卡金额",
    remainingBalance: "剩余余额",
    redeemInstruction: "结账时在礼品卡栏输入此代码。未使用的余额会保留供下次订单使用。",
    checkoutCode: "礼品卡代码",
    purchaseButton: "购买这张礼品卡",
    voucherApplied: "礼品卡余额",
    emailSubject: "来自 {sender} 的穆拉诺玻璃礼物",
    emailTitle: "一份专为你挑选的礼物",
    emailIntro: "{sender} 送给你一张价值 {amount} 的 Perla 礼品卡。",
    emailCode: "你的礼品卡代码",
    emailBalance: "礼品卡金额",
    emailRedeem: "结账时在礼品卡栏输入此代码。未使用的余额会保留供下次订单使用。",
    emailButton: "探索系列",
  },
  ru: {
    title: "Частичка Мурано, которую можно выбрать самому.",
    intro: "Подарите возможность выбрать украшение из венецианского стекла ручной работы с Мурано.",
    selectAmount: "Выберите сумму",
    buyerEmail: "Ваш адрес электронной почты",
    recipientEmail: "Электронная почта получателя",
    deliveryNote:
      "После подтверждения оплаты мы отправим сертификат получателю по электронной почте.",
    balanceTerms: "Без срока действия. Остаток можно использовать для следующего заказа.",
    formError: "Не удалось создать подарочный сертификат. Проверьте данные и попробуйте ещё раз.",
    metaDescription:
      "Электронный подарочный сертификат Perla Murano Glass на 100, 200 или 500 евро. Доставка по электронной почте, оплата сертификатом при оформлении заказа.",
    purchaseLabel: "Электронный подарочный сертификат",
    pendingTitle: "Ваш подарок почти готов",
    pendingText: "После оплаты мы отправим код сертификата получателю по электронной почте.",
    recipientLabel: "Получатель",
    senderLabel: "От кого",
    messageLabel: "Ваше сообщение",
    codeLabel: "Код подарочного сертификата",
    amountLabel: "Номинал сертификата",
    remainingBalance: "Остаток средств",
    redeemInstruction:
      "Введите код в поле подарочного сертификата при оформлении заказа. Неиспользованный остаток сохранится.",
    checkoutCode: "Код подарочного сертификата",
    purchaseButton: "Купить подарочный сертификат",
    voucherApplied: "Средства сертификата",
    emailSubject: "Подарок из муранского стекла от {sender}",
    emailTitle: "Подарок, выбранный специально для вас",
    emailIntro: "{sender} отправил вам подарочный сертификат Perla на сумму {amount}.",
    emailCode: "Ваш код подарочного сертификата",
    emailBalance: "Номинал сертификата",
    emailRedeem:
      "Введите код в поле подарочного сертификата при оформлении заказа. Неиспользованный остаток останется доступен для следующего заказа.",
    emailButton: "Открыть коллекцию",
  },
  es: {
    title: "Un pedacito de Murano, para elegirlo a su gusto.",
    intro: "Regala la libertad de elegir una joya de cristal veneciano, hecha a mano en Murano.",
    selectAmount: "Elige un importe",
    buyerEmail: "Tu correo electrónico",
    recipientEmail: "Correo electrónico del destinatario",
    deliveryNote: "Enviaremos el vale por correo electrónico cuando se confirme el pago.",
    balanceTerms: "Sin fecha de caducidad. El saldo restante se conserva para otro pedido.",
    formError: "No se pudo crear el vale regalo. Revisa los datos e inténtalo de nuevo.",
    metaDescription:
      "Regala un vale digital Perla Murano Glass de 100 €, 200 € o 500 €, enviado por correo electrónico y canjeable al pagar.",
    purchaseLabel: "Vale regalo digital",
    pendingTitle: "Tu regalo está casi listo",
    pendingText:
      "Cuando se confirme el pago, enviaremos el código al destinatario por correo electrónico.",
    recipientLabel: "Destinatario",
    senderLabel: "De parte de",
    messageLabel: "Tu mensaje",
    codeLabel: "Código del vale regalo",
    amountLabel: "Valor del vale",
    remainingBalance: "Saldo restante",
    redeemInstruction:
      "Introduce el código en el campo de vale regalo al pagar. El saldo no utilizado se conserva.",
    checkoutCode: "Código del vale regalo",
    purchaseButton: "Comprar este vale regalo",
    voucherApplied: "Crédito del vale regalo",
    emailSubject: "Un regalo de cristal de Murano de parte de {sender}",
    emailTitle: "Un regalo elegido solo para ti",
    emailIntro: "{sender} te ha enviado un vale regalo Perla por valor de {amount}.",
    emailCode: "Tu código de regalo",
    emailBalance: "Valor del vale",
    emailRedeem:
      "Introduce el código en el campo de vale regalo al pagar. El saldo no utilizado seguirá disponible para otro pedido.",
    emailButton: "Descubrir la colección",
  },
  pt: {
    title: "Um pedacinho de Murano, para escolher ao seu gosto.",
    intro: "Ofereça a liberdade de escolher uma joia de vidro veneziano, feita à mão em Murano.",
    selectAmount: "Escolha um valor",
    buyerEmail: "O seu e-mail",
    recipientEmail: "E-mail de quem recebe",
    deliveryNote: "Enviaremos o vale por e-mail assim que o pagamento for confirmado.",
    balanceTerms: "Sem validade. O saldo restante fica disponível para outra encomenda.",
    formError: "Não foi possível criar o vale-oferta. Verifique os dados e tente novamente.",
    metaDescription:
      "Ofereça um vale digital Perla Murano Glass de 100 €, 200 € ou 500 €, enviado por e-mail e utilizável no checkout.",
    purchaseLabel: "Vale-oferta digital",
    pendingTitle: "A sua prenda está quase pronta",
    pendingText: "Após a confirmação do pagamento, enviaremos o código a quem recebe por e-mail.",
    recipientLabel: "Destinatário",
    senderLabel: "De",
    messageLabel: "A sua mensagem",
    codeLabel: "Código do vale-oferta",
    amountLabel: "Valor do vale",
    remainingBalance: "Saldo restante",
    redeemInstruction:
      "Introduza este código no campo de vale-oferta no checkout. O saldo não utilizado fica disponível.",
    checkoutCode: "Código do vale-oferta",
    purchaseButton: "Comprar este vale-presente",
    voucherApplied: "Crédito do vale-oferta",
    emailSubject: "Uma prenda em vidro de Murano de {sender}",
    emailTitle: "Uma prenda escolhida só para si",
    emailIntro: "{sender} enviou-lhe um vale-oferta Perla no valor de {amount}.",
    emailCode: "O seu código de oferta",
    emailBalance: "Valor do vale",
    emailRedeem:
      "Introduza este código no campo de vale-oferta no checkout. O saldo não utilizado ficará disponível para outra encomenda.",
    emailButton: "Descobrir a coleção",
  },
  hi: {
    title: "मुरानो का एक खूबसूरत एहसास, जिसे वे खुद चुनें।",
    intro: "उन्हें मुरानो में हाथ से बने वेनिस ग्लास के आभूषण को चुनने की खुशी दें।",
    selectAmount: "राशि चुनें",
    buyerEmail: "आपका ईमेल पता",
    recipientEmail: "प्राप्तकर्ता का ईमेल पता",
    deliveryNote: "भुगतान की पुष्टि होते ही हम वाउचर प्राप्तकर्ता को ईमेल करेंगे।",
    balanceTerms: "कोई समाप्ति तिथि नहीं। बची हुई राशि अगले ऑर्डर के लिए उपलब्ध रहेगी।",
    formError: "गिफ्ट वाउचर नहीं बन सका। विवरण जाँचकर फिर कोशिश करें।",
    metaDescription:
      "€100, €200 या €500 का Perla Murano Glass डिजिटल गिफ्ट वाउचर दें। ईमेल से पहुँचे और चेकआउट पर इस्तेमाल करें।",
    purchaseLabel: "डिजिटल गिफ्ट वाउचर",
    pendingTitle: "आपका उपहार लगभग तैयार है",
    pendingText: "भुगतान पूरा होने पर हम वाउचर कोड प्राप्तकर्ता को ईमेल करेंगे।",
    recipientLabel: "प्राप्तकर्ता",
    senderLabel: "की ओर से",
    messageLabel: "आपका संदेश",
    codeLabel: "गिफ्ट वाउचर कोड",
    amountLabel: "वाउचर मूल्य",
    remainingBalance: "बची हुई राशि",
    redeemInstruction:
      "चेकआउट पर गिफ्ट वाउचर फ़ील्ड में यह कोड डालें। बची हुई राशि आगे के लिए सुरक्षित रहेगी।",
    checkoutCode: "गिफ्ट वाउचर कोड",
    purchaseButton: "यह गिफ्ट वाउचर खरीदें",
    voucherApplied: "गिफ्ट वाउचर क्रेडिट",
    emailSubject: "{sender} की ओर से मुरानो ग्लास का उपहार",
    emailTitle: "सिर्फ आपके लिए चुना गया उपहार",
    emailIntro: "{sender} ने आपको {amount} का Perla गिफ्ट वाउचर भेजा है।",
    emailCode: "आपका गिफ्ट वाउचर कोड",
    emailBalance: "वाउचर मूल्य",
    emailRedeem:
      "चेकआउट पर गिफ्ट वाउचर फ़ील्ड में यह कोड डालें। उपयोग न की गई राशि अगले ऑर्डर के लिए उपलब्ध रहेगी।",
    emailButton: "कलेक्शन देखें",
  },
  ja: {
    title: "ムラーノの小さな贈り物を、お好きなように。",
    intro: "ムラーノで手作りされたヴェネツィアンガラスのジュエリーを選ぶ楽しみを贈りましょう。",
    selectAmount: "金額を選ぶ",
    buyerEmail: "あなたのメールアドレス",
    recipientEmail: "受取人のメールアドレス",
    deliveryNote: "お支払い確認後、ギフトカードを受取人へメールでお送りします。",
    balanceTerms: "有効期限はありません。残高は次回のご注文にもご利用いただけます。",
    formError: "ギフトカードを作成できませんでした。内容をご確認のうえ、もう一度お試しください。",
    metaDescription:
      "€100、€200、€500から選べるPerla Murano Glassのデジタルギフトカード。メールで届き、チェックアウトでご利用いただけます。",
    purchaseLabel: "デジタルギフトカード",
    pendingTitle: "ギフトの準備ができました",
    pendingText: "お支払い完了後、受取人にコードをメールでお送りします。",
    recipientLabel: "受取人",
    senderLabel: "贈り主",
    messageLabel: "メッセージ",
    codeLabel: "ギフトカードコード",
    amountLabel: "ギフトカード金額",
    remainingBalance: "残高",
    redeemInstruction:
      "チェックアウトのギフトカード欄にコードを入力してください。残高は次回にも使えます。",
    checkoutCode: "ギフトカードコード",
    purchaseButton: "ギフトカードを購入する",
    voucherApplied: "ギフトカード残高",
    emailSubject: "{sender}からムラーノガラスの贈り物",
    emailTitle: "あなたのために選ばれた贈り物",
    emailIntro: "{sender}から{amount}分のPerlaギフトカードが届きました。",
    emailCode: "ギフトカードコード",
    emailBalance: "ギフトカード金額",
    emailRedeem:
      "チェックアウトのギフトカード欄にコードを入力してください。使い切らなかった残高は次回のご注文にご利用いただけます。",
    emailButton: "コレクションを見る",
  },
};

export function getGiftVoucherCopy(locale: Locale): GiftVoucherCopy {
  return COPY[locale];
}
