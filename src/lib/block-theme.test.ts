import { describe, expect, it } from "vitest";
import { THEME_GROUPS, blockThemeCss, parseBlockTheme, themeGroupId } from "./block-theme";

const button = THEME_GROUPS.find((g) => g.selector === ".bld-btn")!;
const id = themeGroupId(button);

describe("block theme", () => {
  it("drops anything that is not a valid value", () => {
    const theme = parseBlockTheme({
      [id]: { radius: "99", caps: "expression(alert(1))", weight: "700", nope: "1" },
      "x|y": { a: "b" },
    });
    expect(theme[id]).toEqual({ radius: "3", weight: "700" });
    expect(theme["x|y"]).toBeUndefined();
  });

  it("only accepts hex colours", () => {
    const solid = THEME_GROUPS.find((g) => g.selector === ".bld-btn-solid")!;
    const key = themeGroupId(solid);
    const theme = parseBlockTheme({ [key]: { bg: "red;}body{display:none", fg: "#fff" } });
    expect(theme[key]).toEqual({ fg: "#fff" });
  });

  it("prints scoped rules and nothing for an empty theme", () => {
    expect(blockThemeCss({})).toBe("");
    const css = blockThemeCss(parseBlockTheme({ [id]: { radius: 1.5 } }));
    expect(css).toBe("html .bld .bld-btn{border-radius:1.5rem}");
  });

  it("tolerates junk input", () => {
    expect(parseBlockTheme(null)).toEqual({});
    expect(parseBlockTheme("x")).toEqual({});
  });
});
