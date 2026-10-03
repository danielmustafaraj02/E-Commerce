-- AlterTable
ALTER TABLE "StoreSettings"
ADD COLUMN     "muranoReasonProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
