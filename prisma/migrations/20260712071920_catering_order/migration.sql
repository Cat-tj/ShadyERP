-- CreateEnum
CREATE TYPE "CateringOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DONE', 'CANCELLED');

-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'CATERING';

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "cateringOrderId" TEXT;

-- CreateTable
CREATE TABLE "CateringOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "memberId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "eventName" TEXT,
    "eventAddress" TEXT,
    "eventDate" TIMESTAMP(3),
    "total" INTEGER NOT NULL,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "operationalCost" INTEGER,
    "status" "CateringOrderStatus" NOT NULL DEFAULT 'PENDING',
    "pointsAwarded" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CateringOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CateringOrderItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cateringOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "CateringOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CateringPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cateringOrderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CateringPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CateringOrder_orderNumber_key" ON "CateringOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "CateringOrder_tenantId_idx" ON "CateringOrder"("tenantId");

-- CreateIndex
CREATE INDEX "CateringOrder_outletId_idx" ON "CateringOrder"("outletId");

-- CreateIndex
CREATE INDEX "CateringOrder_memberId_idx" ON "CateringOrder"("memberId");

-- CreateIndex
CREATE INDEX "CateringOrder_status_idx" ON "CateringOrder"("status");

-- CreateIndex
CREATE INDEX "CateringOrderItem_tenantId_idx" ON "CateringOrderItem"("tenantId");

-- CreateIndex
CREATE INDEX "CateringOrderItem_cateringOrderId_idx" ON "CateringOrderItem"("cateringOrderId");

-- CreateIndex
CREATE INDEX "CateringPayment_tenantId_idx" ON "CateringPayment"("tenantId");

-- CreateIndex
CREATE INDEX "CateringPayment_cateringOrderId_idx" ON "CateringPayment"("cateringOrderId");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cateringOrderId_fkey" FOREIGN KEY ("cateringOrderId") REFERENCES "CateringOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringOrder" ADD CONSTRAINT "CateringOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringOrder" ADD CONSTRAINT "CateringOrder_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringOrder" ADD CONSTRAINT "CateringOrder_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringOrder" ADD CONSTRAINT "CateringOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringOrderItem" ADD CONSTRAINT "CateringOrderItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringOrderItem" ADD CONSTRAINT "CateringOrderItem_cateringOrderId_fkey" FOREIGN KEY ("cateringOrderId") REFERENCES "CateringOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringOrderItem" ADD CONSTRAINT "CateringOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringPayment" ADD CONSTRAINT "CateringPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringPayment" ADD CONSTRAINT "CateringPayment_cateringOrderId_fkey" FOREIGN KEY ("cateringOrderId") REFERENCES "CateringOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
