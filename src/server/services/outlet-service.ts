import { prisma } from "@/lib/prisma";
import { assertCanAddOutlet } from "@/server/services/billing-service";

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

export async function listAllOutlets(tenantId: string) {
  return prisma.outlet.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

export type OutletInput = {
  name: string;
  address: string | null;
  phone: string | null;
};

export async function createOutlet(tenantId: string, input: OutletInput) {
  await assertCanAddOutlet(tenantId);
  return prisma.outlet.create({
    data: { tenantId, name: input.name, address: input.address, phone: input.phone },
  });
}

export async function updateOutlet(tenantId: string, id: string, input: OutletInput) {
  const outlet = await prisma.outlet.findFirst({ where: { id, tenantId } });
  if (!outlet) throw new Error("Outlet tidak ditemukan.");
  return prisma.outlet.update({
    where: { id },
    data: { name: input.name, address: input.address, phone: input.phone },
  });
}

export async function setOutletActive(tenantId: string, id: string, isActive: boolean) {
  const outlet = await prisma.outlet.findFirst({ where: { id, tenantId } });
  if (!outlet) throw new Error("Outlet tidak ditemukan.");
  return prisma.outlet.update({ where: { id }, data: { isActive } });
}
