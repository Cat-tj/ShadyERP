import { prisma } from "@/lib/prisma";
import { assertCanAddProduct } from "@/server/services/billing-service";
import { recordAuditLog } from "@/server/services/audit-log-service";
import { formatRupiah } from "@/lib/format";

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
    where: { tenantId, kind: { not: "COST" } },
    include: {
      category: true,
      stocks: { where: { outletId } },
      variantGroups: { include: { options: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
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
      reorderPoints: true,
      variantGroups: { include: { options: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      recipes: { include: { ingredient: { select: { id: true, name: true } } } },
      wholesalePrices: { orderBy: { minQty: "asc" } },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Harga grosir bertingkat: makin banyak dibeli (>= minQty), makin murah per
 * unit. Cuma berlaku buat produk tanpa varian — dipilih otomatis saat checkout
 * berdasarkan qty di keranjang (lihat resolveWholesalePrice di sale-service.ts).
 */
export async function addWholesalePriceTier(tenantId: string, productId: string, minQty: number, price: number) {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) throw new Error("Produk tidak ditemukan.");
  return prisma.wholesalePrice.create({ data: { tenantId, productId, minQty, price } });
}

export async function updateWholesalePriceTier(tenantId: string, id: string, minQty: number, price: number) {
  const tier = await prisma.wholesalePrice.findFirst({ where: { id, tenantId } });
  if (!tier) throw new Error("Tingkatan harga grosir tidak ditemukan.");
  return prisma.wholesalePrice.update({ where: { id }, data: { minQty, price } });
}

export async function removeWholesalePriceTier(tenantId: string, id: string) {
  const tier = await prisma.wholesalePrice.findFirst({ where: { id, tenantId } });
  if (!tier) throw new Error("Tingkatan harga grosir tidak ditemukan.");
  return prisma.wholesalePrice.delete({ where: { id } });
}

/**
 * Resep/komponen produk (dipakai buat produk racikan mis. Cappuccino = susu+kopi+gula,
 * atau paket/kombo mis. Paket Hemat = Burger+Kentang+Es Teh — komponennya boleh bahan
 * mentah ATAU menu jadi lain). Ingredient boleh punya resepnya sendiri (nested).
 */
export async function addRecipeItem(tenantId: string, productId: string, ingredientId: string, qty: number) {
  if (productId === ingredientId) {
    throw new Error("Produk tidak bisa jadi bahan/komponen untuk dirinya sendiri.");
  }
  const [product, ingredient] = await Promise.all([
    prisma.product.findFirst({ where: { id: productId, tenantId } }),
    prisma.product.findFirst({ where: { id: ingredientId, tenantId } }),
  ]);
  if (!product) throw new Error("Produk tidak ditemukan.");
  if (!ingredient) throw new Error("Bahan/komponen tidak ditemukan.");

  return prisma.productRecipeItem.create({
    data: { tenantId, productId, ingredientId, qty },
  });
}

export async function updateRecipeItemQty(tenantId: string, id: string, qty: number) {
  const item = await prisma.productRecipeItem.findFirst({ where: { id, tenantId } });
  if (!item) throw new Error("Item resep tidak ditemukan.");
  return prisma.productRecipeItem.update({ where: { id }, data: { qty } });
}

export async function removeRecipeItem(tenantId: string, id: string) {
  const item = await prisma.productRecipeItem.findFirst({ where: { id, tenantId } });
  if (!item) throw new Error("Item resep tidak ditemukan.");
  return prisma.productRecipeItem.delete({ where: { id } });
}

/**
 * Produk racikan/kombo yang tidak bisa dijual sekarang karena salah satu bahan
 * resepnya (langsung atau turunan, mis. kombo -> cappuccino -> susu) stoknya
 * tidak cukup buat 1 unit di outlet ini. Dipakai buat gray-out otomatis di POS.
 */
export async function getUnsellableProductIds(tenantId: string, outletId: string): Promise<Set<string>> {
  const [allProducts, allRecipeItems, stocks] = await Promise.all([
    prisma.product.findMany({ where: { tenantId }, select: { id: true, trackStock: true } }),
    prisma.productRecipeItem.findMany({
      where: { tenantId },
      select: { productId: true, ingredientId: true, qty: true },
    }),
    prisma.productStock.findMany({ where: { tenantId, outletId }, select: { productId: true, qty: true } }),
  ]);

  const trackStockByProduct = new Map(allProducts.map((p) => [p.id, p.trackStock]));
  const recipeByProduct = new Map<string, { ingredientId: string; qty: number }[]>();
  for (const item of allRecipeItems) {
    const list = recipeByProduct.get(item.productId) ?? [];
    list.push({ ingredientId: item.ingredientId, qty: item.qty });
    recipeByProduct.set(item.productId, list);
  }
  const stockByProduct = new Map(stocks.map((s) => [s.productId, s.qty]));

  const cache = new Map<string, number>();
  function maxSellable(productId: string, visited: Set<string>): number {
    if (visited.has(productId)) return 0;
    const cached = cache.get(productId);
    if (cached !== undefined) return cached;

    const recipe = recipeByProduct.get(productId);
    let result: number;
    if (recipe && recipe.length > 0) {
      const nextVisited = new Set(visited).add(productId);
      result = Math.min(...recipe.map((r) => Math.floor(maxSellable(r.ingredientId, nextVisited) / r.qty)));
    } else {
      result = trackStockByProduct.get(productId) ? (stockByProduct.get(productId) ?? 0) : Infinity;
    }
    cache.set(productId, result);
    return result;
  }

  const unsellable = new Set<string>();
  for (const productId of recipeByProduct.keys()) {
    if (maxSellable(productId, new Set()) <= 0) unsellable.add(productId);
  }
  return unsellable;
}

export type ProductInput = {
  name: string;
  sku: string | null;
  categoryId: string | null;
  price: number;
  cost: number | null;
  kind: "GOODS" | "SERVICE" | "ASSEMBLY" | "NON_INVENTORY" | "COST";
  trackStock: boolean;
  trackExpiry: boolean;
  trackSerial: boolean;
  shelfLifeDays: number | null;
  warrantyDays: number | null;
  serviceDurationMin: number | null;
};

export async function createProduct(tenantId: string, input: ProductInput) {
  await assertCanAddProduct(tenantId);
  return prisma.product.create({
    data: {
      tenantId,
      name: input.name,
      sku: input.sku,
      categoryId: input.categoryId,
      price: input.price,
      cost: input.cost,
      kind: input.kind,
      trackStock: input.trackStock,
      trackExpiry: input.trackExpiry,
      trackSerial: input.trackSerial,
      shelfLifeDays: input.shelfLifeDays,
      warrantyDays: input.warrantyDays,
      serviceDurationMin: input.serviceDurationMin,
    },
  });
}

export async function updateProduct(
  tenantId: string,
  id: string,
  input: ProductInput,
  changedById: string
) {
  const product = await prisma.product.findFirst({ where: { id, tenantId } });
  if (!product) throw new Error("Produk tidak ditemukan.");

  if (product.price !== input.price) {
    await recordAuditLog(
      prisma,
      tenantId,
      changedById,
      "PRODUCT_PRICE_CHANGE",
      `Ubah harga ${product.name}: ${formatRupiah(product.price)} → ${formatRupiah(input.price)}`
    );
  }

  return prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      sku: input.sku,
      categoryId: input.categoryId,
      price: input.price,
      cost: input.cost,
      kind: input.kind,
      trackStock: input.trackStock,
      trackExpiry: input.trackExpiry,
      trackSerial: input.trackSerial,
      shelfLifeDays: input.shelfLifeDays,
      warrantyDays: input.warrantyDays,
      serviceDurationMin: input.serviceDurationMin,
    },
  });
}

export async function setProductActive(
  tenantId: string,
  id: string,
  isActive: boolean,
  changedById: string
) {
  const product = await prisma.product.findFirst({ where: { id, tenantId } });
  if (!product) throw new Error("Produk tidak ditemukan.");

  await recordAuditLog(
    prisma,
    tenantId,
    changedById,
    isActive ? "PRODUCT_ACTIVATE" : "PRODUCT_DEACTIVATE",
    `${isActive ? "Aktifkan" : "Nonaktifkan"} produk ${product.name}`
  );

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
  await validateStockTransferInput(tenantId, productId, fromOutletId, toOutletId, qty);

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
        approvedById: transferredById,
        sentById: transferredById,
        receivedById: transferredById,
        status: "RECEIVED",
        qty,
        sentQty: qty,
        receivedQty: qty,
        note: note?.trim() || null,
        approvedAt: new Date(),
        sentAt: new Date(),
        receivedAt: new Date(),
      },
    });
  });
}

async function validateStockTransferInput(
  tenantId: string,
  productId: string,
  fromOutletId: string,
  toOutletId: string,
  qty: number
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
}

export async function requestStockTransfer(
  tenantId: string,
  productId: string,
  fromOutletId: string,
  toOutletId: string,
  qty: number,
  requestedById: string,
  note?: string
) {
  await validateStockTransferInput(tenantId, productId, fromOutletId, toOutletId, qty);

  return prisma.stockTransfer.create({
    data: {
      tenantId,
      productId,
      fromOutletId,
      toOutletId,
      transferredById: requestedById,
      status: "REQUESTED",
      qty,
      note: note?.trim() || null,
    },
  });
}

export async function sendStockTransfer(
  tenantId: string,
  transferId: string,
  sentById: string,
  sentQty?: number
) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.findFirst({
      where: { id: transferId, tenantId },
      include: { product: true },
    });
    if (!transfer) throw new Error("Transfer stok tidak ditemukan.");
    if (transfer.status !== "REQUESTED") {
      throw new Error("Transfer hanya bisa dikirim saat status masih request.");
    }
    if (!transfer.product.trackStock) throw new Error("Produk ini tidak melacak stok.");

    const finalSentQty = sentQty ?? transfer.qty;
    if (!Number.isFinite(finalSentQty) || finalSentQty <= 0) {
      throw new Error("Jumlah kirim tidak valid.");
    }
    if (finalSentQty > transfer.qty) {
      throw new Error("Jumlah kirim tidak boleh lebih besar dari jumlah request.");
    }

    const fromStock = await tx.productStock.findUnique({
      where: { productId_outletId: { productId: transfer.productId, outletId: transfer.fromOutletId } },
    });
    const availableQty = fromStock?.qty ?? 0;
    if (finalSentQty > availableQty) {
      throw new Error(`Stok di outlet asal tidak cukup. Tersedia ${availableQty}, diminta ${finalSentQty}.`);
    }

    await tx.productStock.update({
      where: { productId_outletId: { productId: transfer.productId, outletId: transfer.fromOutletId } },
      data: { qty: { decrement: finalSentQty } },
    });

    return tx.stockTransfer.update({
      where: { id: transfer.id },
      data: {
        status: "SENT",
        approvedById: sentById,
        sentById,
        sentQty: finalSentQty,
        approvedAt: new Date(),
        sentAt: new Date(),
      },
    });
  });
}

export async function receiveStockTransfer(
  tenantId: string,
  transferId: string,
  receivedById: string,
  receivedQty?: number
) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.findFirst({
      where: { id: transferId, tenantId },
    });
    if (!transfer) throw new Error("Transfer stok tidak ditemukan.");
    if (transfer.status !== "SENT") {
      throw new Error("Transfer hanya bisa diterima setelah dikirim.");
    }

    const sentQty = transfer.sentQty ?? transfer.qty;
    const finalReceivedQty = receivedQty ?? sentQty;
    if (!Number.isFinite(finalReceivedQty) || finalReceivedQty < 0) {
      throw new Error("Jumlah terima tidak valid.");
    }
    if (finalReceivedQty > sentQty) {
      throw new Error("Jumlah terima tidak boleh lebih besar dari jumlah kirim.");
    }

    await tx.productStock.upsert({
      where: { productId_outletId: { productId: transfer.productId, outletId: transfer.toOutletId } },
      create: {
        tenantId,
        productId: transfer.productId,
        outletId: transfer.toOutletId,
        qty: finalReceivedQty,
      },
      update: { qty: { increment: finalReceivedQty } },
    });

    return tx.stockTransfer.update({
      where: { id: transfer.id },
      data: {
        status: "RECEIVED",
        receivedById,
        receivedQty: finalReceivedQty,
        receivedAt: new Date(),
      },
    });
  });
}

export async function rejectStockTransfer(
  tenantId: string,
  transferId: string,
  rejectedById: string,
  reason?: string
) {
  const transfer = await prisma.stockTransfer.findFirst({ where: { id: transferId, tenantId } });
  if (!transfer) throw new Error("Transfer stok tidak ditemukan.");
  if (transfer.status !== "REQUESTED") {
    throw new Error("Transfer hanya bisa ditolak saat status masih request.");
  }

  return prisma.stockTransfer.update({
    where: { id: transfer.id },
    data: {
      status: "REJECTED",
      approvedById: rejectedById,
      rejectReason: reason?.trim() || null,
      rejectedAt: new Date(),
    },
  });
}

export async function getStockTransfers(tenantId: string, take = 100) {
  return prisma.stockTransfer.findMany({
    where: { tenantId },
    include: {
      product: true,
      fromOutlet: true,
      toOutlet: true,
      transferredBy: true,
      approvedBy: true,
      sentBy: true,
      receivedBy: true,
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}
