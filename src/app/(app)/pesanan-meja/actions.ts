"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/require-session";
import { updateOrderStatus, completeOrderPayment } from "@/server/services/table-order-service";
import { getOpenShift } from "@/server/services/shift-service";
import type { TableOrderStatus, PaymentMethod } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean; saleId?: string };

export async function updateOrderStatusAction(
  id: string,
  status: TableOrderStatus
): Promise<ActionResult> {
  const user = await requireSession();
  try {
    await updateOrderStatus(user.tenantId, id, status);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal memperbarui pesanan." };
  }
  revalidatePath("/pesanan-meja");
  return { success: true };
}

export async function completeOrderPaymentAction(
  orderId: string,
  paymentMethod: PaymentMethod,
  amountPaid: number,
  memberId?: string | null
): Promise<ActionResult> {
  const user = await requireSession();
  const shift = await getOpenShift(user.tenantId, user.id);
  if (!shift) {
    return { error: "Buka shift kasir dulu untuk menerima pembayaran." };
  }

  try {
    const sale = await completeOrderPayment(user.tenantId, orderId, {
      shiftId: shift.id,
      cashierId: user.id,
      paymentMethod,
      amountPaid,
      memberId,
    });
    revalidatePath("/pesanan-meja");
    revalidatePath("/kasir");
    revalidatePath("/laporan");
    return { success: true, saleId: sale.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal memproses pembayaran." };
  }
}
