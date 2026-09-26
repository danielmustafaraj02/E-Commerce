import type { Prisma } from "@prisma/client";

export type PaidOrder = Prisma.OrderGetPayload<{ include: { user: { select: { email: true } } } }>;

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
    include: { user: { select: { email: true } } },
  });
  if (!order) return { outcome: "not_found" };

  if (
    paid &&
    (paid.amount !== order.total || paid.currency.toUpperCase() !== order.currency.toUpperCase())
  ) {
    return { outcome: "amount_mismatch", order };
  }

  if (order.status === "pending") {
    await tx.order.update({ where: { id: order.id }, data: { status: "paid" } });
    return { outcome: "paid", order };
  }
  if (order.status === "cancelled") return { outcome: "paid_after_cancel", order };
  return { outcome: "already_settled", order };
}
