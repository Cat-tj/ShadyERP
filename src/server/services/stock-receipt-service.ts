import { prisma } from "@/lib/prisma";
import type { StockReceipt, StockReceiptStatus, QCStatus } from "@prisma/client";

export interface ReceiptItemInput {
  productId: string;
  qtyReceived: number;
}

export async function generateReceiptNumber(tenantId: string): Promise<string> {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const count = await prisma.stockReceipt.count({
    where: { tenantId },
  });
  return `GR-${today}-${String(count + 1).padStart(3, "0")}`;
}

export async function createStockReceipt(
  tenantId: string,
  poId: string,
  outletId: string,
  items: ReceiptItemInput[],
  receivedById: string
): Promise<StockReceipt> {
  const receiptNumber = await generateReceiptNumber(tenantId);

  return prisma.stockReceipt.create({
    data: {
      tenantId,
      poId,
      outletId,
      receiptNumber,
      status: "PENDING",
      receivedById,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          qtyReceived: item.qtyReceived,
          qtyAccepted: item.qtyReceived, // Default: accept all (QC pending)
          qcStatus: "PENDING",
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });
}

export async function getReceiptById(tenantId: string, receiptId: string) {
  return prisma.stockReceipt.findFirst({
    where: { id: receiptId, tenantId },
    include: {
      po: { include: { supplier: true } },
      outlet: true,
      items: { include: { product: true } },
      receivedBy: { select: { id: true, name: true } },
      checkedBy: { select: { id: true, name: true } },
    },
  });
}

export async function getStockReceipts(tenantId: string, outletId?: string, status?: StockReceiptStatus) {
  return prisma.stockReceipt.findMany({
    where: {
      tenantId,
      ...(outletId && { outletId }),
      ...(status && { status }),
    },
    include: {
      po: { include: { supplier: true } },
      outlet: true,
      items: { include: { product: true } },
    },
    orderBy: { receivedAt: "desc" },
  });
}

export interface QCInput {
  receiptItemId: string;
  qtyAccepted: number;
  qtyDefect: number;
  qcNotes?: string;
}

export async function performQC(
  tenantId: string,
  receiptId: string,
  qcChecks: QCInput[],
  checkedById: string
): Promise<StockReceipt> {
  const receipt = await getReceiptById(tenantId, receiptId);
  if (!receipt) throw new Error("Receipt not found");

  // Update all items with QC results
  for (const check of qcChecks) {
    const item = receipt.items.find((i) => i.id === check.receiptItemId);
    if (!item) throw new Error("Receipt item not found");

    const qcStatus: QCStatus =
      check.qtyDefect === 0 ? "PASSED" : check.qtyAccepted === 0 ? "REJECTED" : "PARTIAL_DEFECT";

    await prisma.stockReceiptItem.update({
      where: { id: check.receiptItemId },
      data: {
        qtyAccepted: check.qtyAccepted,
        qtyDefect: check.qtyDefect,
        qcStatus,
        qcNotes: check.qcNotes,
      },
    });
  }

  // Check if all items have been QC'd
  const allQCd = receipt.items.every((item) =>
    qcChecks.some((check) => check.receiptItemId === item.id)
  );

  let newStatus: StockReceiptStatus = "PARTIAL_QC";
  if (allQCd) {
    const anyRejected = qcChecks.some((check) => check.qtyAccepted === 0);
    newStatus = anyRejected ? "REJECTED" : "COMPLETED";
  }

  return prisma.stockReceipt.update({
    where: { id: receiptId },
    data: {
      status: newStatus,
      ...(newStatus === "COMPLETED" && { completedAt: new Date() }),
      checkedById,
    },
    include: { items: { include: { product: true } } },
  });
}

export async function completeReceipt(
  tenantId: string,
  receiptId: string
): Promise<StockReceipt> {
  const receipt = await getReceiptById(tenantId, receiptId);
  if (!receipt) throw new Error("Receipt not found");

  // Move accepted qty to actual stock
  for (const item of receipt.items) {
    if (item.qtyAccepted > 0) {
      const stock = await prisma.productStock.findUnique({
        where: {
          productId_outletId: {
            productId: item.productId,
            outletId: receipt.outletId,
          },
        },
      });

      if (stock) {
        await prisma.productStock.update({
          where: { id: stock.id },
          data: {
            qty: { increment: item.qtyAccepted },
          },
        });
      } else {
        await prisma.productStock.create({
          data: {
            tenantId,
            productId: item.productId,
            outletId: receipt.outletId,
            qty: item.qtyAccepted,
          },
        });
      }
    }
  }

  return prisma.stockReceipt.update({
    where: { id: receiptId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
}

export async function rejectReceipt(
  tenantId: string,
  receiptId: string,
  reason: string
): Promise<StockReceipt> {
  return prisma.stockReceipt.update({
    where: { id: receiptId },
    data: {
      status: "REJECTED",
      notes: reason,
    },
  });
}

export async function getReceiptStats(tenantId: string) {
  const pending = await prisma.stockReceipt.count({
    where: { tenantId, status: "PENDING" },
  });

  const completed = await prisma.stockReceipt.count({
    where: { tenantId, status: "COMPLETED" },
  });

  const totalQtyReceived = await prisma.stockReceiptItem.aggregate({
    where: { receipt: { tenantId } },
    _sum: { qtyReceived: true },
  });

  return {
    pending,
    completed,
    totalQtyReceived: totalQtyReceived._sum.qtyReceived || 0,
  };
}
