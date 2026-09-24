import { describe, expect, it } from "vitest";
import { buildFaq, faqJsonLd, FAQ_INITIAL } from "./faq";
import { getDictionary } from "./i18n/dictionaries";
import { locales } from "./i18n/locale-constants";

const facts = {
  prices: { northAmerica: "30 €", rest: "40 €" },
  days: { europe: "3–5", northAmerica: "5–10", rest: "7–15" },
};

describe("buildFaq", () => {
  const faq = buildFaq(getDictionary("en"), facts, "shop@example.com");

  it("has the ten questions, the purchase doubts first", () => {
    expect(faq.map((q) => q.id)).toEqual([
      "authentic",
      "shipping-cost",
      "shipping-time",
      "returns",
      "where",
      "gift-packaging",
      "gift",
      "care",
      "damaged",
      "contact",
    ]);
    expect(FAQ_INITIAL).toBe(6);
  });

  it("fills shipping answers from the configured zones", () => {
    const cost = faq.find((q) => q.id === "shipping-cost")!.answer;
    const time = faq.find((q) => q.id === "shipping-time")!.answer;
    expect(cost).toContain("30 €");
    expect(cost).toContain("40 €");
    expect(time).toContain("3–5");
    expect(time).toContain("7–15");
  });

  it("points to checkout instead of guessing when zones aren't configured", () => {
    const bare = buildFaq(getDictionary("en"), { prices: null, days: null }, "a@b.c");
    expect(bare.find((q) => q.id === "shipping-cost")!.answer).toMatch(/checkout/);
    expect(bare.find((q) => q.id === "shipping-time")!.answer).toMatch(/checkout/);
  });

  it("uses the store's real contact address and existing pages", () => {
    expect(faq.find((q) => q.id === "contact")!.answer).toContain("shop@example.com");
    expect(faq.find((q) => q.id === "returns")!.link?.href).toBe("/legal/returns");
    expect(faq.find((q) => q.id === "damaged")!.link?.href).toBe("/contact");
  });

  it("leaves no unfilled placeholder in any language", () => {
    for (const locale of locales) {
      for (const q of buildFaq(getDictionary(locale), facts, "a@b.c")) {
        expect(q.answer, `${locale} ${q.id}`).not.toMatch(/\{\w+\}/);
      }
    }
  });
});

describe("faqJsonLd", () => {
  it("mirrors the visible questions and answers", () => {
    const faq = buildFaq(getDictionary("en"), facts, "a@b.c");
    const ld = faqJsonLd(faq);
    expect(ld.mainEntity).toHaveLength(faq.length);
    expect(ld.mainEntity[0]).toEqual({
      "@type": "Question",
      name: faq[0].question,
      acceptedAnswer: { "@type": "Answer", text: faq[0].answer },
    });
  });
});
