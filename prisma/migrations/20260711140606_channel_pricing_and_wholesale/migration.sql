-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "channelMarkupAmount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ChannelPricingRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "markupPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelPricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChannelPricingRule_tenantId_idx" ON "ChannelPricingRule"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelPricingRule_tenantId_orderType_key" ON "ChannelPricingRule"("tenantId", "orderType");

-- AddForeignKey
ALTER TABLE "ChannelPricingRule" ADD CONSTRAINT "ChannelPricingRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
