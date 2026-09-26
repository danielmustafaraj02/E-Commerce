-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "giftCardEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "giftCardPrice" INTEGER NOT NULL DEFAULT 500;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "giftCardAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "giftCardFont" TEXT,
ADD COLUMN     "giftCardMessage" TEXT,
ADD COLUMN     "giftCardMessageType" TEXT,
ADD COLUMN     "giftCardRecipient" TEXT,
ADD COLUMN     "giftCardSender" TEXT;

