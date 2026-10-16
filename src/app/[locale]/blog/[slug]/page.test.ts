import { createElement as h, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ARTICLES } from "@/lib/journal";
import { ARTICLE_OPENING_TEMPLATES } from "@/lib/journal/opening";
import { optionAttributes } from "@/lib/section-style";
import {
  ARTICLE_SECTIONS,
  defaultLayout,
  resolveLayout,
} from "@/lib/page-layout";

const mocks = vi.hoisted(() => ({ entries: vi.fn(), findArticle: vi.fn() }));
vi.mock("@/app/home-fonts", () => ({ homeFontClasses: "" }));
vi.mock("@/lib/page-layout-store", () => ({ pageEntries: mocks.entries }));
vi.mock("@/lib/journal/db-articles", () => ({ findArticle: mocks.findArticle }));
vi.mock("@/lib/store-settings", () => ({
  getStoreSettings: async () => ({ storeName: "Test store", defaultLocale: "en-US" }),
}));
vi.mock("@/lib/site-url", () => ({ siteBaseUrl: () => "https://example.com" }));
vi.mock("@/lib/i18n/locale", () => ({ getLocale: async () => "en" }));
vi.mock("@/lib/journal/products", () => ({ getJournalProducts: async () => ({}) }));
vi.mock("@/components/localized-link", () => ({
  Link: ({ children, ...props }: { children: ReactNode }) => h("a", props, children),
}));
vi.mock("@/components/shelf-item", () => ({ ShelfItem: () => null }));
vi.mock("@/components/journal/journal-image", () => ({
  JournalImage: () => h("img", { alt: "Article hero" }),
  journalImageSrc: () => "/hero.png",
}));
vi.mock("@/components/layout-section", () => ({
  LayoutSection: ({
    entry,
    children,
  }: {
    entry: { id: string; options?: Record<string, string> };
    children: ReactNode;
  }) => h("div", { "data-layout-id": entry.id, ...optionAttributes(entry.options) }, children),
}));
import Page from "./page";

const source = {
  ...ARTICLES[0],
  title: "The actual article",
  intro: "The original introduction.",
  body: [{ type: "p" as const, text: "The original article content." }],
};
const props = {
  params: Promise.resolve({ locale: "en", slug: source.slug }),
  searchParams: Promise.resolve({}),
};

beforeEach(() => {
  mocks.findArticle.mockResolvedValue(source);
  mocks.entries.mockResolvedValue(defaultLayout(ARTICLE_SECTIONS));
});

describe("article page layouts", () => {
  it.each(ARTICLE_OPENING_TEMPLATES)(
    "opens with the house template whatever the article stored (%s)",
    async (openingTemplate) => {
      mocks.findArticle.mockResolvedValue({ ...source, openingTemplate });
      const html = renderToStaticMarkup(await Page(props));
      expect(html).toContain("The actual article</h1>");
      expect(html).toContain('alt="Article hero"');
      expect(html.match(/class="journal-opening"/g)).toHaveLength(1);
      expect(html).toContain('data-opening="blended"');
    }
  );

  it("uses the house opening when the article has none, whatever the page layout says", async () => {
    mocks.entries.mockResolvedValue(
      resolveLayout([{ id: "head", visible: true, options: { articleOpening: "cover" } }], ARTICLE_SECTIONS)
    );
    const html = renderToStaticMarkup(await Page(props));
    expect(html).toContain('data-opening="blended"');
    expect(html).toContain("--o-size:0.89");
  });

  it("ignores any per-article adjustments, using the house ones for every article", async () => {
    mocks.findArticle.mockResolvedValue({
      ...source,
      openingTemplate: "overlap",
      openingLayout: { title: { x: 4, size: 120 }, text: "panel" },
    });
    const html = renderToStaticMarkup(await Page(props));
    expect(html).not.toContain('data-text="panel"');
    expect(html).toContain("--o-size:0.89");
  });

  it("renders actual article content with the default sections", async () => {
    const html = renderToStaticMarkup(await Page(props));
    expect(html).toContain("The actual article</h1>");
    expect(html).toContain('class="journal-opening"');
    expect(html).toContain('alt="Article hero"');
    expect(html).not.toContain('data-layout-id="hero"');
    expect(html).toContain("The original introduction.");
    expect(html).toContain("The original article content.");
    expect(mocks.entries).toHaveBeenCalledWith("article");
  });

  it("uses saved ordering and omits sections hidden by the layout", async () => {
    mocks.entries.mockResolvedValue([
      { id: "body", visible: true },
      { id: "related", visible: true },
    ]);
    const html = renderToStaticMarkup(await Page(props));
    expect(html).not.toContain('data-layout-id="head"');
    expect(html.indexOf('data-layout-id="body"')).toBeLessThan(
      html.indexOf('data-layout-id="related"')
    );
    expect(html).toContain("The original article content.");
  });
});
