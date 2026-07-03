import { prisma } from "@/lib/prisma";
import type { AuditAction, Prisma } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function recordAuditLog(
  db: Prisma.TransactionClient | typeof prisma,
  tenantId: string,
  userId: string,
  action: AuditAction,
  description: string
) {
  return db.auditLog.create({ data: { tenantId, userId, action, description } });
}

export async function listAuditLogs(tenantId: string, take = 200) {
  return prisma.auditLog.findMany({
    where: { tenantId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}
