import { prisma } from "@/lib/prisma";
import type { Prisma, VariantGroupType } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function listVariantGroupsForProduct(tenantId: string, productId: string) {
  return prisma.productVariantGroup.findMany({
    where: { tenantId, productId },
    include: { options: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listVariantGroupsForProducts(tenantId: string, productIds: string[]) {
  if (productIds.length === 0) return [];
  return prisma.productVariantGroup.findMany({
    where: { tenantId, productId: { in: productIds } },
    include: { options: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

export type VariantGroupInput = {
  name: string;
  type: VariantGroupType;
  required: boolean;
};

export async function createVariantGroup(tenantId: string, productId: string, input: VariantGroupInput) {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) throw new Error("Produk tidak ditemukan.");
  const count = await prisma.productVariantGroup.count({ where: { tenantId, productId } });
  return prisma.productVariantGroup.create({
    data: {
      tenantId,
      productId,
      name: input.name.trim(),
      type: input.type,
      required: input.required,
      sortOrder: count,
    },
  });
}

export async function updateVariantGroup(tenantId: string, id: string, input: VariantGroupInput) {
  const group = await prisma.productVariantGroup.findFirst({ where: { id, tenantId } });
  if (!group) throw new Error("Grup varian tidak ditemukan.");
  return prisma.productVariantGroup.update({
    where: { id },
    data: { name: input.name.trim(), type: input.type, required: input.required },
  });
}

export async function deleteVariantGroup(tenantId: string, id: string) {
  const group = await prisma.productVariantGroup.findFirst({ where: { id, tenantId } });
  if (!group) throw new Error("Grup varian tidak ditemukan.");
  return prisma.productVariantGroup.delete({ where: { id } });
}

export type VariantOptionInput = { name: string; priceDelta: number };

export async function createVariantOption(tenantId: string, variantGroupId: string, input: VariantOptionInput) {
  const group = await prisma.productVariantGroup.findFirst({ where: { id: variantGroupId, tenantId } });
  if (!group) throw new Error("Grup varian tidak ditemukan.");
  const count = await prisma.productVariantOption.count({ where: { tenantId, variantGroupId } });
  return prisma.productVariantOption.create({
    data: {
      tenantId,
      variantGroupId,
      name: input.name.trim(),
      priceDelta: input.priceDelta,
      sortOrder: count,
    },
  });
}

export async function updateVariantOption(tenantId: string, id: string, input: VariantOptionInput) {
  const option = await prisma.productVariantOption.findFirst({ where: { id, tenantId } });
  if (!option) throw new Error("Opsi varian tidak ditemukan.");
  return prisma.productVariantOption.update({
    where: { id },
    data: { name: input.name.trim(), priceDelta: input.priceDelta },
  });
}

export async function deleteVariantOption(tenantId: string, id: string) {
  const option = await prisma.productVariantOption.findFirst({ where: { id, tenantId } });
  if (!option) throw new Error("Opsi varian tidak ditemukan.");
  return prisma.productVariantOption.delete({ where: { id } });
}

/**
 * Validasi pilihan varian pelanggan/kasir terhadap grup varian produk (wajib
 * diisi, opsi memang milik produk ini) lalu hitung total priceDelta & label
 * snapshot gabungan (mis. "Large, Boba"). Dipakai sale-service & table-order-service
 * supaya logikanya tidak dobel.
 */
export async function resolveVariantSelection(
  db: Prisma.TransactionClient | typeof prisma,
  tenantId: string,
  productId: string,
  selectedOptionIds: string[]
): Promise<{ priceDelta: number; label: string | null }> {
  const groups = await db.productVariantGroup.findMany({
    where: { tenantId, productId },
    include: { options: true },
  });
  if (groups.length === 0) {
    if (selectedOptionIds.length > 0) {
      throw new Error("Produk ini tidak punya varian.");
    }
    return { priceDelta: 0, label: null };
  }

  const selectedSet = new Set(selectedOptionIds);
  let priceDelta = 0;
  const labelParts: string[] = [];

  for (const group of groups) {
    const chosen = group.options.filter((option) => selectedSet.has(option.id));
    if (group.required && chosen.length === 0) {
      throw new Error(`Pilih ${group.name} dulu.`);
    }
    if (group.type === "SINGLE" && chosen.length > 1) {
      throw new Error(`${group.name} cuma boleh pilih satu.`);
    }
    for (const option of chosen) {
      priceDelta += option.priceDelta;
      labelParts.push(option.name);
    }
  }

  const validOptionIds = new Set(groups.flatMap((g) => g.options.map((o) => o.id)));
  for (const id of selectedOptionIds) {
    if (!validOptionIds.has(id)) {
      throw new Error("Salah satu opsi varian tidak valid.");
    }
  }

  return { priceDelta, label: labelParts.length > 0 ? labelParts.join(", ") : null };
}
