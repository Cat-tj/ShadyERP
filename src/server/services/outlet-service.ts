import { prisma } from "@/lib/prisma";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */
export async function listOutletsForUser(
  tenantId: string,
  userId: string,
  role: "OWNER" | "MANAGER" | "STAFF"
) {
  if (role === "OWNER") {
    return prisma.outlet.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  return prisma.outlet.findMany({
    where: {
      tenantId,
      isActive: true,
      userOutlets: { some: { userId } },
    },
    orderBy: { name: "asc" },
  });
}
