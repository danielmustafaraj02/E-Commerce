-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN "paypalClientId" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "paypalClientSecret" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "paypalWebhookId" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "stripePublishableKey" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "stripeSecretKey" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "stripeWebhookSecret" TEXT;
