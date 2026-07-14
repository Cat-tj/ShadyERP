ALTER TABLE "Sale" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "Sale_tenantId_idempotencyKey_key" ON "Sale"("tenantId", "idempotencyKey");
