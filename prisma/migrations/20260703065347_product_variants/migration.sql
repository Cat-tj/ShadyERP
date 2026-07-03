-- CreateEnum
CREATE TYPE "VariantGroupType" AS ENUM ('SINGLE', 'MULTIPLE');

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "variantLabel" TEXT;

-- AlterTable
ALTER TABLE "TableOrderItem" ADD COLUMN     "variantLabel" TEXT;

-- CreateTable
CREATE TABLE "ProductVariantGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "VariantGroupType" NOT NULL DEFAULT 'SINGLE',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariantGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantOption" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "variantGroupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceDelta" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductVariantOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariantGroup_tenantId_idx" ON "ProductVariantGroup"("tenantId");

-- CreateIndex
CREATE INDEX "ProductVariantGroup_productId_idx" ON "ProductVariantGroup"("productId");

-- CreateIndex
CREATE INDEX "ProductVariantOption_tenantId_idx" ON "ProductVariantOption"("tenantId");

-- CreateIndex
CREATE INDEX "ProductVariantOption_variantGroupId_idx" ON "ProductVariantOption"("variantGroupId");

-- AddForeignKey
ALTER TABLE "ProductVariantGroup" ADD CONSTRAINT "ProductVariantGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantGroup" ADD CONSTRAINT "ProductVariantGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "ProductVariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

