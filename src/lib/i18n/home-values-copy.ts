import type { Locale } from "@/lib/i18n/locale-constants";
import type { FaqItem } from "@/lib/faq";

/**
 * The home page's first two questions: why buy here, and what to expect from
 * glass. Facts only: Perla chooses its pieces (it does not make all of them),
 * so nothing here claims hand production; the gift box, shipping and 14-day
 * returns are stated elsewhere on the site too.
 * English, Italian, French, German, Spanish, Arabic, Hindi, Japanese, Simplified Chinese, Russian, Dutch, Polish, Czech, Swedish and Romanian.
 */
const COPY = {
  en: [
    {
      id: "why-us",
      question: "Why choose Perla?",
      answer:
        "Because we choose every piece ourselves, looking at the colour of the glass, how it sits when worn and how well it is finished. Every order arrives in our gift box, shipping is free across Italy and Europe, and you have 14 days to change your mind.",
    },
    {
      id: "unique",
      question: "Will my piece look exactly like the photo?",
      answer:
        "Very close, though not always identical. Glass beads vary slightly in shade and detail from one to the next, so two necklaces of the same design can differ a little.",
    },
  ],
  it: [
    {
      id: "why-us",
      question: "Perché scegliere Perla?",
      answer:
        "Perché ogni gioiello lo scegliamo noi, guardando il colore del vetro, come si porta e la cura delle finiture. Ogni ordine arriva nella nostra confezione regalo, la spedizione è gratuita in Italia e in Europa e hai 14 giorni per cambiare idea.",
    },
    {
      id: "unique",
      question: "Il mio gioiello sarà identico alla foto?",
      answer:
        "Molto simile, anche se non sempre identico. Le perle di vetro cambiano leggermente di tono e di dettagli l'una dall'altra, quindi due collane dello stesso modello possono differire un poco.",
    },
  ],
  es: [
    {
      id: "why-us",
      question: "¿Por qué elegir Perla?",
      answer:
        "Porque seleccionamos cada joya personalmente y nos fijamos en el color del vidrio, cómo queda puesta y la calidad de los acabados. Cada pedido llega en nuestra caja de regalo, el envío es gratuito en Italia y Europa y tienes 14 días para cambiar de opinión.",
    },
    {
      id: "unique",
      question: "¿Mi joya será exactamente igual que en la foto?",
      answer:
        "Muy parecida, aunque no siempre idéntica. Las cuentas de vidrio pueden variar ligeramente en el tono y los detalles, por eso dos collares del mismo diseño pueden ser algo distintos.",
    },
  ],
  ar: [
    {
      id: "why-us",
      question: "لماذا تختار Perla؟",
      answer:
        "لأننا نختار كل قطعة بأنفسنا، مع مراعاة لون الزجاج وكيف تبدو عند ارتدائها وجودة تشطيبها. يصل كل طلب في علبة الهدايا الخاصة بنا، والشحن مجاني في إيطاليا وأوروبا، ولديك 14 يومًا لتغيير رأيك.",
    },
    {
      id: "unique",
      question: "هل ستبدو قطعتي مطابقة تمامًا للصورة؟",
      answer:
        "ستكون قريبة جدًا، لكنها ليست مطابقة دائمًا. تختلف خرزات الزجاج قليلًا في درجات اللون والتفاصيل، لذلك قد يختلف عقدان من التصميم نفسه اختلافًا بسيطًا.",
    },
  ],
  fr: [
    {
      id: "why-us",
      question: "Pourquoi choisir Perla ?",
      answer:
        "Parce que nous choisissons chaque bijou nous-mêmes, en regardant la couleur du verre, son tombé une fois porté et la qualité des finitions. Chaque commande arrive dans notre boîte cadeau, la livraison est offerte en Italie et en Europe, et vous avez 14 jours pour changer d’avis.",
    },
    {
      id: "unique",
      question: "Mon bijou sera-t-il identique à la photo ?",
      answer:
        "Très proche, mais pas toujours identique. La teinte et les détails des perles de verre varient légèrement : deux colliers du même modèle peuvent donc présenter de petites différences.",
    },
  ],
  de: [
    {
      id: "why-us",
      question: "Warum Perla?",
      answer:
        "Weil wir jedes Schmuckstück selbst auswählen und dabei auf die Farbe des Glases, den Sitz beim Tragen und die Verarbeitung achten. Jede Bestellung kommt in unserer Geschenkbox an, der Versand innerhalb Italiens und Europas ist kostenlos, und Sie haben 14 Tage Zeit, es sich anders zu überlegen.",
    },
    {
      id: "unique",
      question: "Sieht mein Schmuckstück genauso aus wie auf dem Foto?",
      answer:
        "Sehr ähnlich, aber nicht immer ganz gleich. Glasperlen unterscheiden sich leicht in Farbton und Details. Deshalb können zwei Ketten desselben Designs etwas voneinander abweichen.",
    },
  ],
  hi: [
    {
      id: "why-us",
      question: "Perla को क्यों चुनें?",
      answer:
        "क्योंकि हर आभूषण हम खुद चुनते हैं—काँच के रंग, पहनने पर उसकी बनावट और उसकी फिनिश को ध्यान से देखकर। हर ऑर्डर हमारे गिफ़्ट बॉक्स में आता है, इटली और यूरोप में शिपिंग मुफ़्त है, और आपके पास अपना मन बदलने के लिए 14 दिन हैं।",
    },
    {
      id: "unique",
      question: "क्या मेरा आभूषण तस्वीर जैसा ही दिखेगा?",
      answer:
        "काफ़ी मिलता-जुलता, लेकिन हमेशा बिल्कुल एक जैसा नहीं। काँच के मनकों के रंग और बारीकियों में थोड़ा अंतर होता है, इसलिए एक ही डिज़ाइन के दो हार भी कुछ अलग दिख सकते हैं।",
    },
  ],
  zh: [
    {
      id: "why-us",
      question: "为什么选择 Perla？",
      answer:
        "因为每件首饰都是我们亲自挑选的：我们会留意玻璃的颜色、佩戴时的效果和做工。每笔订单都配有我们的礼盒包装；意大利和欧洲境内免运费，送达后 14 天内您都可以改变主意。",
    },
    {
      id: "unique",
      question: "我收到的首饰会和照片一模一样吗？",
      answer:
        "会很相似，但不一定完全相同。玻璃珠的色泽和细节会有细微差异，因此同一设计的两条项链也可能略有不同。",
    },
  ],
  ru: [
    {
      id: "why-us",
      question: "Почему Perla?",
      answer:
        "Мы сами выбираем каждое украшение, обращая внимание на цвет стекла, то, как оно смотрится при носке, и качество отделки. Каждый заказ упакован в нашу подарочную коробку, доставка по Италии и Европе бесплатна, а у вас есть 14 дней, чтобы передумать.",
    },
    {
      id: "unique",
      question: "Будет ли моё украшение точно таким же, как на фото?",
      answer:
        "Очень похожим, но не всегда совершенно одинаковым. Оттенки и детали стеклянных бусин немного различаются, поэтому два колье одного дизайна могут слегка отличаться.",
    },
  ],
  ja: [
    {
      id: "why-us",
      question: "Perlaを選ぶ理由は？",
      answer:
        "ガラスの色や身に着けたときの見え方、仕上げの美しさを見ながら、一点ずつ私たち自身で選んでいるからです。ご注文はギフトボックスに入れてお届けします。イタリアとヨーロッパへの送料は無料で、お届けから14日以内ならご購入を取り消せます。",
    },
    {
      id: "unique",
      question: "写真とまったく同じものが届きますか？",
      answer:
        "よく似ていますが、まったく同じとは限りません。ガラスビーズは色合いや細部にわずかな違いがあるため、同じデザインのネックレスでも少しずつ表情が異なります。",
    },
  ],
  nl: [
    {
      id: "why-us",
      question: "Waarom kiezen voor Perla?",
      answer:
        "Omdat we elk sieraad zelf selecteren en letten op de kleur van het glas, hoe het valt wanneer u het draagt en de afwerking. Elke bestelling komt in onze geschenkdoos, verzending is gratis in Italië en Europa en u heeft 14 dagen bedenktijd.",
    },
    {
      id: "unique",
      question: "Ziet mijn sieraad er precies zo uit als op de foto?",
      answer:
        "Het lijkt er sterk op, maar is niet altijd precies hetzelfde. Glazen kralen verschillen soms iets in kleur en details, waardoor twee kettingen met hetzelfde ontwerp toch subtiel kunnen afwijken.",
    },
  ],
  pl: [
    { id: "why-us", question: "Dlaczego warto wybrać Perla?", answer: "Każdą ozdobę wybieramy osobiście, zwracając uwagę na kolor szkła, sposób układania się podczas noszenia i staranność wykończenia. Zamówienie pakujemy w pudełko prezentowe, wysyłamy bezpłatnie na terenie Włoch i Europy, a po dostawie masz 14 dni na zmianę decyzji." },
    { id: "unique", question: "Czy moja biżuteria będzie wyglądać dokładnie jak na zdjęciu?", answer: "Będzie bardzo podobna, choć nie zawsze identyczna. Szklane koraliki mogą nieznacznie różnić się odcieniem i detalami, dlatego dwa naszyjniki z tego samego wzoru mogą mieć nieco inny charakter." },
  ],
  cs: [
    { id: "why-us", question: "Proč si vybrat Perla?", answer: "Každý šperk vybíráme sami a věnujeme pozornost barvě skla, tomu, jak vypadá při nošení, i kvalitě zpracování. Každou objednávku posíláme v dárkové krabičce, doprava po Itálii a Evropě je zdarma a na rozmyšlenou máte 14 dní." },
    { id: "unique", question: "Bude můj šperk vypadat přesně jako na fotografii?", answer: "Bude jí velmi podobný, ale nemusí být úplně stejný. Skleněné korálky se mohou mírně lišit odstínem i detaily, takže dva náhrdelníky stejného designu mohou vypadat trochu jinak." },
  ],
  sv: [
    { id: "why-us", question: "Varför välja Perla?", answer: "Vi väljer varje smycke själva och tänker på glasets färg, hur det sitter när du bär det och hur väl det är gjort. Varje beställning kommer i vår presentask, frakten är gratis i Italien och Europa och du har 14 dagar på dig att ångra dig." },
    { id: "unique", question: "Kommer mitt smycke att se exakt ut som på bilden?", answer: "Det kommer att likna bilden mycket, men är inte alltid identiskt. Glaspärlor kan skilja sig lite i nyans och detaljer, så två halsband med samma design kan se något olika ut." },
  ],
  ro: [
    { id: "why-us", question: "De ce să alegi Perla?", answer: "Alegem personal fiecare bijuterie, ținând cont de culoarea sticlei, felul în care se așază la purtare și calitatea finisajelor. Fiecare comandă ajunge în cutia noastră de cadou, livrarea este gratuită în Italia și Europa, iar tu ai 14 zile să te răzgândești." },
    { id: "unique", question: "Bijuteria mea va arăta exact ca în fotografie?", answer: "Va fi foarte asemănătoare, dar nu întotdeauna identică. Mărgelele de sticlă pot avea mici diferențe de nuanță și detalii, așa că două coliere cu același design pot arăta puțin diferit." },
  ],
} satisfies Record<"en" | "it" | "fr" | "de" | "es" | "ar" | "hi" | "ja" | "zh" | "ru" | "nl" | "pl" | "cs" | "sv" | "ro", FaqItem[]>;

export function homeValueFaq(locale: Locale): FaqItem[] {
  return locale === "it"
    ? COPY.it
    : locale === "fr"
      ? COPY.fr
      : locale === "de"
        ? COPY.de
      : locale === "es"
        ? COPY.es
        : locale === "ar"
          ? COPY.ar
          : locale === "ja"
            ? COPY.ja
            : locale === "nl"
              ? COPY.nl
              : locale === "pl"
                ? COPY.pl
                : locale === "cs"
                  ? COPY.cs
                  : locale === "sv"
                    ? COPY.sv
                    : locale === "ro"
                      ? COPY.ro
        : locale === "hi"
          ? COPY.hi
        : locale === "zh"
          ? COPY.zh
          : locale === "ru"
            ? COPY.ru
            : COPY.en;
}
