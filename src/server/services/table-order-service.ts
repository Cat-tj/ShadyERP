import { prisma } from "@/lib/prisma";
import { createSale, type CartItemInput } from "@/server/services/sale-service";
import { resolveVariantSelection } from "@/server/services/product-variant-service";
import type { TableOrderStatus, PaymentMethod } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`,
 * KECUALI `createOrder` — itu memang sengaja publik (dipakai halaman
 * /pesan/[qrToken] yang diakses pelanggan tanpa login). tenantId di sana
 * diturunkan dari meja yang di-resolve lewat qrToken, bukan dari input client.
 *
 * Stok produk trackStock DIRESERVASI (dipotong) secara atomik begitu pesanan
 * dibuat — bukan nanti saat dibayar — supaya beberapa meja yang pesan barang
 * yang sama persis di waktu bersamaan tidak sama-sama lolos padahal stoknya
 * cuma cukup untuk satu pesanan. Kalau pesanan dibatalkan, stok dikembalikan.
 * Saat staff memproses pembayaran, Sale dibuat dari item pesanan ini TANPA
 * memotong stok lagi (parameter `deductStock: false` di createSale).
 */

export type CreateOrderItemInput = {
  productId: string;
  qty: number;
  note?: string;
  variantOptionIds?: string[];
};

export async function createOrder(
  qrToken: string,
  input: { items: CreateOrderItemInput[]; customerName?: string; note?: string }
) {
  if (input.items.length === 0) {
    throw new Error("Keranjang masih kosong. Pilih menu dulu.");
  }

  return prisma.$transaction(async (tx) => {
    const table = await tx.table.findUnique({ where: { qrToken } });
    if (!table) throw new Error("Meja tidak ditemukan. Coba scan ulang QR-nya.");
    if (!table.isActive) throw new Error("Meja ini sedang tidak aktif. Panggil staff untuk bantuan.");

    const productIds = input.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { tenantId: table.tenantId, id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const itemsData: {
      tenantId: string;
      productId: string;
      productName: string;
      variantLabel: string | null;
      price: number;
      qty: number;
      note: string | null;
    }[] = [];

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product || !product.isActive) {
        throw new Error("Salah satu menu yang dipilih sudah tidak tersedia. Muat ulang halaman.");
      }
      if (item.qty <= 0) continue;

      const resolved = await resolveVariantSelection(
        tx,
        table.tenantId,
        product.id,
        item.variantOptionIds ?? []
      );

      if (product.trackStock) {
        // Decrement atomik: cuma berhasil kalau stok yang tersisa masih cukup
        // PERSIS pada saat ini. Kalau meja lain barusan menghabiskannya, ini
        // gagal (count 0) dan kita tolak pesanannya — tidak overselling.
        const result = await tx.productStock.updateMany({
          where: { productId: item.productId, outletId: table.outletId, qty: { gte: item.qty } },
          data: { qty: { decrement: item.qty } },
        });
        if (result.count === 0) {
          throw new Error(`${product.name} baru saja habis dipesan meja lain. Coba menu lain ya.`);
        }
      }

      itemsData.push({
        tenantId: table.tenantId,
        productId: product.id,
        productName: product.name,
        variantLabel: resolved.label,
        price: product.price + resolved.priceDelta,
        qty: item.qty,
        note: item.note?.trim() || null,
      });
    }

    if (itemsData.length === 0) {
      throw new Error("Pilih minimal satu menu dengan jumlah lebih dari 0.");
    }

    return tx.tableOrder.create({
      data: {
        tenantId: table.tenantId,
        outletId: table.outletId,
        tableId: table.id,
        customerName: input.customerName?.trim() || null,
        note: input.note?.trim() || null,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  });
}

export async function listIncomingOrders(tenantId: string, outletIds: string[]) {
  return prisma.tableOrder.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      status: { in: ["PENDING", "ACCEPTED", "READY"] },
    },
    include: { items: true, table: true, outlet: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateOrderStatus(tenantId: string, id: string, status: TableOrderStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.tableOrder.findFirst({ where: { id, tenantId }, include: { items: true } });
    if (!order) throw new Error("Pesanan tidak ditemukan.");
    if (order.status === "DONE") {
      throw new Error("Pesanan yang sudah dibayar tidak bisa diubah lagi. Pakai retur di kasir kalau perlu.");
    }
    if (order.status === "CANCELLED") {
      throw new Error("Pesanan ini sudah dibatalkan.");
    }
    if (status === "DONE") {
      throw new Error("Gunakan \"Proses Pembayaran\" untuk menandai pesanan selesai.");
    }

    if (status === "CANCELLED") {
      // Kembalikan stok yang sempat direservasi saat pesanan dibuat.
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product?.trackStock) {
          await tx.productStock.updateMany({
            where: { productId: item.productId, outletId: order.outletId },
            data: { qty: { increment: item.qty } },
          });
        }
      }
    }

    return tx.tableOrder.update({ where: { id }, data: { status } });
  });
}

export type CompleteOrderPaymentInput = {
  shiftId: string;
  cashierId: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  memberId?: string | null;
};

/**
 * Dipanggil staff saat pelanggan bayar. Membuat Sale langsung dari item
 * pesanan (tanpa retyping manual, tanpa potong stok lagi karena sudah
 * direservasi saat pesanan dibuat), lalu menandai pesanan Selesai.
 */
export async function completeOrderPayment(
  tenantId: string,
  orderId: string,
  input: CompleteOrderPaymentInput
) {
  const order = await prisma.tableOrder.findFirst({
    where: { id: orderId, tenantId },
    include: { items: true },
  });
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (order.status === "DONE") throw new Error("Pesanan ini sudah dibayar sebelumnya.");
  if (order.status === "CANCELLED") throw new Error("Pesanan ini sudah dibatalkan.");

  const shift = await prisma.cashierShift.findFirst({
    where: { id: input.shiftId, tenantId, status: "OPEN" },
  });
  if (!shift) throw new Error("Shift kasir kamu tidak aktif. Buka shift dulu.");
  if (shift.outletId !== order.outletId) {
    throw new Error("Shift kasir kamu bukan untuk outlet meja ini.");
  }

  const items: CartItemInput[] = order.items.map((item) => ({
    productId: item.productId,
    qty: item.qty,
    discountAmount: 0,
    unitPriceOverride: item.price,
    variantLabel: item.variantLabel,
  }));

  const sale = await createSale({
    tenantId,
    outletId: order.outletId,
    shiftId: input.shiftId,
    cashierId: input.cashierId,
    memberId: input.memberId ?? null,
    items,
    discountAmount: 0,
    paymentMethod: input.paymentMethod,
    amountPaid: input.amountPaid,
    deductStock: false,
  });

  await prisma.tableOrder.update({
    where: { id: order.id },
    data: { status: "DONE", saleId: sale.id },
  });

  return sale;
}
