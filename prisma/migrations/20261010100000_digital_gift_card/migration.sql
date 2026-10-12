-- The personalised gift card becomes digital: emailed to the recipient once
-- the order is paid, and opened on its own page by an unguessable token.
ALTER TABLE "Order" ADD COLUMN     "giftCardRecipientEmail" TEXT,
ADD COLUMN     "giftCardToken" TEXT,
ADD COLUMN     "giftCardSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_giftCardToken_key" ON "Order"("giftCardToken");
