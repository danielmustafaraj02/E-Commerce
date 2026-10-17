-- Add optional Polish catalog translations. Existing rows stay valid and fall
-- back to English/Italian until staff enter the Polish copy in the admin.
ALTER TABLE "Category"
  ADD COLUMN "namePl" TEXT,
  ADD COLUMN "descriptionPl" TEXT;

ALTER TABLE "Product"
  ADD COLUMN "namePl" TEXT,
  ADD COLUMN "descriptionPl" TEXT,
  ADD COLUMN "storyPl" TEXT;
