-- AlterTable
ALTER TABLE "JournalPost" ADD COLUMN "sources" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "translationIt" JSONB;
