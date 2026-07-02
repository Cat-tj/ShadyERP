"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { voidSale } from "@/server/services/sale-service";

export type VoidResult = { error?: string; success?: boolean };

export async function voidSaleAction(saleId: string, reason: string): Promise<VoidResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await voidSale(user.tenantId, saleId, reason);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membatalkan transaksi." };
  }
  revalidatePath("/kasir/riwayat");
  revalidatePath("/kasir");
  return { success: true };
}
