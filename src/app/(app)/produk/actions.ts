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
  type ProductInput,
} from "@/server/services/product-service";
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
  revalidatePath("/produk/riwayat-stok");
  revalidatePath("/kasir");
  return { success: true };
}
