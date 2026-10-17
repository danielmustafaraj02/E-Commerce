-- Add optional Czech, Swedish, and Romanian catalog translations. Existing
-- rows stay valid and fall back to English/Italian until staff add translations.
ALTER TABLE "Category"
  ADD COLUMN "nameCs" TEXT,
  ADD COLUMN "descriptionCs" TEXT,
  ADD COLUMN "nameSv" TEXT,
  ADD COLUMN "descriptionSv" TEXT,
  ADD COLUMN "nameRo" TEXT,
  ADD COLUMN "descriptionRo" TEXT;

ALTER TABLE "Product"
  ADD COLUMN "nameCs" TEXT,
  ADD COLUMN "descriptionCs" TEXT,
  ADD COLUMN "storyCs" TEXT,
  ADD COLUMN "nameSv" TEXT,
  ADD COLUMN "descriptionSv" TEXT,
  ADD COLUMN "storySv" TEXT,
  ADD COLUMN "nameRo" TEXT,
  ADD COLUMN "descriptionRo" TEXT,
  ADD COLUMN "storyRo" TEXT;
