import { prisma } from "@/lib/prisma";
import type { StockReceipt, StockReceiptStatus, QCStatus } from "@prisma/client";
import { receiveBatch } from "@/server/services/inventory-service";

export interface ReceiptItemInput {
  productId: string;
  qtyReceived: number;
  unitPrice?: number;
  batchNumber?: string | null;
  expirationDate?: Date | null;
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
          batchNumber: item.batchNumber?.trim() || null,
          expirationDate: item.expirationDate ?? null,
          qcStatus: "PENDING",
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });
}

export async function createDirectStockReceipt(
  tenantId: string,
  outletId: string,
  supplierId: string | null,
  items: ReceiptItemInput[],
  receivedById: string,
  note?: string | null
) {
  if (!items.length) throw new Error("Minimal satu item barang wajib diisi.");
  let supplier = supplierId
    ? await prisma.supplier.findFirst({ where: { id: supplierId, tenantId } })
    : await prisma.supplier.findFirst({ where: { tenantId, name: "Supplier Umum" } });
  if (!supplier && !supplierId) {
    supplier = await prisma.supplier.create({ data: { tenantId, name: "Supplier Umum" } });
  }
  if (!supplier) throw new Error("Supplier tidak ditemukan.");

  const poNumber = `PO-DIRECT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(
    (await prisma.purchaseOrder.count({ where: { tenantId } })) + 1
  ).padStart(3, "0")}`;
  const receiptNumber = await generateReceiptNumber(tenantId);
  const totalAmount = items.reduce((sum, item) => sum + item.qtyReceived * (item.unitPrice ?? 0), 0);

  return prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.create({
      data: {
        tenantId,
        supplierId: supplier.id,
        poNumber,
        status: "CONFIRMED",
        expectedAt: new Date(),
        totalAmount,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            qty: item.qtyReceived,
            unitPrice: item.unitPrice ?? 0,
            subtotal: item.qtyReceived * (item.unitPrice ?? 0),
          })),
        },
      },
    });

    return tx.stockReceipt.create({
      data: {
        tenantId,
        poId: po.id,
        outletId,
        receiptNumber,
        status: "PENDING",
        receivedById,
        notes: note?.trim() || "Penerimaan langsung tanpa PO manual",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            qtyReceived: item.qtyReceived,
            qtyAccepted: item.qtyReceived,
            batchNumber: item.batchNumber?.trim() || null,
            expirationDate: item.expirationDate ?? null,
            qcStatus: "PENDING",
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
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

  let totalInvoiceAmount = 0;

  // Move accepted qty to actual stock & compute moving average cost
  for (const item of receipt.items) {
    if (item.qtyAccepted > 0) {
      // Get unitPrice from PurchaseOrder
      const poItem = await prisma.purchaseOrderItem.findFirst({
        where: {
          poId: receipt.poId,
          productId: item.productId,
        },
      });
      const receivedCost = poItem?.unitPrice ?? 0;
      totalInvoiceAmount += item.qtyAccepted * receivedCost;

      // Update current stocks
      const stock = await prisma.productStock.findUnique({
        where: {
          productId_outletId: {
            productId: item.productId,
            outletId: receipt.outletId,
          },
        },
      });

      // Calculate total stock across all outlets to compute overall average cost
      const totalStockAgg = await prisma.productStock.aggregate({
        where: {
          productId: item.productId,
          tenantId,
        },
        _sum: { qty: true },
      });
      const currentTotalStock = totalStockAgg._sum.qty ?? 0;

      // Fetch current product cost
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { cost: true, trackExpiry: true },
      });
      const previousCost = product?.cost ?? 0;

      // Moving Average Cost calculation
      const newCost = (currentTotalStock + item.qtyAccepted) > 0
        ? Math.round(
            (currentTotalStock * previousCost + item.qtyAccepted * receivedCost) /
              (currentTotalStock + item.qtyAccepted)
          )
        : receivedCost;

      // Update Product cost & cost history
      await prisma.product.update({
        where: { id: item.productId },
        data: { cost: newCost },
      });

      await prisma.productCostHistory.create({
        data: {
          tenantId,
          productId: item.productId,
          previousCost,
          newCost,
          reason: `Auto Moving Average (GR: ${receipt.receiptNumber})`,
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

      if (item.batchNumber || item.expirationDate || product?.trackExpiry) {
        await receiveBatch(
          tenantId,
          item.productId,
          receipt.outletId,
          item.batchNumber || `${receipt.receiptNumber}-${item.productId.slice(-4)}`,
          item.qtyAccepted,
          item.expirationDate ?? undefined,
          `Dari penerimaan ${receipt.receiptNumber}`
        );
      }
    }
  }

  // Auto-generate SupplierInvoice if totalInvoiceAmount > 0 and ADVANCED mode
  const setting = await prisma.tenantSetting.findUnique({ where: { tenantId } });
  const isAdvanced = setting?.accountingMode === "ADVANCED";
  const supplierId = receipt.po?.supplier?.id;
  if (isAdvanced && supplierId && totalInvoiceAmount > 0) {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);

    const count = await prisma.supplierInvoice.count({
      where: { tenantId },
    });
    const invoiceNumber = `INV-SUP-${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${String(count + 1).padStart(3, "0")}`;

    await prisma.supplierInvoice.create({
      data: {
        tenantId,
        supplierId,
        outletId: receipt.outletId,
        invoiceNumber,
        invoiceDate: today,
        dueDate,
        subtotal: totalInvoiceAmount,
        total: totalInvoiceAmount,
        status: "UNPAID",
        purchaseOrderId: receipt.poId,
        stockReceiptId: receipt.id,
        notes: `Auto-generated from Stock Receipt ${receipt.receiptNumber}`,
      },
    });
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
