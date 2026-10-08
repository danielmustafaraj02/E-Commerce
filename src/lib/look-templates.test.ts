import { describe, expect, it } from "vitest";

describe("editorial look templates", () => {
  // The dispatcher is the place the option values meet the components,
  // so a typo there would silently fall back to the shipped layout.
  it("preserves every existing ID and adds the four bold editions to the editor", async () => {
    const { LOOK_STYLE_OPTION } = await import("./page-layout");
    const { EDITORIAL_TEMPLATE_IDS } = await import("./look-templates");
    if (LOOK_STYLE_OPTION.type !== "choice") throw new Error("unreachable");
    const all = LOOK_STYLE_OPTION.choices.map((c) => c.value);
    // Every editorial id is offered as a choice...
    for (const id of EDITORIAL_TEMPLATE_IDS) expect(all).toContain(id);
    // The editorial registry preserves its ordering and contains no duplicates.
    const editorial = all.filter((v) => (EDITORIAL_TEMPLATE_IDS as readonly string[]).includes(v));
    expect(editorial).toEqual([
      "xxl",
      "botanical",
      "collage",
      "atelier",
      "runway",
      "collector",
      "botanical-atelier",
      "forest-editorial",
      "botanical-cutout",
      "couture-collage",
      "modern-collage-bold",
      "runway-bold",
      "forest-bold",
      "couture-bold",
    ]);
    expect(new Set(all).size).toBe(all.length);
    for (const base of ["editorial", "alternating", "stacked", "minimal", "framed"]) {
      expect(EDITORIAL_TEMPLATE_IDS).not.toContain(base);
    }
  });

  it("has a name and a note for every template, for the preview selector", async () => {
    const { EDITORIAL_TEMPLATE_IDS, EDITORIAL_TEMPLATE_META } = await import("./look-templates");
    for (const id of EDITORIAL_TEMPLATE_IDS) {
      expect(EDITORIAL_TEMPLATE_META[id].name, id).toBeTruthy();
      expect(EDITORIAL_TEMPLATE_META[id].note, id).toBeTruthy();
    }
  });
});
