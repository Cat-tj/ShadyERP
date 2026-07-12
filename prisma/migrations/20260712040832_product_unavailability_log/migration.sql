-- CreateTable
CREATE TABLE "ProductUnavailabilityLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductUnavailabilityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductUnavailabilityLog_tenantId_idx" ON "ProductUnavailabilityLog"("tenantId");

-- CreateIndex
CREATE INDEX "ProductUnavailabilityLog_productId_idx" ON "ProductUnavailabilityLog"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductUnavailabilityLog_tenantId_outletId_productId_date_key" ON "ProductUnavailabilityLog"("tenantId", "outletId", "productId", "date");

-- AddForeignKey
ALTER TABLE "ProductUnavailabilityLog" ADD CONSTRAINT "ProductUnavailabilityLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUnavailabilityLog" ADD CONSTRAINT "ProductUnavailabilityLog_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUnavailabilityLog" ADD CONSTRAINT "ProductUnavailabilityLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
