import { describe, expect, it } from "vitest";
import { sanitizeSectionHtml, scopeSectionCss, safeColor } from "./custom-section";

describe("sanitizeSectionHtml", () => {
  it("keeps ordinary markup", () => {
    const html =
      '<h2>Hi</h2><p class="x">Text <a href="/products">shop</a></p><img src="https://a.test/i.jpg" alt="">';
    expect(sanitizeSectionHtml(html)).toBe(html);
  });
  it("removes scripts, handlers and script URLs", () => {
    const out = sanitizeSectionHtml(
      '<script>alert(1)</script><a href="javascript:alert(1)" onclick="x()">a</a><img src=x onerror=alert(1)><style>*{}</style>'
    );
    expect(out).not.toMatch(/script|onclick|onerror|javascript|style/i);
    expect(out).toContain("<a");
  });
  it("only lets YouTube and Vimeo iframes through", () => {
    expect(
      sanitizeSectionHtml(
        '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe>'
      )
    ).toContain("youtube-nocookie");
    expect(sanitizeSectionHtml('<iframe src="https://evil.test/"></iframe>')).toBe("");
  });
});

describe("scopeSectionCss", () => {
  it("scopes rules to the section class", () => {
    expect(scopeSectionCss("h2{color:red}", "custom-abc")).toBe(".custom-abc{h2{color:red}}");
  });
  it("rejects unbalanced or escaping CSS", () => {
    expect(scopeSectionCss("} body{display:none}", "c")).toBe("");
    expect(scopeSectionCss("h2{color:red", "c")).toBe("");
    expect(scopeSectionCss("</style><script>", "c")).toBe("");
  });
  it("drops @import", () => {
    expect(scopeSectionCss("@import url(x.css); p{margin:0}", "c")).toBe(".c{p{margin:0}}");
  });
});

describe("safeColor", () => {
  it("accepts colours and rejects everything else", () => {
    expect(safeColor("#fff")).toBe("#fff");
    expect(safeColor("rgba(0, 0, 0, .5)")).toBe("rgba(0, 0, 0, .5)");
    expect(safeColor("url(javascript:x)")).toBeUndefined();
    expect(safeColor("red;background:url(x)")).toBeUndefined();
  });
});

import { HOME_SECTIONS, resolveLayout } from "./page-layout";

// The layout also lists the hero and showcase now, so look sections up by id.
const resolveFaq = (stored: unknown, sections: typeof HOME_SECTIONS) =>
  resolveLayout(stored, sections).find((e) => e.id === "faq")!;

describe("resolveLayout with custom sections and styles", () => {
  it("keeps valid custom sections in place and clamps styles", () => {
    const layout = resolveLayout(
      [
        { id: "faq", visible: true, style: { bg: "#fff", padTop: 99, hideOn: "mobile" } },
        { id: "custom-abc123", visible: true, custom: { name: "Promo", html: "<p>x</p>", css: "" } },
        { id: "custom-bad", visible: true, custom: { name: "no html" } },
        { id: "nonsense", visible: true },
      ],
      HOME_SECTIONS
    );
    expect(layout.find((e) => e.id === "faq")).toEqual({
      id: "faq",
      visible: true,
      style: { bg: "#fff", padTop: 8, hideOn: "mobile" },
    });
    expect(layout.find((e) => e.id === "custom-abc123")?.custom?.name).toBe("Promo");
    expect(layout.some((e) => e.id === "custom-bad" || e.id === "nonsense")).toBe(false);
    expect(layout.length).toBe(HOME_SECTIONS.length + 1);
  });
  it("drops unsafe colours", () => {
    const entry = resolveFaq(
      [{ id: "faq", visible: true, style: { bg: "url(javascript:x)" } }],
      HOME_SECTIONS
    );
    expect(entry.style).toBeUndefined();
  });
});

describe("section style options", () => {
  it("accepts the new options and drops unsafe ones", () => {
    const entry = resolveFaq(
      [
        {
          id: "faq",
          visible: true,
          style: {
            color: "#222",
            align: "center",
            maxWidth: 500,
            bgImage: 'https://a.test/x.jpg")',
            borderTop: true,
            css: ".shelf-heading{font-size:3rem}",
          },
        },
      ],
      HOME_SECTIONS
    );
    expect(entry.style).toEqual({
      color: "#222",
      align: "center",
      maxWidth: 100,
      borderTop: true,
      css: ".shelf-heading{font-size:3rem}",
    });
  });
});

describe("HTML override on built-in sections", () => {
  it("keeps it on built-ins, ignores it elsewhere, and caps its size", () => {
    const layout = resolveLayout(
      [
        { id: "faq", visible: true, html: "<p>mine</p>" },
        { id: "looks", visible: true, html: "   " },
        { id: "custom-abc123", visible: true, html: "<b>x</b>", custom: { name: "c", html: "<i>y</i>", css: "" } },
        { id: "reasons", visible: true, html: "a".repeat(70000) },
      ],
      HOME_SECTIONS
    );
    const by = Object.fromEntries(layout.map((e) => [e.id, e]));
    expect(by.faq.html).toBe("<p>mine</p>");
    expect(by.looks.html).toBeUndefined();
    expect(by["custom-abc123"].html).toBeUndefined();
    expect(by.reasons.html).toHaveLength(60000);
  });
});

describe("section animation options", () => {
  it("accepts known animations and clamps the delay", () => {
    const entry = resolveFaq(
      [{ id: "faq", visible: true, style: { anim: "fade-up", animSpeed: "slow", animDelay: 99999 } }],
      HOME_SECTIONS
    );
    expect(entry.style).toEqual({ anim: "fade-up", animSpeed: "slow", animDelay: 2000 });
    const bad = resolveFaq(
      [{ id: "faq", visible: true, style: { anim: "explode", animSpeed: "warp" } }],
      HOME_SECTIONS
    );
    expect(bad.style).toBeUndefined();
  });
});

describe("map embeds in custom HTML", () => {
  it("allows Google Maps embeds only, with a bounded height", () => {
    const ok = sanitizeSectionHtml(
      '<iframe data-h="99" src="https://www.google.com/maps?q=Murano&amp;output=embed"></iframe>'
    );
    expect(ok).toContain("https://www.google.com/maps?q=Murano");
    expect(ok).toContain("height:40rem");
    expect(sanitizeSectionHtml('<iframe src="https://www.google.com/search?q=x"></iframe>')).toBe("");
  });
});

describe("rich background options", () => {
  it("keeps valid gradient, parallax, video and overlay settings", () => {
    const entry = resolveFaq(
      [
        {
          id: "faq",
          visible: true,
          style: {
            gradFrom: "#fff",
            gradTo: "#ccc",
            gradAngle: 999,
            parallax: true,
            bgVideo: "/hero/film.mp4",
            overlayColor: "#000",
            overlayStrength: 250,
          },
        },
      ],
      HOME_SECTIONS
    );
    expect(entry.style).toEqual({
      gradFrom: "#fff",
      gradTo: "#ccc",
      gradAngle: 360,
      parallax: true,
      bgVideo: "/hero/film.mp4",
      overlayColor: "#000",
      overlayStrength: 100,
    });
  });
  it("rejects unsafe video links and colours", () => {
    const entry = resolveFaq(
      [
        {
          id: "faq",
          visible: true,
          style: {
            bgVideo: "javascript:alert(1)//x.mp4",
            gradFrom: "url(javascript:x)",
            overlayColor: "red;position:fixed",
          },
        },
      ],
      HOME_SECTIONS
    );
    expect(entry.style).toBeUndefined();
    const web = resolveFaq(
      [{ id: "faq", visible: true, style: { bgVideo: "https://x.test/a.webm?x=1" } }],
      HOME_SECTIONS
    );
    expect(web.style?.bgVideo).toBe("https://x.test/a.webm?x=1");
  });
});
