import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaidOrder } from "@/lib/order-payment";

const mocks = vi.hoisted(() => ({
  sendOrderStatusEmail: vi.fn(),
  sendGiftVoucherEmail: vi.fn(),
  captureError: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendOrderStatusEmail: mocks.sendOrderStatusEmail,
  sendGiftVoucherEmail: mocks.sendGiftVoucherEmail,
}));
vi.mock("@/lib/monitoring", () => ({ captureError: mocks.captureError }));

import { sendPaidOrderEmails } from "./paid-order-emails";

const order = (extra: Partial<PaidOrder> = {}) =>
  ({
    orderNumber: "PM-1001",
    trackingNumber: null,
    guestEmail: "guest@example.com",
    user: null,
    locale: "it",
    giftVoucherIssue: null,
    ...extra,
  }) as unknown as PaidOrder;

describe("sendPaidOrderEmails", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends the paid status email", async () => {
    await sendPaidOrderEmails(order(), "stripe-webhook");
    expect(mocks.sendOrderStatusEmail).toHaveBeenCalledWith({
      orderNumber: "PM-1001",
      status: "paid",
      trackingNumber: null,
      guestEmail: "guest@example.com",
      user: null,
    });
    expect(mocks.sendGiftVoucherEmail).not.toHaveBeenCalled();
  });

  it("also sends a bought gift voucher, in the order's language", async () => {
    const voucher = { code: "GV-1" };
    await sendPaidOrderEmails(order({ giftVoucherIssue: voucher } as never), "paypal-webhook");
    expect(mocks.sendGiftVoucherEmail).toHaveBeenCalledWith(voucher, "it");
  });

  it("reports failures under the caller's scope and never throws", async () => {
    mocks.sendOrderStatusEmail.mockRejectedValueOnce(new Error("smtp down"));
    mocks.sendGiftVoucherEmail.mockRejectedValueOnce(new Error("smtp down"));
    await expect(
      sendPaidOrderEmails(order({ giftVoucherIssue: { code: "GV-1" } } as never), "paypal-return")
    ).resolves.toBeUndefined();
    expect(mocks.captureError).toHaveBeenCalledWith(expect.any(Error), {
      scope: "paypal-return-order-email",
      orderNumber: "PM-1001",
    });
    expect(mocks.captureError).toHaveBeenCalledWith(expect.any(Error), {
      scope: "paypal-return-gift-voucher-email",
      orderNumber: "PM-1001",
    });
    expect(mocks.sendGiftVoucherEmail).toHaveBeenCalled();
  });
});
