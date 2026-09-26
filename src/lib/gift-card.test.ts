import { describe, expect, it } from "vitest";
import {
  giftCardLines,
  giftCardSchema,
  parseGiftCardBack,
  parseGiftCardStickers,
  GIFT_CARD_MESSAGE_MAX,
} from "./gift-card";

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

describe("stickers and back", () => {
  const card = { messageType: "custom", message: "Hi", font: "serif" };
  const heart = { icon: "heart", x: 20, y: 30 };

  it("accepts up to three stickers placed on the card and a known back", () => {
    expect(
      giftCardSchema.safeParse({ ...card, stickers: [heart, heart, heart], back: "lagoon" }).success
    ).toBe(true);
  });

  it("refuses a fourth sticker, one off the card, an unknown motif or back", () => {
    expect(giftCardSchema.safeParse({ ...card, stickers: [heart, heart, heart, heart] }).success).toBe(false);
    expect(giftCardSchema.safeParse({ ...card, stickers: [{ ...heart, x: 101 }] }).success).toBe(false);
    expect(giftCardSchema.safeParse({ ...card, stickers: [{ ...heart, icon: "skull" }] }).success).toBe(false);
    expect(giftCardSchema.safeParse({ ...card, back: "gold" }).success).toBe(false);
  });

  it("reads stored stickers leniently and defaults the back to ivory", () => {
    expect(parseGiftCardStickers([heart, { icon: "nope", x: 1, y: 1 }, "x"])).toEqual([heart]);
    expect(parseGiftCardStickers(null)).toEqual([]);
    expect(parseGiftCardBack("ruby")).toBe("ruby");
    expect(parseGiftCardBack(null)).toBe("ivory");
  });
});
