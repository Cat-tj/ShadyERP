-- KPI goals can be owned by an individual worker, a department, or the
-- organization. Existing goals remain INDIVIDUAL goals after this migration.
ALTER TABLE "KpiGoal"
  ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  ADD COLUMN "department" TEXT;

ALTER TABLE "KpiGoal" ALTER COLUMN "workerId" DROP NOT NULL;

ALTER TABLE "KpiGoal" DROP CONSTRAINT IF EXISTS "KpiGoal_workerId_fkey";
ALTER TABLE "KpiGoal"
  ADD CONSTRAINT "KpiGoal_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "KpiGoal_tenantId_scope_idx" ON "KpiGoal"("tenantId", "scope");
CREATE INDEX "KpiGoal_tenantId_department_idx" ON "KpiGoal"("tenantId", "department");
