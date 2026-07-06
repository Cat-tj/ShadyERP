"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
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

export async function createProductAction(input: ProductInput): Promise<CreateResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  const validationError = validateProductInput(input);
  if (validationError) return { error: validationError };
  let product;
  try {
    product = await createProduct(user.tenantId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah produk." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true, id: product.id };
}

export async function updateProductAction(id: string, input: ProductInput): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  const validationError = validateProductInput(input);
  if (validationError) return { error: validationError };
  try {
    await updateProduct(user.tenantId, id, input, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah produk." };
  }
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

function validateProductInput(input: ProductInput) {
  if (!input.name.trim()) return "Nama produk wajib diisi.";
  if (!Number.isFinite(input.price) || input.price < 0) return "Harga tidak valid.";
  if (input.cost != null && (!Number.isFinite(input.cost) || input.cost < 0)) return "Modal tidak valid.";
  if (!["GOODS", "SERVICE"].includes(input.kind)) return "Jenis produk tidak valid.";
  if (input.kind === "SERVICE" && input.trackStock) return "Jasa tidak boleh memakai stok barang.";
  if (input.kind === "SERVICE" && (!input.serviceDurationMin || input.serviceDurationMin <= 0)) {
    return "Durasi layanan wajib diisi untuk produk jasa.";
  }
  if (input.trackExpiry && !input.trackStock) return "Expired hanya bisa dilacak untuk produk yang memakai stok.";
  if (input.shelfLifeDays != null && input.shelfLifeDays < 0) return "Masa simpan tidak valid.";
  if (input.warrantyDays != null && input.warrantyDays < 0) return "Masa garansi tidak valid.";
  return null;
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
  revalidatePath("/produk/riwayat-stok");
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
  revalidatePath("/produk/transfer-stok");
  revalidatePath("/inventory");
  revalidatePath("/inventory/transfer-stok");
  revalidatePath("/produk/riwayat-stok");
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
  revalidatePath("/produk/transfer-stok");
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
  revalidatePath("/produk/transfer-stok");
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
  revalidatePath("/produk/transfer-stok");
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
  revalidatePath("/produk/transfer-stok");
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
