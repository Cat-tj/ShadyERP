"use server";

import { requireSession } from "@/server/require-session";
import {
  createStockReceipt,
  createDirectStockReceipt,
  performQC,
  completeReceipt,
  rejectReceipt,
} from "@/server/services/stock-receipt-service";

export interface ReceiptItemInput {
  productId: string;
  qtyReceived: number;
  unitPrice?: number;
  batchNumber?: string | null;
  expirationDate?: Date | null;
  serialNumbers?: string[];
}

export interface QCInput {
  receiptItemId: string;
  qtyAccepted: number;
  qtyDefect: number;
  qcNotes?: string;
}

export async function createStockReceiptAction(
  poId: string,
  outletId: string,
  items: ReceiptItemInput[],
  landedCost?: { shippingCost?: number; otherCost?: number }
) {
  try {
    const user = await requireSession();

    const receipt = await createStockReceipt(
      user.tenantId,
      poId,
      outletId,
      items,
      user.id,
      landedCost
    );

    return { data: receipt };
  } catch (err) {
    console.error("Error creating stock receipt:", err);
    return { error: "Gagal membuat penerimaan barang" };
  }
}

export async function createDirectStockReceiptAction(
  outletId: string,
  supplierId: string | null,
  items: ReceiptItemInput[],
  note?: string | null,
  landedCost?: { shippingCost?: number; otherCost?: number }
) {
  try {
    const user = await requireSession();

    const receipt = await createDirectStockReceipt(
      user.tenantId,
      outletId,
      supplierId,
      items,
      user.id,
      note,
      landedCost
    );

    return { data: receipt };
  } catch (err) {
    console.error("Error creating direct stock receipt:", err);
    return { error: err instanceof Error ? err.message : "Gagal membuat penerimaan langsung" };
  }
}

export async function performQCAction(receiptId: string, qcChecks: QCInput[]) {
  try {
    const user = await requireSession();

    const receipt = await performQC(user.tenantId, receiptId, qcChecks, user.id);

    return { data: receipt };
  } catch (err) {
    console.error("Error performing QC:", err);
    return { error: "Gagal melakukan pemeriksaan kualitas" };
  }
}

export async function completeStockReceiptAction(receiptId: string) {
  try {
    const user = await requireSession();

    const receipt = await completeReceipt(user.tenantId, receiptId);

    return { data: receipt };
  } catch (err) {
    console.error("Error completing receipt:", err);
    return { error: "Gagal menyelesaikan penerimaan barang" };
  }
}

export async function rejectStockReceiptAction(receiptId: string, reason: string) {
  try {
    const user = await requireSession();

    const receipt = await rejectReceipt(user.tenantId, receiptId, reason);

    return { data: receipt };
  } catch (err) {
    console.error("Error rejecting receipt:", err);
    return { error: "Gagal menolak penerimaan barang" };
  }
}
