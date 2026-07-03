"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createPromo, updatePromo, deletePromo, type PromoInput } from "@/server/services/promo-service";

export type ActionResult = { error?: string; success?: boolean };

const MANAGE_ROLES = ["OWNER", "MANAGER"] as const;

export async function createPromoAction(input: PromoInput): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!input.name.trim()) return { error: "Nama promo wajib diisi." };
  try {
    await createPromo(user.tenantId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah promo." };
  }
  revalidatePath("/pengaturan/promo");
  revalidatePath("/kasir");
  return { success: true };
}

export async function updatePromoAction(id: string, input: PromoInput): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  if (!input.name.trim()) return { error: "Nama promo wajib diisi." };
  try {
    await updatePromo(user.tenantId, id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah promo." };
  }
  revalidatePath("/pengaturan/promo");
  revalidatePath("/kasir");
  return { success: true };
}

export async function deletePromoAction(id: string): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    await deletePromo(user.tenantId, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus promo." };
  }
  revalidatePath("/pengaturan/promo");
  revalidatePath("/kasir");
  return { success: true };
}
