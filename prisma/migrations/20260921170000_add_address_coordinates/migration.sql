-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "geocodeLabel" TEXT,
ADD COLUMN     "geocodedAt" TIMESTAMP(3),
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;

