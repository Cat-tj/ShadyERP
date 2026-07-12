-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "LaundryOrder" ADD COLUMN     "memberId" TEXT;

-- CreateIndex
CREATE INDEX "Booking_memberId_idx" ON "Booking"("memberId");

-- CreateIndex
CREATE INDEX "LaundryOrder_memberId_idx" ON "LaundryOrder"("memberId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryOrder" ADD CONSTRAINT "LaundryOrder_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
