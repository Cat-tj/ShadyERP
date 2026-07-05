-- Store tenant-level static QRIS payload so POS can generate dynamic QRIS amounts.
ALTER TABLE "TenantSetting" ADD COLUMN "staticQrisPayload" TEXT;
