"use server";

import { auth } from "@/server/auth";
import {
  createPurchaseOrder,
  approvePO,
  rejectPO,
  confirmPOReceipt,
  cancelPO,
} from "@/server/services/purchase-order-service";

export interface POItemInput {
  productId: string;
  qty: number;
  unitPrice: number;
}

export async function createPurchaseOrderAction(supplierId: string, items: POItemInput[]) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const po = await createPurchaseOrder(session.user.tenantId, supplierId, items);

    return { data: po };
  } catch (err) {
    console.error("Error creating purchase order:", err);
    return { error: "Gagal membuat pemesanan" };
  }
}

export async function approvePurchaseOrderAction(poId: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session.user.id) {
      return { error: "Unauthorized" };
    }

    const po = await approvePO(session.user.tenantId, poId, session.user.id);

    return { data: po };
  } catch (err) {
    console.error("Error approving PO:", err);
    return { error: "Gagal menyetujui pemesanan" };
  }
}

export async function rejectPurchaseOrderAction(poId: string, reason: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const po = await rejectPO(session.user.tenantId, poId, reason);

    return { data: po };
  } catch (err) {
    console.error("Error rejecting PO:", err);
    return { error: "Gagal menolak pemesanan" };
  }
}

export async function confirmPurchaseOrderAction(poId: string, expectedDateStr: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const expectedDate = new Date(expectedDateStr);
    if (isNaN(expectedDate.getTime())) {
      return { error: "Format tanggal tidak valid" };
    }

    const po = await confirmPOReceipt(session.user.tenantId, poId, expectedDate);

    return { data: po };
  } catch (err) {
    console.error("Error confirming PO:", err);
    return { error: "Gagal mengkonfirmasi pemesanan" };
  }
}

export async function cancelPurchaseOrderAction(poId: string, reason: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    await cancelPO(session.user.tenantId, poId, reason);

    return { data: null };
  } catch (err) {
    console.error("Error cancelling PO:", err);
    return { error: "Gagal membatalkan pemesanan" };
  }
}
