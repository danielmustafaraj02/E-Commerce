import { describe, expect, it } from "vitest";
import { SECTIONS_BY_TARGET, PAGE_TARGETS, parseStyle } from "./page-layout";
import {
  ALL_TEMPLATES,
  EDITORIAL_TEMPLATES,
  PAGE_TEMPLATES,
  recreateTemplateFor,
  templateBody,
  templatesFor,
  usesOriginal,
  alternativesFor,
} from "./page-templates";
import { compileBuilder, parseBuilder } from "./section-builder";
import { sanitizeSectionHtml } from "./custom-section";
import { dictionaryText, localizeDoc } from "./builder-i18n";
import { getDictionary } from "./i18n/dictionaries";
import { getShopCopy } from "./i18n/shop-copy";
import { getLookPageCopy } from "./i18n/look-page-copy";
import { getShowcaseCopy } from "./i18n/showcase-copy";

describe("page templates", () => {
  it("offers seven editable hero layouts and seven live favourites layouts", () => {
    const heroes = alternativesFor("home", "hero");
    const favourites = alternativesFor("home", "popular");
    expect(heroes).toHaveLength(7);
    expect(favourites).toHaveLength(7);
    for (const template of heroes) {
      const blocks = template.doc.cells.flat();
      expect(blocks.filter((block) => block.type === "heading" && block.h1)).toHaveLength(1);
      expect(blocks.some((block) => block.type === "button")).toBe(true);
    }
    for (const template of favourites) {
      expect(
        template.doc.cells
          .flat()
          .some(
            (block) =>
              (block.type === "carousel" || block.type === "shelf") && block.source === "popular"
          )
      ).toBe(true);
    }
    expect(alternativesFor("about", "popular")).toHaveLength(0);
  });
  it("recreates every built-in section of every page (except the fixed buy box)", () => {
    for (const page of PAGE_TARGETS) {
      for (const section of SECTIONS_BY_TARGET[page]) {
        if ("fixed" in section && section.fixed) continue;
        expect(recreateTemplateFor(page, section.id), `${page}/${section.id}`).toBeTruthy();
      }
    }
  });

  it("has unique ids", () => {
    const ids = ALL_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template survives parsing and compiles to clean HTML", () => {
    for (const t of ALL_TEMPLATES) {
      const doc = parseBuilder(JSON.parse(JSON.stringify(t.doc)));
      expect(doc, t.id).toEqual(t.doc);
      const { html } = compileBuilder(doc!);
      expect(sanitizeSectionHtml(html), t.id).toBe(html);
      if (t.style) expect(parseStyle(t.style), t.id).toEqual(t.style);
    }
  });

  it("every site-text reference exists, in every language", () => {
    for (const locale of ["en", "it", "de", "ja"] as const) {
      const text = dictionaryText(
        {
          ...getDictionary(locale),
          shopCopy: getShopCopy(locale),
          lookPage: getLookPageCopy(locale),
          showcaseCopy: getShowcaseCopy(locale),
        },
        "Perla"
      );
      for (const t of PAGE_TEMPLATES) {
        const html = compileBuilder(localizeDoc(t.doc, locale, text)).html;
        expect(html, `${t.id} (${locale})`).not.toMatch(/\{\{/);
      }
    }
  });

  // The editorial examples go straight onto the home page, so a token that
  // fails to resolve would be visible to visitors, not just to the admin.
  it("every editorial example resolves its site text and compiles cleanly", () => {
    for (const locale of ["en", "it", "de", "ja"] as const) {
      const text = dictionaryText(
        {
          ...getDictionary(locale),
          shopCopy: getShopCopy(locale),
          lookPage: getLookPageCopy(locale),
          showcaseCopy: getShowcaseCopy(locale),
        },
        "Perla"
      );
      for (const t of EDITORIAL_TEMPLATES) {
        const parsed = parseBuilder(JSON.parse(JSON.stringify(t.doc)));
        expect(parsed, t.id).toBeTruthy();
        const html = compileBuilder(localizeDoc(parsed!, locale, text)).html;
        expect(html, `${t.id} (${locale})`).not.toMatch(/\{\{/);
        expect(sanitizeSectionHtml(html), t.id).toBe(html);
      }
    }
  });

  it("templateBody returns a design for every seeded editorial example", () => {
    for (const t of EDITORIAL_TEMPLATES) {
      const body = templateBody(t.id);
      expect(body?.builder, t.id).toBeTruthy();
      // A fresh copy each time: two sections must not share one document.
      expect(body!.builder).not.toBe(t.doc);
    }
    expect(templateBody("nope")).toBeNull();
  });

  it("offers the editorial examples on every page, without a recreate target", () => {
    for (const t of EDITORIAL_TEMPLATES) expect(t.recreates).toBeUndefined();
    expect(templatesFor("about")).toEqual(expect.arrayContaining(EDITORIAL_TEMPLATES));
    expect(templatesFor("home")).toEqual(expect.arrayContaining(EDITORIAL_TEMPLATES));
  });

  it("offers a page's own templates first, never another page's, and keeps original-content ones out of new sections", () => {
    const about = templatesFor("about");
    expect(about[0].page).toBe("about");
    expect(templatesFor("home").some((t) => t.page === "about")).toBe(false);
    expect(usesOriginal(recreateTemplateFor("product", "reviews")!)).toBe(true);
    expect(usesOriginal(recreateTemplateFor("home", "hero")!)).toBe(false);
  });
});
