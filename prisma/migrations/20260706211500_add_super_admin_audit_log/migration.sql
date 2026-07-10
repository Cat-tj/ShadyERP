CREATE TABLE "SuperAdminAuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetTenantId" TEXT,
  "description" TEXT NOT NULL,
  "beforeJson" JSONB,
  "afterJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SuperAdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SuperAdminAuditLog_actorId_idx" ON "SuperAdminAuditLog"("actorId");
CREATE INDEX "SuperAdminAuditLog_targetTenantId_idx" ON "SuperAdminAuditLog"("targetTenantId");
CREATE INDEX "SuperAdminAuditLog_createdAt_idx" ON "SuperAdminAuditLog"("createdAt");

ALTER TABLE "SuperAdminAuditLog" ADD CONSTRAINT "SuperAdminAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "SuperAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
