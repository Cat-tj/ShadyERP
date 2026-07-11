-- CreateEnum
CREATE TYPE "StockAdjustmentReason" AS ENUM ('WASTE', 'EXPIRED', 'DAMAGED', 'OTHER');

-- AlterTable
ALTER TABLE "StockAdjustment" ADD COLUMN     "reason" "StockAdjustmentReason";
