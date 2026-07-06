CREATE TYPE "ProductKind" AS ENUM ('GOODS', 'SERVICE');

ALTER TABLE "Product"
  ADD COLUMN "kind" "ProductKind" NOT NULL DEFAULT 'GOODS',
  ADD COLUMN "trackExpiry" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "shelfLifeDays" INTEGER,
  ADD COLUMN "warrantyDays" INTEGER,
  ADD COLUMN "serviceDurationMin" INTEGER;
