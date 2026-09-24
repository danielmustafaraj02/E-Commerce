import { describe, expect, it } from "vitest";
import { giftCardLines, giftCardSchema, GIFT_CARD_MESSAGE_MAX } from "./gift-card";

const labels = { forLine: "For {name}", fromLine: "With love, {name}" };

describe("giftCardLines", () => {
  it("prints greeting, message and sign-off in the customer's words", () => {
    expect(
      giftCardLines({ message: " A little piece of Venice. ", recipient: "Sofia", sender: "Marco" }, labels)
    ).toEqual(["For Sofia", "A little piece of Venice.", "With love, Marco"]);
  });

  it("leaves out the names nobody filled in", () => {
    expect(giftCardLines({ message: "Ciao", recipient: " ", sender: undefined }, labels)).toEqual([
      "Ciao",
    ]);
  });

  it("lets a language put the name first", () => {
    expect(
      giftCardLines({ message: "x", recipient: "ソフィア" }, { forLine: "{name}さまへ", fromLine: "" })
    ).toEqual(["ソフィアさまへ", "x"]);
  });
});

describe("giftCardSchema", () => {
  const card = { messageType: "custom", message: "Hi", font: "serif" };

  it("accepts a card with only a message and a font", () => {
    expect(giftCardSchema.safeParse(card).success).toBe(true);
  });

  it("refuses empty or too-long messages and unknown fonts", () => {
    expect(giftCardSchema.safeParse({ ...card, message: "   " }).success).toBe(false);
    expect(
      giftCardSchema.safeParse({ ...card, message: "x".repeat(GIFT_CARD_MESSAGE_MAX + 1) }).success
    ).toBe(false);
    expect(giftCardSchema.safeParse({ ...card, font: "comic" }).success).toBe(false);
  });
});
