/*
  Warnings:

  - You are about to drop the `WarehouseLocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WarehouseLocation" DROP CONSTRAINT "WarehouseLocation_outletId_fkey";

-- DropForeignKey
ALTER TABLE "WarehouseLocation" DROP CONSTRAINT "WarehouseLocation_tenantId_fkey";

-- DropTable
DROP TABLE "WarehouseLocation";
