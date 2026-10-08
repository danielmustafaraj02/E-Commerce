import { createElement as h, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ARTICLES } from "@/lib/journal";
import {
  ARTICLE_OPENING_OPTIONS,
  ARTICLE_SECTIONS,
  defaultLayout,
  resolveLayout,
} from "@/lib/page-layout";
import { optionAttributes } from "@/lib/section-style";

const mocks = vi.hoisted(() => ({ entries: vi.fn(), preview: vi.fn(), findArticle: vi.fn() }));
vi.mock("@/app/home-fonts", () => ({ homeFontClasses: "" }));
vi.mock("@/lib/page-layout-store", () => ({ pageEntries: mocks.entries }));
vi.mock("@/lib/layout-preview-server", () => ({ isLayoutPreview: mocks.preview }));
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
vi.mock("@/components/layout-preview-bridge-server", () => ({
  PreviewBridge: ({ target }: { target: string }) => h("div", { "data-preview-target": target }),
}));
import Page from "./page";

const source = {
  ...ARTICLES[0],
  title: "The actual article",
  intro: "The original introduction.",
  body: [{ type: "p" as const, text: "The original article content." }],
};
const props = {
  params: Promise.resolve({ slug: source.slug }),
  searchParams: Promise.resolve({}),
};

beforeEach(() => {
  mocks.findArticle.mockResolvedValue(source);
  mocks.entries.mockResolvedValue(defaultLayout(ARTICLE_SECTIONS));
  mocks.preview.mockResolvedValue(false);
});

describe("article page layouts", () => {
  const opening = ARTICLE_OPENING_OPTIONS[0];
  const styles = opening.type === "choice" ? opening.choices.map((choice) => choice.value) : [];

  it.each(styles)(
    "preserves the article title and hero for the %s opening",
    async (articleOpening) => {
      const layout = resolveLayout(
        [{ id: "head", visible: true, options: { articleOpening } }],
        ARTICLE_SECTIONS
      );
      mocks.entries.mockResolvedValue(layout);
      const html = renderToStaticMarkup(await Page(props));
      expect(html).toContain("The actual article</h1>");
      expect(html).toContain('alt="Article hero"');
      expect(html.match(/class="journal-opening"/g)).toHaveLength(1);
      if (articleOpening !== "classic") {
        expect(html).toContain(`data-opt-article-opening="${articleOpening}"`);
      }
    }
  );

  it("renders actual article content with the default sections", async () => {
    const html = renderToStaticMarkup(await Page(props));
    expect(html).toContain("The actual article</h1>");
    expect(html).toContain('class="journal-opening"');
    expect(html).toContain('alt="Article hero"');
    expect(html).not.toContain('data-layout-id="hero"');
    expect(html).toContain("The original introduction.");
    expect(html).toContain("The original article content.");
    expect(mocks.entries).toHaveBeenCalledWith("article", { preview: false });
    expect(html).not.toContain("data-preview-target");
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

  it("enables the article preview bridge for authorized previews", async () => {
    mocks.preview.mockResolvedValue(true);
    const html = renderToStaticMarkup(await Page(props));
    expect(mocks.entries).toHaveBeenCalledWith("article", { preview: true });
    expect(html).toContain('data-preview-target="article"');
  });
});
