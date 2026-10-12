-- Per-article opening design ('' = follow the site-wide Article layout choice)
-- and the article's own drag/resize/rotate adjustments to it.
ALTER TABLE "JournalPost" ADD COLUMN "openingTemplate" TEXT NOT NULL DEFAULT '';
ALTER TABLE "JournalPost" ADD COLUMN "openingLayout" JSONB NOT NULL DEFAULT '{}';

-- Numbered saved designs are scoped to an individual page section.
CREATE TABLE "PageTemplate" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "doc" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PageTemplate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PageTemplate_target_sectionId_slot_key" ON "PageTemplate"("target", "sectionId", "slot");
CREATE INDEX "PageTemplate_target_sectionId_idx" ON "PageTemplate"("target", "sectionId");
