import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function addProductSerials(
  tenantId: string,
  productId: string,
  outletId: string,
  serialNumbers: string[],
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;
  const cleaned = Array.from(new Set(serialNumbers.map((s) => s.trim()).filter(Boolean)));
  if (cleaned.length === 0) return { count: 0 };
  return client.productSerial.createMany({
    data: cleaned.map((serialNumber) => ({ tenantId, productId, outletId, serialNumber })),
    skipDuplicates: true,
  });
}

export async function getAvailableSerials(tenantId: string, productId: string, outletId: string) {
  return prisma.productSerial.findMany({
    where: { tenantId, productId, outletId, status: "IN_STOCK" },
    orderBy: { createdAt: "asc" },
  });
}

/** Tandai satu serial terjual dan kaitkan ke SaleItem — dipanggil dari dalam transaction createSale. */
export async function assignSerialToSaleItem(
  tenantId: string,
  serialNumber: string,
  saleItemId: string,
  tx: Prisma.TransactionClient
) {
  const serial = await tx.productSerial.findFirst({
    where: { tenantId, serialNumber: serialNumber.trim(), status: "IN_STOCK" },
  });
  if (!serial) {
    throw new Error(`Serial/IMEI "${serialNumber}" tidak tersedia atau sudah terjual.`);
  }
  await tx.productSerial.update({
    where: { id: serial.id },
    data: { status: "SOLD", saleItemId, soldAt: new Date() },
  });
}

/** Kembalikan serial ke IN_STOCK — dipanggil saat void/retur transaksi. */
export async function releaseSerialsForSaleItem(tenantId: string, saleItemId: string, tx: Prisma.TransactionClient) {
  await tx.productSerial.updateMany({
    where: { tenantId, saleItemId },
    data: { status: "IN_STOCK", saleItemId: null, soldAt: null },
  });
}

/** Cari satu serial (untuk klaim garansi/lacak unit terjual ke mana). */
export async function findSerial(tenantId: string, serialNumber: string) {
  return prisma.productSerial.findFirst({
    where: { tenantId, serialNumber: serialNumber.trim() },
    include: {
      product: true,
      outlet: true,
      saleItem: { include: { sale: { include: { outlet: true, cashier: true } } } },
    },
  });
}

export async function getSerialsForProduct(tenantId: string, productId: string, outletId?: string) {
  return prisma.productSerial.findMany({
    where: { tenantId, productId, ...(outletId ? { outletId } : {}) },
    include: { saleItem: { include: { sale: true } } },
    orderBy: { createdAt: "desc" },
  });
}
