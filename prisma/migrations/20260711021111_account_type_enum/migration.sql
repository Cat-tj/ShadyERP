-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- AlterTable
-- Cast langsung dari string yang sudah ada (nilai lama persis sama dengan label
-- enum, karena DEFAULT_ACCOUNTS di accounting-service.ts adalah satu-satunya
-- penulis tabel ini) — TIDAK pakai DROP COLUMN supaya data tenant yang sudah
-- pakai Advanced accounting tidak hilang.
ALTER TABLE "Account" ALTER COLUMN "type" TYPE "AccountType" USING ("type"::"AccountType");
