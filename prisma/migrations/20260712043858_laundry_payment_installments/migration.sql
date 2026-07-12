-- CreateTable
CREATE TABLE "LaundryPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "laundryOrderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaundryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LaundryPayment_tenantId_idx" ON "LaundryPayment"("tenantId");

-- CreateIndex
CREATE INDEX "LaundryPayment_laundryOrderId_idx" ON "LaundryPayment"("laundryOrderId");

-- AddForeignKey
ALTER TABLE "LaundryPayment" ADD CONSTRAINT "LaundryPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryPayment" ADD CONSTRAINT "LaundryPayment_laundryOrderId_fkey" FOREIGN KEY ("laundryOrderId") REFERENCES "LaundryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
