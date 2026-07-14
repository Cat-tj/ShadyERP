-- Add a separate hash column first. The old `pin` column is retained only for
-- the controlled bcrypt backfill script and is cleared immediately afterwards.
ALTER TABLE "User" ADD COLUMN "pinHash" TEXT;
