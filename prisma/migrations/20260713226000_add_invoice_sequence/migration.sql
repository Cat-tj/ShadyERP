CREATE TABLE "InvoiceSequence" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "outletId" TEXT NOT NULL,
  "dayKey" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InvoiceSequence_tenantId_outletId_dayKey_key"
ON "InvoiceSequence"("tenantId", "outletId", "dayKey");
CREATE INDEX "InvoiceSequence_tenantId_idx" ON "InvoiceSequence"("tenantId");
