"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/server/require-session";
import { voidSale, processReturn, correctSalePaymentMethod, type ReturnItemInput } from "@/server/services/sale-service";
import type { PaymentMethod } from "@prisma/client";

export type VoidResult = { error?: string; success?: boolean };

export async function voidSaleAction(saleId: string, reason: string): Promise<VoidResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await voidSale(user.tenantId, saleId, reason, user.id);
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
  reason: string,
  refundMethod: string = "CASH"
): Promise<ReturnResult> {
  const user = await requireSession();
  try {
    await processReturn(user.tenantId, saleId, user.id, items, reason, refundMethod);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal memproses retur." };
  }
  revalidatePath("/kasir/riwayat");
  revalidatePath("/kasir");
  revalidatePath("/laporan");
  return { success: true };
}

export async function correctSalePaymentMethodAction(
  saleId: string,
  paymentMethod: Exclude<PaymentMethod, "DEPOSIT">,
  reason: string
): Promise<VoidResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await correctSalePaymentMethod(user.tenantId, saleId, paymentMethod, reason, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengoreksi metode bayar." };
  }
  revalidatePath("/kasir/riwayat");
  revalidatePath("/finance");
  revalidatePath("/finance/kas");
  revalidatePath("/simple/uang");
  return { success: true };
}
