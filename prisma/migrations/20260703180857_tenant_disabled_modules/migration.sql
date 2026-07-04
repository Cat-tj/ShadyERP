-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "disabledModules" TEXT[] DEFAULT ARRAY[]::TEXT[];
