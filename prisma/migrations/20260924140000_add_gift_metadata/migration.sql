-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "giftOccasions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "giftRecipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "giftStyles" TEXT[] DEFAULT ARRAY[]::TEXT[];

