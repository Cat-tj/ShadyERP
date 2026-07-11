"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/server/require-session";
import { sellGiftCard, getGiftCardByCode, voidGiftCard } from "@/server/services/gift-card-service";

export type ActionResult = { error?: string; success?: boolean };

export type SellGiftCardResult = ActionResult & { code?: string };

export async function sellGiftCardAction(input: {
  amount: number;
  buyerName?: string;
  buyerPhone?: string;
  note?: string;
}): Promise<SellGiftCardResult> {
  const user = await requireSession();
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { error: "Nilai voucher tidak valid." };
  }
  try {
    const giftCard = await sellGiftCard({
      tenantId: user.tenantId,
      amount: input.amount,
      buyerName: input.buyerName,
      buyerPhone: input.buyerPhone,
      note: input.note,
      soldById: user.id,
    });
    revalidatePath("/voucher");
    return { success: true, code: giftCard.code };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menjual voucher." };
  }
}

export type LookupGiftCardResult = {
  error?: string;
  code?: string;
  balance?: number;
  status?: string;
};

export async function lookupGiftCardAction(code: string): Promise<LookupGiftCardResult> {
  const user = await requireSession();
  if (!code.trim()) return { error: "Masukkan kode voucher." };
  const giftCard = await getGiftCardByCode(user.tenantId, code);
  if (!giftCard) return { error: "Kode voucher tidak ditemukan." };
  return { code: giftCard.code, balance: giftCard.balance, status: giftCard.status };
}

export async function voidGiftCardAction(giftCardId: string, reason: string): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  if (!reason.trim()) return { error: "Alasan pembatalan wajib diisi." };
  try {
    await voidGiftCard(user.tenantId, giftCardId, reason, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membatalkan voucher." };
  }
  revalidatePath("/voucher");
  return { success: true };
}
