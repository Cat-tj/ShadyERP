"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/require-session";
import { openShift, closeShift, getOpenShift } from "@/server/services/shift-service";
import { createSale, type CartItemInput } from "@/server/services/sale-service";
import type { PaymentMethod } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean };

export type CloseShiftResult = { error?: string };

export async function openShiftAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireSession();
  const outletId = String(formData.get("outletId") ?? "");
  const openingCash = Number(formData.get("openingCash") ?? 0);

  if (!outletId) return { error: "Pilih outlet dulu." };
  if (!Number.isFinite(openingCash) || openingCash < 0) {
    return { error: "Modal awal tidak valid." };
  }

  try {
    await openShift({ tenantId: user.tenantId, userId: user.id, outletId, openingCash });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membuka shift." };
  }

  revalidatePath("/kasir");
  return { success: true };
}

export async function closeShiftAction(
  _prev: CloseShiftResult,
  formData: FormData
): Promise<CloseShiftResult> {
  const user = await requireSession();
  const shiftId = String(formData.get("shiftId") ?? "");
  const closingCash = Number(formData.get("closingCash") ?? 0);

  if (!Number.isFinite(closingCash) || closingCash < 0) {
    return { error: "Uang yang dihitung tidak valid." };
  }

  try {
    await closeShift({ tenantId: user.tenantId, shiftId, closingCash });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menutup shift." };
  }

  revalidatePath("/kasir");
  redirect(`/kasir/tutup/selesai/${shiftId}`);
}

export type CreateSalePayload = {
  items: CartItemInput[];
  discountAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  memberId?: string | null;
};

export type CreateSaleResult = { error?: string; saleId?: string };

export async function createSaleAction(payload: CreateSalePayload): Promise<CreateSaleResult> {
  const user = await requireSession();
  const openShiftRecord = await getOpenShift(user.tenantId, user.id);

  if (!openShiftRecord) {
    return { error: "Shift belum dibuka. Buka shift dulu sebelum berjualan." };
  }

  try {
    const sale = await createSale({
      tenantId: user.tenantId,
      outletId: openShiftRecord.outletId,
      shiftId: openShiftRecord.id,
      cashierId: user.id,
      memberId: payload.memberId,
      items: payload.items,
      discountAmount: payload.discountAmount,
      paymentMethod: payload.paymentMethod,
      amountPaid: payload.amountPaid,
    });
    revalidatePath("/kasir");
    return { saleId: sale.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan transaksi." };
  }
}
