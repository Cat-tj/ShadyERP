CREATE TYPE "LaundryServiceType" AS ENUM ('KILOAN', 'SATUAN', 'DRY_CLEAN', 'SETRIKA', 'EXPRESS');
CREATE TYPE "LaundryOrderStatus" AS ENUM ('RECEIVED', 'WASHING', 'DRYING', 'IRONING', 'READY', 'PICKED_UP', 'CANCELLED');

CREATE TABLE "LaundryOrder" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "outletId" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT,
  "serviceType" "LaundryServiceType" NOT NULL DEFAULT 'KILOAN',
  "weightGram" INTEGER,
  "itemQty" INTEGER,
  "pricePerKg" INTEGER,
  "servicePrice" INTEGER NOT NULL DEFAULT 0,
  "extraFee" INTEGER NOT NULL DEFAULT 0,
  "discountAmount" INTEGER NOT NULL DEFAULT 0,
  "total" INTEGER NOT NULL,
  "paidAmount" INTEGER NOT NULL DEFAULT 0,
  "dueAt" TIMESTAMP(3),
  "pickupDelivery" BOOLEAN NOT NULL DEFAULT false,
  "deliveryAddress" TEXT,
  "status" "LaundryOrderStatus" NOT NULL DEFAULT 'RECEIVED',
  "note" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LaundryOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LaundryOrder_orderNumber_key" ON "LaundryOrder"("orderNumber");
CREATE INDEX "LaundryOrder_tenantId_idx" ON "LaundryOrder"("tenantId");
CREATE INDEX "LaundryOrder_outletId_idx" ON "LaundryOrder"("outletId");
CREATE INDEX "LaundryOrder_status_idx" ON "LaundryOrder"("status");
CREATE INDEX "LaundryOrder_dueAt_idx" ON "LaundryOrder"("dueAt");

ALTER TABLE "LaundryOrder" ADD CONSTRAINT "LaundryOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaundryOrder" ADD CONSTRAINT "LaundryOrder_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaundryOrder" ADD CONSTRAINT "LaundryOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
