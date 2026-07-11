-- CreateEnum
CREATE TYPE "StampTransactionType" AS ENUM ('EARN', 'REDEEM', 'ADJUST');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "stampCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TenantSetting" ADD COLUMN     "stampProgramEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stampRewardName" TEXT,
ADD COLUMN     "stampRewardValue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stampTarget" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "StampTransaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "StampTransactionType" NOT NULL,
    "count" INTEGER NOT NULL,
    "saleId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StampTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StampTransaction_tenantId_idx" ON "StampTransaction"("tenantId");

-- CreateIndex
CREATE INDEX "StampTransaction_memberId_idx" ON "StampTransaction"("memberId");

-- AddForeignKey
ALTER TABLE "StampTransaction" ADD CONSTRAINT "StampTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampTransaction" ADD CONSTRAINT "StampTransaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampTransaction" ADD CONSTRAINT "StampTransaction_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
