import { describe, expect, it } from "vitest";
import { sectionStylesFor, recreateTemplateFor } from "./page-templates";
import { PAGE_TARGETS, SECTIONS_BY_TARGET, parseStyle, resolveLayout } from "./page-layout";
import { applySectionDesign, createSectionDesigns } from "./section-designs";
import { parseBuilder, compileBuilder } from "./section-builder";
import { scopeSectionCss, sanitizeSectionHtml } from "./custom-section";

describe("ten styles of every page section", () => {
  it("covers every section, with unique designs that survive saving", () => {
    const ids = new Set<string>();
    for (const page of PAGE_TARGETS)
      for (const section of SECTIONS_BY_TARGET[page]) {
        const styles = sectionStylesFor(page, section.id);
        expect(styles, `${page}/${section.id}`).toHaveLength(10);
        expect(new Set(styles.map((s) => JSON.stringify([s.doc, s.style]))).size).toBe(10);
        for (const design of styles) {
          expect(ids.has(design.id)).toBe(false);
          ids.add(design.id);
          expect(parseBuilder(JSON.parse(JSON.stringify(design.doc))), design.id).toEqual(
            design.doc
          );
          expect(parseStyle(design.style), design.id).toEqual(design.style);
          expect(scopeSectionCss(design.style.css!, "sample"), design.id).toContain(".sample{");
          const rendered = compileBuilder(design.doc);
          expect(sanitizeSectionHtml(rendered.html), design.id).toBe(rendered.html);
          const entry = applySectionDesign({ id: section.id, visible: true }, design);
          const saved = resolveLayout(
            JSON.parse(JSON.stringify([entry])),
            SECTIONS_BY_TARGET[page]
          ).find((e) => e.id === section.id)!;
          expect(saved.style).toEqual(entry.style);
          if (!design.styleOnly) expect(saved.builder).toEqual(entry.builder);
        }
      }
    expect(sectionStylesFor("home", "missing")).toEqual([]);
  });
  it("keeps all data-driven and functional content native", () => {
    for (const page of PAGE_TARGETS)
      for (const section of SECTIONS_BY_TARGET[page]) {
        const source = recreateTemplateFor(page, section.id);
        const hasLive = source?.doc.cells
          .flat()
          .some((b) =>
            [
              "original",
              "shelf",
              "carousel",
              "reviews",
              "looks",
              "newsletter",
              "siteFaq",
              "journal",
            ].includes(b.type)
          );
        if (hasLive)
          for (const design of sectionStylesFor(page, section.id)) {
            expect(
              design.doc.cells.flat().some((b) => b.type === "original"),
              design.id
            ).toBe(true);
          }
      }
  });
  it("styles the fixed buy area without replacing its controls or options", () => {
    const entry = { id: "top", visible: true, options: { gallery: "right", thumbs: "off" } };
    for (const design of sectionStylesFor("product", "top")) {
      const result = applySectionDesign(entry, design);
      expect(design.styleOnly).toBe(true);
      expect(result.builder).toBeUndefined();
      expect(result.html).toBeUndefined();
      expect(result.options).toEqual(entry.options);
    }
  });
  it("retains custom section content when applying a treatment", () => {
    const entry = {
      id: "custom-wardrobe",
      visible: true,
      custom: { name: "Our story", html: "<p>Our own words</p>", css: "p{line-height:2}" },
    };
    const designs = createSectionDesigns("home", {
      id: entry.id,
      label: entry.custom.name,
      hint: "",
      fixed: true,
    });
    expect(designs).toHaveLength(10);
    for (const design of designs) {
      const result = applySectionDesign(entry, design);
      expect(result.custom).toEqual(entry.custom);
      expect(result.builder).toBeUndefined();
    }
  });
  it("keeps collection images and wording while changing the scroll composition", () => {
    const builder = parseBuilder({
      columns: 1,
      cells: [
        [
          {
            type: "showcase",
            scenes: { necklace: { name: "Our necklaces", image: "/hero/hero-atelier-poster.webp" } },
          },
        ],
      ],
    })!;
    const result = applySectionDesign(
      { id: "showcase", visible: true, builder },
      sectionStylesFor("home", "showcase")[3]
    );
    const block = result.builder!.cells[0][0];
    expect(block.type).toBe("showcase");
    if (block.type === "showcase") {
      expect(block.scenes?.necklace?.name).toBe("Our necklaces");
      expect(block.scenes?.necklace?.image).toBe("/hero/hero-atelier-poster.webp");
      expect(block.layout).toBe("row");
    }
  });
  it("clones drafts so edits do not mutate templates", () => {
    const design = sectionStylesFor("home", "hero")[0];
    const result = applySectionDesign({ id: "hero", visible: false, html: "old" }, design);
    expect(result.visible).toBe(false);
    expect(result.html).toBeUndefined();
    result.builder!.cells[0].pop();
    result.style!.bg = "#fff";
    expect(design.doc.cells[0].length).toBeGreaterThan(result.builder!.cells[0].length);
    expect(design.style.bg).not.toBe("#fff");
  });
});

describe("composed designs for content sections", () => {
  const section = { id: "story", label: "Story", hint: "" };
  const source = {
    id: "s",
    name: "s",
    description: "",
    doc: parseBuilder({
      columns: 1,
      cells: [[
        { type: "heading", text: "Title", size: "m", style: { color: "#123456" } },
        { type: "text", text: "Words" },
        { type: "button", text: "Go", href: "/", look: "solid" },
        { type: "image", src: "/a.jpg", alt: "" },
      ]],
    })!,
  };
  const designs = createSectionDesigns("about", section, source);

  it("are ten distinct named compositions", () => {
    expect(designs.map((d) => d.name)).toEqual([
      "Split", "Split, photo first", "Centred", "Cover", "Editorial",
      "Card", "Night", "Minimal", "Gallery", "Framed",
    ]);
  });

  it("put the photo behind the text on phones for the split layouts", () => {
    for (const i of [0, 1, 6]) {
      expect(designs[i].doc.mobile?.layout).toBe("overlay");
      expect(compileBuilder(designs[i].doc).css).toContain('grid-template-areas:"stack"');
    }
  });

  it("run the split layouts edge to edge, and never narrow the background", () => {
    for (const i of [0, 1, 6]) {
      expect(designs[i].doc.width).toBe("full");
      expect(designs[i].style).toMatchObject({ padTop: 0, padBottom: 0 });
      expect(designs[i].style.css).toContain("min-height:min(88svh,58rem)");
    }
    for (const d of designs) expect(d.style.maxWidth, d.name).toBeUndefined();
    expect(designs[2].style.css).toContain(".bld{max-width:64rem;margin-inline:auto}");
  });

  it("make the photo the section background for Cover", () => {
    expect(designs[3].style.bgImage).toBe("/a.jpg");
    expect(designs[3].doc.cells.flat().some((b) => b.type === "image")).toBe(false);
  });

  it("let colours come from the section, so text stays readable over photos", () => {
    for (const d of designs)
      for (const b of d.doc.cells.flat()) expect(b.style?.color, d.name).toBeUndefined();
  });
});
