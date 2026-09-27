import type { Prisma } from "@prisma/client";

// Restore a reservation exactly once. Call only in the same transaction that
// moves an unpaid order to cancelled or a paid order to refunded.
export async function restoreGiftVoucherRedemption(
  tx: Prisma.TransactionClient,
  order: {
    id: string;
    appliedGiftVoucherId: string | null;
    giftVoucherRedeemedAmount: number;
    giftVoucherRestoredAt: Date | null;
  }
) {
  if (
    !order.appliedGiftVoucherId ||
    order.giftVoucherRedeemedAmount <= 0 ||
    order.giftVoucherRestoredAt
  ) {
    return false;
  }

  const claimed = await tx.order.updateMany({
    where: { id: order.id, giftVoucherRestoredAt: null },
    data: { giftVoucherRestoredAt: new Date() },
  });
  if (claimed.count !== 1) return false;

  await tx.giftVoucher.update({
    where: { id: order.appliedGiftVoucherId },
    data: { balance: { increment: order.giftVoucherRedeemedAmount } },
  });
  return true;
}
