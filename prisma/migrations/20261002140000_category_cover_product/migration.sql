-- Per-category cover product: the piece whose first photo represents the
-- category on the homepage shelf and in the header's Products menu, chosen in
-- Admin > Categories instead of being hardcoded by slug in the application.
ALTER TABLE "Category" ADD COLUMN "coverProductId" TEXT;

CREATE INDEX "Category_coverProductId_idx" ON "Category"("coverProductId");

ALTER TABLE "Category" ADD CONSTRAINT "Category_coverProductId_fkey"
  FOREIGN KEY ("coverProductId") REFERENCES "Product"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Carry over the three covers that used to live in
-- CATEGORY_COVER_PRODUCT_SLUGS (src/lib/homepage-data.ts), so the storefront
-- looks exactly the same after this migration and the admin field starts out
-- filled in rather than empty. Stores without these products are unaffected.
UPDATE "Category" SET "coverProductId" = "Product"."id"
FROM "Product"
WHERE "Product"."categoryId" = "Category"."id"
  AND "Product"."slug" IN (
    'bracciale-rame-di-mezzanotte-ca793a',
    'collana-fiore-notturno-15492b',
    'orecchini-goccia-di-rubino-9ad623'
  );
