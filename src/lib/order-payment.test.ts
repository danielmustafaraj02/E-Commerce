import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import { applyPaidToOrder } from "./order-payment";

const findUnique = vi.fn();
const update = vi.fn();
const tx = { order: { findUnique, update } } as unknown as Prisma.TransactionClient;

function order(status: string, overrides: Record<string, unknown> = {}) {
  return { id: "o1", status, total: 5167, currency: "EUR", user: null, ...overrides };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("applyPaidToOrder", () => {
  it("marks a pending order paid", async () => {
    findUnique.mockResolvedValue(order("pending"));

    const result = await applyPaidToOrder(tx, { orderNumber: "ORD-1" });

    expect(result.outcome).toBe("paid");
    expect(update).toHaveBeenCalledWith({ where: { id: "o1" }, data: { status: "paid" } });
  });

  it("accepts a matching collected amount (currency compared case-insensitively)", async () => {
    findUnique.mockResolvedValue(order("pending"));

    const result = await applyPaidToOrder(
      tx,
      { orderNumber: "ORD-1" },
      { amount: 5167, currency: "eur" }
    );

    expect(result.outcome).toBe("paid");
  });

  it("refuses to mark paid when the collected amount differs", async () => {
    findUnique.mockResolvedValue(order("pending"));

    const result = await applyPaidToOrder(
      tx,
      { orderNumber: "ORD-1" },
      { amount: 100, currency: "EUR" }
    );

    expect(result.outcome).toBe("amount_mismatch");
    expect(update).not.toHaveBeenCalled();
  });

  it("refuses to mark paid when the currency differs", async () => {
    findUnique.mockResolvedValue(order("pending"));

    const result = await applyPaidToOrder(
      tx,
      { orderNumber: "ORD-1" },
      { amount: 5167, currency: "USD" }
    );

    expect(result.outcome).toBe("amount_mismatch");
    expect(update).not.toHaveBeenCalled();
  });

  it("reports money arriving for a cancelled order without reinstating it", async () => {
    findUnique.mockResolvedValue(order("cancelled"));

    const result = await applyPaidToOrder(tx, { orderNumber: "ORD-1" });

    expect(result.outcome).toBe("paid_after_cancel");
    expect(update).not.toHaveBeenCalled();
  });

  it.each(["paid", "shipped", "delivered"])(
    "leaves a %s order alone (webhook retry)",
    async (status) => {
      findUnique.mockResolvedValue(order(status));

      const result = await applyPaidToOrder(tx, { orderNumber: "ORD-1" });

      expect(result.outcome).toBe("already_settled");
      expect(update).not.toHaveBeenCalled();
    }
  );

  it("reports an unknown order", async () => {
    findUnique.mockResolvedValue(null);

    expect((await applyPaidToOrder(tx, { orderNumber: "NOPE" })).outcome).toBe("not_found");
  });
});
