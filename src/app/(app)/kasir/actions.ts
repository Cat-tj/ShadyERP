"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/require-session";
import { openShift, closeShift, getOpenShift } from "@/server/services/shift-service";
import { createSale, type CartItemInput } from "@/server/services/sale-service";
import { createCashOutTransaction } from "@/server/services/cash-out-service";
import { getAvailableSerials } from "@/server/services/product-serial-service";
import { getMemberFavoriteProducts } from "@/server/services/member-service";
import type { CashOutMethod, OrderType, PaymentMethod } from "@prisma/client";

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
  const breakdownRaw = String(formData.get("closingCashBreakdown") ?? "");
  const varianceNote = String(formData.get("varianceNote") ?? "").trim() || undefined;

  if (!Number.isFinite(closingCash) || closingCash < 0) {
    return { error: "Uang yang dihitung tidak valid." };
  }

  let closingCashBreakdown: Record<string, number> | undefined;
  if (breakdownRaw) {
    try {
      const parsed = JSON.parse(breakdownRaw);
      if (parsed && typeof parsed === "object") closingCashBreakdown = parsed;
    } catch {
      // Abaikan breakdown yang tidak valid — closingCash tetap dipakai sebagai sumber kebenaran.
    }
  }

  try {
    await closeShift({ tenantId: user.tenantId, shiftId, closingCash, closingCashBreakdown, varianceNote });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menutup shift." };
  }

  revalidatePath("/kasir");
  redirect(`/kasir/tutup/selesai/${shiftId}`);
}

/**
 * Kasir boleh memakai harga khusus untuk satu transaksi (mis. barang timbang atau
 * negosiasi). Nilai ini hanya menjadi snapshot di struk, tidak mengubah harga master.
 */
export type PosCartItemInput = CartItemInput;

export type CreateSalePayload = {
  items: PosCartItemInput[];
  discountAmount: number;
  paymentMethod: PaymentMethod;
  orderType?: OrderType;
  amountPaid: number;
  memberId?: string | null;
  redeemStamp?: boolean;
  giftCardCode?: string;
  /** Isi kalau kasir bayar pakai lebih dari 1 metode — lihat CreateSaleInput di sale-service.ts. */
  splitPayments?: { method: PaymentMethod; amount: number }[];
  idempotencyKey?: string;
};

export type CreateSaleResult = { error?: string; saleId?: string };

export async function createSaleAction(payload: CreateSalePayload): Promise<CreateSaleResult> {
  const user = await requireSession();
  const openShiftRecord = await getOpenShift(user.tenantId, user.id);

  if (!openShiftRecord) {
    return { error: "Shift belum dibuka. Buka shift dulu sebelum berjualan." };
  }

  const invalidCustomPrice = payload.items.some(
    (item) =>
      item.unitPriceOverride !== undefined &&
      (!Number.isFinite(item.unitPriceOverride) || item.unitPriceOverride < 0)
  );
  if (invalidCustomPrice) {
    return { error: "Harga khusus tidak valid." };
  }

  try {
    const sale = await createSale({
      tenantId: user.tenantId,
      outletId: openShiftRecord.outletId,
      shiftId: openShiftRecord.id,
      cashierId: user.id,
      memberId: payload.memberId,
      items: payload.items.map(({ ...item }) => item),
      discountAmount: payload.discountAmount,
      paymentMethod: payload.paymentMethod,
      orderType: payload.orderType ?? "DINE_IN",
      amountPaid: payload.amountPaid,
      redeemStamp: payload.redeemStamp,
      giftCardCode: payload.giftCardCode,
      splitPayments: payload.splitPayments,
      idempotencyKey: payload.idempotencyKey,
    });
    revalidatePath("/kasir");
    return { saleId: sale.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan transaksi." };
  }
}

export async function getAvailableSerialsAction(productId: string): Promise<{ serialNumber: string }[]> {
  const user = await requireSession();
  const openShiftRecord = await getOpenShift(user.tenantId, user.id);
  if (!openShiftRecord) return [];

  const serials = await getAvailableSerials(user.tenantId, productId, openShiftRecord.outletId);
  return serials.map((s) => ({ serialNumber: s.serialNumber }));
}

export type MemberFavoriteProduct = { id: string; name: string; price: number };

export async function getMemberFavoriteProductsAction(memberId: string): Promise<MemberFavoriteProduct[]> {
  const user = await requireSession();
  const favorites = await getMemberFavoriteProducts(user.tenantId, memberId);
  return favorites.map((p) => ({ id: p.id, name: p.name, price: p.price }));
}

export type CreateCashOutPayload = {
  customerName?: string;
  customerPhone?: string;
  withdrawAmount: number;
  adminFee: number;
  method: CashOutMethod;
  note?: string;
};

export type CreateCashOutResult = { error?: string; referenceNumber?: string };

export async function createCashOutAction(
  payload: CreateCashOutPayload
): Promise<CreateCashOutResult> {
  const user = await requireSession();
  const openShiftRecord = await getOpenShift(user.tenantId, user.id);

  if (!openShiftRecord) {
    return { error: "Shift belum dibuka. Buka shift dulu sebelum gesek tunai." };
  }

  try {
    const transaction = await createCashOutTransaction({
      tenantId: user.tenantId,
      outletId: openShiftRecord.outletId,
      shiftId: openShiftRecord.id,
      cashierId: user.id,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      withdrawAmount: payload.withdrawAmount,
      adminFee: payload.adminFee,
      method: payload.method,
      note: payload.note,
    });
    revalidatePath("/kasir");
    revalidatePath("/kasir/riwayat");
    return { referenceNumber: transaction.referenceNumber };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan gesek tunai." };
  }
}
