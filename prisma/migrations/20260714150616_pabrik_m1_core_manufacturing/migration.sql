-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('RAW_MATERIAL', 'WIP', 'FINISHED_GOODS', 'QUARANTINE', 'REJECT', 'SCRAP', 'IN_TRANSIT');

-- CreateEnum
CREATE TYPE "StockMovementSourceType" AS ENUM ('WORK_ORDER_RESERVATION', 'WORK_ORDER_ISSUE', 'WORK_ORDER_RETURN', 'WORK_ORDER_CONSUMPTION', 'WORK_ORDER_OUTPUT', 'WORK_ORDER_WASTE', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "BomVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "RoutingVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'MATERIAL_SHORTAGE', 'MATERIAL_RESERVED', 'SCHEDULED', 'RELEASED', 'IN_PROGRESS', 'PAUSED', 'AWAITING_QC', 'COMPLETED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderOperationStatus" AS ENUM ('PENDING', 'READY', 'IN_PROGRESS', 'PAUSED', 'BLOCKED', 'COMPLETED', 'SKIPPED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WarehouseType" NOT NULL DEFAULT 'RAW_MATERIAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "fromWarehouseId" TEXT,
    "toWarehouseId" TEXT,
    "sourceType" "StockMovementSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BomVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "BomVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "outputQty" INTEGER NOT NULL DEFAULT 1,
    "effectiveDate" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BomVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BomVersionItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bomVersionId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "wasteAllowancePct" INTEGER,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BomVersionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkCenter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "equipmentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutingVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "RoutingVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutingVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutingOperationStep" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "routingVersionId" TEXT NOT NULL,
    "workCenterId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "standardDurationMin" INTEGER,
    "instruction" TEXT,
    "qcCheckpoint" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoutingOperationStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "bomVersionId" TEXT NOT NULL,
    "routingVersionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "targetQty" INTEGER NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "plannedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderOperation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "workCenterId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "WorkOrderOperationStatus" NOT NULL DEFAULT 'PENDING',
    "actualStartAt" TIMESTAMP(3),
    "actualEndAt" TIMESTAMP(3),
    "goodQty" INTEGER NOT NULL DEFAULT 0,
    "rejectQty" INTEGER NOT NULL DEFAULT 0,
    "reworkQty" INTEGER NOT NULL DEFAULT 0,
    "scrapQty" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderOperation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Warehouse_tenantId_idx" ON "Warehouse"("tenantId");

-- CreateIndex
CREATE INDEX "Warehouse_outletId_idx" ON "Warehouse"("outletId");

-- CreateIndex
CREATE INDEX "StorageLocation_tenantId_idx" ON "StorageLocation"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "StorageLocation_warehouseId_code_key" ON "StorageLocation"("warehouseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "StockMovement_idempotencyKey_key" ON "StockMovement"("idempotencyKey");

-- CreateIndex
CREATE INDEX "StockMovement_tenantId_idx" ON "StockMovement"("tenantId");

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_sourceType_sourceId_idx" ON "StockMovement"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "StockMovement_fromWarehouseId_idx" ON "StockMovement"("fromWarehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_toWarehouseId_idx" ON "StockMovement"("toWarehouseId");

-- CreateIndex
CREATE INDEX "BomVersion_tenantId_idx" ON "BomVersion"("tenantId");

-- CreateIndex
CREATE INDEX "BomVersion_productId_status_idx" ON "BomVersion"("productId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BomVersion_productId_version_key" ON "BomVersion"("productId", "version");

-- CreateIndex
CREATE INDEX "BomVersionItem_tenantId_idx" ON "BomVersionItem"("tenantId");

-- CreateIndex
CREATE INDEX "BomVersionItem_bomVersionId_idx" ON "BomVersionItem"("bomVersionId");

-- CreateIndex
CREATE INDEX "BomVersionItem_ingredientId_idx" ON "BomVersionItem"("ingredientId");

-- CreateIndex
CREATE INDEX "WorkCenter_tenantId_idx" ON "WorkCenter"("tenantId");

-- CreateIndex
CREATE INDEX "WorkCenter_outletId_idx" ON "WorkCenter"("outletId");

-- CreateIndex
CREATE INDEX "RoutingVersion_tenantId_idx" ON "RoutingVersion"("tenantId");

-- CreateIndex
CREATE INDEX "RoutingVersion_productId_status_idx" ON "RoutingVersion"("productId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RoutingVersion_productId_version_key" ON "RoutingVersion"("productId", "version");

-- CreateIndex
CREATE INDEX "RoutingOperationStep_tenantId_idx" ON "RoutingOperationStep"("tenantId");

-- CreateIndex
CREATE INDEX "RoutingOperationStep_routingVersionId_idx" ON "RoutingOperationStep"("routingVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutingOperationStep_routingVersionId_sequence_key" ON "RoutingOperationStep"("routingVersionId", "sequence");

-- CreateIndex
CREATE INDEX "WorkOrder_tenantId_idx" ON "WorkOrder"("tenantId");

-- CreateIndex
CREATE INDEX "WorkOrder_outletId_idx" ON "WorkOrder"("outletId");

-- CreateIndex
CREATE INDEX "WorkOrder_status_idx" ON "WorkOrder"("status");

-- CreateIndex
CREATE INDEX "WorkOrder_productId_idx" ON "WorkOrder"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_tenantId_code_key" ON "WorkOrder"("tenantId", "code");

-- CreateIndex
CREATE INDEX "WorkOrderOperation_tenantId_idx" ON "WorkOrderOperation"("tenantId");

-- CreateIndex
CREATE INDEX "WorkOrderOperation_workOrderId_idx" ON "WorkOrderOperation"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderOperation_status_idx" ON "WorkOrderOperation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrderOperation_workOrderId_sequence_key" ON "WorkOrderOperation"("workOrderId", "sequence");

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomVersion" ADD CONSTRAINT "BomVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomVersion" ADD CONSTRAINT "BomVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomVersionItem" ADD CONSTRAINT "BomVersionItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomVersionItem" ADD CONSTRAINT "BomVersionItem_bomVersionId_fkey" FOREIGN KEY ("bomVersionId") REFERENCES "BomVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomVersionItem" ADD CONSTRAINT "BomVersionItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkCenter" ADD CONSTRAINT "WorkCenter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkCenter" ADD CONSTRAINT "WorkCenter_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkCenter" ADD CONSTRAINT "WorkCenter_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingVersion" ADD CONSTRAINT "RoutingVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingVersion" ADD CONSTRAINT "RoutingVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingOperationStep" ADD CONSTRAINT "RoutingOperationStep_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingOperationStep" ADD CONSTRAINT "RoutingOperationStep_routingVersionId_fkey" FOREIGN KEY ("routingVersionId") REFERENCES "RoutingVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingOperationStep" ADD CONSTRAINT "RoutingOperationStep_workCenterId_fkey" FOREIGN KEY ("workCenterId") REFERENCES "WorkCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_bomVersionId_fkey" FOREIGN KEY ("bomVersionId") REFERENCES "BomVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_routingVersionId_fkey" FOREIGN KEY ("routingVersionId") REFERENCES "RoutingVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_plannedById_fkey" FOREIGN KEY ("plannedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderOperation" ADD CONSTRAINT "WorkOrderOperation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderOperation" ADD CONSTRAINT "WorkOrderOperation_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderOperation" ADD CONSTRAINT "WorkOrderOperation_workCenterId_fkey" FOREIGN KEY ("workCenterId") REFERENCES "WorkCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
