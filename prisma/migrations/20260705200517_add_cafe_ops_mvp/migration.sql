-- Cafe operations MVP: casual/overtime scheduling, event booking costs, and equipment maintenance.

CREATE TYPE "ShiftWorkType" AS ENUM ('REGULAR', 'OVERTIME', 'CASUAL');
CREATE TYPE "ShiftPayType" AS ENUM ('MONTHLY', 'PER_SHIFT');
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'NEEDS_REPAIR', 'REPAIRING', 'RETIRED');
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

ALTER TABLE "ShiftSchedule"
  ADD COLUMN "workType" "ShiftWorkType" NOT NULL DEFAULT 'REGULAR',
  ADD COLUMN "payType" "ShiftPayType" NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN "shiftPay" INTEGER,
  ADD COLUMN "holidayBonus" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "overtimeNote" TEXT,
  ADD COLUMN "note" TEXT;

ALTER TABLE "Booking"
  ADD COLUMN "pax" INTEGER,
  ADD COLUMN "eventAddress" TEXT,
  ADD COLUMN "quotedAmount" INTEGER,
  ADD COLUMN "transportFee" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "staffFee" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "depositAmount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "Equipment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "outletId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "serialNumber" TEXT,
  "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EquipmentMaintenanceLog" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "outletId" TEXT NOT NULL,
  "equipmentId" TEXT NOT NULL,
  "reportedById" TEXT NOT NULL,
  "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
  "issue" TEXT NOT NULL,
  "actionTaken" TEXT,
  "cost" INTEGER NOT NULL DEFAULT 0,
  "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EquipmentMaintenanceLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Equipment_tenantId_idx" ON "Equipment"("tenantId");
CREATE INDEX "Equipment_outletId_idx" ON "Equipment"("outletId");
CREATE INDEX "Equipment_status_idx" ON "Equipment"("status");
CREATE INDEX "EquipmentMaintenanceLog_tenantId_idx" ON "EquipmentMaintenanceLog"("tenantId");
CREATE INDEX "EquipmentMaintenanceLog_outletId_idx" ON "EquipmentMaintenanceLog"("outletId");
CREATE INDEX "EquipmentMaintenanceLog_equipmentId_idx" ON "EquipmentMaintenanceLog"("equipmentId");
CREATE INDEX "EquipmentMaintenanceLog_status_idx" ON "EquipmentMaintenanceLog"("status");

ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_outletId_fkey"
  FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EquipmentMaintenanceLog" ADD CONSTRAINT "EquipmentMaintenanceLog_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EquipmentMaintenanceLog" ADD CONSTRAINT "EquipmentMaintenanceLog_outletId_fkey"
  FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EquipmentMaintenanceLog" ADD CONSTRAINT "EquipmentMaintenanceLog_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EquipmentMaintenanceLog" ADD CONSTRAINT "EquipmentMaintenanceLog_reportedById_fkey"
  FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
