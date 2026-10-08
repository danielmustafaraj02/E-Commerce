import { describe, expect, it } from "vitest";
import { applyBlockDrop, blockHtml, compileBuilder, parseBuilder } from "./section-builder";
import { canvasViewport } from "./canvas-viewport";

const doc = (blocks: unknown[], second?: unknown[]) =>
  parseBuilder({ columns: second ? 2 : 1, cells: second ? [blocks, second] : [blocks] })!;

describe("buttons, image frames and canvas drops", () => {
  it("puts button colours and rounding on the link in both rendering modes", () => {
    const button = doc([
      {
        type: "button",
        text: "Discover",
        href: "/products",
        look: "solid",
        style: { color: "#fff", bg: "#154230", radius: 1, pad: 1 },
      },
    ]).cells[0][0];
    for (const edit of [false, true]) {
      const html = blockHtml(button, edit);
      expect(html).toMatch(
        /<a[^>]*style="color:#fff;background:#154230;padding:1rem;border-radius:1rem"/
      );
      expect(html).not.toMatch(/<div[^>]*style="[^"]*background:#154230/);
      expect(html).toContain('href="/products"');
    }
  });
  it("keeps rich button labels inside one clickable link", () => {
    const html = compileBuilder(
      doc([
        { type: "button", text: "**Shop** [pieces](/other)", href: "/products", look: "outline" },
      ])
    ).html;
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain("<strong>Shop</strong> pieces");
  });
  it("contains product images and clips the rounded media frame", () => {
    const { html, css } = compileBuilder(
      doc([
        {
          type: "image",
          src: "/hero/hero-atelier-poster.jpg",
          alt: "Murano",
          style: { radius: 2, h: 20, mh: 14 },
        },
      ])
    );
    expect(html).toContain("bld-media-frame");
    expect(html).toContain("border-radius:2rem");
    expect(css).toContain(".bld-media-frame{overflow:hidden}");
    expect(css).toContain(".bld-fit>.bld-img{object-fit:contain}");
  });
  it("persists crop choices and keeps the rounded image option inside a frame", () => {
    const image = doc([
      {
        type: "image",
        src: "/hero/hero-atelier-poster.jpg",
        alt: "Atelier",
        fit: "cover",
        rounded: true,
        style: { h: 20 },
      },
    ]).cells[0][0];
    expect(blockHtml(image)).toContain('style="object-fit:cover"');
    expect(blockHtml(image)).toContain("border-radius:.75rem");
    expect(parseBuilder(JSON.parse(JSON.stringify(doc([image]))))!.cells[0][0]).toEqual(image);
  });
  it("retains the moved block's selection after reordering", () => {
    const start = doc([
      { type: "text", text: "A" },
      { type: "text", text: "B" },
      { type: "text", text: "C" },
    ]);
    const result = applyBlockDrop(start, "move:0:0", { col: 0, idx: 3 });
    expect(result.selected).toEqual({ col: 0, idx: 2 });
    expect(result.doc.cells[0][2]).toEqual(start.cells[0][0]);
  });
  it("rejects locked blocks and untrusted or malformed drag payloads", () => {
    const start = doc([{ type: "text", text: "Locked", locked: true }], []);
    for (const payload of [
      "move:0:0",
      "move:NaN:0",
      "move:-1:0",
      "new:invalid",
      "new:__proto__",
      "https://example.com/image.png",
    ]) {
      expect(applyBlockDrop(start, payload, { col: 1, idx: 0 }).doc).toBe(start);
    }
    expect(applyBlockDrop(start, "new:image", { col: 1, idx: 0 }).doc.cells[1][0].type).toBe(
      "image"
    );
  });
  it("fits device canvases without clipping, while allowing deliberate zoom", () => {
    expect(canvasViewport(300, 390, 1).width).toBe(300);
    expect(canvasViewport(700, 1280, 1).width).toBe(700);
    expect(canvasViewport(1000, 390, 1)).toEqual({ scale: 1, width: 390 });
    expect(canvasViewport(300, 390, 1.5).width).toBeCloseTo(450);
  });
});
