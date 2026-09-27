import type { Prisma } from "@prisma/client";
import { createGiftVoucherCode } from "@/lib/gift-voucher";

export type PaidOrder = Prisma.OrderGetPayload<{
  include: { user: { select: { email: true } }; giftVoucherIssue: true };
}>;

export type ApplyPaidResult =
  | { outcome: "paid"; order: PaidOrder }
  // Already paid/shipped/etc. — a webhook retry or the return-route fast path
  // got there first. Nothing to do.
  | { outcome: "already_settled"; order: PaidOrder }
  // Money arrived for an order we had already cancelled (the abandoned-order
  // cron cancels after 48h and releases the stock, but slow methods such as
  // SEPA debit can settle later). The order is left cancelled — reinstating
  // it could oversell, and the cron's cancellation is indistinguishable from
  // an admin's deliberate one — so a person has to reinstate or refund it.
  | { outcome: "paid_after_cancel"; order: PaidOrder }
  // The provider reports a different amount/currency than the order total.
  | { outcome: "amount_mismatch"; order: PaidOrder }
  | { outcome: "not_found" };

// Single place that decides what "the provider says this order was paid"
// means for the order row, shared by every payment webhook so they can't
// drift apart. Runs inside the caller's transaction and only touches the
// order; the caller records the outcome on the matching Payment row.
//
// `paid` is the amount the provider actually collected, when the event carries
// one. A status alone says nothing about *how much* was taken, so when it is
// present it must equal the order total.
export async function applyPaidToOrder(
  tx: Prisma.TransactionClient,
  where: Prisma.OrderWhereUniqueInput,
  paid?: { amount: number; currency: string }
): Promise<ApplyPaidResult> {
  const order = await tx.order.findUnique({
    where,
    include: {
      user: { select: { email: true } },
      giftVoucherIssue: true,
    },
  });
  if (!order) return { outcome: "not_found" };

  if (
    paid &&
    (paid.amount !== order.total || paid.currency.toUpperCase() !== order.currency.toUpperCase())
  ) {
    return { outcome: "amount_mismatch", order };
  }

  if (order.status === "pending") {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });
    const paidOrder = { ...order, status: "paid" };
    const giftVoucherIssue = paidOrder.giftVoucherPurchaseAmount
      ? await issueGiftVoucher(tx, paidOrder)
      : null;
    return {
      outcome: "paid",
      order: {
        ...paidOrder,
        giftVoucherIssue: giftVoucherIssue ?? paidOrder.giftVoucherIssue,
      },
    };
  }
  if (order.status === "cancelled") return { outcome: "paid_after_cancel", order };
  if (
    ["paid", "processing", "shipped", "delivered"].includes(order.status) &&
    order.giftVoucherPurchaseAmount > 0 &&
    !order.giftVoucherIssue
  ) {
    const giftVoucherIssue = await issueGiftVoucher(tx, order);
    return {
      outcome: "already_settled",
      order: { ...order, giftVoucherIssue },
    };
  }
  return { outcome: "already_settled", order };
}

export async function issueGiftVoucher(
  tx: Prisma.TransactionClient,
  order: Pick<
    PaidOrder,
    | "id"
    | "currency"
    | "total"
    | "giftVoucherPurchaseAmount"
    | "giftVoucherRecipientEmail"
    | "giftVoucherRecipientName"
    | "giftVoucherSenderName"
    | "giftVoucherMessage"
  >
) {
  if (order.giftVoucherPurchaseAmount <= 0) return null;
  if (
    order.currency !== "EUR" ||
    order.total !== order.giftVoucherPurchaseAmount ||
    !order.giftVoucherRecipientEmail
  ) {
    throw new Error("Gift voucher order is missing valid purchase details");
  }

  const existing = await tx.giftVoucher.findUnique({
    where: { purchaseOrderId: order.id },
  });
  if (existing) return existing;

  return tx.giftVoucher.create({
    data: {
      code: createGiftVoucherCode(),
      originalAmount: order.giftVoucherPurchaseAmount,
      balance: order.giftVoucherPurchaseAmount,
      currency: order.currency,
      recipientEmail: order.giftVoucherRecipientEmail,
      recipientName: order.giftVoucherRecipientName,
      senderName: order.giftVoucherSenderName,
      message: order.giftVoucherMessage,
      purchaseOrderId: order.id,
    },
  });
}
