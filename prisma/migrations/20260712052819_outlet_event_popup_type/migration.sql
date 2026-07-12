-- CreateEnum
CREATE TYPE "OutletType" AS ENUM ('PERMANENT', 'POPUP', 'EVENT');

-- AlterEnum
ALTER TYPE "ExpenseCategory" ADD VALUE 'EVENT';

-- AlterTable
ALTER TABLE "Outlet" ADD COLUMN     "eventEndDate" TIMESTAMP(3),
ADD COLUMN     "eventFee" INTEGER,
ADD COLUMN     "eventName" TEXT,
ADD COLUMN     "eventStartDate" TIMESTAMP(3),
ADD COLUMN     "outletType" "OutletType" NOT NULL DEFAULT 'PERMANENT';
