/**
 * The built-in articles by slug and title, without their text: small enough for
 * the admin's section editor, where the home page's Journal section lets you
 * pick which articles it shows (lib/page-layout.ts). journal.test.ts keeps it
 * in step with ARTICLES.
 */
export const ARTICLE_LIST: { slug: string; title: string }[] = [
  { slug: "murano-glass-necklaces-buying-guide", title: "How to Choose a Murano Glass Necklace" },
  { slug: "murano-glass-bracelets-buying-guide", title: "How to Choose a Murano Glass Bracelet" },
  { slug: "murano-glass-earrings-buying-guide", title: "How to Choose Murano Glass Earrings" },
  { slug: "history-of-murano-glass", title: "Murano Glass, Part I: How the Island Became Its Home" },
  {
    slug: "murano-glass-materials-cristallo-lattimo",
    title: "Murano Glass, Part II: Cristallo, Lattimo and the Material",
  },
  {
    slug: "murano-glassmaking-techniques-filigrana-murrine",
    title: "Murano Glass, Part III: Filigrana, Reticello and Murrine",
  },
  { slug: "murano-glassmakers-guilds-labor", title: "Murano Glass, Part IV: Guilds, Labour and the Furnace" },
  { slug: "venetian-glass-beads", title: "Murano Glass, Part V: Beads, Skills and Global Trade" },
  {
    slug: "murano-glass-modern-revival-design",
    title: "Murano Glass, Part VI: Revival, Design and Living Tradition",
  },
  { slug: "things-to-do-in-murano", title: "Things to Do in Murano: A Slower Island Guide" },
  { slug: "how-to-recognize-authentic-murano-glass", title: "How to Recognize Authentic Murano Glass" },
  { slug: "how-to-care-for-murano-glass-jewelry", title: "How to Care for Murano Glass Jewelry" },
];
