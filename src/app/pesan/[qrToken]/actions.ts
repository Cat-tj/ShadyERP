"use server";

import { createOrder, type CreateOrderItemInput } from "@/server/services/table-order-service";

export type ActionResult = { error?: string; success?: boolean };

export async function submitOrderAction(
  qrToken: string,
  items: CreateOrderItemInput[],
  customerName?: string,
  note?: string
): Promise<ActionResult> {
  try {
    await createOrder(qrToken, { items, customerName, note });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengirim pesanan." };
  }
  return { success: true };
}
