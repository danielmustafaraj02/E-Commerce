-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "lookId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "bundleDiscountAmount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Look" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "discountPercent" INTEGER NOT NULL DEFAULT 15,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Look_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_lookId_idx" ON "Product"("lookId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_lookId_fkey" FOREIGN KEY ("lookId") REFERENCES "Look"("id") ON DELETE SET NULL ON UPDATE CASCADE;
