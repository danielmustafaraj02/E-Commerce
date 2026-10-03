// The Murano Journal (/blog). Articles are typed data in src/content/journal,
// reviewed in pull requests like code, so every claim, source and image
// licence is visible in the diff. Rules are enforced in journal.test.ts.

export type JournalCategory = "history" | "craft" | "buying" | "care" | "gifting";

// Where an image came from and why we may publish it. Anything we can't
// document this way isn't used.
export type ImageRights = {
  credit: string;
  license: "own-photography" | "public-domain" | "cc0" | "cc-by" | "cc-by-sa";
  // Required for anything that isn't our own photography.
  sourceUrl?: string;
  attribution?: string;
};

export type JournalImage =
  // A catalog piece's own photo, looked up by product slug when rendering.
  | {
      kind: "product";
      productSlug: string;
      alt: string;
      altIt?: string;
      caption?: string;
      rights: ImageRights;
    }
  | {
      kind: "file";
      src: string;
      alt: string;
      altIt?: string;
      caption?: string;
      rights: ImageRights;
    };

export type Source = {
  title: string;
  publisher: string;
  url: string;
  // What the article relies on it for.
  usedFor: string;
  accessed: string; // YYYY-MM-DD
  kind?: "primary" | "scholarly" | "institutional" | "reference";
  usedForIt?: string;
  locator?: string;
  author?: string;
  published?: string;
};

export type JournalContentLocale = "en" | "it";

export type ArticleCopy = {
  title: string;
  seoTitle: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intro: string;
  body: Block[];
};

export type ArticleTranslation = ArticleCopy;

export type ArticleSeries = {
  key: string;
  title: string;
  titleIt: string;
  episode: number;
  total: number;
};

// Inline links inside paragraphs: [label](href), internal or to a source.
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "facts"; title: string; items: string[] }
  | { type: "image"; image: JournalImage }
  | { type: "products"; title: string; slugs: string[] }
  | { type: "cta"; text: string; href: string };

export type Article = ArticleCopy & {
  slug: string;
  category: JournalCategory;
  published: string; // YYYY-MM-DD
  updated?: string;
  hero: JournalImage;
  sources: Source[];
  related: string[]; // other article slugs
  series?: ArticleSeries;
  translations?: Partial<Record<"it", ArticleTranslation>>;
};

export type LocalizedArticle = Omit<Article, "translations" | keyof ArticleCopy> &
  ArticleCopy & { contentLocale: JournalContentLocale };
