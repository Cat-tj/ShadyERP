-- CreateEnum
CREATE TYPE "ProductSerialStatus" AS ENUM ('IN_STOCK', 'SOLD');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "trackSerial" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ProductSerial" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" "ProductSerialStatus" NOT NULL DEFAULT 'IN_STOCK',
    "saleItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "ProductSerial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSerial_tenantId_productId_outletId_status_idx" ON "ProductSerial"("tenantId", "productId", "outletId", "status");

-- CreateIndex
CREATE INDEX "ProductSerial_saleItemId_idx" ON "ProductSerial"("saleItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSerial_tenantId_serialNumber_key" ON "ProductSerial"("tenantId", "serialNumber");

-- AddForeignKey
ALTER TABLE "ProductSerial" ADD CONSTRAINT "ProductSerial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSerial" ADD CONSTRAINT "ProductSerial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSerial" ADD CONSTRAINT "ProductSerial_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSerial" ADD CONSTRAINT "ProductSerial_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES "SaleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
