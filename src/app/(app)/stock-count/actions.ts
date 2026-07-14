"use server";

import { requireSession } from "@/server/require-session";
import {
  createStockCount,
  updateCountItems,
  completeCount,
  verifyAndApplyCount,
} from "@/server/services/stock-count-service";

export interface CountItemInput {
  stockCountItemId: string;
  physicalQty: number;
  notes?: string;
}

export async function createStockCountAction(outletId: string) {
  try {
    const user = await requireSession();

    const count = await createStockCount(user.tenantId, outletId, new Date(), user.id);

    return { data: count };
  } catch (err) {
    console.error("Error creating stock count:", err);
    return { error: "Gagal membuat opname" };
  }
}

export async function updateCountItemsAction(countId: string, items: CountItemInput[]) {
  try {
    const user = await requireSession();

    const count = await updateCountItems(user.tenantId, countId, items);

    return { data: count };
  } catch (err) {
    console.error("Error updating count items:", err);
    return { error: "Gagal menyimpan opname" };
  }
}

export async function completeStockCountAction(countId: string) {
  try {
    const user = await requireSession();

    const count = await completeCount(user.tenantId, countId, user.id);

    return { data: count };
  } catch (err) {
    console.error("Error completing count:", err);
    return { error: "Gagal menyelesaikan opname" };
  }
}

export async function verifyStockCountAction(countId: string) {
  try {
    const user = await requireSession();

    const count = await verifyAndApplyCount(user.tenantId, countId, user.id);

    return { data: count };
  } catch (err) {
    console.error("Error verifying count:", err);
    return { error: "Gagal meverifikasi opname" };
  }
}
