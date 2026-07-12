"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/require-session";
import {
  createCateringOrder,
  updateCateringOrderStatus,
  addCateringPayment,
  type CateringOrderInput,
} from "@/server/services/catering-order-service";
import type { CateringOrderStatus, PaymentMethod } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean };

export async function createCateringOrderAction(input: CateringOrderInput): Promise<ActionResult> {
  const user = await requireSession();
  try {
    await createCateringOrder(user.tenantId, user.id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membuat pesanan katering." };
  }
  revalidatePath("/pesanan-katering");
  return { success: true };
}

export async function updateCateringOrderStatusAction(
  id: string,
  status: CateringOrderStatus
): Promise<ActionResult> {
  const user = await requireSession();
  try {
    await updateCateringOrderStatus(user.tenantId, id, status, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status pesanan." };
  }
  revalidatePath("/pesanan-katering");
  return { success: true };
}

export async function addCateringPaymentAction(
  cateringOrderId: string,
  amount: number,
  method: PaymentMethod
): Promise<ActionResult> {
  const user = await requireSession();
  try {
    await addCateringPayment(user.tenantId, cateringOrderId, amount, method);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mencatat pembayaran." };
  }
  revalidatePath("/pesanan-katering");
  return { success: true };
}
