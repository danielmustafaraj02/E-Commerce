-- AlterTable
ALTER TABLE "ImprovementTask" ADD COLUMN     "claudeClaimedAt" TIMESTAMP(3),
ADD COLUMN     "claudeReport" TEXT,
ADD COLUMN     "claudeReportAt" TIMESTAMP(3),
ADD COLUMN     "forClaude" BOOLEAN NOT NULL DEFAULT false;

