import { prisma } from "@/lib/prisma";
import { buildInvoiceNumber, buildInvoicePrefix } from "@/lib/invoice";
import type { PaymentMethod } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export type CartItemInput = {
  productId: string;
  qty: number;
  discountAmount: number;
};

export type CreateSaleInput = {
  tenantId: string;
  outletId: string;
  shiftId: string;
  cashierId: string;
  memberId?: string | null;
  items: CartItemInput[];
  discountAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
};

export async function createSale(input: CreateSaleInput) {
  if (input.items.length === 0) {
    throw new Error("Keranjang masih kosong. Tambahkan produk dulu.");
  }

  return prisma.$transaction(async (tx) => {
    const productIds = input.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { tenantId: input.tenantId, id: { in: productIds } },
      include: { stocks: { where: { outletId: input.outletId } } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const itemsData: {
      tenantId: string;
      productId: string;
      productName: string;
      price: number;
      qty: number;
      discountAmount: number;
      subtotal: number;
    }[] = [];

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product || !product.isActive) {
        throw new Error("Salah satu produk di keranjang sudah tidak tersedia. Muat ulang halaman.");
      }
      if (product.trackStock) {
        const stockQty = product.stocks[0]?.qty ?? 0;
        if (stockQty < item.qty) {
          throw new Error(
            `Stok ${product.name} tinggal ${stockQty} — kurangi jumlah atau perbarui stok.`
          );
        }
      }
      const itemSubtotal = product.price * item.qty - item.discountAmount;
      subtotal += itemSubtotal;
      itemsData.push({
        tenantId: input.tenantId,
        productId: product.id,
        productName: product.name,
        price: product.price,
        qty: item.qty,
        discountAmount: item.discountAmount,
        subtotal: itemSubtotal,
      });
    }

    const setting = await tx.tenantSetting.findUnique({ where: { tenantId: input.tenantId } });
    const taxPercent = setting?.taxPercent ?? 0;
    const afterDiscount = subtotal - input.discountAmount;
    const taxAmount = Math.round((afterDiscount * taxPercent) / 100);
    const total = afterDiscount + taxAmount;

    if (input.paymentMethod === "CASH" && input.amountPaid < total) {
      throw new Error("Uang diterima kurang dari total belanja.");
    }

    let member = null;
    if (input.paymentMethod === "DEPOSIT") {
      if (!input.memberId) {
        throw new Error("Pilih member dulu untuk bayar pakai saldo deposit.");
      }
      member = await tx.member.findFirst({ where: { id: input.memberId, tenantId: input.tenantId } });
      if (!member) throw new Error("Member tidak ditemukan.");
      if (member.depositBalance < total) {
        throw new Error(
          `Saldo deposit ${member.name} tidak cukup — sisa ${member.depositBalance}, butuh ${total}.`
        );
      }
    }

    const amountPaid = input.paymentMethod === "DEPOSIT" ? total : input.amountPaid;
    const changeAmount = input.paymentMethod === "CASH" ? input.amountPaid - total : 0;

    const now = new Date();
    const ymdPrefix = buildInvoicePrefix(input.outletId, now);
    const countToday = await tx.sale.count({
      where: { tenantId: input.tenantId, outletId: input.outletId, invoiceNumber: { startsWith: ymdPrefix } },
    });
    const invoiceNumber = buildInvoiceNumber(input.outletId, now, countToday + 1);

    const sale = await tx.sale.create({
      data: {
        tenantId: input.tenantId,
        outletId: input.outletId,
        shiftId: input.shiftId,
        cashierId: input.cashierId,
        memberId: input.memberId ?? null,
        invoiceNumber,
        subtotal,
        discountAmount: input.discountAmount,
        taxAmount,
        total,
        paymentMethod: input.paymentMethod,
        amountPaid,
        changeAmount,
        status: "COMPLETED",
        items: { create: itemsData },
      },
      include: { items: true },
    });

    for (const item of input.items) {
      const product = productMap.get(item.productId)!;
      if (product.trackStock) {
        await tx.productStock.update({
          where: { productId_outletId: { productId: item.productId, outletId: input.outletId } },
          data: { qty: { decrement: item.qty } },
        });
      }
    }

    if (member) {
      await tx.member.update({
        where: { id: member.id },
        data: { depositBalance: { decrement: total } },
      });
    }

    if (input.memberId) {
      const points = Math.floor(total / (setting?.pointsPerAmount ?? 10000));
      if (points > 0) {
        await tx.pointTransaction.create({
          data: {
            tenantId: input.tenantId,
            memberId: input.memberId,
            type: "EARN",
            points,
            saleId: sale.id,
            note: `Poin dari transaksi ${invoiceNumber}`,
          },
        });
        await tx.member.update({
          where: { id: input.memberId },
          data: { points: { increment: points } },
        });
      }
    }

    return sale;
  });
}

export async function getSaleById(tenantId: string, saleId: string) {
  return prisma.sale.findFirst({
    where: { id: saleId, tenantId },
    include: {
      items: true,
      outlet: true,
      cashier: true,
      member: true,
      saleReturns: { include: { items: true, processedBy: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function listSales(tenantId: string, outletIds: string[], take = 50) {
  return prisma.sale.findMany({
    where: { tenantId, outletId: { in: outletIds } },
    include: { cashier: true, member: true, items: true, outlet: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function voidSale(tenantId: string, saleId: string, reason: string) {
  if (!reason.trim()) {
    throw new Error("Alasan pembatalan wajib diisi.");
  }

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { items: true },
    });
    if (!sale) throw new Error("Transaksi tidak ditemukan.");
    if (sale.status === "VOIDED") throw new Error("Transaksi ini sudah dibatalkan sebelumnya.");

    for (const item of sale.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (product?.trackStock) {
        await tx.productStock.updateMany({
          where: { productId: item.productId, outletId: sale.outletId },
          data: { qty: { increment: item.qty } },
        });
      }
    }

    if (sale.memberId) {
      const earnTx = await tx.pointTransaction.findFirst({
        where: { saleId: sale.id, type: "EARN" },
      });
      if (earnTx && earnTx.points > 0) {
        await tx.pointTransaction.create({
          data: {
            tenantId,
            memberId: sale.memberId,
            type: "ADJUST",
            points: -earnTx.points,
            saleId: sale.id,
            note: `Pembatalan transaksi ${sale.invoiceNumber}`,
          },
        });
        await tx.member.update({
          where: { id: sale.memberId },
          data: { points: { decrement: earnTx.points } },
        });
      }
    }

    return tx.sale.update({
      where: { id: sale.id },
      data: { status: "VOIDED", voidReason: reason },
    });
  });
}

export type ReturnItemInput = { saleItemId: string; qty: number };

/**
 * Retur sebagian item dari transaksi yang sudah selesai. Beda dengan voidSale
 * (membatalkan seluruh transaksi) — ini cuma mengembalikan sebagian item.
 */
export async function processReturn(
  tenantId: string,
  saleId: string,
  processedById: string,
  items: ReturnItemInput[],
  reason: string
) {
  if (!reason.trim()) {
    throw new Error("Alasan retur wajib diisi.");
  }
  if (items.length === 0) {
    throw new Error("Pilih minimal satu item untuk diretur.");
  }

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { items: true },
    });
    if (!sale) throw new Error("Transaksi tidak ditemukan.");
    if (sale.status === "VOIDED") {
      throw new Error("Transaksi ini sudah dibatalkan, tidak bisa diretur.");
    }

    const saleItemMap = new Map(sale.items.map((i) => [i.id, i]));
    let totalRefund = 0;
    const returnItemsData: { tenantId: string; saleItemId: string; qty: number; refundAmount: number }[] = [];

    for (const input of items) {
      const saleItem = saleItemMap.get(input.saleItemId);
      if (!saleItem) throw new Error("Item transaksi tidak ditemukan.");
      if (input.qty <= 0) continue;
      const sisaBisaDiretur = saleItem.qty - saleItem.returnedQty;
      if (input.qty > sisaBisaDiretur) {
        throw new Error(
          `${saleItem.productName}: maksimal bisa diretur ${sisaBisaDiretur}, kamu masukkan ${input.qty}.`
        );
      }
      const netPerUnit = saleItem.subtotal / saleItem.qty;
      const refundAmount = Math.round(netPerUnit * input.qty);
      totalRefund += refundAmount;
      returnItemsData.push({ tenantId, saleItemId: saleItem.id, qty: input.qty, refundAmount });
    }

    if (returnItemsData.length === 0) {
      throw new Error("Pilih minimal satu item dengan jumlah retur lebih dari 0.");
    }

    const saleReturn = await tx.saleReturn.create({
      data: {
        tenantId,
        saleId: sale.id,
        processedById,
        reason,
        totalRefund,
        items: { create: returnItemsData },
      },
      include: { items: true },
    });

    for (const returnItem of returnItemsData) {
      const saleItem = saleItemMap.get(returnItem.saleItemId)!;
      await tx.saleItem.update({
        where: { id: saleItem.id },
        data: { returnedQty: { increment: returnItem.qty } },
      });
      const product = await tx.product.findUnique({ where: { id: saleItem.productId } });
      if (product?.trackStock) {
        await tx.productStock.updateMany({
          where: { productId: saleItem.productId, outletId: sale.outletId },
          data: { qty: { increment: returnItem.qty } },
        });
      }
    }

    if (sale.memberId && sale.paymentMethod === "DEPOSIT" && totalRefund > 0) {
      await tx.member.update({
        where: { id: sale.memberId },
        data: { depositBalance: { increment: totalRefund } },
      });
    }

    if (sale.memberId && sale.total > 0) {
      const earnTx = await tx.pointTransaction.findFirst({
        where: { saleId: sale.id, type: "EARN" },
      });
      if (earnTx && earnTx.points > 0) {
        const pointsToReverse = Math.floor((earnTx.points * totalRefund) / sale.total);
        if (pointsToReverse > 0) {
          const member = await tx.member.findUnique({ where: { id: sale.memberId } });
          const actualReverse = Math.min(pointsToReverse, member?.points ?? 0);
          if (actualReverse > 0) {
            await tx.pointTransaction.create({
              data: {
                tenantId,
                memberId: sale.memberId,
                type: "ADJUST",
                points: -actualReverse,
                saleId: sale.id,
                note: `Koreksi poin dari retur transaksi ${sale.invoiceNumber}`,
              },
            });
            await tx.member.update({
              where: { id: sale.memberId },
              data: { points: { decrement: actualReverse } },
            });
          }
        }
      }
    }

    return saleReturn;
  });
}
