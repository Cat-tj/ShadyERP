-- CreateEnum
CREATE TYPE "AccountClass" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'COGS', 'EXPENSE');

-- CreateEnum
CREATE TYPE "NormalBalance" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "AccountingJournalStatus" AS ENUM ('DRAFT', 'POSTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "FiscalPeriodStatus" AS ENUM ('OPEN', 'LOCKED', 'CLOSED');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "accountClass" "AccountClass" NOT NULL DEFAULT 'ASSET',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isGroup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "normalBalance" "NormalBalance" NOT NULL DEFAULT 'DEBIT',
ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "FiscalPeriod" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "FiscalPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingJournal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "journalNumber" TEXT NOT NULL,
    "postingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AccountingJournalStatus" NOT NULL DEFAULT 'POSTED',
    "sourceType" TEXT,
    "sourceId" TEXT,
    "postingPurpose" TEXT,
    "description" TEXT NOT NULL,
    "fiscalPeriodId" TEXT,
    "outletId" TEXT,
    "createdById" TEXT,
    "reversalOfId" TEXT,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountingJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingJournalLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "outletId" TEXT,
    "partyType" TEXT,
    "partyId" TEXT,
    "debit" INTEGER NOT NULL DEFAULT 0,
    "credit" INTEGER NOT NULL DEFAULT 0,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingJournalLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "preferredName" TEXT,
    "birthPlace" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankHolder" TEXT,
    "nik" TEXT,
    "npwp" TEXT,
    "taxStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "workerType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employment" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "probationEnd" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "position" TEXT,
    "department" TEXT,
    "outletId" TEXT,
    "managerId" TEXT,
    "costCenter" TEXT,
    "shiftGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompensationProfile" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "grade" TEXT,
    "salaryBasis" TEXT NOT NULL,
    "baseRate" INTEGER NOT NULL,
    "bpjsKesActive" BOOLEAN NOT NULL DEFAULT false,
    "bpjsTkActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompensationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FiscalPeriod_tenantId_status_idx" ON "FiscalPeriod"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalPeriod_tenantId_startDate_endDate_key" ON "FiscalPeriod"("tenantId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "AccountingJournal_tenantId_postingDate_idx" ON "AccountingJournal"("tenantId", "postingDate");

-- CreateIndex
CREATE INDEX "AccountingJournal_tenantId_status_idx" ON "AccountingJournal"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AccountingJournal_fiscalPeriodId_idx" ON "AccountingJournal"("fiscalPeriodId");

-- CreateIndex
CREATE INDEX "AccountingJournal_outletId_idx" ON "AccountingJournal"("outletId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingJournal_tenantId_journalNumber_key" ON "AccountingJournal"("tenantId", "journalNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingJournal_tenantId_sourceType_sourceId_postingPurpo_key" ON "AccountingJournal"("tenantId", "sourceType", "sourceId", "postingPurpose");

-- CreateIndex
CREATE INDEX "AccountingJournalLine_tenantId_idx" ON "AccountingJournalLine"("tenantId");

-- CreateIndex
CREATE INDEX "AccountingJournalLine_journalId_idx" ON "AccountingJournalLine"("journalId");

-- CreateIndex
CREATE INDEX "AccountingJournalLine_accountId_idx" ON "AccountingJournalLine"("accountId");

-- CreateIndex
CREATE INDEX "AccountingJournalLine_outletId_idx" ON "AccountingJournalLine"("outletId");

-- CreateIndex
CREATE INDEX "Worker_tenantId_idx" ON "Worker"("tenantId");

-- CreateIndex
CREATE INDEX "Worker_personId_idx" ON "Worker"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_tenantId_employeeNumber_key" ON "Worker"("tenantId", "employeeNumber");

-- CreateIndex
CREATE INDEX "Employment_workerId_idx" ON "Employment"("workerId");

-- CreateIndex
CREATE INDEX "Assignment_workerId_idx" ON "Assignment"("workerId");

-- CreateIndex
CREATE INDEX "Assignment_outletId_idx" ON "Assignment"("outletId");

-- CreateIndex
CREATE INDEX "CompensationProfile_workerId_idx" ON "CompensationProfile"("workerId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalPeriod" ADD CONSTRAINT "FiscalPeriod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJournal" ADD CONSTRAINT "AccountingJournal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJournal" ADD CONSTRAINT "AccountingJournal_fiscalPeriodId_fkey" FOREIGN KEY ("fiscalPeriodId") REFERENCES "FiscalPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJournal" ADD CONSTRAINT "AccountingJournal_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJournal" ADD CONSTRAINT "AccountingJournal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJournalLine" ADD CONSTRAINT "AccountingJournalLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJournalLine" ADD CONSTRAINT "AccountingJournalLine_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "AccountingJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJournalLine" ADD CONSTRAINT "AccountingJournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJournalLine" ADD CONSTRAINT "AccountingJournalLine_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationProfile" ADD CONSTRAINT "CompensationProfile_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
