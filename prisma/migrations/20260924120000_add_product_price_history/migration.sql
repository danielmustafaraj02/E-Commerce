-- CreateTable
CREATE TABLE "ProductPriceChange" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductPriceChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductPriceChange_productId_changedAt_idx" ON "ProductPriceChange"("productId", "changedAt");

-- AddForeignKey
ALTER TABLE "ProductPriceChange" ADD CONSTRAINT "ProductPriceChange_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Record every price a product gets, whoever writes it (admin form, scripts,
-- raw SQL), so the Omnibus "lowest price in the last 30 days" check on
-- compareAtPrice (src/lib/price-history.ts) has a complete history.
CREATE FUNCTION "record_product_price_change"() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW."price" IS DISTINCT FROM OLD."price" THEN
    INSERT INTO "ProductPriceChange" ("id", "productId", "price", "changedAt")
    VALUES (gen_random_uuid()::text, NEW."id", NEW."price", CURRENT_TIMESTAMP);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Product_record_price_change"
AFTER INSERT OR UPDATE OF "price" ON "Product"
FOR EACH ROW EXECUTE FUNCTION "record_product_price_change"();

-- History starts now: each existing product's current price is its first
-- known price.
INSERT INTO "ProductPriceChange" ("id", "productId", "price", "changedAt")
SELECT gen_random_uuid()::text, "id", "price", CURRENT_TIMESTAMP FROM "Product";
