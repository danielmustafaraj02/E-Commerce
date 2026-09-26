import type { Article } from "@/lib/journal/types";
import {
  MUSEUM_BUILDING,
  MUSEUM_COLLECTION,
  MUSEUM_FOUNDING,
  MUSEUM_GALLERY_GUIDE,
  OWN_PHOTO,
} from "./sources";

export const historyOfMuranoGlass: Article = {
  slug: "history-of-murano-glass",
  title: "The History of Murano Glass, from the 1291 Decree to Today",
  seoTitle: "The History of Murano Glass: From 1291 to Today",
  description:
    "Why Venice moved its glass furnaces to Murano in 1291, how cristallo changed glassmaking, and how the island's craft survived decline and returned.",
  category: "history",
  published: "2026-09-24",
  primaryKeyword: "history of murano glass",
  secondaryKeywords: [
    "murano glass history",
    "venetian glass",
    "angelo barovier cristallo",
    "murano glass museum",
  ],
  hero: {
    kind: "file",
    src: "/blog/venice-canal-bridge-gondola-lion-flag.jpg",
    alt: "A Venice canal with a brick bridge and the red-and-gold flag of the Lion of Saint Mark",
    rights: OWN_PHOTO,
  },
  intro:
    "A small island in the Venetian lagoon has been synonymous with glass for more than seven centuries. Its story is one of fire, invention, near-collapse and revival, and it is told best by the objects themselves, many of which are kept today in the Glass Museum on Murano.",
  body: [
    {
      type: "facts",
      title: "At a glance",
      items: [
        "1291: the Venetian government moves glass production to Murano to limit the risk of fire.",
        "1405: Angelo Barovier, the glassmaker credited with inventing cristallo, is born on Murano.",
        "Around 1527: filigree glass is invented.",
        "1797: the Republic of Venice falls, and Murano's glassmaking enters a long crisis.",
        "1861: the Glass Museum is founded on the island.",
      ],
    },
    { type: "h2", text: "Why glassmaking moved to Murano" },
    {
      type: "p",
      text: "Around the year one thousand, Venice was becoming a hub of trade with the eastern Mediterranean, and in particular with Syria, one of the oldest centres of glass production. According to the [Museo del Vetro](https://museovetro.visitmuve.it/), the first Venetian glassmakers imitated Syrian glass and imported some of their raw materials from that region. Early Venetian glass was mostly made up of simple, everyday objects.",
    },
    {
      type: "p",
      text: "The trade grew quickly, so quickly that in 1291 the government of Venice decided to move all glass production to the island of Murano, to limit the risk of fire from the furnaces in a city built so densely. That decision made Murano what it still is: an island whose identity is bound up with glass.",
    },
    { type: "h2", text: "Cristallo and the Golden Age" },
    {
      type: "p",
      text: "The museum describes the period from the fourteenth to the seventeenth century as Murano's golden age, but it was only from the middle of the fifteenth century that Venice took an unchallenged lead. The turning point was cristallo: a glass that, for the first time, could be completely transparent and pure, close in appearance to rock crystal. Its invention is credited to Angelo Barovier, born on Murano in 1405.",
    },
    {
      type: "quote",
      text: "For the first time in history, glass could be completely transparent and very pure, similar to rock crystal.",
      cite: "Glass Museum of Murano, gallery guide",
    },
    {
      type: "p",
      text: "Decorated with enamel and gold, the new transparent glass was sought after by great families, doges and even the pope. In the sixteenth century Murano's work became openly virtuosic, much of it shaped free-hand, a way of working that, as the museum notes, still distinguishes the island's master glassmakers today. New kinds of glass appeared, among them ice glass, with its rough, translucent surface, and filigree, invented around 1527, in which rods containing fine threads of white or coloured glass are worked into twisted (a retortoli) or net-like (a reticello) patterns.",
    },
    { type: "h2", text: "Imitation, decline and the fall of the Republic" },
    {
      type: "p",
      text: "In the seventeenth century taste moved towards more elaborate shapes, and many of Murano's glassmakers left the island. The eighteenth century brought glass that imitated other precious materials: lattimo, a white glass resembling porcelain, and chalcedony glass, which imitates the quartz of the same name.",
    },
    {
      type: "p",
      text: "Then came a long crisis. Competition from Bohemian glass grew, and in 1797 the Republic of Venice ceased to exist. The guilds and the protections that had safeguarded local production were abolished; under Austrian rule from 1815, Bohemian products spread through the markets, while duties on Murano's imported raw materials and finished goods rose. Skilled craftsmen left and recipes seemed lost. By 1820, the museum records, sixteen furnaces remained on the island, and only five of them still produced blown glass.",
    },
    {
      type: "p",
      text: "One branch of the craft held firm: beads. While blown glass declined, [Venetian bead-making](/blog/venetian-glass-beads) kept its factories and sales networks, with, the museum notes, a significant presence of women both among the workers and as designers.",
    },
    { type: "h2", text: "The nineteenth-century revival" },
    {
      type: "p",
      text: "In the second half of the nineteenth century, glassmakers and entrepreneurs set about recovering what had been lost. Lorenzo Radi researched chalcedony glass, Vincenzo Moretti mosaic glass, and filigree was rediscovered. The glassmaker Bigaglia revived avventurina, a glossy glass with tiny copper crystals whose seventeenth-century recipe had been lost. From the 1860s, new firms such as Fratelli Toso and Salviati & C. showed ever more ambitious work at the world exhibitions, finding buyers abroad, especially in Britain.",
    },
    {
      type: "p",
      text: "The revival also produced the museum itself. The Glass Museum was founded in 1861 on the initiative of Antonio Colleoni, then mayor of Murano, with the aim of gathering the history of an island in crisis since 1797. In 1862 Vincenzo Zanetti added a school where glassworkers could study design and the historic models in the collection. The museum occupies Palazzo Giustinian, once the residence of the bishops of Torcello, and became part of Venice's civic museums after Murano was joined to the city of Venice in 1923.",
    },
    {
      type: "image",
      image: {
        kind: "product",
        productSlug: "collana-notte-stellata-92b5fd",
        alt: "A Murano glass bead necklace in deep blue tones",
        caption: "Contemporary Murano glass beads, from the Perla Murano Glass collection.",
        rights: OWN_PHOTO,
      },
    },
    { type: "h2", text: "From the furnace to jewellery today" },
    {
      type: "p",
      text: "The museum's collection continues into the twentieth century, with a section devoted to glass and design from 1900 to 1970. Beads, meanwhile, remained one of the most personal ways Murano glass travels: small enough to wear every day, and each one shaped by hand. If you would like to see how the techniques named in this story appear in finished pieces, our [guide to Murano glass](/murano-glass) is a good next step.",
    },
    {
      type: "products",
      title: "Pieces from the collection",
      slugs: [
        "collana-turchese-sfaccettato-8e4504",
        "bracciale-laguna-azzurra-5ae8cc",
        "orecchini-blu-profondo-fa4c96",
      ],
    },
    { type: "cta", text: "Explore handmade Murano glass jewellery", href: "/products" },
  ],
  sources: [
    {
      ...MUSEUM_GALLERY_GUIDE,
      usedFor:
        "Early Venetian glass and Syria; the 1291 move to Murano; Angelo Barovier and cristallo; filigree (c. 1527); 18th-century lattimo and chalcedony; the crisis after 1797 and the 1820 furnace count; the 19th-century revival.",
    },
    {
      ...MUSEUM_FOUNDING,
      usedFor: "The museum's founding in 1861 by Antonio Colleoni; its purpose.",
    },
    {
      ...MUSEUM_COLLECTION,
      usedFor: "Zanetti's school (1862); the collection's 1900–1970 glass and design section.",
    },
    {
      ...MUSEUM_BUILDING,
      usedFor: "Palazzo Giustinian; the 1923 annexation to Venice and the civic museums.",
    },
  ],
  related: ["venetian-glass-beads", "how-to-recognize-authentic-murano-glass"],
};
