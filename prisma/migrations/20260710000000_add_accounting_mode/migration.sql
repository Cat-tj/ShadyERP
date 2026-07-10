-- CreateEnum
CREATE TYPE "AccountingMode" AS ENUM ('SIMPLE', 'ADVANCED');

-- AlterTable
ALTER TABLE "TenantSetting" ADD COLUMN "accountingMode" "AccountingMode" NOT NULL DEFAULT 'SIMPLE';
