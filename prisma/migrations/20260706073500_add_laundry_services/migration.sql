CREATE TABLE "LaundryService" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "serviceType" "LaundryServiceType" NOT NULL DEFAULT 'KILOAN',
  "pricePerKg" INTEGER,
  "servicePrice" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LaundryService_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "LaundryOrder"
  ADD COLUMN "laundryServiceId" TEXT,
  ADD COLUMN "serviceName" TEXT;

CREATE INDEX "LaundryService_tenantId_idx" ON "LaundryService"("tenantId");
CREATE INDEX "LaundryService_isActive_idx" ON "LaundryService"("isActive");
CREATE INDEX "LaundryOrder_laundryServiceId_idx" ON "LaundryOrder"("laundryServiceId");

ALTER TABLE "LaundryService"
  ADD CONSTRAINT "LaundryService_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LaundryOrder"
  ADD CONSTRAINT "LaundryOrder_laundryServiceId_fkey"
  FOREIGN KEY ("laundryServiceId") REFERENCES "LaundryService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "LaundryService" ("id", "tenantId", "name", "serviceType", "pricePerKg", "servicePrice", "sortOrder", "updatedAt")
SELECT
  'ls_' || md5(t."id" || ':kiloan'),
  t."id",
  'Kiloan',
  'KILOAN',
  8000,
  0,
  10,
  CURRENT_TIMESTAMP
FROM "Tenant" t;

INSERT INTO "LaundryService" ("id", "tenantId", "name", "serviceType", "pricePerKg", "servicePrice", "sortOrder", "updatedAt")
SELECT
  'ls_' || md5(t."id" || ':express'),
  t."id",
  'Express',
  'EXPRESS',
  12000,
  0,
  20,
  CURRENT_TIMESTAMP
FROM "Tenant" t;

INSERT INTO "LaundryService" ("id", "tenantId", "name", "serviceType", "servicePrice", "sortOrder", "updatedAt")
SELECT
  'ls_' || md5(t."id" || ':satuan'),
  t."id",
  'Satuan',
  'SATUAN',
  10000,
  30,
  CURRENT_TIMESTAMP
FROM "Tenant" t;

INSERT INTO "LaundryService" ("id", "tenantId", "name", "serviceType", "servicePrice", "sortOrder", "updatedAt")
SELECT
  'ls_' || md5(t."id" || ':dry-clean'),
  t."id",
  'Dry clean',
  'DRY_CLEAN',
  25000,
  40,
  CURRENT_TIMESTAMP
FROM "Tenant" t;

INSERT INTO "LaundryService" ("id", "tenantId", "name", "serviceType", "servicePrice", "sortOrder", "updatedAt")
SELECT
  'ls_' || md5(t."id" || ':setrika'),
  t."id",
  'Setrika',
  'SETRIKA',
  7000,
  50,
  CURRENT_TIMESTAMP
FROM "Tenant" t;
