import { describe, expect, it } from "vitest";
import { auditDesign } from "./design-audit";
import { parseBuilder } from "./section-builder";

const doc = (blocks: unknown[], extra: Record<string, unknown> = {}) =>
  parseBuilder({ columns: 1, cells: [blocks], ...extra })!;

describe("design audit", () => {
  it("flags missing alt text and vague buttons", () => {
    const issues = auditDesign(
      doc([
        { type: "image", src: "/a.png", alt: "" },
        { type: "button", text: "Click here", href: "/x", look: "solid" },
      ])
    );
    expect(issues.map((i) => i.pos?.idx)).toEqual([0, 1]);
    expect(issues.every((i) => i.level === "warn")).toBe(true);
  });

  it("checks contrast against the section background", () => {
    const bad = auditDesign(doc([{ type: "text", text: "x", style: { color: "#cccccc" } }]), {
      sectionBg: "#ffffff",
    });
    expect(bad.some((i) => /contrast/.test(i.message))).toBe(true);
    const good = auditDesign(doc([{ type: "text", text: "x", style: { color: "#111111" } }]), {
      sectionBg: "#ffffff",
    });
    expect(good.some((i) => /contrast/.test(i.message))).toBe(false);
  });

  it("is gentler on large headings", () => {
    const issues = auditDesign(
      doc([{ type: "heading", text: "x", size: "xl", style: { color: "#888888" } }]),
      { sectionBg: "#ffffff" }
    );
    expect(issues.some((i) => /contrast/.test(i.message))).toBe(false);
  });

  it("warns about looping text and heavy scroll effects", () => {
    const blocks = [
      { type: "text", text: "x", idle: "pulse" },
      ...Array.from({ length: 5 }, () => ({
        type: "image",
        src: "/a.png",
        alt: "a",
        motion: { type: "fade", mode: "scrub" },
      })),
    ];
    const messages = auditDesign(doc(blocks))
      .map((i) => i.message)
      .join(" ");
    expect(messages).toMatch(/looping animation on text/);
    expect(messages).toMatch(/follow the scroll position/);
  });

  it("is quiet for a clean design", () => {
    expect(auditDesign(doc([{ type: "text", text: "hello" }]))).toEqual([]);
  });
});
