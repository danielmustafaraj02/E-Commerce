import { describe, expect, it } from "vitest";
import { roadmapTaskPrompt } from "./roadmap-prompt";

describe("roadmapTaskPrompt", () => {
  it("includes the priority, title, details and working instructions", () => {
    const prompt = roadmapTaskPrompt({
      title: "Add a size guide",
      description: "  Rings and bracelets, in cm.  ",
      priority: "high",
    });

    expect(prompt).toMatch(/^Task from the Perla Murano Glass roadmap .*, high priority:/);
    expect(prompt).toContain("# Add a size guide\n\nRings and bracelets, in cm.\n\n");
    expect(prompt).toContain("Write the tests first");
    expect(prompt).toContain("never push to main");
    expect(prompt).toContain("what I should check");
  });

  it("leaves no empty gap when there are no details", () => {
    const prompt = roadmapTaskPrompt({ title: "Fix footer", description: null, priority: "low" });

    expect(prompt).toContain("# Fix footer\n\nBefore coding:");
  });
});
