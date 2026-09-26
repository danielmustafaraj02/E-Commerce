import { describe, expect, it } from "vitest";
import { absoluteUrl, isPlaceholderCompany, toSafeJsonLd } from "./json-ld";

describe("toSafeJsonLd", () => {
  it("produces valid JSON for ordinary data", () => {
    const data = { name: "Bracciale Avvolto Ambra", price: 4999 };
    expect(JSON.parse(toSafeJsonLd(data))).toEqual(data);
  });

  it("escapes a literal </script> so it can't break out of the tag it's injected into", () => {
    const malicious = { name: "</script><script>alert(document.cookie)</script>" };
    const output = toSafeJsonLd(malicious);
    expect(output).not.toContain("</script>");
    expect(output).not.toContain("<script>");
    // Still valid, value-identical JSON once parsed by a JSON parser.
    expect(JSON.parse(output)).toEqual(malicious);
  });

  it("escapes bare < and > even outside a script-closing sequence", () => {
    const data = { description: "Diameter < 5cm, weight > 10g" };
    const output = toSafeJsonLd(data);
    expect(output).not.toContain("<");
    expect(output).not.toContain(">");
    expect(JSON.parse(output)).toEqual(data);
  });

  it("escapes the JS line-terminator code points", () => {
    const data = {
      note: `line one${String.fromCharCode(8232)}line two${String.fromCharCode(8233)}end`,
    };
    const output = toSafeJsonLd(data);
    expect(output).not.toContain(String.fromCharCode(8232));
    expect(output).not.toContain(String.fromCharCode(8233));
    expect(JSON.parse(output)).toEqual(data);
  });
});

describe("absoluteUrl", () => {
  it("makes site-relative paths absolute", () => {
    expect(absoluteUrl("/logo.png", "https://shop.test")).toBe("https://shop.test/logo.png");
    expect(absoluteUrl("products/a.jpg", "https://shop.test/")).toBe(
      "https://shop.test/products/a.jpg"
    );
  });

  it("leaves absolute and protocol-relative URLs alone", () => {
    expect(absoluteUrl("https://cdn.test/a.jpg", "https://shop.test")).toBe(
      "https://cdn.test/a.jpg"
    );
    expect(absoluteUrl("//cdn.test/a.jpg", "https://shop.test")).toBe("//cdn.test/a.jpg");
  });

  it("returns the input unchanged when the site URL is unknown", () => {
    expect(absoluteUrl("/logo.png", "")).toBe("/logo.png");
  });
});

describe("isPlaceholderCompany", () => {
  it("flags the seed's demo company and empty values", () => {
    expect(isPlaceholderCompany("Demo Store S.r.l.")).toBe(true);
    expect(isPlaceholderCompany(" demo store ")).toBe(true);
    expect(isPlaceholderCompany(null)).toBe(true);
    expect(isPlaceholderCompany("")).toBe(true);
  });

  it("accepts a real company name", () => {
    expect(isPlaceholderCompany("Perla Murano S.r.l.")).toBe(false);
  });
});
