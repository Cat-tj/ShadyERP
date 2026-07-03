import { prisma } from "@/lib/prisma";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function listCategories(tenantId: string) {
  return prisma.category.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(tenantId: string, name: string) {
  return prisma.category.create({ data: { tenantId, name } });
}

export async function updateCategory(tenantId: string, id: string, name: string) {
  const category = await prisma.category.findFirst({ where: { id, tenantId } });
  if (!category) throw new Error("Kategori tidak ditemukan.");
  return prisma.category.update({ where: { id }, data: { name } });
}

export async function deleteCategory(tenantId: string, id: string) {
  const category = await prisma.category.findFirst({ where: { id, tenantId } });
  if (!category) throw new Error("Kategori tidak ditemukan.");
  const productCount = await prisma.product.count({ where: { tenantId, categoryId: id } });
  if (productCount > 0) {
    throw new Error("Kategori masih dipakai produk. Pindahkan produknya dulu sebelum menghapus.");
  }
  return prisma.category.delete({ where: { id } });
}

export async function listProductsWithStock(tenantId: string, outletId: string) {
  const products = await prisma.product.findMany({
    where: { tenantId },
    include: {
      category: true,
      stocks: { where: { outletId } },
    },
    orderBy: { name: "asc" },
  });

  return products.map((product) => ({
    ...product,
    stockQty: product.stocks[0]?.qty ?? 0,
  }));
}

export async function listProductsFull(tenantId: string) {
  return prisma.product.findMany({
    where: { tenantId },
    include: {
      category: true,
      stocks: { include: { outlet: true } },
    },
    orderBy: { name: "asc" },
  });
}

export type ProductInput = {
  name: string;
  categoryId: string | null;
  price: number;
  cost: number | null;
  trackStock: boolean;
};

export async function createProduct(tenantId: string, input: ProductInput) {
  return prisma.product.create({
    data: {
      tenantId,
      name: input.name,
      categoryId: input.categoryId,
      price: input.price,
      cost: input.cost,
      trackStock: input.trackStock,
    },
  });
}

export async function updateProduct(tenantId: string, id: string, input: ProductInput) {
  const product = await prisma.product.findFirst({ where: { id, tenantId } });
  if (!product) throw new Error("Produk tidak ditemukan.");
  return prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      categoryId: input.categoryId,
      price: input.price,
      cost: input.cost,
      trackStock: input.trackStock,
    },
  });
}

export async function setProductActive(tenantId: string, id: string, isActive: boolean) {
  const product = await prisma.product.findFirst({ where: { id, tenantId } });
  if (!product) throw new Error("Produk tidak ditemukan.");
  return prisma.product.update({ where: { id }, data: { isActive } });
}

export async function setProductStock(
  tenantId: string,
  productId: string,
  outletId: string,
  qty: number,
  changedById: string,
  note?: string
) {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) throw new Error("Produk tidak ditemukan.");

  return prisma.$transaction(async (tx) => {
    const existing = await tx.productStock.findUnique({
      where: { productId_outletId: { productId, outletId } },
    });
    const previousQty = existing?.qty ?? 0;

    const stock = await tx.productStock.upsert({
      where: { productId_outletId: { productId, outletId } },
      create: { tenantId, productId, outletId, qty },
      update: { qty },
    });

    if (qty !== previousQty) {
      await tx.stockAdjustment.create({
        data: {
          tenantId,
          productId,
          outletId,
          changedById,
          previousQty,
          newQty: qty,
          delta: qty - previousQty,
          note: note?.trim() || null,
        },
      });
    }

    return stock;
  });
}

export async function getStockAdjustments(tenantId: string, take = 100) {
  return prisma.stockAdjustment.findMany({
    where: { tenantId },
    include: { product: true, outlet: true, changedBy: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function transferStock(
  tenantId: string,
  productId: string,
  fromOutletId: string,
  toOutletId: string,
  qty: number,
  transferredById: string,
  note?: string
) {
  if (fromOutletId === toOutletId) {
    throw new Error("Outlet asal dan tujuan tidak boleh sama.");
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Jumlah transfer tidak valid.");
  }

  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) throw new Error("Produk tidak ditemukan.");
  if (!product.trackStock) throw new Error("Produk ini tidak melacak stok.");

  return prisma.$transaction(async (tx) => {
    const fromStock = await tx.productStock.findUnique({
      where: { productId_outletId: { productId, outletId: fromOutletId } },
    });
    const availableQty = fromStock?.qty ?? 0;
    if (qty > availableQty) {
      throw new Error(`Stok di outlet asal tidak cukup. Tersedia ${availableQty}, diminta ${qty}.`);
    }

    await tx.productStock.update({
      where: { productId_outletId: { productId, outletId: fromOutletId } },
      data: { qty: { decrement: qty } },
    });

    await tx.productStock.upsert({
      where: { productId_outletId: { productId, outletId: toOutletId } },
      create: { tenantId, productId, outletId: toOutletId, qty },
      update: { qty: { increment: qty } },
    });

    return tx.stockTransfer.create({
      data: {
        tenantId,
        productId,
        fromOutletId,
        toOutletId,
        transferredById,
        qty,
        note: note?.trim() || null,
      },
    });
  });
}

export async function getStockTransfers(tenantId: string, take = 100) {
  return prisma.stockTransfer.findMany({
    where: { tenantId },
    include: { product: true, fromOutlet: true, toOutlet: true, transferredBy: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}
