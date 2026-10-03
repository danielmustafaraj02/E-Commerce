-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN "homeLayout" JSONB,
ADD COLUMN "productPageLayout" JSONB;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "pageLayout" JSONB;
