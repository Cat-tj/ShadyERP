-- AlterTable
ALTER TABLE "TableOrder" ADD COLUMN     "saleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TableOrder_saleId_key" ON "TableOrder"("saleId");

-- AddForeignKey
ALTER TABLE "TableOrder" ADD CONSTRAINT "TableOrder_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

