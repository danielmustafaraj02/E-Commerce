import type { Locale } from "./locale";

/**
 * Copy for the homepage scroll-driven collection showcase.
 *
 * English, Italian, French, German, Spanish, Arabic, Hindi, Simplified Chinese, Russian, Japanese, Dutch and Polish copy. Other locales read English. The
 * category names themselves are NOT defined here — they come from the database
 * (categories.name / nameEn), so a category renamed in the admin shows the new
 * name here automatically. Only the supporting description and the link label
 * live in this file.
 */

export type ShowcaseScene = "necklace" | "bracelet" | "earrings";

/** Which scene each category slug prefix belongs to, in showcase order. */
export const SHOWCASE_SCENE_ORDER: readonly ShowcaseScene[] = [
  "necklace",
  "bracelet",
  "earrings",
] as const;

/* The descriptions are a single editorial line each — a styling benefit stated
   as briefly as it can be, because the showcase gives the reader one line of
   type beside a very large photograph and anything longer competes with it.
   Deliberately free of claims about origin, craftsmanship, materials or
   uniqueness: those are per-product facts held in the catalogue, and a category
   block cannot assert them for every product underneath it. The category NAMES
   are not here — they come from the database. */
const en = {
  scenes: {
    necklace: {
      description: "Worn close to the face, where the colour of the glass meets your own.",
      cta: "See the necklaces",
    },
    bracelet: {
      description: "Colour and texture gathered around the wrist, moving with every gesture.",
      cta: "See the bracelets",
    },
    earrings: {
      description: "Light enough for a whole day, with a flash of colour each time you turn your head.",
      cta: "See the earrings",
    },
  },
};

const it: typeof en = {
  scenes: {
    necklace: {
      description: "Si porta vicino al viso, dove il colore del vetro incontra il tuo.",
      cta: "Guarda le collane",
    },
    bracelet: {
      description: "Colore e materia raccolti intorno al polso, in movimento a ogni gesto.",
      cta: "Guarda i bracciali",
    },
    earrings: {
      description: "Leggeri per un giorno intero, con un lampo di colore ogni volta che ti volti.",
      cta: "Guarda gli orecchini",
    },
  },
};

const fr: typeof en = {
  scenes: {
    necklace: {
      description: "Porté près du visage, là où la couleur du verre rencontre la vôtre.",
      cta: "Voir les colliers",
    },
    bracelet: {
      description: "Couleur et texture au poignet, qui accompagnent chacun de vos gestes.",
      cta: "Voir les bracelets",
    },
    earrings: {
      description: "Assez légères pour toute la journée, avec une touche de couleur à chaque mouvement de tête.",
      cta: "Voir les boucles d’oreilles",
    },
  },
};

const de: typeof en = {
  scenes: {
    necklace: {
      description: "Nah am Gesicht getragen, wo die Farbe des Glases auf Ihre eigene trifft.",
      cta: "Ketten ansehen",
    },
    bracelet: {
      description: "Farbe und Struktur am Handgelenk, die jede Bewegung mitmachen.",
      cta: "Armbänder ansehen",
    },
    earrings: {
      description: "Leicht genug für den ganzen Tag und mit einem Farbakzent bei jeder Kopfbewegung.",
      cta: "Ohrringe ansehen",
    },
  },
};

const es: typeof en = {
  scenes: {
    necklace: {
      description: "Junto al rostro, donde el color del vidrio se encuentra con el tuyo.",
      cta: "Ver collares",
    },
    bracelet: {
      description: "Color y textura alrededor de la muñeca, en movimiento con cada gesto.",
      cta: "Ver pulseras",
    },
    earrings: {
      description: "Ligeros para todo el día, con un toque de color al girar la cabeza.",
      cta: "Ver pendientes",
    },
  },
};

const ar: typeof en = {
  scenes: {
    necklace: {
      description: "تُرتدى قرب الوجه، حيث يلتقي لون الزجاج بلونك.",
      cta: "اكتشف العقود",
    },
    bracelet: {
      description: "ألوان وملمس يلتفان حول المعصم ويتحركان مع كل إيماءة.",
      cta: "اكتشف الأساور",
    },
    earrings: {
      description: "خفيفة طوال اليوم، مع لمحة لون كلما أدرت رأسك.",
      cta: "اكتشف الأقراط",
    },
  },
};

const ja: typeof en = {
  scenes: {
    necklace: {
      description: "顔まわりに寄り添い、ガラスの色があなたの色と出会います。",
      cta: "ネックレスを見る",
    },
    bracelet: {
      description: "手首に集まる色と質感が、仕草に合わせて揺れます。",
      cta: "ブレスレットを見る",
    },
    earrings: {
      description: "一日中着けても軽やか。振り向くたびに色がきらめきます。",
      cta: "ピアスを見る",
    },
  },
};

const nl: typeof en = {
  scenes: {
    necklace: {
      description: "Dicht bij het gezicht gedragen, waar de kleur van het glas die van u ontmoet.",
      cta: "Bekijk de kettingen",
    },
    bracelet: {
      description: "Kleur en textuur om de pols, die met elke beweging meegaan.",
      cta: "Bekijk de armbanden",
    },
    earrings: {
      description: "Licht genoeg om de hele dag te dragen, met een vleugje kleur bij elke draai van uw hoofd.",
      cta: "Bekijk de oorbellen",
    },
  },
};

const pl: typeof en = {
  scenes: {
    necklace: { description: "Noszony blisko twarzy, gdzie kolor szkła spotyka się z Twoją urodą.", cta: "Zobacz naszyjniki" },
    bracelet: { description: "Kolor i faktura wokół nadgarstka, poruszające się z każdym gestem.", cta: "Zobacz bransoletki" },
    earrings: { description: "Lekkie przez cały dzień, z błyskiem koloru przy każdym ruchu głowy.", cta: "Zobacz kolczyki" },
  },
};

const cs: typeof en = { scenes: { necklace: { description: "Náhrdelník nošený blízko tváře, kde se barva skla setkává s vaší vlastní.", cta: "Prohlédnout náhrdelníky" }, bracelet: { description: "Barvy a struktury kolem zápěstí, které se pohybují s každým gestem.", cta: "Prohlédnout náramky" }, earrings: { description: "Lehké na celý den, s barevným zábleskem při každém otočení hlavy.", cta: "Prohlédnout náušnice" } } };
const sv: typeof en = { scenes: { necklace: { description: "Bärs nära ansiktet, där glasets färg möter din egen.", cta: "Se halsbanden" }, bracelet: { description: "Färg och struktur runt handleden som följer varje rörelse.", cta: "Se armbanden" }, earrings: { description: "Lätta att bära hela dagen, med en färgklick när du vänder på huvudet.", cta: "Se örhängena" } } };
const ro: typeof en = { scenes: { necklace: { description: "Purtat aproape de chip, unde culoarea sticlei se întâlnește cu a ta.", cta: "Vezi colierele" }, bracelet: { description: "Culoare și textură în jurul încheieturii, în mișcare la fiecare gest.", cta: "Vezi brățările" }, earrings: { description: "Ușori pentru întreaga zi, cu o scânteie de culoare la fiecare întoarcere a capului.", cta: "Vezi cerceii" } } };

const hi: typeof en = {
  scenes: {
    necklace: {
      description: "चेहरे के पास पहना जाने वाला हार, जहाँ काँच का रंग आपके अपने रंग से मिलता है।",
      cta: "हार देखें",
    },
    bracelet: {
      description: "कलाई पर रंग और बनावट, जो आपकी हर हरकत के साथ चलती है।",
      cta: "कंगन देखें",
    },
    earrings: {
      description: "पूरे दिन पहनने में हल्के, और सिर घुमाते ही रंग की एक छोटी-सी झलक।",
      cta: "झुमके देखें",
    },
  },
};

const zh: typeof en = {
  scenes: {
    necklace: {
      description: "佩戴在脸庞附近，让玻璃的色彩与您的气色相映。",
      cta: "查看项链",
    },
    bracelet: {
      description: "腕间汇聚的色彩与质感，随着每个动作轻轻流动。",
      cta: "查看手链",
    },
    earrings: {
      description: "轻盈舒适，转头之间便闪现一抹色彩。",
      cta: "查看耳环",
    },
  },
};

const ru: typeof en = {
  scenes: {
    necklace: {
      description: "Колье у лица, где цвет стекла перекликается с вашим собственным.",
      cta: "Смотреть колье",
    },
    bracelet: {
      description: "Цвет и фактура на запястье, которые движутся с каждым жестом.",
      cta: "Смотреть браслеты",
    },
    earrings: {
      description: "Лёгкие на весь день, с ярким цветовым акцентом при каждом повороте головы.",
      cta: "Смотреть серьги",
    },
  },
};

export type ShowcaseCopy = typeof en;

export function getShowcaseCopy(locale: Locale): ShowcaseCopy {
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
        : locale === "hi"
          ? hi
        : locale === "zh"
          ? zh
          : locale === "ru"
            ? ru
            : en;
}
