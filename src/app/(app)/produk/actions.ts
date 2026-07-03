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
  type ProductInput,
} from "@/server/services/product-service";

export type ActionResult = { error?: string; success?: boolean };

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
    await updateProduct(user.tenantId, id, input);
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
    await setProductActive(user.tenantId, id, isActive);
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
