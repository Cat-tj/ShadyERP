"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/server/require-session";
import { voidSale, processReturn, type ReturnItemInput } from "@/server/services/sale-service";

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

export type ReturnResult = { error?: string; success?: boolean };

export async function processReturnAction(
  saleId: string,
  items: ReturnItemInput[],
  reason: string
): Promise<ReturnResult> {
  const user = await requireSession();
  try {
    await processReturn(user.tenantId, saleId, user.id, items, reason);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal memproses retur." };
  }
  revalidatePath("/kasir/riwayat");
  revalidatePath("/kasir");
  revalidatePath("/laporan");
  return { success: true };
}
