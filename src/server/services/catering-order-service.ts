import { ulid } from "ulid";
import { prisma } from "@/lib/prisma";
import { findMemberByPhone } from "@/server/services/member-service";
import { createExpense } from "@/server/services/expense-service";
import { createSale } from "@/server/services/sale-service";
import { formatRupiah } from "@/lib/format";
import type { CateringOrderStatus, PaymentMethod } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 *
 * Pesanan besar buat acara PIHAK LAIN (mis. suplai 1000 gelas kopi ke acara orang) —
 * harga per item custom (bisa beda dari harga normal kasir). Waktu status DONE,
 * otomatis bikin Sale asli lewat createSale() dari sale-service.ts — biar stok/resep
 * kepotong beneran & masuk jurnal akuntansi, bukan cuma catatan informal.
 */

export type CateringOrderItemInput = {
  productId: string;
  qty: number;
  unitPrice: number;
};

export type CateringOrderInput = {
  outletId: string;
  customerName: string;
  customerPhone: string | null;
  eventName: string | null;
  eventAddress: string | null;
  eventDate: Date | null;
  items: CateringOrderItemInput[];
  /** DP saat order dibuat — opsional, langsung tercatat sebagai baris pembayaran pertama. */
  paidAmount?: number;
  /** Biaya transport/tenaga tambahan/sewa alat — kalau diisi, otomatis jadi Pengeluaran outlet ini. */
  operationalCost?: number | null;
  note: string | null;
};

function computeTotal(items: CateringOrderItemInput[]) {
  return items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

function validateItems(items: CateringOrderItemInput[]) {
  if (items.length === 0) throw new Error("Pesanan katering butuh minimal 1 produk.");
  for (const item of items) {
    if (!Number.isFinite(item.qty) || item.qty <= 0) throw new Error("Jumlah item tidak valid.");
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) throw new Error("Harga item tidak valid.");
  }
}

export async function listCateringOrders(tenantId: string, outletIds: string[], take = 80) {
  return prisma.cateringOrder.findMany({
    where: { tenantId, outletId: { in: outletIds } },
    include: {
      outlet: { select: { name: true } },
      member: { select: { name: true } },
      items: true,
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getCateringOrder(tenantId: string, id: string) {
  return prisma.cateringOrder.findFirst({
    where: { id, tenantId },
    include: {
      outlet: true,
      member: { select: { name: true } },
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createCateringOrder(
  tenantId: string,
  createdById: string,
  input: CateringOrderInput
) {
  if (!input.customerName.trim()) throw new Error("Nama pemesan wajib diisi.");
  validateItems(input.items);
  const paidAmount = input.paidAmount ?? 0;
  if (paidAmount < 0) throw new Error("DP tidak valid.");
  if (input.operationalCost != null && input.operationalCost < 0) {
    throw new Error("Biaya operasional tidak valid.");
  }

  const outlet = await prisma.outlet.findFirst({ where: { id: input.outletId, tenantId } });
  if (!outlet) throw new Error("Outlet tidak ditemukan.");

  const products = await prisma.product.findMany({
    where: { tenantId, id: { in: input.items.map((item) => item.productId) } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  if (products.length !== new Set(input.items.map((i) => i.productId)).size) {
    throw new Error("Salah satu produk di pesanan sudah tidak tersedia.");
  }

  const total = computeTotal(input.items);
  if (paidAmount > total) throw new Error("DP tidak boleh lebih dari total pesanan.");

  const matchedMember = input.customerPhone?.trim()
    ? await findMemberByPhone(tenantId, input.customerPhone)
    : null;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.cateringOrder.create({
      data: {
        tenantId,
        outletId: input.outletId,
        orderNumber: `CTR-${ulid()}`,
        memberId: matchedMember?.id ?? null,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone?.trim() || null,
        eventName: input.eventName?.trim() || null,
        eventAddress: input.eventAddress?.trim() || null,
        eventDate: input.eventDate,
        total,
        paidAmount,
        operationalCost: input.operationalCost ?? null,
        note: input.note?.trim() || null,
        createdById,
        items: {
          create: input.items.map((item) => ({
            tenantId,
            productId: item.productId,
            productName: productMap.get(item.productId)?.name ?? "Produk",
            qty: item.qty,
            unitPrice: item.unitPrice,
            subtotal: item.qty * item.unitPrice,
          })),
        },
      },
    });

    if (paidAmount > 0) {
      await tx.cateringPayment.create({
        data: {
          tenantId,
          cateringOrderId: created.id,
          amount: paidAmount,
          method: "CASH",
          note: "DP saat order dibuat",
        },
      });
    }

    return created;
  });

  // Biaya operasional dicatat otomatis sebagai Pengeluaran begitu order dibuat —
  // owner udah isi angkanya di form yang sama, jangan disuruh input dobel.
  if (input.operationalCost && input.operationalCost > 0) {
    await createExpense(tenantId, createdById, {
      outletId: input.outletId,
      category: "EVENT",
      amount: input.operationalCost,
      note: `Biaya operasional katering: ${input.eventName?.trim() || order.orderNumber}`,
      spentAt: input.eventDate ?? new Date(),
    });
  }

  return order;
}

/** Rincian tiap DP/cicilan/pelunasan satu pesanan katering, terbaru duluan. */
export async function listCateringPayments(tenantId: string, cateringOrderId: string) {
  return prisma.cateringPayment.findMany({
    where: { tenantId, cateringOrderId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addCateringPayment(
  tenantId: string,
  cateringOrderId: string,
  amount: number,
  method: PaymentMethod,
  note?: string | null
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Jumlah pembayaran harus lebih dari 0.");
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.cateringOrder.findFirst({ where: { id: cateringOrderId, tenantId } });
    if (!order) throw new Error("Pesanan katering tidak ditemukan.");
    const remaining = order.total - order.paidAmount;
    if (amount > remaining) {
      throw new Error(`Sisa tagihan cuma ${formatRupiah(remaining)} — jumlah bayar kelebihan.`);
    }

    await tx.cateringPayment.create({
      data: { tenantId, cateringOrderId, amount, method, note: note?.trim() || null },
    });

    return tx.cateringOrder.update({
      where: { id: cateringOrderId },
      data: { paidAmount: { increment: amount } },
    });
  });
}

export async function updateCateringOrderStatus(
  tenantId: string,
  id: string,
  status: CateringOrderStatus,
  cashierId: string
) {
  const order = await prisma.cateringOrder.findFirst({
    where: { id, tenantId },
    include: { items: true },
  });
  if (!order) throw new Error("Pesanan katering tidak ditemukan.");

  if (status === "DONE") {
    const existingSale = await prisma.sale.findFirst({ where: { tenantId, cateringOrderId: id } });
    if (!existingSale && order.items.length > 0) {
      await createSale({
        tenantId,
        outletId: order.outletId,
        cashierId,
        memberId: order.memberId,
        cateringOrderId: order.id,
        orderType: "CATERING",
        paymentMethod: "TRANSFER",
        amountPaid: order.total,
        discountAmount: 0,
        items: order.items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          discountAmount: 0,
          unitPriceOverride: item.unitPrice,
        })),
      });

      if (order.memberId && !order.pointsAwarded) {
        const setting = await prisma.tenantSetting.findUnique({ where: { tenantId } });
        const points = Math.floor(order.total / (setting?.pointsPerAmount ?? 10000));
        if (points > 0) {
          await prisma.$transaction([
            prisma.pointTransaction.create({
              data: {
                tenantId,
                memberId: order.memberId,
                type: "EARN",
                points,
                note: `Poin dari katering ${order.orderNumber}`,
              },
            }),
            prisma.member.update({
              where: { id: order.memberId },
              data: { points: { increment: points } },
            }),
          ]);
        }
        await prisma.cateringOrder.update({ where: { id }, data: { pointsAwarded: true } });
      }
    }
  }

  return prisma.cateringOrder.update({ where: { id }, data: { status } });
}
