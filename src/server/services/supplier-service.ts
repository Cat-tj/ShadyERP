import { prisma } from "@/lib/prisma";
import type { Supplier, SupplierStatus } from "@prisma/client";

type SupplierUpdateInput = {
  name?: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  contactPerson?: string | null;
  paymentTerms?: string | null;
  taxId?: string | null;
  status?: SupplierStatus;
  rating?: number | null;
};

export async function createSupplier(
  tenantId: string,
  data: {
    name: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    paymentTerms?: string;
    taxId?: string;
  }
): Promise<Supplier> {
  return prisma.supplier.create({
    data: {
      tenantId,
      ...data,
    },
  });
}

export async function updateSupplier(
  tenantId: string,
  supplierId: string,
  data: SupplierUpdateInput
): Promise<Supplier> {
  // `id` adalah global. Jangan pernah meng-update berdasarkan id saja karena
  // caller tenant A dapat menebak id supplier tenant B. `updateMany` memberi
  // predicate atomik pada tenant tanpa membiarkan tenantId ikut diubah.
  const result = await prisma.supplier.updateMany({
    where: { id: supplierId, tenantId },
    data,
  });

  if (result.count !== 1) throw new Error("Supplier tidak ditemukan");

  return prisma.supplier.findFirstOrThrow({
    where: { id: supplierId, tenantId },
  });
}

export async function getSupplierById(tenantId: string, supplierId: string): Promise<Supplier | null> {
  return prisma.supplier.findFirst({
    where: { id: supplierId, tenantId },
  });
}

export async function getSuppliers(
  tenantId: string,
  status?: SupplierStatus,
  limit?: number
): Promise<Supplier[]> {
  return prisma.supplier.findMany({
    where: {
      tenantId,
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
    take: limit || 100,
  });
}

export async function setSupplierStatus(
  tenantId: string,
  supplierId: string,
  status: SupplierStatus
): Promise<Supplier> {
  const supplier = await getSupplierById(tenantId, supplierId);
  if (!supplier) throw new Error("Supplier not found");

  return updateSupplier(tenantId, supplierId, { status });
}

export async function rateSupplier(
  tenantId: string,
  supplierId: string,
  rating: number
): Promise<Supplier> {
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");

  return updateSupplier(tenantId, supplierId, { rating });
}

export async function getSupplierStats(tenantId: string, supplierId: string) {
  const supplier = await getSupplierById(tenantId, supplierId);
  if (!supplier) throw new Error("Supplier not found");

  const totalPOs = await prisma.purchaseOrder.count({
    where: { tenantId, supplierId },
  });

  const totalSpent = await prisma.purchaseOrder.aggregate({
    where: { tenantId, supplierId, status: "RECEIVED" },
    _sum: { totalAmount: true },
  });

  return {
    supplier,
    totalPOs,
    totalSpent: totalSpent._sum.totalAmount || 0,
    rating: supplier.rating || 0,
  };
}
