import type { Locale } from "@/lib/i18n/locale-constants";

/**
 * The new collection: its own page (/new-collection, linked in the header)
 * showing only the pieces that belong to it, with the shop's usual grid,
 * sorting and filters.
 *
 * Membership is read from the product's web address: every piece of the
 * October 2026 collection was published with "ottobre-2026" in its slug. When
 * the next collection arrives, change `slugMarker` (and the copy below) and
 * the page, its link and its title follow.
 */
export const NEW_COLLECTION = {
  path: "/new-collection",
  slugMarker: "ottobre-2026",
} as const;

export type NewCollectionCopy = {
  /** The header link. */
  nav: string;
  /** The page's heading. */
  title: string;
  /** One line under the heading. */
  intro: string;
  /** The search snippet. */
  metaDescription: (storeName: string) => string;
};

const en: NewCollectionCopy = {
  nav: "New collection",
  title: "The new collection",
  intro: "The pieces that joined the collection in October 2026: new shapes, new shades of glass.",
  metaDescription: (storeName) =>
    `The new ${storeName} collection: Murano glass necklaces, bracelets and earrings added in October 2026.`,
};

const it: NewCollectionCopy = {
  nav: "Nuova collezione",
  title: "La nuova collezione",
  intro: "I gioielli entrati in collezione a ottobre 2026: forme nuove, nuove sfumature di vetro.",
  metaDescription: (storeName) =>
    `La nuova collezione ${storeName}: collane, bracciali e orecchini in vetro di Murano arrivati a ottobre 2026.`,
};

const fr: NewCollectionCopy = {
  nav: "Nouvelle collection",
  title: "La nouvelle collection",
  intro: "Les bijoux qui ont rejoint la collection en octobre 2026 : de nouvelles formes et nuances de verre.",
  metaDescription: (storeName) =>
    `La nouvelle collection ${storeName} : colliers, bracelets et boucles d’oreilles en verre de Murano ajoutés en octobre 2026.`,
};

const de: NewCollectionCopy = {
  nav: "Neue Kollektion",
  title: "Die neue Kollektion",
  intro: "Die Schmuckstücke, die im Oktober 2026 zur Kollektion kamen: neue Formen und neue Glasnuancen.",
  metaDescription: (storeName) =>
    `Die neue Kollektion von ${storeName}: Ketten, Armbänder und Ohrringe aus Muranoglas, neu im Oktober 2026.`,
};

const es: NewCollectionCopy = {
  nav: "Nueva colección",
  title: "La nueva colección",
  intro: "Las joyas que se incorporaron a la colección en octubre de 2026: nuevas formas y tonos de vidrio.",
  metaDescription: (storeName) =>
    `La nueva colección de ${storeName}: collares, pulseras y pendientes de vidrio de Murano incorporados en octubre de 2026.`,
};

const ar: NewCollectionCopy = {
  nav: "المجموعة الجديدة",
  title: "المجموعة الجديدة",
  intro: "القطع التي انضمت إلى المجموعة في أكتوبر 2026: أشكال جديدة ودرجات زجاج جديدة.",
  metaDescription: (storeName) =>
    `مجموعة ${storeName} الجديدة: عقود وأساور وأقراط من زجاج مورانو أُضيفت في أكتوبر 2026.`,
};

const ja: NewCollectionCopy = {
  nav: "新作コレクション",
  title: "新作コレクション",
  intro: "2026年10月にコレクションに加わったジュエリー。新しいフォルムとガラスの色合いをお楽しみください。",
  metaDescription: (storeName) =>
    `${storeName}の新作コレクション。2026年10月に加わったムラーノガラスのネックレス、ブレスレット、ピアスをご紹介します。`,
};

const hi: NewCollectionCopy = {
  nav: "नया कलेक्शन",
  title: "नया कलेक्शन",
  intro: "अक्टूबर 2026 में कलेक्शन में शामिल हुए आभूषण: नए आकार और काँच के नए रंग।",
  metaDescription: (storeName) =>
    `${storeName} का नया कलेक्शन: मुरानो ग्लास के हार, कंगन और झुमके, अक्टूबर 2026 में जोड़े गए।`,
};

const zh: NewCollectionCopy = {
  nav: "全新系列",
  title: "全新系列",
  intro: "2026 年 10 月加入系列的首饰：全新的造型与玻璃色彩。",
  metaDescription: (storeName) =>
    `${storeName} 全新系列：2026 年 10 月上新的穆拉诺玻璃项链、手链和耳环。`,
};

const ru: NewCollectionCopy = {
  nav: "Новая коллекция",
  title: "Новая коллекция",
  intro: "Украшения, вошедшие в коллекцию в октябре 2026 года: новые формы и оттенки стекла.",
  metaDescription: (storeName) =>
    `Новая коллекция ${storeName}: колье, браслеты и серьги из муранского стекла, добавленные в октябре 2026 года.`,
};

const nl: NewCollectionCopy = {
  nav: "Nieuwe collectie",
  title: "De nieuwe collectie",
  intro: "De sieraden die in oktober 2026 aan de collectie zijn toegevoegd: nieuwe vormen en nieuwe glastinten.",
  metaDescription: (storeName) =>
    `De nieuwe collectie van ${storeName}: kettingen, armbanden en oorbellen van Murano-glas, toegevoegd in oktober 2026.`,
};

const pl: NewCollectionCopy = {
  nav: "Nowa kolekcja",
  title: "Nowa kolekcja",
  intro: "Biżuteria, która dołączyła do kolekcji w październiku 2026 roku: nowe formy i odcienie szkła.",
  metaDescription: (storeName) => `Nowa kolekcja ${storeName}: naszyjniki, bransoletki i kolczyki ze szkła z Murano, dodane w październiku 2026 roku.`,
};

const cs: NewCollectionCopy = { nav: "Nová kolekce", title: "Nová kolekce", intro: "Šperky, které se ke kolekci připojily v říjnu 2026: nové tvary a odstíny skla.", metaDescription: (storeName) => `Nová kolekce ${storeName}: náhrdelníky, náramky a náušnice z muránského skla přidané v říjnu 2026.` };
const sv: NewCollectionCopy = { nav: "Ny kollektion", title: "Den nya kollektionen", intro: "Smycken som lades till i kollektionen i oktober 2026: nya former och nyanser av glas.", metaDescription: (storeName) => `Den nya kollektionen från ${storeName}: halsband, armband och örhängen i Muranoglas, tillagda i oktober 2026.` };
const ro: NewCollectionCopy = { nav: "Colecție nouă", title: "Noua colecție", intro: "Bijuteriile adăugate colecției în octombrie 2026: forme noi și nuanțe noi de sticlă.", metaDescription: (storeName) => `Noua colecție ${storeName}: coliere, brățări și cercei din sticlă de Murano, adăugate în octombrie 2026.` };

/** English, Italian, French, German, Spanish, Arabic, Hindi, Simplified Chinese, Russian, Japanese, Dutch, Polish, Czech, Swedish, and Romanian; other languages use English. */
export function getNewCollectionCopy(locale: Locale): NewCollectionCopy {
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
