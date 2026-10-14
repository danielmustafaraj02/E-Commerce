import { describe, it, expect } from "vitest";
import { repairLegalContent, sellerDetails } from "./legal-content";

describe("starter legal corrections", () => {
  it("preserves bespoke policies", () => {
    expect(repairLegalContent("returns", "Our individually reviewed return policy")).toBe(
      "Our individually reviewed return policy"
    );
  });
  it("repairs the refund trigger and is idempotent", () => {
    const original =
      "1. EU 14-day right of withdrawal\nOnce we receive and inspect the return, we'll refund the original payment method within 14 days\nwith your order number and reason for return.";
    const repaired = repairLegalContent("returns", original);
    expect(repaired).toContain("14 days of being informed");
    expect(repaired).toContain("No reason is required");
    expect(repaired).toContain("Model withdrawal form");
    expect(repairLegalContent("returns", repaired)).toBe(repaired);
  });
  it("omits demo identities and shows the configured seller", () => {
    expect(
      sellerDetails({
        companyLegalName: "Demo Store S.r.l.",
        companyAddress: "Via Roma 1, 00100 Roma, Italy",
        vatNumber: "IT00000000000",
      })
    ).toEqual([]);
    expect(
      sellerDetails({
        companyLegalName: "Seller",
        companyAddress: "Real address",
        vatNumber: "12345678901",
      })
    ).toEqual(["Seller", "Real address", "P. IVA: 12345678901"]);
  });
});
