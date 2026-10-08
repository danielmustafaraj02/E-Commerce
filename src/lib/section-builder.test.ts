import { describe, expect, it } from "vitest";
import {
  SECTION_TEMPLATES,
  applyBlockDrop,
  duplicateBlock,
  builderNeedsRuntime,
  compileBuilder,
  freshBlock,
  getRawField,
  inlineHtml,
  insertBlock,
  isSingleLineField,
  moveBlock,
  parseBuilder,
  patchBlockStyle,
  setColumnWidths,
  setRawField,
} from "./section-builder";
import { sanitizeSectionHtml } from "./custom-section";
import { ALL_TEMPLATES, PAGE_TEMPLATES } from "./page-templates";
import { formatHtml, readableSectionHtml } from "./format-html";

describe("section builder", () => {
  it("every template survives a parse round trip and compiles to clean HTML", () => {
    for (const template of SECTION_TEMPLATES) {
      const parsed = parseBuilder(JSON.parse(JSON.stringify(template.doc)));
      expect(parsed, template.id).toEqual(
        expect.objectContaining({ columns: template.doc.columns })
      );
      const { html } = compileBuilder(parsed!);
      expect(sanitizeSectionHtml(html), template.id).toBe(html);
    }
  });
  it("draws vertical lines between columns", () => {
    const { css } = compileBuilder(SECTION_TEMPLATES.find((t) => t.id === "highlights")!.doc);
    expect(css).toContain("border-inline-start:1px solid");
  });
  it("escapes text and refuses unsafe links", () => {
    expect(inlineHtml("<b>x</b> & [bad](javascript:x) [ok](/products) **b** *i*")).toBe(
      '&lt;b&gt;x&lt;/b&gt; &amp; bad <a href="/products">ok</a> <strong>b</strong> <em>i</em>'
    );
    const doc = parseBuilder({
      columns: 1,
      cells: [
        [
          { type: "button", text: "x", href: "javascript:alert(1)" },
          { type: "image", src: "javascript:x", alt: "" },
        ],
      ],
    })!;
    expect(compileBuilder(doc).html).not.toMatch(/javascript|<a |<img/);
  });
  it("clamps and drops junk", () => {
    const doc = parseBuilder({
      columns: 9,
      gap: 99,
      cells: [[{ type: "nope" }, { type: "spacer", height: 999 }]],
    })!;
    expect(doc.columns).toBe(1);
    expect(doc.gap).toBe(6);
    expect(doc.cells[0]).toEqual([{ type: "spacer", height: 12 }]);
  });
});

describe("formatHtml", () => {
  it("indents and keeps short elements on one line", () => {
    expect(
      formatHtml(
        '<div><h2 class="a">Title</h2><p>Hello <a href="/x">there</a></p><img src="/a.png"></div>'
      )
    ).toBe(
      [
        "<div>",
        '  <h2 class="a">Title</h2>',
        '  <p>Hello <a href="/x">there</a></p>',
        '  <img src="/a.png">',
        "</div>",
      ].join("\n")
    );
  });
  it("cleans framework noise from rendered markup", () => {
    const out = readableSectionHtml(
      '<section data-reveal="true"><img src="/_next/image?url=%2Fproducts%2Fa.png&w=640&q=75" srcset="x 1x" data-nimg="1" style="color:transparent"></section>'
    );
    expect(out).toContain('src="/products/a.png"');
    expect(out).not.toMatch(/srcset|data-nimg|transparent|data-reveal/);
  });
});

describe("builder: new blocks, block styles and effects", () => {
  const doc = (blocks: unknown[]) => parseBuilder({ columns: 1, cells: [blocks] })!;

  it("compiles counter, icon, stars, countdown, badge and map", () => {
    const { html } = compileBuilder(
      doc([
        { type: "counter", value: 2400, suffix: "+", label: "customers", size: "xl" },
        { type: "icon", icon: "gem", title: "Handmade", text: "By hand" },
        { type: "stars", rating: 4.8, label: "1,200 reviews" },
        { type: "countdown", until: "2030-01-01T00:00", label: "Ends in" },
        { type: "badge", text: "New", look: "soft" },
        { type: "map", query: "Murano, Venice", height: 20 },
      ])
    );
    expect(html).toContain('data-bld-count="2400"');
    expect(html).toContain(">2,400<");
    expect(html).toContain("<svg");
    expect(html).toContain("--r:4.8");
    expect(html).toContain('data-bld-countdown="2030-01-01T00:00"');
    expect(html).toContain("bld-badge-soft");
    expect(sanitizeSectionHtml(html)).toContain("https://www.google.com/maps?q=Murano%2C%20Venice");
  });

  it("drops a countdown without a valid date and clamps numbers", () => {
    expect(compileBuilder(doc([{ type: "countdown", until: "tomorrow" }])).html).not.toContain(
      "bld-countdown"
    );
    const parsed = doc([
      { type: "stars", rating: 99 },
      { type: "counter", value: -5 },
    ]);
    expect(parsed.cells[0]).toMatchObject([{ rating: 5 }, { value: 0 }]);
  });

  it("wraps styled blocks, validating colours and numbers", () => {
    const { html } = compileBuilder(
      doc([
        {
          type: "text",
          text: "Hi",
          style: { color: "#fff", bg: "url(javascript:x)", pad: 99, radius: 1, shadow: "soft" },
          effect: "lift",
        },
      ])
    );
    expect(html).toContain('class="bld-b bld-fx bld-fx-lift"');
    expect(html).toContain("color:#fff");
    expect(html).toContain("padding:4rem");
    expect(html).not.toContain("javascript");
  });

  it("ignores unknown effects", () => {
    expect(
      compileBuilder(doc([{ type: "text", text: "Hi", effect: "explode" }])).html
    ).not.toContain("bld-fx");
  });
});

describe("builder: scroll-drawn lines, count-up toggle and phone controls", () => {
  const parse = (extra: object, blocks: unknown[] = []) =>
    parseBuilder({ columns: 3, divider: "thin", cells: [blocks, [], []], ...extra })!;

  it("marks lines to draw on scroll", () => {
    const { html } = compileBuilder(
      parse({}, [
        { type: "divider", draw: true },
        { type: "vline", height: 4, draw: true },
      ])
    );
    expect(html.match(/data-bld-draw/g)).toHaveLength(2);
  });

  it("draws the column lines with a pseudo-element when asked", () => {
    const plain = compileBuilder(parse({}));
    const drawn = compileBuilder(parse({ drawLines: true }));
    expect(plain.css).toContain("border-inline-start:1px solid");
    expect(plain.css).not.toContain(".bld-col+.bld-col::before");
    expect(drawn.html).toContain('class="bld" data-bld-draw');
    expect(drawn.css).toContain(".bld-col+.bld-col::before");
  });

  it("can turn the counter animation off", () => {
    const on = compileBuilder(parse({}, [{ type: "counter", value: 5, size: "m" }])).html;
    const off = compileBuilder(
      parse({}, [{ type: "counter", value: 5, size: "m", countUp: false }])
    ).html;
    expect(on).toContain("data-bld-count");
    expect(off).not.toContain("data-bld-count");
  });

  it("compiles the phone settings and clamps them", () => {
    const { css } = compileBuilder(
      parse({ mobile: { reverse: true, hide: [1, 1, 7], gap: 99, fontScale: 10 } })
    );
    expect(css).toContain("@media (max-width:47.99rem){");
    expect(css).toContain(".bld{gap:6rem}");
    expect(css).toContain(".bld{font-size:60%}");
    expect(css).toContain("flex-direction:column-reverse");
    expect(css).toContain(".bld-col:nth-child(2){display:none}");
    expect(css).not.toContain("nth-child(8)");
  });
});

describe("builder: canvas editing helpers", () => {
  const base = () =>
    parseBuilder({
      columns: 2,
      cells: [
        [
          { type: "heading", text: "A", size: "l" },
          { type: "text", text: "B" },
          { type: "badge", text: "C", look: "solid" },
        ],
        [{ type: "quote", text: "D" }],
      ],
    })!;
  const texts = (doc: ReturnType<typeof base>) =>
    doc.cells.map((cell) => cell.map((b) => getRawField(b, "text") ?? b.type));

  it("moves a block within a column", () => {
    // Drop "A" before index 3 (the end): it lands last.
    expect(texts(moveBlock(base(), { col: 0, idx: 0 }, { col: 0, idx: 3 }))).toEqual([
      ["B", "C", "A"],
      ["D"],
    ]);
    // Drop "C" before index 0.
    expect(texts(moveBlock(base(), { col: 0, idx: 2 }, { col: 0, idx: 0 }))[0]).toEqual([
      "C",
      "A",
      "B",
    ]);
    // Dropping a block on itself changes nothing.
    expect(texts(moveBlock(base(), { col: 0, idx: 1 }, { col: 0, idx: 1 }))[0]).toEqual([
      "A",
      "B",
      "C",
    ]);
  });

  it("moves a block to another column", () => {
    const moved = moveBlock(base(), { col: 0, idx: 1 }, { col: 1, idx: 0 });
    expect(texts(moved)).toEqual([
      ["A", "C"],
      ["B", "D"],
    ]);
  });

  it("inserts a new block and ignores bad targets", () => {
    const doc = insertBlock(base(), { col: 1, idx: 1 }, freshBlock("divider"));
    expect(doc.cells[1].map((b) => b.type)).toEqual(["quote", "divider"]);
    expect(insertBlock(base(), { col: 9, idx: 0 }, freshBlock("text"))).toEqual(base());
    expect(moveBlock(base(), { col: 5, idx: 0 }, { col: 0, idx: 0 })).toEqual(base());
  });

  it("reads and writes a text field without touching anything else", () => {
    const doc = setRawField(base(), { col: 0, idx: 1 }, "text", "**new** text");
    expect(getRawField(doc.cells[0][1], "text")).toBe("**new** text");
    expect(doc.cells[0][0]).toEqual(base().cells[0][0]);
    expect(setRawField(base(), { col: 0, idx: 1 }, "nope", "x")).toEqual(base());
    expect(isSingleLineField("heading", "text")).toBe(true);
    expect(isSingleLineField("text", "text")).toBe(false);
  });

  it("marks blocks and editable text only in edit mode", () => {
    const doc = base();
    const plain = compileBuilder(doc).html;
    expect(plain).not.toMatch(/data-bi|draggable/);
    const { html } = compileBuilder(doc, { edit: true });
    expect(html).toContain('data-bi-col="0"');
    expect(html).toContain('data-bi="0:2"');
    expect(html).toContain('data-bi="1:0"');
    expect(html).toContain('draggable="true"');
    expect(html.match(/data-bi-field="text"/g)?.length).toBe(4);
  });

  it("shows a placeholder for blocks with nothing to draw", () => {
    const doc = parseBuilder({ columns: 1, cells: [[{ type: "image", src: "", alt: "" }]] })!;
    expect(compileBuilder(doc).html).not.toContain("bld-empty");
    expect(compileBuilder(doc, { edit: true }).html).toContain("Empty image block");
  });
});

describe("builder: product carousel and heading rule", () => {
  it("compiles a carousel placeholder and lists the carousels in a design", async () => {
    const { builderCarousels } = await import("./section-builder");
    const template = SECTION_TEMPLATES.find((t) => t.id === "carousel")!;
    const { html, css } = compileBuilder(template.doc);
    expect(html).toContain('data-bld-live="carousel"');
    expect(html).toContain('data-source="popular" data-count="10"');
    expect(html).toContain("bld-h-ul bld-h-ul-gold");
    expect(css).toContain(".bld-live:empty");
    expect(builderCarousels(template.doc)).toEqual([{ source: "popular", count: 10 }]);
  });
  it("clamps the count and falls back to a known source", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [[{ type: "carousel", source: "nonsense", count: 99 }]],
    })!;
    expect(doc.cells[0][0]).toEqual({ type: "carousel", source: "popular", count: 10 });
  });
  it("shows a placeholder for the carousel in the canvas only", () => {
    const doc = SECTION_TEMPLATES.find((t) => t.id === "carousel")!.doc;
    expect(compileBuilder(doc, { edit: true }).html).toContain('data-bi="0:1"');
  });
});

describe("builder: eyebrow label and heading rules", () => {
  it("compiles the numbered label with a line, and the thick rule", () => {
    const { html, css } = compileBuilder(
      SECTION_TEMPLATES.find((t) => t.id === "section-heading")!.doc
    );
    expect(html).toContain('<span class="bld-eyebrow-num">02</span>');
    expect(html).toContain('<span class="bld-eyebrow-sep" aria-hidden="true">/</span>');
    expect(html).toContain("bld-eyebrow-rule");
    expect(html).toContain("bld-h-ul bld-h-ul-thick");
    expect(css).toContain(".bld-h-ul-thick::after{height:3px");
  });
  it("hides the number and line when asked, and escapes the text", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [[{ type: "eyebrow", text: "<b>x</b>", line: "none" }]],
    })!;
    const { html } = compileBuilder(doc);
    expect(html).not.toContain("bld-eyebrow-num");
    expect(html).not.toContain("bld-eyebrow-rule");
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
  });
  it("puts a line on both sides and keeps the old underline setting working", () => {
    const both = parseBuilder({
      columns: 1,
      cells: [[{ type: "eyebrow", text: "Hi", line: "both", align: "center" }]],
    })!;
    expect(compileBuilder(both).html.match(/bld-eyebrow-rule/g)).toHaveLength(2);
    const legacy = parseBuilder({
      columns: 1,
      cells: [[{ type: "heading", text: "H", size: "l", underline: true }]],
    })!;
    expect(legacy.cells[0][0]).toMatchObject({ rule: "gold" });
  });
  it("lets the label and number be edited in the canvas", () => {
    const doc = SECTION_TEMPLATES.find((t) => t.id === "section-heading")!.doc;
    const { html } = compileBuilder(doc, { edit: true });
    expect(html).toContain('data-bi-field="number"');
    expect(html).toContain('data-bi-field="text"');
  });
});

describe("builder: live blocks and the home section templates", () => {
  const home = PAGE_TEMPLATES.filter((t) => t.recreates && (t.page ?? "home") === "home");

  it("recreates every built-in home section with its own template", async () => {
    const { HOME_SECTIONS } = await import("./page-layout");
    const ids = home.map((t) => t.recreates).sort();
    expect(ids).toEqual(HOME_SECTIONS.map((s) => s.id).sort());
  });

  it("every home template survives a parse round trip and compiles", () => {
    for (const t of home) {
      const parsed = parseBuilder(JSON.parse(JSON.stringify(t.doc)))!;
      expect(parsed, t.id).toBeTruthy();
      const { html } = compileBuilder(parsed);
      expect(sanitizeSectionHtml(html), t.id).toBe(html);
      expect(compileBuilder(parsed, { edit: true }).html, t.id).toContain("data-bi=");
    }
  });

  it("marks live blocks and tells the site to render them", async () => {
    const { hasLiveBlocks, isLiveBlock } = await import("./section-builder");
    const bestsellers = ALL_TEMPLATES.find((t) => t.id === "home-bestsellers")!.doc;
    expect(hasLiveBlocks(bestsellers)).toBe(true);
    expect(compileBuilder(bestsellers).html).toContain('data-bld-live="shelf"');
    expect(hasLiveBlocks(SECTION_TEMPLATES.find((t) => t.id === "highlights")!.doc)).toBe(false);
    expect(isLiveBlock({ type: "looks", count: 3 })).toBe(true);
    expect(isLiveBlock({ type: "text", text: "x" })).toBe(false);
  });

  it("builds the editable FAQ with accordion markup", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [
        [
          {
            type: "faq",
            items: [
              { q: "Why?", a: "Because." },
              { q: "", a: "skipped" },
            ],
          },
        ],
      ],
    })!;
    const { html } = compileBuilder(doc);
    expect(html).toContain('<details class="bld-faq-item"><summary>Why?</summary>');
    expect(html).not.toContain("skipped");
  });

  it("keeps the collection animation's scene text and clamps live counts", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [
        [
          {
            type: "showcase",
            scenes: { necklace: { description: "Hello", cta: "Go" }, nope: { description: "x" } },
          },
          { type: "shelf", source: "special", count: 99 },
          { type: "looks", count: 0 },
        ],
      ],
    })!;
    expect(doc.cells[0][0]).toEqual({
      type: "showcase",
      scenes: { necklace: { description: "Hello", cta: "Go" } },
    });
    expect(doc.cells[0][1]).toEqual({ type: "shelf", source: "special", count: 12 });
    expect(doc.cells[0][2]).toEqual({ type: "looks", count: 1 });
  });

  it("builds the hero with typing text, a button that waits and the film beside it", () => {
    const hero = ALL_TEMPLATES.find((t) => t.id === "home-hero-split")!;
    const { html } = compileBuilder(hero.doc);
    expect(html).toContain('data-bld-type="normal"');
    expect(html).toContain('data-bld-type="fast"');
    expect(html).toContain("data-bld-after");
    expect(html).toContain('<video class="bld-video bld-video-file" src="/hero/hero-atelier.mp4"');
    expect(html).toContain("autoplay muted loop playsinline");
  });
});

describe("builder: phone friendliness", () => {
  it("lets each block be hidden on phones or on computers", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [
        [
          { type: "text", text: "A", hide: "mobile" },
          { type: "text", text: "B", hide: "desktop" },
          { type: "text", text: "C", hide: "sideways" },
        ],
      ],
    })!;
    const { html, css } = compileBuilder(doc);
    expect(html).toContain("bld-hide-mobile");
    expect(html).toContain("bld-hide-desktop");
    expect(html.match(/bld-hide-/g)).toHaveLength(2);
    expect(css).toContain("@media (max-width:47.99rem){.bld-hide-mobile{display:none!important}}");
  });

  it("uses fluid type, tidy phone defaults and hover effects only where hover exists", () => {
    const { css } = compileBuilder(SECTION_TEMPLATES.find((t) => t.id === "stats")!.doc);
    expect(css).toContain("clamp(");
    expect(css).toContain("@media (hover:hover){.bld-fx-lift:hover");
    expect(css).not.toMatch(/(^|\n)\.bld-fx-lift:hover/);
    expect(css).toContain(".bld{gap:min(2rem,2rem)}");
    expect(css).toContain(".bld-vline{height:0!important");
  });

  it("keeps the hero's film in its own column on phones too", () => {
    const hero = ALL_TEMPLATES.find((t) => t.id === "home-hero-split")!;
    expect(hero.doc.cells[1][0]).toMatchObject({ type: "video" });
    expect(hero.doc.mobile?.hide).toBeUndefined();
  });
});

describe("builder: typing animation", () => {
  const doc = (blocks: unknown[]) => parseBuilder({ columns: 1, cells: [blocks] })!;

  it("marks headings and text to type, and only with a known speed", () => {
    const { html } = compileBuilder(
      doc([
        { type: "heading", text: "Hello", size: "l", typing: "slow" },
        { type: "text", text: "World", typing: "turbo" },
        { type: "text", text: "Again", typing: "fast" },
      ])
    );
    expect(html.match(/data-bld-type=/g)).toHaveLength(2);
    expect(html).toContain('data-bld-type="slow"');
    expect(html).not.toContain("turbo");
  });

  it("needs the runtime script only when something types", async () => {
    const { builderNeedsRuntime } = await import("./section-builder");
    expect(builderNeedsRuntime(doc([{ type: "text", text: "x" }]))).toBe(false);
    expect(builderNeedsRuntime(doc([{ type: "text", text: "x", typing: "fast" }]))).toBe(true);
  });

  it("plays video files, but only safe ones", () => {
    expect(compileBuilder(doc([{ type: "video", url: "/hero/a.mp4" }])).html).toContain("<video");
    expect(compileBuilder(doc([{ type: "video", url: "https://x.test/a.webm" }])).html).toContain(
      "<video"
    );
    expect(
      compileBuilder(doc([{ type: "video", url: "javascript:alert(1)//a.mp4" }])).html
    ).not.toContain("<video");
    expect(
      compileBuilder(doc([{ type: "video", url: "https://youtu.be/dQw4w9WgXcQ" }])).html
    ).toContain("<iframe");
  });
});

describe("builder: collections animation block", () => {
  it("keeps the animation style and treats anything but 'row' as the scroll sequence", () => {
    const parse = (layout: unknown) =>
      parseBuilder({ columns: 1, cells: [[{ type: "showcase", layout }]] })!.cells[0][0];
    expect(parse("row")).toEqual({ type: "showcase", layout: "row" });
    expect(parse("scroll")).toEqual({ type: "showcase" });
    expect(parse(5)).toEqual({ type: "showcase" });
  });
  it("shows a labelled placeholder that the preview can replace with the real thing", () => {
    const { html } = compileBuilder(ALL_TEMPLATES.find((t) => t.id === "home-showcase")!.doc);
    expect(html).toMatch(/<div class="bld-live" data-bld-live="showcase"[^>]*><\/div>/);
  });
});

describe("block size", () => {
  it("keeps width and height, clamped, and compiles them", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [[{ type: "image", src: "/a.png", alt: "", style: { w: 55.46, h: 500 } }]],
    })!;
    const style = doc.cells[0][0].style;
    expect(style).toMatchObject({ w: 55.5, h: 60 });
    const { html } = compileBuilder(doc);
    expect(html).toContain("width:55.5%");
    expect(html).toContain("height:60rem");
    expect(html).toContain("bld-fit");
  });

  it("patchBlockStyle sets and clears", () => {
    const doc = parseBuilder({ columns: 1, cells: [[{ type: "text", text: "x" }]] })!;
    const sized = patchBlockStyle(doc, { col: 0, idx: 0 }, { w: 50 });
    expect(sized.cells[0][0].style).toEqual({ w: 50 });
    const cleared = patchBlockStyle(sized, { col: 0, idx: 0 }, { w: undefined });
    expect(cleared.cells[0][0].style).toBeUndefined();
  });
});

describe("block position", () => {
  it("compiles offsets and layer, clamped", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [[{ type: "image", src: "/a.png", alt: "", style: { x: -90, y: 2.5, z: 3 } }]],
    })!;
    expect(doc.cells[0][0].style).toMatchObject({ x: -60, y: 2.5, z: 3 });
    const { html, css } = compileBuilder(doc);
    expect(html).toContain("position:relative;left:-60%;top:2.5rem;z-index:3");
    expect(html).toContain("bld-moved");
    expect(css).toContain(".bld-moved");
  });
});

describe("column widths", () => {
  const doc = (widths: unknown) => parseBuilder({ columns: 2, widths, cells: [[], []] })!;

  it("compiles unequal widths into the grid", () => {
    const d = doc([1.5, 0.5]);
    expect(d.widths).toEqual([1.5, 0.5]);
    expect(compileBuilder(d).css).toContain("minmax(0,1.5fr) minmax(0,0.5fr)");
  });

  it("ignores equal, missing or mismatched widths", () => {
    expect(doc([1, 1]).widths).toBeUndefined();
    expect(doc([1, 2, 3]).widths).toBeUndefined();
    expect(compileBuilder(doc(undefined)).css).toContain("repeat(2,minmax(0,1fr))");
  });

  it("setColumnWidths clears equal widths", () => {
    expect(setColumnWidths(doc([2, 1]), [1, 1]).widths).toBeUndefined();
  });
});

describe("scroll animation", () => {
  const doc = parseBuilder({
    columns: 1,
    stagger: 300,
    cells: [
      [
        {
          type: "text",
          text: "a",
          motion: { type: "rise", mode: "toggle", order: 2, speed: "slow", delay: 99999 },
        },
        { type: "text", text: "b", motion: { type: "nope" } },
      ],
    ],
  })!;

  it("keeps valid animations and drops unknown ones", () => {
    expect(doc.cells[0][0].motion).toEqual({
      type: "rise",
      mode: "toggle",
      speed: "slow",
      delay: 3000,
      order: 2,
    });
    expect(doc.cells[0][1].motion).toBeUndefined();
    expect(doc.stagger).toBe(300);
  });

  it("compiles the attributes the scroll script reads", () => {
    const { html } = compileBuilder(doc);
    expect(html).toContain('data-bm="rise"');
    expect(html).toContain('data-bm-mode="toggle"');
    expect(html).toContain('data-bm-order="2"');
    expect(html).toContain("--bm-dur:1.4s");
    expect(html).toContain('data-bm-stagger="300"');
    expect(compileBuilder(doc, { edit: true }).html).toContain("data-bm="); // so the canvas can play it
  });

  it("asks for the runtime", () => {
    expect(builderNeedsRuntime(doc)).toBe(true);
  });
});

describe("more block options", () => {
  const doc = parseBuilder({
    columns: 1,
    cells: [
      [
        {
          type: "image",
          src: "/a.png",
          alt: "x",
          idle: "float",
          parallax: 500,
          sticky: true,
          group: "hero-1",
          locked: true,
          ghost: true,
          style: { font: "heading", mx: 5, my: -3, mw: 80, mh: 12, x: 2 },
          motion: { type: "rise", ease: "bounce" },
        },
        { type: "text", text: "t", idle: "nope", group: "bad group!" },
      ],
    ],
  })!;

  it("parses and clamps the new fields", () => {
    const b = doc.cells[0][0];
    expect(b).toMatchObject({ idle: "float", parallax: 60, sticky: true, group: "hero-1" });
    expect(b.style).toMatchObject({ font: "heading", mx: 5, my: -3, mw: 80, mh: 12 });
    expect(b.motion?.ease).toBe("bounce");
    expect(doc.cells[0][1].idle).toBeUndefined();
    expect(doc.cells[0][1].group).toBeUndefined();
  });

  it("compiles them for the site", () => {
    const { html, css } = compileBuilder(doc);
    expect(html).toContain("bld-idle-float");
    expect(html).toContain('data-bld-par="60"');
    expect(html).toContain("bld-sticky");
    expect(html).toContain("font-family:var(--font-heading)");
    expect(html).toContain("--mx:5%");
    expect(html).toContain("--bm-ease:cubic-bezier(.34,1.56,.64,1)");
    expect(html).toContain("bld-mx");
    expect(css).toContain("align-items:stretch");
    expect(builderNeedsRuntime(doc)).toBe(true);
  });

  it("marks locked and hidden blocks only in the canvas", () => {
    const edit = compileBuilder(doc, { edit: true }).html;
    expect(edit).toContain("bld-locked");
    expect(edit).toContain("bld-ghost");
    expect(edit).toContain('data-grp="hero-1"');
    expect(edit).toContain('draggable="false"');
    const site = compileBuilder(doc).html;
    expect(site).not.toContain("bld-locked");
    expect(site).not.toContain("bld-ghost");
  });
});

describe("collections animation block", () => {
  it("keeps scene overrides and scroll settings through a round trip", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [
        [
          {
            type: "showcase",
            scenes: {
              necklace: { name: "Mine", side: "right", href: "javascript:x" },
              nope: { name: "x" },
            },
            scroll: { transition: "fade", distance: 1, rail: false, accent: "#123456" },
          },
        ],
      ],
    })!;
    const block = doc.cells[0][0];
    expect(block).toEqual({
      type: "showcase",
      scenes: { necklace: { name: "Mine", side: "right" } },
      scroll: { transition: "fade", distance: 1, rail: false, accent: "#123456" },
    });
    expect(parseBuilder(JSON.parse(JSON.stringify(doc)))).toEqual(doc);
  });
});

describe("editable shapes", () => {
  it.each(["rectangle", "oval", "triangle", "diamond"])(
    "preserves and renders %s shapes through saving and sanitization",
    (kind) => {
      const doc = parseBuilder({
        columns: 1,
        cells: [
          [
            {
              type: "shape",
              kind,
              fill: "#abcdef",
              style: { w: 40, h: 12, mx: 5, my: 2, mw: 80, mh: 6 },
            },
          ],
        ],
      })!;
      expect(doc.cells[0][0]).toMatchObject({ type: "shape", kind, fill: "#abcdef" });
      const { html } = compileBuilder(doc);
      expect(html).toContain("height:12rem");
      expect(html).toContain("background:#abcdef");
      expect(html).toContain("--mh:6rem");
      expect(html).toContain("bld-fit");
      expect(sanitizeSectionHtml(html)).toBe(html);
      if (kind === "oval") expect(html).toContain("border-radius:50%");
      if (kind === "triangle" || kind === "diamond") expect(html).toContain("clip-path:polygon(");
    }
  );

  it("rejects unsafe fills and unsupported shape kinds", () => {
    const doc = parseBuilder({
      columns: 1,
      cells: [[{ type: "shape", kind: "bad", fill: "red;position:fixed" }]],
    })!;
    expect(doc.cells[0][0]).toEqual({ type: "shape", kind: "rectangle", fill: "#154230" });
    expect(compileBuilder(doc).html).toContain("height:8rem");
  });

  it("adds shapes by drag payload and copies their independent controls", () => {
    const empty = parseBuilder({ columns: 2, cells: [[], []] })!;
    const added = applyBlockDrop(empty, "new:shape", { col: 0, idx: 0 });
    expect(added.selected).toEqual({ col: 0, idx: 0 });
    expect(added.doc.cells[0][0]).toEqual(freshBlock("shape"));
    const copied = duplicateBlock(added.doc, { col: 0, idx: 0 });
    const resized = patchBlockStyle(copied, { col: 0, idx: 1 }, { h: 20 });
    expect(resized.cells[0][0].style?.h).toBe(8);
    expect(resized.cells[0][1].style?.h).toBe(20);
    const moved = applyBlockDrop(resized, "move:0:1", { col: 1, idx: 0 });
    expect(moved.doc.cells[1][0].type).toBe("shape");
    expect(moved.doc.cells[1][0].style?.h).toBe(20);
  });
});
