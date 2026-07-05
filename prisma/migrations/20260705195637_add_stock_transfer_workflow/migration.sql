-- Add a lightweight workflow for inter-outlet stock transfers.
CREATE TYPE "StockTransferStatus" AS ENUM ('REQUESTED', 'SENT', 'RECEIVED', 'REJECTED', 'CANCELLED');

ALTER TABLE "StockTransfer"
  ADD COLUMN "approvedById" TEXT,
  ADD COLUMN "sentById" TEXT,
  ADD COLUMN "receivedById" TEXT,
  ADD COLUMN "status" "StockTransferStatus" NOT NULL DEFAULT 'RECEIVED',
  ADD COLUMN "sentQty" INTEGER,
  ADD COLUMN "receivedQty" INTEGER,
  ADD COLUMN "rejectReason" TEXT,
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "sentAt" TIMESTAMP(3),
  ADD COLUMN "receivedAt" TIMESTAMP(3),
  ADD COLUMN "rejectedAt" TIMESTAMP(3),
  ADD COLUMN "cancelledAt" TIMESTAMP(3);

UPDATE "StockTransfer"
SET
  "sentQty" = "qty",
  "receivedQty" = "qty",
  "approvedAt" = "createdAt",
  "sentAt" = "createdAt",
  "receivedAt" = "createdAt"
WHERE "status" = 'RECEIVED';

CREATE INDEX "StockTransfer_status_idx" ON "StockTransfer"("status");

ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_sentById_fkey"
  FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_receivedById_fkey"
  FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
