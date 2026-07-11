-- AlterTable
ALTER TABLE "StockReceiptItem" ADD COLUMN     "serialNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[];
