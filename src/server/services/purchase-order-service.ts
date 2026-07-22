import { prisma } from "@/lib/prisma";
import type { PurchaseOrder, PurchaseOrderStatus } from "@prisma/client";

export interface POItemInput {
  productId: string;
  qty: number;
  unitPrice: number;
}

export async function generatePONumber(tenantId: string): Promise<string> {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const count = await prisma.purchaseOrder.count({
    where: { tenantId },
  });
  return `PO-${today}-${String(count + 1).padStart(3, "0")}`;
}

export async function createPurchaseOrder(
  tenantId: string,
  supplierId: string,
  items: POItemInput[]
): Promise<PurchaseOrder> {
  const poNumber = await generatePONumber(tenantId);

  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  return prisma.purchaseOrder.create({
    data: {
      tenantId,
      supplierId,
      poNumber,
      totalAmount,
      status: "DRAFT",
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          unitPrice: item.unitPrice,
          subtotal: item.qty * item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });
}

export async function getPOById(tenantId: string, poId: string) {
  return prisma.purchaseOrder.findFirst({
    where: { id: poId, tenantId },
    include: {
      supplier: true,
      items: {
        include: { product: true },
      },
      approvedBy: { select: { id: true, name: true } },
    },
  });
}

export async function getPurchaseOrders(
  tenantId: string,
  status?: PurchaseOrderStatus,
  supplierId?: string
) {
  return prisma.purchaseOrder.findMany({
    where: {
      tenantId,
      ...(status && { status }),
      ...(supplierId && { supplierId }),
    },
    include: {
      supplier: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function approvePO(
  tenantId: string,
  poId: string,
  approvedById: string
): Promise<PurchaseOrder> {
  const po = await getPOById(tenantId, poId);
  if (!po) throw new Error("PO not found");
  if (po.status !== "DRAFT") throw new Error("Only DRAFT POs can be approved");

  return prisma.purchaseOrder.update({
    where: { id: poId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      approvedById,
    },
  });
}

export async function rejectPO(
  tenantId: string,
  poId: string,
  reason: string
): Promise<PurchaseOrder> {
  const po = await getPOById(tenantId, poId);
  if (!po) throw new Error("PO not found");

  return prisma.purchaseOrder.update({
    where: { id: poId },
    data: {
      status: "CANCELLED",
      rejectionNote: reason,
    },
  });
}

export async function confirmPOReceipt(
  tenantId: string,
  poId: string,
  expectedDate: Date
): Promise<PurchaseOrder> {
  const po = await getPOById(tenantId, poId);
  if (!po) throw new Error("PO not found");

  return prisma.purchaseOrder.update({
    where: { id: poId },
    data: {
      status: "CONFIRMED",
      expectedAt: expectedDate,
    },
  });
}

export async function updatePOStatus(
  tenantId: string,
  poId: string,
  status: PurchaseOrderStatus
): Promise<PurchaseOrder> {
  const po = await getPOById(tenantId, poId);
  if (!po) throw new Error("PO not found");

  return prisma.purchaseOrder.update({
    where: { id: poId },
    data: { status },
  });
}

export async function cancelPO(tenantId: string, poId: string, reason: string): Promise<void> {
  const po = await getPOById(tenantId, poId);
  if (!po) throw new Error("PO not found");
  if (po.status === "RECEIVED") throw new Error("Cannot cancel received PO");

  await prisma.purchaseOrder.update({
    where: { id: poId },
    data: {
      status: "CANCELLED",
      rejectionNote: reason,
    },
  });
}

export async function getPOStats(tenantId: string) {
  const statuses = await prisma.purchaseOrder.groupBy({
    by: ["status"],
    where: { tenantId },
    _count: { id: true },
  });

  const totalValue = await prisma.purchaseOrder.aggregate({
    where: { tenantId },
    _sum: { totalAmount: true },
  });

  return {
    byStatus: statuses,
    totalValue: totalValue._sum.totalAmount || 0,
  };
}

/** PO yang sudah dikirim ke supplier tapi belum diterima penuh, dan tanggal
 * kedatangan yang dijanjikan (expectedAt) sudah lewat — dipakai buat action
 * center dashboard ("N purchase order melewati jadwal tiba"). */
export async function getOverduePurchaseOrders(tenantId: string, limit = 5) {
  return prisma.purchaseOrder.findMany({
    where: {
      tenantId,
      status: { in: ["SENT", "CONFIRMED", "PARTIALLY_RECEIVED"] },
      expectedAt: { lt: new Date() },
    },
    include: { supplier: true },
    orderBy: { expectedAt: "asc" },
    take: limit,
  });
}
