ALTER TABLE "JournalEntry" ADD COLUMN "sourceKey" TEXT;
CREATE UNIQUE INDEX "JournalEntry_tenantId_sourceKey_key" ON "JournalEntry"("tenantId", "sourceKey");
