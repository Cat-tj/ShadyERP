import { prisma } from "@/lib/prisma";
import { createSale, type CartItemInput } from "@/server/services/sale-service";
import { computeVariantSelection, loadVariantGroupsByProduct } from "@/server/services/product-variant-service";
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

  return prisma.$transaction(
    async (tx) => {
      const table = await tx.table.findUnique({ where: { qrToken } });
      if (!table) throw new Error("Meja tidak ditemukan. Coba scan ulang QR-nya.");
      if (!table.isActive) throw new Error("Meja ini sedang tidak aktif. Panggil staff untuk bantuan.");

      const productIds = input.items.map((item) => item.productId);
      // Product + grup varian di-fetch sekaligus buat semua item (bukan per-item
      // di dalam loop) supaya jumlah round-trip DB di dalam transaksi ini tidak
      // ikut membengkak seiring banyaknya item di keranjang — tiap round-trip
      // tambahan menambah risiko transaksi kena timeout.
      const [products, variantGroupsByProduct] = await Promise.all([
        tx.product.findMany({ where: { tenantId: table.tenantId, id: { in: productIds } } }),
        loadVariantGroupsByProduct(tx, table.tenantId, productIds),
      ]);
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

        const resolved = computeVariantSelection(
          variantGroupsByProduct.get(item.productId) ?? [],
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

      // Open bill/tab: kalau meja ini masih punya pesanan yang belum dibayar,
      // gabungkan pesanan baru ke situ (satu tagihan per meja) alih-alih bikin
      // TableOrder baru — supaya pelanggan bisa pesan berkali-kali lalu bayar
      // sekali di akhir.
      const openOrder = await tx.tableOrder.findFirst({
        where: { tenantId: table.tenantId, tableId: table.id, status: { in: ["PENDING", "ACCEPTED", "READY"] } },
        orderBy: { createdAt: "desc" },
      });

      if (openOrder) {
        await tx.tableOrderItem.createMany({
          data: itemsData.map((item) => ({ ...item, tableOrderId: openOrder.id })),
        });
        return tx.tableOrder.update({
          where: { id: openOrder.id },
          // Susulan pesanan baru berarti ada yang perlu dimasak lagi, jadi
          // status dikembalikan ke PENDING walau tadinya sudah READY/ACCEPTED.
          data: { status: "PENDING" },
          include: { items: true },
        });
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
    },
    // Timeout default Prisma (5s) gampang kelewat kalau keranjang isinya banyak
    // item (tiap item butuh 1 round-trip productStock.updateMany) ditambah
    // latensi jaringan ke DB — dinaikkan jadi 15s sebagai pengaman.
    { timeout: 15000 }
  );
}

/**
 * Dipakai halaman publik /pesan/[qrToken] untuk menampilkan tagihan berjalan
 * (open bill) meja ini kalau sudah ada pesanan yang belum dibayar — supaya
 * pelanggan tahu apa saja yang sudah dipesan sebelum menambah pesanan lagi.
 */
export async function getOpenOrderForTable(qrToken: string) {
  const table = await prisma.table.findUnique({ where: { qrToken } });
  if (!table) return null;
  return prisma.tableOrder.findFirst({
    where: { tenantId: table.tenantId, tableId: table.id, status: { in: ["PENDING", "ACCEPTED", "READY"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
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
      // Kembalikan stok yang sempat direservasi saat pesanan dibuat. Produk
      // di-fetch sekaligus (bukan per-item) supaya jumlah round-trip DB di
      // dalam transaksi ini tidak ikut membengkak seiring banyaknya item.
      const products = await tx.product.findMany({
        where: { id: { in: order.items.map((item) => item.productId) } },
      });
      const trackStockIds = new Set(products.filter((p) => p.trackStock).map((p) => p.id));
      for (const item of order.items) {
        if (trackStockIds.has(item.productId)) {
          await tx.productStock.updateMany({
            where: { productId: item.productId, outletId: order.outletId },
            data: { qty: { increment: item.qty } },
          });
        }
      }
    }

    return tx.tableOrder.update({ where: { id }, data: { status } });
  }, { timeout: 15000 });
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
