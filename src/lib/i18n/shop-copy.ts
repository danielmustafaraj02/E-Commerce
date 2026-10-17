import type { Locale } from "./locale";

// Copy for the product listings (/products, /new-collection, /category/*).
const en = {
  sortLabel: "Sort by",
  sortNewest: "Newest",
  sortPriceAsc: "Price: low to high",
  sortPriceDesc: "Price: high to low",
  // Short forms for the phone's segmented control (the full ones stay for
  // screen readers and wider screens).
  sortNewestShort: "Newest",
  // Under the price chart: how many pieces the chosen range holds.
  rangeOne: "1 piece in this range",
  rangeMany: "{n} pieces in this range",
  sortPriceAscShort: "Price ↑",
  sortPriceDescShort: "Price ↓",
  pieceCount: (n: number) => (n === 1 ? "1 piece" : `${n} pieces`),
  emptyHint: "Try removing a filter, or start from one of these.",
  // The row of active filters above the grid.
  activeFilters: "Active filters",
  removeFilter: "Remove filter: {x}",
  // One line under the heading, as on the new collection.
  catalogIntro: "Every piece in the shop: Murano glass necklaces, bracelets and earrings, chosen one by one.",
  saleIntro: "The pieces with a reduced price.",
  // Matched on the start of the category's address (collane-in-vetro-di-murano).
  categoryIntros: {
    collane: "Strands of glass beads worn close to the face, from deep ruby to soft sage.",
    bracciali: "Colour and texture around the wrist: glass beads that move with every gesture.",
    orecchini: "Light to wear, with a small flash of colour each time you turn your head.",
  } as Record<string, string>,
};

export type ShopCopy = typeof en;

const it: ShopCopy = {
  sortLabel: "Ordina per",
  sortNewest: "Più recenti",
  sortPriceAsc: "Prezzo: dal più basso",
  sortPriceDesc: "Prezzo: dal più alto",
  sortNewestShort: "Novità",
  rangeOne: "1 gioiello in questa fascia",
  rangeMany: "{n} gioielli in questa fascia",
  sortPriceAscShort: "Prezzo ↑",
  sortPriceDescShort: "Prezzo ↓",
  pieceCount: (n) => (n === 1 ? "1 gioiello" : `${n} gioielli`),
  emptyHint: "Prova a togliere un filtro, oppure parti da qui.",
  activeFilters: "Filtri attivi",
  removeFilter: "Togli il filtro: {x}",
  catalogIntro: "Tutti i gioielli del negozio: collane, bracciali e orecchini in vetro di Murano, scelti uno a uno.",
  saleIntro: "I gioielli con il prezzo ribassato.",
  categoryIntros: {
    collane: "Fili di perle di vetro da portare vicino al viso, dal rosso rubino al verde salvia.",
    bracciali: "Colore e materia intorno al polso: perle di vetro che si muovono a ogni gesto.",
    orecchini: "Leggeri da portare, con un lampo di colore ogni volta che ti volti.",
  },
};

const fr: ShopCopy = {
  sortLabel: "Trier par",
  sortNewest: "Les plus récents",
  sortPriceAsc: "Prix : du moins cher au plus cher",
  sortPriceDesc: "Prix : du plus cher au moins cher",
  sortNewestShort: "Nouveautés",
  rangeOne: "1 bijou dans cette fourchette",
  rangeMany: "{n} bijoux dans cette fourchette",
  sortPriceAscShort: "Prix ↑",
  sortPriceDescShort: "Prix ↓",
  pieceCount: (n) => (n === 1 ? "1 bijou" : `${n} bijoux`),
  emptyHint: "Essayez de retirer un filtre, ou découvrez l’une de ces pièces.",
  activeFilters: "Filtres actifs",
  removeFilter: "Retirer le filtre : {x}",
  catalogIntro: "Tous les bijoux de la boutique : colliers, bracelets et boucles d’oreilles en verre de Murano, choisis un à un.",
  saleIntro: "Les bijoux proposés à prix réduit.",
  categoryIntros: {
    collane: "Des rangs de perles de verre près du visage, du rouge rubis au vert sauge.",
    bracciali: "Couleur et texture au poignet : des perles de verre qui suivent chaque geste.",
    orecchini: "Légers à porter, avec une touche de couleur à chaque mouvement de tête.",
  },
};

const de: ShopCopy = {
  sortLabel: "Sortieren nach",
  sortNewest: "Neueste zuerst",
  sortPriceAsc: "Preis: aufsteigend",
  sortPriceDesc: "Preis: absteigend",
  sortNewestShort: "Neuheiten",
  rangeOne: "1 Schmuckstück in dieser Preisspanne",
  rangeMany: "{n} Schmuckstücke in dieser Preisspanne",
  sortPriceAscShort: "Preis ↑",
  sortPriceDescShort: "Preis ↓",
  pieceCount: (n) => (n === 1 ? "1 Schmuckstück" : `${n} Schmuckstücke`),
  emptyHint: "Entfernen Sie einen Filter oder entdecken Sie eines dieser Schmuckstücke.",
  activeFilters: "Aktive Filter",
  removeFilter: "Filter entfernen: {x}",
  catalogIntro: "Alle Schmuckstücke im Shop: Ketten, Armbänder und Ohrringe aus Muranoglas, einzeln ausgewählt.",
  saleIntro: "Diese Schmuckstücke sind jetzt günstiger.",
  categoryIntros: {
    collane: "Glasperlen nah am Gesicht getragen – von tiefem Rubinrot bis zu sanftem Salbeigrün.",
    bracciali: "Farbe und Struktur am Handgelenk: Glasperlen, die jede Bewegung begleiten.",
    orecchini: "Leicht zu tragen und mit einem kleinen Farbakzent bei jeder Kopfbewegung.",
  },
};

const es: ShopCopy = {
  sortLabel: "Ordenar por",
  sortNewest: "Más recientes",
  sortPriceAsc: "Precio: de menor a mayor",
  sortPriceDesc: "Precio: de mayor a menor",
  sortNewestShort: "Novedades",
  rangeOne: "1 joya en este tramo de precios",
  rangeMany: "{n} joyas en este tramo de precios",
  sortPriceAscShort: "Precio ↑",
  sortPriceDescShort: "Precio ↓",
  pieceCount: (n) => (n === 1 ? "1 joya" : `${n} joyas`),
  emptyHint: "Prueba a quitar algún filtro o descubre una de estas joyas.",
  activeFilters: "Filtros activos",
  removeFilter: "Quitar filtro: {x}",
  catalogIntro: "Todas las joyas de la tienda: collares, pulseras y pendientes de vidrio de Murano, seleccionados uno a uno.",
  saleIntro: "Joyas con descuento.",
  categoryIntros: {
    collane: "Cuentas de vidrio cerca del rostro, del rojo rubí intenso al verde salvia suave.",
    bracciali: "Color y textura en la muñeca: cuentas de vidrio que acompañan cada gesto.",
    orecchini: "Ligeros para llevar todo el día, con un destello de color al girar la cabeza.",
  },
};

const ar: ShopCopy = {
  sortLabel: "ترتيب حسب",
  sortNewest: "الأحدث",
  sortPriceAsc: "السعر: من الأقل إلى الأعلى",
  sortPriceDesc: "السعر: من الأعلى إلى الأقل",
  sortNewestShort: "الأحدث",
  rangeOne: "قطعة واحدة في هذا النطاق السعري",
  rangeMany: "{n} قطع في هذا النطاق السعري",
  sortPriceAscShort: "السعر ↑",
  sortPriceDescShort: "السعر ↓",
  pieceCount: (n) => {
    if (n === 1) return "قطعة واحدة";
    if (n === 2) return "قطعتان";
    if (n % 100 >= 3 && n % 100 <= 10) return `${n} قطع`;
    return `${n} قطعة`;
  },
  emptyHint: "جرّب إزالة أحد الفلاتر، أو اختر من هذه القطع.",
  activeFilters: "الفلاتر النشطة",
  removeFilter: "إزالة الفلتر: {x}",
  catalogIntro: "كل قطع المتجر: عقود وأساور وأقراط من زجاج مورانو، نختارها قطعةً قطعة.",
  saleIntro: "قطع بأسعار مخفّضة.",
  categoryIntros: {
    collane: "خرز زجاجي يُرتدى قرب الوجه، من الأحمر الياقوتي الداكن إلى الأخضر المريمي الهادئ.",
    bracciali: "ألوان وملمس حول المعصم، وخرز زجاجي يتحرك مع كل إيماءة.",
    orecchini: "خفيفة طوال اليوم، مع لمحة لون كلما أدرت رأسك.",
  },
};

const ja: ShopCopy = {
  sortLabel: "並び替え",
  sortNewest: "新着順",
  sortPriceAsc: "価格の安い順",
  sortPriceDesc: "価格の高い順",
  sortNewestShort: "新着",
  rangeOne: "この価格帯の商品は1点",
  rangeMany: "この価格帯の商品は{n}点",
  sortPriceAscShort: "価格 ↑",
  sortPriceDescShort: "価格 ↓",
  pieceCount: (n) => `${n}点`,
  emptyHint: "フィルターを外すか、こちらの商品をご覧ください。",
  activeFilters: "適用中のフィルター",
  removeFilter: "フィルターを解除：{x}",
  catalogIntro: "ショップの全商品をご紹介します。ムラーノガラスのネックレス、ブレスレット、ピアスを一点ずつ選びました。",
  saleIntro: "お求めやすくなった商品をご覧ください。",
  categoryIntros: {
    collane: "顔まわりを彩るガラスビーズ。深いルビーレッドから柔らかなセージグリーンまで。",
    bracciali: "手首に彩りと質感を添えるガラスビーズが、動きに合わせて揺れます。",
    orecchini: "一日中着けても軽やか。振り向くたびに小さな彩りがきらめきます。",
  },
};

const nl: ShopCopy = {
  sortLabel: "Sorteren op",
  sortNewest: "Nieuwste eerst",
  sortPriceAsc: "Prijs: laag naar hoog",
  sortPriceDesc: "Prijs: hoog naar laag",
  sortNewestShort: "Nieuw",
  rangeOne: "1 sieraad in deze prijsklasse",
  rangeMany: "{n} sieraden in deze prijsklasse",
  sortPriceAscShort: "Prijs ↑",
  sortPriceDescShort: "Prijs ↓",
  pieceCount: (n) => (n === 1 ? "1 sieraad" : `${n} sieraden`),
  emptyHint: "Verwijder een filter of bekijk een van deze sieraden.",
  activeFilters: "Actieve filters",
  removeFilter: "Filter verwijderen: {x}",
  catalogIntro: "Alle sieraden in de shop: kettingen, armbanden en oorbellen van Murano-glas, stuk voor stuk geselecteerd.",
  saleIntro: "Sieraden met een lagere prijs.",
  categoryIntros: {
    collane: "Glazen kralen dicht bij het gezicht, van diep robijnrood tot zacht saliegroen.",
    bracciali: "Kleur en textuur om de pols: glazen kralen die met elke beweging meebewegen.",
    orecchini: "Licht om te dragen, met een vleugje kleur telkens wanneer u uw hoofd draait.",
  },
};

const pl: ShopCopy = {
  sortLabel: "Sortuj według",
  sortNewest: "Najnowsze",
  sortPriceAsc: "Cena: od najniższej",
  sortPriceDesc: "Cena: od najwyższej",
  sortNewestShort: "Nowości",
  rangeOne: "1 biżuteria w tym przedziale cenowym",
  rangeMany: "Biżuteria w tym przedziale cenowym: {n}",
  sortPriceAscShort: "Cena ↑",
  sortPriceDescShort: "Cena ↓",
  pieceCount: (n) => `${n} ${n === 1 ? "sztuka" : "sztuki"}`,
  emptyHint: "Usuń jeden z filtrów lub zobacz wybrane propozycje.",
  activeFilters: "Aktywne filtry",
  removeFilter: "Usuń filtr: {x}",
  catalogIntro: "Cała kolekcja: naszyjniki, bransoletki i kolczyki ze szkła z Murano, starannie wybrane przez nas sztuka po sztuce.",
  saleIntro: "Biżuteria w obniżonych cenach.",
  categoryIntros: {
    collane: "Szklane koraliki blisko twarzy — od głębokiego rubinu po delikatną szałwię.",
    bracciali: "Kolor i faktura na nadgarstku: szklane koraliki poruszają się z każdym gestem.",
    orecchini: "Lekkie na co dzień, z subtelnym błyskiem koloru przy każdym ruchu głowy.",
  },
};

const cs: ShopCopy = {
  sortLabel: "Seřadit podle", sortNewest: "Nejnovější", sortPriceAsc: "Cena: od nejnižší", sortPriceDesc: "Cena: od nejvyšší", sortNewestShort: "Novinky", rangeOne: "1 šperk v tomto cenovém rozpětí", rangeMany: "Šperků v tomto cenovém rozpětí: {n}", sortPriceAscShort: "Cena ↑", sortPriceDescShort: "Cena ↓", pieceCount: (n) => `${n} ${n === 1 ? "šperk" : n >= 2 && n <= 4 ? "šperky" : "šperků"}`, emptyHint: "Zkuste odebrat některý filtr nebo si prohlédněte tyto kousky.", activeFilters: "Aktivní filtry", removeFilter: "Odebrat filtr: {x}", catalogIntro: "Celá kolekce: náhrdelníky, náramky a náušnice z muránského skla, pečlivě vybírané kus po kuse.", saleIntro: "Šperky za zvýhodněné ceny.", categoryIntros: { collane: "Skleněné korálky blízko tváře, od sytě rubínové po jemnou šalvějovou.", bracciali: "Barva a struktura na zápěstí: skleněné korálky se pohybují s každým gestem.", orecchini: "Lehké na celodenní nošení, s jemným zábleskem barvy při každém otočení hlavy." },
};
const sv: ShopCopy = {
  sortLabel: "Sortera efter", sortNewest: "Senaste", sortPriceAsc: "Pris: lägst först", sortPriceDesc: "Pris: högst först", sortNewestShort: "Nyheter", rangeOne: "1 smycke i det här prisintervallet", rangeMany: "Smycken i det här prisintervallet: {n}", sortPriceAscShort: "Pris ↑", sortPriceDescShort: "Pris ↓", pieceCount: (n) => `${n} ${n === 1 ? "smycke" : "smycken"}`, emptyHint: "Prova att ta bort ett filter eller titta bland de här smyckena.", activeFilters: "Aktiva filter", removeFilter: "Ta bort filter: {x}", catalogIntro: "Hela kollektionen: halsband, armband och örhängen i Muranoglas, noggrant utvalda ett i taget.", saleIntro: "Smycken till nedsatt pris.", categoryIntros: { collane: "Glaspärlor nära ansiktet, från djup rubinrött till mjukt salviagrönt.", bracciali: "Färg och struktur runt handleden: glaspärlor som rör sig med varje gest.", orecchini: "Lätta att bära hela dagen, med en liten färgklick när du vänder på huvudet." },
};
const ro: ShopCopy = {
  sortLabel: "Sortează după", sortNewest: "Cele mai noi", sortPriceAsc: "Preț: crescător", sortPriceDesc: "Preț: descrescător", sortNewestShort: "Noutăți", rangeOne: "1 bijuterie în acest interval de preț", rangeMany: "Bijuterii în acest interval de preț: {n}", sortPriceAscShort: "Preț ↑", sortPriceDescShort: "Preț ↓", pieceCount: (n) => `${n} ${n === 1 ? "bijuterie" : "bijuterii"}`, emptyHint: "Încearcă să elimini un filtru sau descoperă una dintre aceste bijuterii.", activeFilters: "Filtre active", removeFilter: "Elimină filtrul: {x}", catalogIntro: "Întreaga colecție: coliere, brățări și cercei din sticlă de Murano, alese cu grijă, piesă cu piesă.", saleIntro: "Bijuterii la preț redus.", categoryIntros: { collane: "Mărgele de sticlă purtate aproape de chip, de la rubiniu intens la verde salvie delicat.", bracciali: "Culoare și textură la încheietură: mărgelele de sticlă se mișcă odată cu fiecare gest.", orecchini: "Ușori pentru întreaga zi, cu o mică pată de culoare la fiecare întoarcere a capului." },
};

const hi: ShopCopy = {
  sortLabel: "क्रम से दिखाएँ",
  sortNewest: "नए पहले",
  sortPriceAsc: "कीमत: कम से ज़्यादा",
  sortPriceDesc: "कीमत: ज़्यादा से कम",
  sortNewestShort: "नए उत्पाद",
  rangeOne: "इस कीमत सीमा में 1 आभूषण",
  rangeMany: "इस कीमत सीमा में {n} आभूषण",
  sortPriceAscShort: "कीमत ↑",
  sortPriceDescShort: "कीमत ↓",
  pieceCount: (n) => (n === 1 ? "1 आभूषण" : `${n} आभूषण`),
  emptyHint: "कोई फ़िल्टर हटाकर देखें या इनमें से कोई आभूषण चुनें।",
  activeFilters: "लागू फ़िल्टर",
  removeFilter: "फ़िल्टर हटाएँ: {x}",
  catalogIntro: "दुकान के सभी आभूषण: मुरानो ग्लास के हार, कंगन और झुमके, एक-एक करके चुने गए।",
  saleIntro: "कम कीमत पर उपलब्ध आभूषण।",
  categoryIntros: {
    collane: "चेहरे के पास पहने जाने वाले काँच के मनके—गहरे रूबी लाल से हल्के सेज हरे तक।",
    bracciali: "कलाई पर रंग और बनावट: हर हरकत के साथ झूमते काँच के मनके।",
    orecchini: "पूरे दिन पहनने में हल्के, और सिर घुमाते ही रंग की एक छोटी-सी झलक।",
  },
};

const zh: ShopCopy = {
  sortLabel: "排序方式",
  sortNewest: "最新上架",
  sortPriceAsc: "价格：从低到高",
  sortPriceDesc: "价格：从高到低",
  sortNewestShort: "最新",
  rangeOne: "此价格区间内有 1 件首饰",
  rangeMany: "此价格区间内有 {n} 件首饰",
  sortPriceAscShort: "价格 ↑",
  sortPriceDescShort: "价格 ↓",
  pieceCount: (n) => `${n} 件首饰`,
  emptyHint: "试试移除一个筛选条件，或从这些首饰中挑选。",
  activeFilters: "已选筛选条件",
  removeFilter: "移除筛选条件：{x}",
  catalogIntro: "店内全部首饰：项链、手链和耳环，均为穆拉诺玻璃材质，由我们逐件挑选。",
  saleIntro: "正在优惠销售的首饰。",
  categoryIntros: {
    collane: "贴近脸庞佩戴的玻璃珠串，从浓郁的红宝石色到柔和的鼠尾草绿。",
    bracciali: "腕间的色彩与质感：玻璃珠随着每个动作轻轻晃动。",
    orecchini: "轻盈舒适，转头之间便闪现一抹色彩。",
  },
};

const ru: ShopCopy = {
  sortLabel: "Сортировать",
  sortNewest: "Сначала новинки",
  sortPriceAsc: "Цена: по возрастанию",
  sortPriceDesc: "Цена: по убыванию",
  sortNewestShort: "Новинки",
  rangeOne: "1 украшение в этом диапазоне цен",
  rangeMany: "В этом диапазоне цен: {n} шт.",
  sortPriceAscShort: "Цена ↑",
  sortPriceDescShort: "Цена ↓",
  pieceCount: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    const noun =
      mod10 === 1 && mod100 !== 11
        ? "украшение"
        : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
          ? "украшения"
          : "украшений";
    return `${n} ${noun}`;
  },
  emptyHint: "Попробуйте убрать фильтр или выберите одно из этих украшений.",
  activeFilters: "Выбранные фильтры",
  removeFilter: "Убрать фильтр: {x}",
  catalogIntro: "Все украшения магазина: колье, браслеты и серьги из муранского стекла, отобранные по одному.",
  saleIntro: "Украшения по сниженной цене.",
  categoryIntros: {
    collane: "Стеклянные бусины у лица — от насыщенного рубинового до мягкого шалфейного оттенка.",
    bracciali: "Цвет и фактура на запястье: стеклянные бусины двигаются вместе с каждым жестом.",
    orecchini: "Лёгкие серьги с небольшим всплеском цвета при каждом повороте головы.",
  },
};

export function getShopCopy(locale: Locale): ShopCopy {
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

/** The category's one-line introduction, if it has one (by its address). */
export function categoryIntro(copy: ShopCopy, slug: string): string | undefined {
  return Object.entries(copy.categoryIntros).find(([prefix]) => slug.startsWith(prefix))?.[1];
}
