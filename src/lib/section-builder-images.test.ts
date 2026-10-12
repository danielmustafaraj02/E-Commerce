import { describe, expect, it } from "vitest";
import {
  blockHtml,
  blockWrap,
  columnShare,
  compileBuilder,
  type BuilderBlock,
  type BuilderDoc,
} from "./section-builder";

const image = (src: string) =>
  ({ type: "image", src, alt: "A ring", rounded: false }) as unknown as BuilderBlock;

const doc = (cells: BuilderBlock[][], extra: Partial<BuilderDoc> = {}) =>
  ({
    columns: cells.length,
    gap: 2,
    divider: "none",
    valign: "top",
    cells,
    ...extra,
  }) as BuilderDoc;

describe("builder pictures on the site", () => {
  it("are served through the image optimizer, sized to their column", () => {
    const { html } = compileBuilder(doc([[image("/products/a.png")], []]));
    expect(html).toContain('src="/_next/image?url=%2Fproducts%2Fa.webp&amp;w=1200&amp;q=75"');
    expect(html).toContain("&amp;w=640&amp;q=75 640w");
    expect(html).toContain('sizes="(max-width:47.99rem) 100vw, 50vw"');
    expect(html).toContain('loading="lazy" decoding="async"');
  });

  it("keep their plain address in the editor, which swaps it in place", () => {
    const html = blockHtml(image("/products/a.png"), true);
    expect(html).toContain('src="/products/a.webp"');
    expect(html).not.toContain("srcset");
  });

  it("stay as they are when the optimizer can't take them", () => {
    const html = blockHtml(image("https://cdn.example/a.jpg"));
    expect(html).toContain('src="https://cdn.example/a.jpg"');
    expect(html).not.toContain("srcset");
  });
});

describe("columnShare", () => {
  it("follows dragged column widths", () => {
    expect(columnShare(doc([[], []]), 0)).toBe(0.5);
    expect(columnShare(doc([[], [], []], { widths: [2, 1, 1] }), 0)).toBe(0.5);
    expect(columnShare(doc([[], [], []], { widths: [2, 1, 1] }), 2)).toBe(0.25);
  });
});

describe("block background pictures", () => {
  const withBackground = {
    type: "text",
    text: "Hello",
    style: { bgImage: "/hero/poster.jpg" },
  } as unknown as BuilderBlock;

  it("keep the style attribute intact (the quoted url() used to end it early)", () => {
    const html = blockHtml(withBackground);
    expect(html).toMatch(
      /^<div class="bld-b" style="[^"]*url\(&quot;\/_next\/image\?url=%2Fhero%2Fposter\.webp&amp;w=1920&amp;q=75&quot;\)[^"]*">/
    );
  });

  it("stay unescaped in the React style of live blocks", () => {
    expect(blockWrap(withBackground)?.style?.backgroundImage).toBe(
      'url("/_next/image?url=%2Fhero%2Fposter.webp&w=1920&q=75")'
    );
  });
});
