import { prisma } from "@/lib/prisma";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */
export async function searchMembers(tenantId: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return prisma.member.findMany({
    where: {
      tenantId,
      OR: [
        { name: { contains: trimmed } },
        { phone: { contains: trimmed } },
      ],
    },
    take: 8,
    orderBy: { name: "asc" },
  });
}
