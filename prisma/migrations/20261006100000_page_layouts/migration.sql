-- CreateTable
CREATE TABLE "PageLayout" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageLayout_target_key" ON "PageLayout"("target");
