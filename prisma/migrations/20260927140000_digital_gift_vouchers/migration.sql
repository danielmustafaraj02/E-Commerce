ALTER TABLE "Order"
ADD COLUMN "giftVoucherPurchaseAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "giftVoucherRecipientEmail" TEXT,
ADD COLUMN "giftVoucherRecipientName" TEXT,
ADD COLUMN "giftVoucherSenderName" TEXT,
ADD COLUMN "giftVoucherMessage" TEXT,
ADD COLUMN "appliedGiftVoucherId" TEXT,
ADD COLUMN "giftVoucherRedeemedAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "giftVoucherRestoredAt" TIMESTAMP(3);

CREATE TABLE "GiftVoucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "originalAmount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'active',
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "senderName" TEXT,
    "message" TEXT,
    "purchaseOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftVoucher_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GiftVoucher_code_key" ON "GiftVoucher"("code");
CREATE UNIQUE INDEX "GiftVoucher_purchaseOrderId_key" ON "GiftVoucher"("purchaseOrderId");
CREATE INDEX "GiftVoucher_recipientEmail_idx" ON "GiftVoucher"("recipientEmail");
CREATE INDEX "GiftVoucher_status_balance_idx" ON "GiftVoucher"("status", "balance");
CREATE INDEX "Order_appliedGiftVoucherId_idx" ON "Order"("appliedGiftVoucherId");

ALTER TABLE "GiftVoucher"
ADD CONSTRAINT "GiftVoucher_purchaseOrderId_fkey"
FOREIGN KEY ("purchaseOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order"
ADD CONSTRAINT "Order_appliedGiftVoucherId_fkey"
FOREIGN KEY ("appliedGiftVoucherId") REFERENCES "GiftVoucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
