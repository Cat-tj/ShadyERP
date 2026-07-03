import { prisma } from "@/lib/prisma";
import type { TableOrderStatus } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`,
 * KECUALI `createOrder` — itu memang sengaja publik (dipakai halaman
 * /pesan/[qrToken] yang diakses pelanggan tanpa login). tenantId di sana
 * diturunkan dari meja yang di-resolve lewat qrToken, bukan dari input client.
 *
 * Pesanan di sini TIDAK memotong stok dan TIDAK membuat Sale — murni antrian
 * permintaan pelanggan. Staff yang memproses pembayaran & mencatat transaksi
 * asli lewat halaman Kasir seperti biasa, lalu menandai pesanan ini Selesai.
 */

export type CreateOrderItemInput = { productId: string; qty: number; note?: string };

export async function createOrder(
  qrToken: string,
  input: { items: CreateOrderItemInput[]; customerName?: string; note?: string }
) {
  if (input.items.length === 0) {
    throw new Error("Keranjang masih kosong. Pilih menu dulu.");
  }

  const table = await prisma.table.findUnique({ where: { qrToken } });
  if (!table) throw new Error("Meja tidak ditemukan. Coba scan ulang QR-nya.");
  if (!table.isActive) throw new Error("Meja ini sedang tidak aktif. Panggil staff untuk bantuan.");

  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { tenantId: table.tenantId, id: { in: productIds } },
    include: { stocks: { where: { outletId: table.outletId } } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const itemsData: {
    tenantId: string;
    productId: string;
    productName: string;
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
    if (product.trackStock) {
      const stockQty = product.stocks[0]?.qty ?? 0;
      if (stockQty < item.qty) {
        throw new Error(`${product.name} tinggal ${stockQty} — kurangi jumlahnya ya.`);
      }
    }
    itemsData.push({
      tenantId: table.tenantId,
      productId: product.id,
      productName: product.name,
      price: product.price,
      qty: item.qty,
      note: item.note?.trim() || null,
    });
  }

  if (itemsData.length === 0) {
    throw new Error("Pilih minimal satu menu dengan jumlah lebih dari 0.");
  }

  return prisma.tableOrder.create({
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
}

export async function listIncomingOrders(tenantId: string, outletIds: string[]) {
  return prisma.tableOrder.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    include: { items: true, table: true, outlet: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateOrderStatus(tenantId: string, id: string, status: TableOrderStatus) {
  const order = await prisma.tableOrder.findFirst({ where: { id, tenantId } });
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  return prisma.tableOrder.update({ where: { id }, data: { status } });
}
