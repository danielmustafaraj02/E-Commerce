import { describe, expect, it } from "vitest";
import {
  dictionaryText,
  docNeedsLocalizing,
  flattenDictionary,
  localizeDoc,
  parseTranslations,
  resolveTokens,
} from "./builder-i18n";
import { compileBuilder, parseBuilder } from "./section-builder";

const dict = {
  home: { heroSubtitle: "Glass jewellery", nested: { deep: "Deep" } },
  about: { intro: (name: string) => `${name} was founded on Murano.` },
  count: 3,
};
const text = dictionaryText(dict, "Perla");

describe("builder languages", () => {
  it("resolves site text, functions with the store name, and leaves unknown keys", () => {
    expect(resolveTokens("{{home.heroSubtitle}}!", text)).toBe("Glass jewellery!");
    expect(resolveTokens("{{ about.intro }}", text)).toBe("Perla was founded on Murano.");
    expect(resolveTokens("{{store.name}}", text)).toBe("Perla");
    expect(resolveTokens("{{nope.key}}", text)).toBe("{{nope.key}}");
    expect(resolveTokens("{{count}}", text)).toBe("{{count}}");
  });

  it("flattens the dictionary for the editor", () => {
    expect(flattenDictionary(dict, "Perla")).toMatchObject({
      "home.heroSubtitle": "Glass jewellery",
      "home.nested.deep": "Deep",
      "about.intro": "Perla was founded on Murano.",
      "store.name": "Perla",
    });
  });

  it("keeps only known languages and fields", () => {
    expect(
      parseTranslations("heading", {
        it: { text: "Ciao", evil: "x" },
        xx: { text: "no" },
        en: { text: "" },
      })
    ).toEqual({ it: { text: "Ciao" } });
    expect(parseTranslations("image", { it: { text: "x" } })).toBeUndefined();
  });

  it("uses a block's own wording for the visitor's language, else the main text", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [
        [
          {
            type: "heading",
            text: "{{home.heroSubtitle}}",
            size: "l",
            tr: { it: { text: "Gioielli" } },
          },
          { type: "story", title: "{{store.name}}", text: "x", src: "", alt: "", side: "left" },
        ],
      ],
    })!;
    expect(docNeedsLocalizing(doc)).toBe(true);
    const it = localizeDoc(doc, "it", text);
    const en = localizeDoc(doc, "en", text);
    expect(it.cells[0][0]).toMatchObject({ text: "Gioielli" });
    expect(it.cells[0][0].tr).toBeUndefined();
    expect(en.cells[0][0]).toMatchObject({ text: "Glass jewellery" });
    expect(compileBuilder(en).html).toContain("Perla");
  });
});

describe("story and original blocks", () => {
  it("compiles a story row with its card and keeps links safe", () => {
    const doc = parseBuilder({
      columns: 1,
      width: "full",
      cells: [
        [
          {
            type: "story",
            eyebrow: "01",
            title: "Seven centuries",
            text: "Line one\n\nLine two",
            cta: "See it",
            href: "javascript:alert(1)",
            src: "/products/a.png",
            alt: "A necklace",
            side: "left",
            blend: true,
            cardTitle: "Necklace",
            cardPrice: "80,00 €",
            cardCta: "View",
            cardHref: "/products/a",
          },
          { type: "original" },
        ],
      ],
    })!;
    expect(doc.width).toBe("full");
    const { html, css } = compileBuilder(doc);
    expect(html).toContain("bld-story--img-left");
    expect(html).toContain("data-blend");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="/products/a"');
    expect(html).toContain('data-bld-live="original"');
    expect(css).toContain(".bld-story-card");
  });
});
