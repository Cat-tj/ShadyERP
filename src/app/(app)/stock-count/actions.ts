"use server";

import { auth } from "@/lib/auth";
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
    const session = await auth();
    if (!session?.user?.tenantId || !session.user.id) {
      return { error: "Unauthorized" };
    }

    const count = await createStockCount(session.user.tenantId, outletId, new Date(), session.user.id);

    return { data: count };
  } catch (err) {
    console.error("Error creating stock count:", err);
    return { error: "Gagal membuat opname" };
  }
}

export async function updateCountItemsAction(countId: string, items: CountItemInput[]) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const count = await updateCountItems(session.user.tenantId, countId, items);

    return { data: count };
  } catch (err) {
    console.error("Error updating count items:", err);
    return { error: "Gagal menyimpan opname" };
  }
}

export async function completeStockCountAction(countId: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session.user.id) {
      return { error: "Unauthorized" };
    }

    const count = await completeCount(session.user.tenantId, countId, session.user.id);

    return { data: count };
  } catch (err) {
    console.error("Error completing count:", err);
    return { error: "Gagal menyelesaikan opname" };
  }
}

export async function verifyStockCountAction(countId: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session.user.id) {
      return { error: "Unauthorized" };
    }

    const count = await verifyAndApplyCount(session.user.tenantId, countId, session.user.id);

    return { data: count };
  } catch (err) {
    console.error("Error verifying count:", err);
    return { error: "Gagal meverifikasi opname" };
  }
}
