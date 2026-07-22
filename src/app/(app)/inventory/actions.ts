"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { prisma } from "@/lib/prisma";
import type { Prisma, StockAdjustmentReason } from "@prisma/client";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  setProductActive,
  setProductStock,
  transferStock,
  requestStockTransfer,
  sendStockTransfer,
  receiveStockTransfer,
  rejectStockTransfer,
  type ProductInput,
} from "@/server/services/product-service";
import { setReorderPoint } from "@/server/services/inventory-service";
import { recordWaste } from "@/server/services/waste-service";
import {
  createVariantGroup,
  updateVariantGroup,
  deleteVariantGroup,
  createVariantOption,
  updateVariantOption,
  deleteVariantOption,
  type VariantGroupInput,
  type VariantOptionInput,
} from "@/server/services/product-variant-service";

export type ActionResult = { error?: string; success?: boolean };
export type CreateResult = ActionResult & { id?: string };

const MANAGE_ROLES = ["OWNER", "MANAGER"] as const;

export async function createCategoryAction(name: string): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!name.trim()) return { error: "Nama kategori wajib diisi." };
  try {
    await createCategory(user.tenantId, name.trim());
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah kategori." };
  }
  revalidatePath("/produk");
  return { success: true };
}

export async function updateCategoryAction(id: string, name: string): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!name.trim()) return { error: "Nama kategori wajib diisi." };
  try {
    await updateCategory(user.tenantId, id, name.trim());
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah kategori." };
  }
  revalidatePath("/produk");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    await deleteCategory(user.tenantId, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus kategori." };
  }
  revalidatePath("/produk");
  return { success: true };
}

export async function createProductAction(input: ProductInput): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!input.name.trim()) return { error: "Nama produk wajib diisi." };
  if (!Number.isFinite(input.price) || input.price < 0) return { error: "Harga tidak valid." };
  try {
    await createProduct(user.tenantId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah produk." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

export async function updateProductAction(id: string, input: ProductInput): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!input.name.trim()) return { error: "Nama produk wajib diisi." };
  if (!Number.isFinite(input.price) || input.price < 0) return { error: "Harga tidak valid." };
  try {
    await updateProduct(user.tenantId, id, input, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah produk." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

export async function toggleProductActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    await setProductActive(user.tenantId, id, isActive, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status produk." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

export async function updateStockAction(
  productId: string,
  outletId: string,
  qty: number,
  note?: string
): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!Number.isFinite(qty) || qty < 0) return { error: "Jumlah stok tidak valid." };
  try {
    await setProductStock(user.tenantId, productId, outletId, qty, user.id, note);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal memperbarui stok." };
  }
  revalidatePath("/produk");
  revalidatePath("/inventory/riwayat-stok");
  revalidatePath("/kasir");
  return { success: true };
}

export async function createVariantGroupAction(
  productId: string,
  input: VariantGroupInput
): Promise<CreateResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!input.name.trim()) return { error: "Nama grup varian wajib diisi." };
  let group;
  try {
    group = await createVariantGroup(user.tenantId, productId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah grup varian." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true, id: group.id };
}

export async function updateVariantGroupAction(id: string, input: VariantGroupInput): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!input.name.trim()) return { error: "Nama grup varian wajib diisi." };
  try {
    await updateVariantGroup(user.tenantId, id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah grup varian." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

export async function deleteVariantGroupAction(id: string): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    await deleteVariantGroup(user.tenantId, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus grup varian." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

export async function createVariantOptionAction(
  variantGroupId: string,
  input: VariantOptionInput
): Promise<CreateResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!input.name.trim()) return { error: "Nama opsi varian wajib diisi." };
  let option;
  try {
    option = await createVariantOption(user.tenantId, variantGroupId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah opsi varian." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true, id: option.id };
}

export async function updateVariantOptionAction(id: string, input: VariantOptionInput): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!input.name.trim()) return { error: "Nama opsi varian wajib diisi." };
  try {
    await updateVariantOption(user.tenantId, id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah opsi varian." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

export async function deleteVariantOptionAction(id: string): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    await deleteVariantOption(user.tenantId, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus opsi varian." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

export async function transferStockAction(
  productId: string,
  fromOutletId: string,
  toOutletId: string,
  qty: number,
  note?: string
): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!Number.isFinite(qty) || qty <= 0) return { error: "Jumlah transfer tidak valid." };
  try {
    await transferStock(user.tenantId, productId, fromOutletId, toOutletId, qty, user.id, note);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal transfer stok." };
  }
  revalidatePath("/produk");
  revalidatePath("/inventory/transfer-stok");
  revalidatePath("/inventory");
  revalidatePath("/inventory/transfer-stok");
  revalidatePath("/inventory/riwayat-stok");
  revalidatePath("/kasir");
  return { success: true };
}

export async function requestStockTransferAction(
  productId: string,
  fromOutletId: string,
  toOutletId: string,
  qty: number,
  note?: string
): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!Number.isFinite(qty) || qty <= 0) return { error: "Jumlah transfer tidak valid." };
  try {
    await requestStockTransfer(user.tenantId, productId, fromOutletId, toOutletId, qty, user.id, note);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membuat request transfer stok." };
  }
  revalidatePath("/produk");
  revalidatePath("/inventory/transfer-stok");
  revalidatePath("/inventory");
  revalidatePath("/inventory/transfer-stok");
  return { success: true };
}

export async function sendStockTransferAction(
  transferId: string,
  sentQty?: number
): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (sentQty !== undefined && (!Number.isFinite(sentQty) || sentQty <= 0)) {
    return { error: "Jumlah kirim tidak valid." };
  }
  try {
    await sendStockTransfer(user.tenantId, transferId, user.id, sentQty);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengirim stok." };
  }
  revalidatePath("/produk");
  revalidatePath("/inventory/transfer-stok");
  revalidatePath("/inventory");
  revalidatePath("/inventory/transfer-stok");
  revalidatePath("/kasir");
  return { success: true };
}

export async function receiveStockTransferAction(
  transferId: string,
  receivedQty?: number
): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (receivedQty !== undefined && (!Number.isFinite(receivedQty) || receivedQty < 0)) {
    return { error: "Jumlah terima tidak valid." };
  }
  try {
    await receiveStockTransfer(user.tenantId, transferId, user.id, receivedQty);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menerima stok." };
  }
  revalidatePath("/produk");
  revalidatePath("/inventory/transfer-stok");
  revalidatePath("/inventory");
  revalidatePath("/inventory/transfer-stok");
  revalidatePath("/kasir");
  return { success: true };
}

export async function rejectStockTransferAction(
  transferId: string,
  reason?: string
): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    await rejectStockTransfer(user.tenantId, transferId, user.id, reason);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menolak request transfer." };
  }
  revalidatePath("/inventory/transfer-stok");
  revalidatePath("/inventory/transfer-stok");
  return { success: true };
}

export async function updateReorderPointAction(
  productId: string,
  outletId: string,
  minQty: number
): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!Number.isFinite(minQty) || minQty < 0) return { error: "Batas stok minimum tidak valid." };
  try {
    await setReorderPoint(user.tenantId, productId, outletId, minQty);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal memperbarui batas stok minimum." };
  }
  revalidatePath("/produk");
  revalidatePath("/inventory");
  revalidatePath("/kpi");
  return { success: true };
}

export async function importProductsBulkAction(
  rows: {
    name: string;
    sku?: string | null;
    categoryName?: string | null;
    outletName?: string | null;
    supplierName?: string | null;
    price: number;
    cost?: number | null;
    trackStock: boolean;
    trackExpiry?: boolean;
    stockQty?: number | null;
    reorderPoint?: number | null;
    batchNumber?: string | null;
    expirationDate?: string | null;
    kind: "GOODS" | "SERVICE" | "NON_INVENTORY";
  }[]
): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  
  try {
    const firstOutlet = await prisma.outlet.findFirst({ where: { tenantId: user.tenantId }, orderBy: { name: "asc" } });
    if (!firstOutlet) {
      return { error: "Tenant belum memiliki outlet." };
    }
    const duplicateSku = findDuplicate(rows.map((row) => row.sku?.trim()).filter(Boolean) as string[]);
    if (duplicateSku) return { error: `SKU/barcode duplikat di CSV: ${duplicateSku}.` };
    const existingSku = rows
      .map((row) => row.sku?.trim())
      .filter(Boolean) as string[];
    if (existingSku.length > 0) {
      const existing = await prisma.product.findFirst({
        where: { tenantId: user.tenantId, sku: { in: existingSku } },
        select: { sku: true },
      });
      if (existing?.sku) return { error: `SKU/barcode sudah ada di database: ${existing.sku}.` };
    }

    const [existingCats, outlets, suppliers] = await Promise.all([
      prisma.category.findMany({ where: { tenantId: user.tenantId } }),
      prisma.outlet.findMany({ where: { tenantId: user.tenantId } }),
      prisma.supplier.findMany({ where: { tenantId: user.tenantId } }),
    ]);
    const categoryMap = new Map<string, string>(
      existingCats.map((c: { name: string; id: string }) => [c.name.toLowerCase().trim(), c.id])
    );
    const outletMap = new Map(outlets.map((outlet) => [outlet.name.toLowerCase().trim(), outlet.id]));
    const supplierMap = new Map(suppliers.map((supplier) => [supplier.name.toLowerCase().trim(), supplier.id]));

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const row of rows) {
        let categoryId: string | null = null;
        if (row.categoryName && row.categoryName.trim()) {
          const catNameClean = row.categoryName.trim();
          const catNameLower = catNameClean.toLowerCase();
          if (categoryMap.has(catNameLower)) {
            categoryId = categoryMap.get(catNameLower) ?? null;
          } else {
            const newCat = await tx.category.create({
              data: { tenantId: user.tenantId, name: catNameClean },
            });
            categoryMap.set(catNameLower, newCat.id);
            categoryId = newCat.id;
          }
        }
        const outletId = row.outletName?.trim()
          ? outletMap.get(row.outletName.trim().toLowerCase()) ?? firstOutlet.id
          : firstOutlet.id;
        if (row.supplierName?.trim()) {
          const supplierName = row.supplierName.trim();
          const supplierKey = supplierName.toLowerCase();
          if (!supplierMap.has(supplierKey)) {
            const supplier = await tx.supplier.create({ data: { tenantId: user.tenantId, name: supplierName } });
            supplierMap.set(supplierKey, supplier.id);
          }
        }

        const product = await tx.product.create({
          data: {
            tenantId: user.tenantId,
            name: row.name.trim(),
            sku: row.sku?.trim() || null,
            categoryId,
            price: row.price,
            cost: row.cost || null,
            kind: row.kind,
            trackStock: row.trackStock,
            trackExpiry: row.trackExpiry ?? Boolean(row.expirationDate),
          },
        });

        if (row.trackStock) {
          const qty = row.stockQty || 0;
          await tx.productStock.create({
            data: {
              tenantId: user.tenantId,
              productId: product.id,
              outletId,
              qty,
            },
          });

          await tx.stockAdjustment.create({
            data: {
              tenantId: user.tenantId,
              productId: product.id,
              outletId,
              changedById: user.id,
              previousQty: 0,
              newQty: qty,
              delta: qty,
              note: "Import awal produk",
            },
          });

          if (row.reorderPoint != null && row.reorderPoint >= 0) {
            await tx.stockReorderPoint.create({
              data: {
                tenantId: user.tenantId,
                productId: product.id,
                outletId,
                minQty: row.reorderPoint,
              },
            });
          }
          if (qty > 0 && (row.batchNumber?.trim() || row.expirationDate)) {
            await tx.stockBatch.create({
              data: {
                tenantId: user.tenantId,
                productId: product.id,
                outletId,
                batchNumber: row.batchNumber?.trim() || `IMPORT-${product.id.slice(-6)}`,
                expirationDate: row.expirationDate ? new Date(row.expirationDate) : null,
                qtyReceived: qty,
                qtyRemaining: qty,
                note: "Batch awal dari import CSV",
              },
            });
          }
        }
      }
    });

    revalidatePath("/produk");
    revalidatePath("/inventory");
    revalidatePath("/kasir");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengimpor produk secara massal." };
  }
}

function findDuplicate(values: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) return value;
    seen.add(key);
  }
  return null;
}

export async function disposeExpiredBatchAction(batchId: string, note?: string): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    await prisma.$transaction(async (tx) => {
      const batch = await tx.stockBatch.findFirst({
        where: { id: batchId, tenantId: user.tenantId },
        include: { product: true },
      });
      if (!batch) throw new Error("Batch tidak ditemukan.");
      if (batch.qtyRemaining <= 0) return;

      const stock = await tx.productStock.findUnique({
        where: { productId_outletId: { productId: batch.productId, outletId: batch.outletId } },
      });
      const currentQty = stock?.qty ?? 0;
      const disposeQty = Math.min(batch.qtyRemaining, currentQty);

      if (stock && disposeQty > 0) {
        await tx.productStock.update({
          where: { id: stock.id },
          data: { qty: { decrement: disposeQty } },
        });
      }
      await tx.stockBatch.update({
        where: { id: batch.id },
        data: { qtyRemaining: 0, note: note?.trim() || "Dibuang/rusak dari workflow expired" },
      });
      await tx.stockAdjustment.create({
        data: {
          tenantId: user.tenantId,
          productId: batch.productId,
          outletId: batch.outletId,
          changedById: user.id,
          previousQty: currentQty,
          newQty: Math.max(0, currentQty - disposeQty),
          delta: -disposeQty,
          reason: "EXPIRED",
          note: `Expired/rusak batch ${batch.batchNumber}: ${note?.trim() || "dibuang"}`,
        },
      });
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menandai batch expired." };
  }
  revalidatePath("/inventory");
  revalidatePath("/inventory/riwayat-stok");
  revalidatePath("/simple/data");
  return { success: true };
}

export async function recordWasteAction(input: {
  productId: string;
  outletId: string;
  qty: number;
  reason: StockAdjustmentReason;
  note?: string;
}): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    await recordWaste({
      tenantId: user.tenantId,
      productId: input.productId,
      outletId: input.outletId,
      qty: input.qty,
      reason: input.reason,
      note: input.note,
      changedById: user.id,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mencatat kerugian." };
  }
  revalidatePath("/inventory/waste");
  revalidatePath("/inventory");
  revalidatePath("/inventory/riwayat-stok");
  return { success: true };
}
