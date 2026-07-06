CREATE TYPE "CashOutMethod" AS ENUM ('DEBIT_CARD', 'CREDIT_CARD', 'QRIS', 'TRANSFER', 'EWALLET');

CREATE TYPE "CashOutStatus" AS ENUM ('COMPLETED', 'VOIDED');

CREATE TABLE "CashOutTransaction" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "outletId" TEXT NOT NULL,
  "shiftId" TEXT NOT NULL,
  "cashierId" TEXT NOT NULL,
  "referenceNumber" TEXT NOT NULL,
  "customerName" TEXT,
  "customerPhone" TEXT,
  "withdrawAmount" INTEGER NOT NULL,
  "adminFee" INTEGER NOT NULL DEFAULT 0,
  "totalCharged" INTEGER NOT NULL,
  "method" "CashOutMethod" NOT NULL,
  "status" "CashOutStatus" NOT NULL DEFAULT 'COMPLETED',
  "voidReason" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CashOutTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CashOutTransaction_referenceNumber_key" ON "CashOutTransaction"("referenceNumber");
CREATE INDEX "CashOutTransaction_tenantId_idx" ON "CashOutTransaction"("tenantId");
CREATE INDEX "CashOutTransaction_outletId_idx" ON "CashOutTransaction"("outletId");
CREATE INDEX "CashOutTransaction_shiftId_idx" ON "CashOutTransaction"("shiftId");
CREATE INDEX "CashOutTransaction_cashierId_idx" ON "CashOutTransaction"("cashierId");
CREATE INDEX "CashOutTransaction_status_idx" ON "CashOutTransaction"("status");

ALTER TABLE "CashOutTransaction"
  ADD CONSTRAINT "CashOutTransaction_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashOutTransaction"
  ADD CONSTRAINT "CashOutTransaction_outletId_fkey"
  FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashOutTransaction"
  ADD CONSTRAINT "CashOutTransaction_shiftId_fkey"
  FOREIGN KEY ("shiftId") REFERENCES "CashierShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashOutTransaction"
  ADD CONSTRAINT "CashOutTransaction_cashierId_fkey"
  FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
