import { describe, expect, it } from "vitest";
import { JEWELLERY_STYLES, jewelleryBlockTheme } from "./jewellery-styles";
import { blockThemeCss, parseBlockTheme } from "./block-theme";
import { JEWELLERY_TEMPLATES, templatesFor } from "./page-templates";
import { parseBuilder, compileBuilder } from "./section-builder";
import { parseStyle, PAGE_TARGETS } from "./page-layout";

describe("jewellery styles", () => {
  it("offers ten distinct editable designs on every page", () => {
    expect(JEWELLERY_STYLES).toHaveLength(10);
    expect(new Set(JEWELLERY_STYLES.map((s) => s.name)).size).toBe(10);
    for (const page of PAGE_TARGETS) {
      expect(templatesFor(page)).toEqual(expect.arrayContaining(JEWELLERY_TEMPLATES));
    }
    for (const template of JEWELLERY_TEMPLATES) {
      expect(parseBuilder(template.doc), template.name).toEqual(template.doc);
      expect(parseStyle(template.style), template.name).toEqual(template.style);
      const html = compileBuilder(template.doc).html;
      expect(html + JSON.stringify(template.style)).toContain("var(--site-");
      expect(JSON.stringify(template)).not.toMatch(/#[0-9a-f]{3,6}/i);
    }
    expect(new Set(JEWELLERY_TEMPLATES.map((t) => JSON.stringify(t.doc))).size).toBe(10);
  });
  it("persists matching treatments with palette links intact", () => {
    for (const style of JEWELLERY_STYLES) {
      const theme = jewelleryBlockTheme(style.id)!;
      expect(parseBlockTheme(JSON.parse(JSON.stringify(theme)))).toEqual(theme);
      expect(blockThemeCss(theme)).toContain("var(--site-accent)");
      expect(Object.keys(theme).length).toBeGreaterThan(10);
    }
    expect(jewelleryBlockTheme("missing")).toBeNull();
  });
  it("rejects injected CSS while accepting only known palette roles", () => {
    const key = "divider|.bld-hr";
    expect(
      parseBlockTheme({ [key]: { color: "var(--site-accent); } body { display:none" } })
    ).toEqual({});
    expect(parseBlockTheme({ [key]: { color: "var(--unknown)" } })).toEqual({});
    expect(parseBlockTheme({ [key]: { color: "var(--site-accent)" } })[key].color).toBe(
      "var(--site-accent)"
    );
  });
});
