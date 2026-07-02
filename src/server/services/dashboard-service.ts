import { prisma } from "@/lib/prisma";

/**
 * PERINGATAN MULTI-TENANT: setiap query di bawah WAJIB menyertakan
 * `where: { tenantId }`. Jangan pernah query tabel bisnis tanpa filter ini —
 * data satu toko bisa bocor ke toko lain.
 */
export async function getDashboardSummary(tenantId: string) {
  const [tenant, outletCount, userCount, productCount, memberCount] =
    await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId } }),
      prisma.outlet.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId, isActive: true } }),
      prisma.product.count({ where: { tenantId, isActive: true } }),
      prisma.member.count({ where: { tenantId } }),
    ]);

  return {
    tenant,
    outletCount,
    userCount,
    productCount,
    memberCount,
  };
}
