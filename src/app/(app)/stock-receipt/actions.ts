"use server";

import { auth } from "@/lib/auth";
import {
  createStockReceipt,
  performQC,
  completeReceipt,
  rejectReceipt,
} from "@/server/services/stock-receipt-service";

export interface ReceiptItemInput {
  productId: string;
  qtyReceived: number;
}

export interface QCInput {
  receiptItemId: string;
  qtyAccepted: number;
  qtyDefect: number;
  qcNotes?: string;
}

export async function createStockReceiptAction(poId: string, outletId: string, items: ReceiptItemInput[]) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session.user.id) {
      return { error: "Unauthorized" };
    }

    const receipt = await createStockReceipt(session.user.tenantId, poId, outletId, items, session.user.id);

    return { data: receipt };
  } catch (err) {
    console.error("Error creating stock receipt:", err);
    return { error: "Gagal membuat penerimaan barang" };
  }
}

export async function performQCAction(receiptId: string, qcChecks: QCInput[]) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session.user.id) {
      return { error: "Unauthorized" };
    }

    const receipt = await performQC(session.user.tenantId, receiptId, qcChecks, session.user.id);

    return { data: receipt };
  } catch (err) {
    console.error("Error performing QC:", err);
    return { error: "Gagal melakukan pemeriksaan kualitas" };
  }
}

export async function completeStockReceiptAction(receiptId: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const receipt = await completeReceipt(session.user.tenantId, receiptId);

    return { data: receipt };
  } catch (err) {
    console.error("Error completing receipt:", err);
    return { error: "Gagal menyelesaikan penerimaan barang" };
  }
}

export async function rejectStockReceiptAction(receiptId: string, reason: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const receipt = await rejectReceipt(session.user.tenantId, receiptId, reason);

    return { data: receipt };
  } catch (err) {
    console.error("Error rejecting receipt:", err);
    return { error: "Gagal menolak penerimaan barang" };
  }
}
