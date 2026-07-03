"use server";

import { createOrder, type CreateOrderItemInput } from "@/server/services/table-order-service";
import { checkRateLimit, getClientIp, formatRetryMessage } from "@/lib/rate-limit";

export type ActionResult = { error?: string; success?: boolean };

export async function submitOrderAction(
  qrToken: string,
  items: CreateOrderItemInput[],
  customerName?: string,
  note?: string
): Promise<ActionResult> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`pesan:ip:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return { error: formatRetryMessage(limit.retryAfterMs) };
  }

  try {
    await createOrder(qrToken, { items, customerName, note });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengirim pesanan." };
  }
  return { success: true };
}
