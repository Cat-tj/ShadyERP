import { prisma } from "@/lib/prisma";
import type { VariantGroupType } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function listCategoriesWithModifierGroups(tenantId: string) {
  return prisma.category.findMany({
    where: { tenantId },
    include: {
      modifierGroups: {
        include: { options: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export type ModifierGroupInput = { name: string; type: VariantGroupType; required: boolean };

export async function createModifierGroup(tenantId: string, categoryId: string, input: ModifierGroupInput) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, tenantId } });
  if (!category) throw new Error("Kategori tidak ditemukan.");
  const count = await prisma.modifierGroup.count({ where: { tenantId, categoryId } });
  return prisma.modifierGroup.create({
    data: {
      tenantId,
      categoryId,
      name: input.name.trim(),
      type: input.type,
      required: input.required,
      sortOrder: count,
    },
  });
}

export async function updateModifierGroup(tenantId: string, id: string, input: ModifierGroupInput) {
  const group = await prisma.modifierGroup.findFirst({ where: { id, tenantId } });
  if (!group) throw new Error("Grup modifier tidak ditemukan.");
  return prisma.modifierGroup.update({
    where: { id },
    data: { name: input.name.trim(), type: input.type, required: input.required },
  });
}

export async function deleteModifierGroup(tenantId: string, id: string) {
  const group = await prisma.modifierGroup.findFirst({ where: { id, tenantId } });
  if (!group) throw new Error("Grup modifier tidak ditemukan.");
  return prisma.modifierGroup.delete({ where: { id } });
}

export type ModifierOptionInput = { name: string; priceDelta: number };

export async function createModifierOption(tenantId: string, modifierGroupId: string, input: ModifierOptionInput) {
  const group = await prisma.modifierGroup.findFirst({ where: { id: modifierGroupId, tenantId } });
  if (!group) throw new Error("Grup modifier tidak ditemukan.");
  const count = await prisma.modifierOption.count({ where: { tenantId, modifierGroupId } });
  return prisma.modifierOption.create({
    data: {
      tenantId,
      modifierGroupId,
      name: input.name.trim(),
      priceDelta: input.priceDelta,
      sortOrder: count,
    },
  });
}

export async function updateModifierOption(tenantId: string, id: string, input: ModifierOptionInput) {
  const option = await prisma.modifierOption.findFirst({ where: { id, tenantId } });
  if (!option) throw new Error("Opsi modifier tidak ditemukan.");
  return prisma.modifierOption.update({
    where: { id },
    data: { name: input.name.trim(), priceDelta: input.priceDelta },
  });
}

export async function deleteModifierOption(tenantId: string, id: string) {
  const option = await prisma.modifierOption.findFirst({ where: { id, tenantId } });
  if (!option) throw new Error("Opsi modifier tidak ditemukan.");
  return prisma.modifierOption.delete({ where: { id } });
}

/** Modifier kategori yang berlaku buat produk ini — dipakai form produk buat preview + checklist pengecualian. */
export async function getCategoryModifierGroupsForProduct(tenantId: string, categoryId: string | null) {
  if (!categoryId) return [];
  return prisma.modifierGroup.findMany({
    where: { tenantId, categoryId },
    include: { options: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProductModifierExclusions(tenantId: string, productId: string): Promise<string[]> {
  const rows = await prisma.productModifierExclusion.findMany({ where: { tenantId, productId } });
  return rows.map((r) => r.modifierGroupId);
}

/** Semua pengecualian modifier tenant ini dalam satu query — dipakai listing produk supaya tidak N+1. */
export async function listAllProductModifierExclusions(tenantId: string): Promise<Map<string, string[]>> {
  const rows = await prisma.productModifierExclusion.findMany({ where: { tenantId } });
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const existing = map.get(row.productId);
    if (existing) existing.push(row.modifierGroupId);
    else map.set(row.productId, [row.modifierGroupId]);
  }
  return map;
}

export async function setProductModifierExclusions(
  tenantId: string,
  productId: string,
  excludedModifierGroupIds: string[]
) {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) throw new Error("Produk tidak ditemukan.");

  await prisma.$transaction(async (tx) => {
    await tx.productModifierExclusion.deleteMany({ where: { tenantId, productId } });
    if (excludedModifierGroupIds.length > 0) {
      await tx.productModifierExclusion.createMany({
        data: excludedModifierGroupIds.map((modifierGroupId) => ({ tenantId, productId, modifierGroupId })),
        skipDuplicates: true,
      });
    }
  });
}
