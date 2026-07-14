-- PostgreSQL partial unique index: one cashier may have only one open shift
-- within a tenant. Closed shifts remain unlimited historical records.
CREATE UNIQUE INDEX "CashierShift_one_open_per_user_tenant"
ON "CashierShift"("tenantId", "userId")
WHERE "status" = 'OPEN';
