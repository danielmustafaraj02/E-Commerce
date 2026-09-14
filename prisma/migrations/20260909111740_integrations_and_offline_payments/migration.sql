-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StoreSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeName" TEXT NOT NULL DEFAULT 'My Store',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#111827',
    "secondaryColor" TEXT NOT NULL DEFAULT '#4F46E5',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "defaultLocale" TEXT NOT NULL DEFAULT 'en-US',
    "contactEmail" TEXT NOT NULL DEFAULT 'hello@example.com',
    "vatNumber" TEXT,
    "companyLegalName" TEXT,
    "companyAddress" TEXT,
    "pricesIncludeTax" BOOLEAN NOT NULL DEFAULT true,
    "freeShippingThreshold" INTEGER,
    "stripeSecretKey" TEXT,
    "stripePublishableKey" TEXT,
    "stripeWebhookSecret" TEXT,
    "paypalClientId" TEXT,
    "paypalClientSecret" TEXT,
    "paypalWebhookId" TEXT,
    "resendApiKey" TEXT,
    "emailFrom" TEXT,
    "turnstileSiteKey" TEXT,
    "turnstileSecretKey" TEXT,
    "upstashRedisUrl" TEXT,
    "upstashRedisToken" TEXT,
    "googleClientId" TEXT,
    "googleClientSecret" TEXT,
    "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT false,
    "bankAccountHolder" TEXT,
    "bankIban" TEXT,
    "bankBic" TEXT,
    "codEnabled" BOOLEAN NOT NULL DEFAULT false,
    "codFee" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_StoreSettings" ("companyAddress", "companyLegalName", "contactEmail", "createdAt", "defaultCurrency", "defaultLocale", "fontFamily", "freeShippingThreshold", "id", "logoUrl", "paypalClientId", "paypalClientSecret", "paypalWebhookId", "pricesIncludeTax", "primaryColor", "secondaryColor", "storeName", "stripePublishableKey", "stripeSecretKey", "stripeWebhookSecret", "updatedAt", "vatNumber") SELECT "companyAddress", "companyLegalName", "contactEmail", "createdAt", "defaultCurrency", "defaultLocale", "fontFamily", "freeShippingThreshold", "id", "logoUrl", "paypalClientId", "paypalClientSecret", "paypalWebhookId", "pricesIncludeTax", "primaryColor", "secondaryColor", "storeName", "stripePublishableKey", "stripeSecretKey", "stripeWebhookSecret", "updatedAt", "vatNumber" FROM "StoreSettings";
DROP TABLE "StoreSettings";
ALTER TABLE "new_StoreSettings" RENAME TO "StoreSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
