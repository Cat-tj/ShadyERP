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

type VariantGroupWithOptions = Awaited<ReturnType<typeof listVariantGroupsForProducts>>[number];

/**
 * Bentuk minimal yang dibutuhkan computeVariantSelection — dipenuhi baik oleh
 * ProductVariantGroup+options (Prisma) maupun ModifierGroup+options yang
 * digabung lewat loadEffectiveGroupsByProduct, jadi satu mekanisme
 * validasi+harga dipakai buat varian per-produk maupun modifier per-kategori.
 */
export type EffectiveVariantGroup = {
  id: string;
  name: string;
  type: VariantGroupType;
  required: boolean;
  options: { id: string; name: string; priceDelta: number }[];
};

/**
 * Bagian murni (tanpa query) dari resolveVariantSelection — dipisah supaya
 * checkout dengan banyak item bisa fetch semua grup varian dalam SATU query
 * lewat listVariantGroupsForProducts, lalu panggil fungsi ini per item dari
 * hasil yang sudah di tangan. Ini penting di dalam transaksi interaktif
 * (createOrder, createSale): tiap round-trip DB tambahan ikut menambah risiko
 * transaksi kena timeout kalau keranjang isinya banyak item.
 */
export function computeVariantSelection(
  groups: EffectiveVariantGroup[],
  selectedOptionIds: string[]
): { priceDelta: number; label: string | null } {
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

/**
 * Fetch semua grup varian untuk sekumpulan produk dalam SATU query, dikelompokkan
 * per productId — dipakai bareng computeVariantSelection supaya checkout dengan
 * N item cuma perlu 1 round-trip DB, bukan N.
 */
export async function loadVariantGroupsByProduct(
  db: Prisma.TransactionClient | typeof prisma,
  tenantId: string,
  productIds: string[]
): Promise<Map<string, VariantGroupWithOptions[]>> {
  const groups = await db.productVariantGroup.findMany({
    where: { tenantId, productId: { in: productIds } },
    include: { options: true },
  });
  const map = new Map<string, VariantGroupWithOptions[]>();
  for (const group of groups) {
    const existing = map.get(group.productId);
    if (existing) {
      existing.push(group);
    } else {
      map.set(group.productId, [group]);
    }
  }
  return map;
}

/**
 * Gabungan varian per-produk (ProductVariantGroup) + modifier menu per-kategori
 * (ModifierGroup — mis. "Level Gula", "Tambahan Espresso" — otomatis berlaku ke
 * semua produk di kategori itu, dikurangi ProductModifierExclusion kalau ada
 * produk yang dikecualikan). Dipakai gantinya loadVariantGroupsByProduct di
 * checkout (createSale, createOrder) supaya satu mekanisme validasi+harga
 * (computeVariantSelection) menangani keduanya sekaligus.
 */
export async function loadEffectiveGroupsByProduct(
  db: Prisma.TransactionClient | typeof prisma,
  tenantId: string,
  productIds: string[]
): Promise<Map<string, EffectiveVariantGroup[]>> {
  if (productIds.length === 0) return new Map();

  const [products, variantGroups] = await Promise.all([
    db.product.findMany({ where: { tenantId, id: { in: productIds } }, select: { id: true, categoryId: true } }),
    db.productVariantGroup.findMany({
      where: { tenantId, productId: { in: productIds } },
      include: { options: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const categoryIds = Array.from(
    new Set(products.map((p) => p.categoryId).filter((id): id is string => Boolean(id)))
  );

  const [modifierGroups, exclusions] = await Promise.all([
    db.modifierGroup.findMany({
      where: { tenantId, categoryId: { in: categoryIds } },
      include: { options: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.productModifierExclusion.findMany({ where: { tenantId, productId: { in: productIds } } }),
  ]);

  const modifierGroupsByCategory = new Map<string, typeof modifierGroups>();
  for (const group of modifierGroups) {
    const existing = modifierGroupsByCategory.get(group.categoryId);
    if (existing) existing.push(group);
    else modifierGroupsByCategory.set(group.categoryId, [group]);
  }

  const excludedByProduct = new Map<string, Set<string>>();
  for (const exclusion of exclusions) {
    const existing = excludedByProduct.get(exclusion.productId);
    if (existing) existing.add(exclusion.modifierGroupId);
    else excludedByProduct.set(exclusion.productId, new Set([exclusion.modifierGroupId]));
  }

  const variantGroupsByProduct = new Map<string, typeof variantGroups>();
  for (const group of variantGroups) {
    const existing = variantGroupsByProduct.get(group.productId);
    if (existing) existing.push(group);
    else variantGroupsByProduct.set(group.productId, [group]);
  }

  const toEffective = (g: { id: string; name: string; type: VariantGroupType; required: boolean; options: { id: string; name: string; priceDelta: number }[] }): EffectiveVariantGroup => ({
    id: g.id,
    name: g.name,
    type: g.type,
    required: g.required,
    options: g.options.map((o) => ({ id: o.id, name: o.name, priceDelta: o.priceDelta })),
  });

  const result = new Map<string, EffectiveVariantGroup[]>();
  for (const product of products) {
    const ownGroups = variantGroupsByProduct.get(product.id) ?? [];
    const categoryGroups = product.categoryId ? modifierGroupsByCategory.get(product.categoryId) ?? [] : [];
    const excluded = excludedByProduct.get(product.id) ?? new Set<string>();
    const effectiveModifierGroups = categoryGroups.filter((g) => !excluded.has(g.id));

    result.set(product.id, [...ownGroups.map(toEffective), ...effectiveModifierGroups.map(toEffective)]);
  }

  return result;
}

/**
 * Versi single-item (1 query per panggilan) — dipertahankan untuk pemakaian
 * di luar loop checkout. Untuk checkout dengan banyak item, pakai
 * loadVariantGroupsByProduct + computeVariantSelection supaya cuma 1 query total.
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
  return computeVariantSelection(groups, selectedOptionIds);
}
