import type { Locale } from "@/lib/i18n/locale-constants";

const en = {
  request: "Withdraw from this contract here",
  confirm: "Confirm withdrawal",
  name: "Full name",
  email: "Email for confirmation",
  reason: "Additional information (optional)",
  invalid:
    "Enter your name, a valid confirmation email and no more than 2,000 characters of additional information.",
  submitted: "Your withdrawal has been recorded.",
  download: "Download withdrawal receipt",
  emailFailed:
    "The confirmation email could not be sent. Download your receipt and keep it as proof. Your withdrawal is still recorded.",
  subject: "Withdrawal receipt",
  statement: "I hereby withdraw from the contract for the following order:",
};
const it: typeof en = {
  request: "Recedere dal contratto qui",
  confirm: "Conferma recesso",
  name: "Nome e cognome",
  email: "Email per la conferma",
  reason: "Informazioni aggiuntive (facoltative)",
  invalid:
    "Inserisci nome e cognome, un'email valida per la conferma e al massimo 2.000 caratteri di informazioni aggiuntive.",
  submitted: "La tua dichiarazione di recesso è stata registrata.",
  download: "Scarica la ricevuta di recesso",
  emailFailed:
    "Non è stato possibile inviare l'email di conferma. Scarica e conserva la ricevuta come prova. Il recesso è comunque registrato.",
  subject: "Ricevuta di recesso",
  statement: "Comunico il recesso dal contratto relativo al seguente ordine:",
};
const fr: typeof en = {
  request: "Exercer mon droit de rétractation",
  confirm: "Confirmer la rétractation",
  name: "Nom complet",
  email: "Adresse e-mail de confirmation",
  reason: "Informations complémentaires (facultatif)",
  invalid:
    "Saisissez votre nom, une adresse e-mail valide pour la confirmation et au maximum 2 000 caractères d’informations complémentaires.",
  submitted: "Votre demande de rétractation a bien été enregistrée.",
  download: "Télécharger le reçu de rétractation",
  emailFailed:
    "L’e-mail de confirmation n’a pas pu être envoyé. Téléchargez et conservez votre reçu comme justificatif. Votre demande reste enregistrée.",
  subject: "Reçu de rétractation",
  statement: "Je vous informe par la présente de ma rétractation du contrat portant sur la commande suivante :",
};
const de: typeof en = {
  request: "Vertrag hier widerrufen",
  confirm: "Widerruf bestätigen",
  name: "Vor- und Nachname",
  email: "E-Mail-Adresse für die Bestätigung",
  reason: "Zusätzliche Angaben (optional)",
  invalid:
    "Geben Sie Ihren Namen, eine gültige E-Mail-Adresse für die Bestätigung und höchstens 2.000 Zeichen an zusätzlichen Informationen ein.",
  submitted: "Ihr Widerruf wurde registriert.",
  download: "Widerrufsbestätigung herunterladen",
  emailFailed:
    "Die Bestätigungs-E-Mail konnte nicht gesendet werden. Laden Sie die Bestätigung herunter und bewahren Sie sie als Nachweis auf. Ihr Widerruf ist trotzdem registriert.",
  subject: "Widerrufsbestätigung",
  statement: "Hiermit widerrufe ich den Vertrag über die folgende Bestellung:",
};
const es: typeof en = {
  request: "Ejercer aquí el derecho de desistimiento",
  confirm: "Confirmar el desistimiento",
  name: "Nombre y apellidos",
  email: "Correo electrónico de confirmación",
  reason: "Información adicional (opcional)",
  invalid:
    "Introduce tu nombre, un correo electrónico válido para la confirmación y un máximo de 2.000 caracteres de información adicional.",
  submitted: "Hemos registrado tu desistimiento.",
  download: "Descargar el justificante de desistimiento",
  emailFailed:
    "No se ha podido enviar el correo de confirmación. Descarga y guarda el justificante. Tu desistimiento sigue registrado.",
  subject: "Justificante de desistimiento",
  statement: "Por la presente, desisto del contrato correspondiente al siguiente pedido:",
};
const ar: typeof en = {
  request: "مارس حق الانسحاب من العقد هنا",
  confirm: "تأكيد الانسحاب",
  name: "الاسم الكامل",
  email: "البريد الإلكتروني للتأكيد",
  reason: "معلومات إضافية (اختيارية)",
  invalid:
    "أدخل اسمك وعنوان بريد إلكتروني صالحًا للتأكيد، واكتب معلومات إضافية لا تتجاوز 2,000 حرف.",
  submitted: "تم تسجيل طلب انسحابك.",
  download: "تنزيل إيصال الانسحاب",
  emailFailed:
    "تعذّر إرسال رسالة التأكيد. نزّل الإيصال واحتفظ به كإثبات. لا يزال طلب انسحابك مسجّلًا.",
  subject: "إيصال الانسحاب",
  statement: "أعلن بموجب هذا انسحابي من العقد المتعلق بالطلب التالي:",
};
const ja: typeof en = {
  request: "こちらから契約を撤回する",
  confirm: "契約の撤回を確定する",
  name: "氏名",
  email: "確認用メールアドレス",
  reason: "追加情報（任意）",
  invalid:
    "氏名、有効な確認用メールアドレス、2,000文字以内の追加情報を入力してください。",
  submitted: "契約の撤回を受け付けました。",
  download: "撤回の受付確認書をダウンロード",
  emailFailed:
    "確認メールを送信できませんでした。確認書をダウンロードして証明として保管してください。撤回手続きは受け付け済みです。",
  subject: "撤回の受付確認書",
  statement: "以下の注文に関する契約を撤回します。",
};
const hi: typeof en = {
  request: "यहाँ अनुबंध से पीछे हटें",
  confirm: "वापसी की पुष्टि करें",
  name: "पूरा नाम",
  email: "पुष्टि के लिए ईमेल",
  reason: "अतिरिक्त जानकारी (वैकल्पिक)",
  invalid:
    "अपना नाम, पुष्टि के लिए मान्य ईमेल पता और अधिकतम 2,000 अक्षरों की अतिरिक्त जानकारी दर्ज करें।",
  submitted: "आपकी वापसी का अनुरोध दर्ज कर लिया गया है।",
  download: "वापसी की रसीद डाउनलोड करें",
  emailFailed:
    "पुष्टि वाला ईमेल नहीं भेजा जा सका। अपनी रसीद डाउनलोड करके प्रमाण के रूप में संभालकर रखें। आपका अनुरोध दर्ज है।",
  subject: "वापसी की रसीद",
  statement: "मैं निम्नलिखित ऑर्डर के अनुबंध से पीछे हटने की सूचना देता/देती हूँ:",
};
const zh: typeof en = {
  request: "在此撤回合同",
  confirm: "确认撤回",
  name: "姓名",
  email: "用于接收确认信息的电子邮箱",
  reason: "补充说明（选填）",
  invalid: "请输入姓名、有效的确认邮箱，并将补充说明控制在 2,000 个字符以内。",
  submitted: "您的撤回申请已登记。",
  download: "下载撤回凭证",
  emailFailed:
    "确认邮件未能发送。请下载并保存凭证作为证明。您的撤回申请仍已登记。",
  subject: "撤回凭证",
  statement: "本人特此撤回与以下订单相关的合同：",
};
const ru: typeof en = {
  request: "Отказаться от договора здесь",
  confirm: "Подтвердить отказ",
  name: "Имя и фамилия",
  email: "Электронная почта для подтверждения",
  reason: "Дополнительная информация (необязательно)",
  invalid:
    "Укажите имя, действующий адрес электронной почты для подтверждения и не более 2 000 символов дополнительной информации.",
  submitted: "Ваш отказ зарегистрирован.",
  download: "Скачать подтверждение отказа",
  emailFailed:
    "Не удалось отправить письмо с подтверждением. Скачайте подтверждение и сохраните его. Ваш отказ всё равно зарегистрирован.",
  subject: "Подтверждение отказа",
  statement: "Настоящим я отказываюсь от договора по следующему заказу:",
};
const nl: typeof en = {
  request: "Herroep hier de overeenkomst",
  confirm: "Herroeping bevestigen",
  name: "Volledige naam",
  email: "E-mailadres voor bevestiging",
  reason: "Aanvullende informatie (optioneel)",
  invalid:
    "Vul uw naam en een geldig e-mailadres voor de bevestiging in. Aanvullende informatie mag maximaal 2.000 tekens bevatten.",
  submitted: "Uw herroeping is geregistreerd.",
  download: "Herroepingsbewijs downloaden",
  emailFailed:
    "De bevestigingsmail kon niet worden verzonden. Download uw bewijs en bewaar het. Uw herroeping is wel geregistreerd.",
  subject: "Herroepingsbewijs",
  statement: "Hierbij herroep ik de overeenkomst voor de volgende bestelling:",
};
const pl: typeof en = {
  request: "Skorzystaj tutaj z prawa odstąpienia od umowy",
  confirm: "Potwierdź odstąpienie",
  name: "Imię i nazwisko",
  email: "Adres e-mail do potwierdzenia",
  reason: "Dodatkowe informacje (opcjonalnie)",
  invalid: "Podaj imię i nazwisko, prawidłowy adres e-mail do potwierdzenia oraz nie więcej niż 2000 znaków dodatkowych informacji.",
  submitted: "Oświadczenie o odstąpieniu zostało zarejestrowane.",
  download: "Pobierz potwierdzenie odstąpienia",
  emailFailed: "Nie udało się wysłać wiadomości z potwierdzeniem. Pobierz potwierdzenie i zachowaj je jako dowód. Odstąpienie zostało zarejestrowane.",
  subject: "Potwierdzenie odstąpienia",
  statement: "Niniejszym odstępuję od umowy dotyczącej następującego zamówienia:",
};
const cs: typeof en = { request: "Zde odstoupit od smlouvy", confirm: "Potvrdit odstoupení", name: "Jméno a příjmení", email: "E-mail pro potvrzení", reason: "Doplňující informace (volitelné)", invalid: "Zadejte jméno a příjmení, platný e-mail pro potvrzení a nejvýše 2 000 znaků doplňujících informací.", submitted: "Vaše odstoupení od smlouvy bylo zaznamenáno.", download: "Stáhnout potvrzení o odstoupení", emailFailed: "Potvrzovací e-mail se nepodařilo odeslat. Stáhněte si potvrzení a uschovejte ho. Vaše odstoupení je přesto zaznamenáno.", subject: "Potvrzení o odstoupení", statement: "Tímto odstupuji od smlouvy vztahující se k následující objednávce:" };
const sv: typeof en = { request: "Ångra avtalet här", confirm: "Bekräfta ånger", name: "Fullständigt namn", email: "E-postadress för bekräftelse", reason: "Ytterligare information (valfritt)", invalid: "Ange ditt namn, en giltig e-postadress för bekräftelse och högst 2 000 tecken med ytterligare information.", submitted: "Ditt meddelande om ångerrätt har registrerats.", download: "Ladda ned bekräftelse på ångerrätt", emailFailed: "Bekräftelsemejlet kunde inte skickas. Ladda ned bekräftelsen och spara den som underlag. Din ångerrätt har ändå registrerats.", subject: "Bekräftelse på ångerrätt", statement: "Jag frånträder härmed avtalet för följande beställning:" };
const ro: typeof en = { request: "Retrage din contract aici", confirm: "Confirmă retragerea", name: "Numele complet", email: "Adresa de e-mail pentru confirmare", reason: "Informații suplimentare (opțional)", invalid: "Introdu numele, o adresă de e-mail validă pentru confirmare și cel mult 2.000 de caractere de informații suplimentare.", submitted: "Retragerea din contract a fost înregistrată.", download: "Descarcă dovada retragerii", emailFailed: "E-mailul de confirmare nu a putut fi trimis. Descarcă dovada și păstreaz-o. Retragerea ta a fost totuși înregistrată.", subject: "Confirmarea retragerii", statement: "Prin prezenta, mă retrag din contractul aferent următoarei comenzi:" };
export function withdrawalCopy(locale: Locale | string | null) {
  return locale === "it"
    ? it
    : locale === "fr"
      ? fr
      : locale === "de"
        ? de
      : locale === "es"
        ? es
        : locale === "ar"
          ? ar
          : locale === "ja"
            ? ja
        : locale === "hi"
          ? hi
          : locale === "zh"
            ? zh
            : locale === "ru"
              ? ru
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
