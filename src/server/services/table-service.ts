import { ulid } from "ulid";
import { prisma } from "@/lib/prisma";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`,
 * KECUALI `getTableByQrToken` — itu memang sengaja publik (dipakai halaman
 * /pesan/[qrToken] yang diakses pelanggan tanpa login dan tanpa tahu tenant-nya).
 */

export async function listTables(tenantId: string, outletIds: string[]) {
  return prisma.table.findMany({
    where: { tenantId, outletId: { in: outletIds } },
    include: { outlet: true },
    orderBy: { name: "asc" },
  });
}

export async function createTable(
  tenantId: string,
  outletId: string,
  name: string,
  posX?: number,
  posY?: number,
  floor?: number,
  shape?: string,
  capacity?: number
) {
  const outlet = await prisma.outlet.findFirst({ where: { id: outletId, tenantId } });
  if (!outlet) throw new Error("Outlet tidak ditemukan.");
  if (!name.trim()) throw new Error("Nama meja wajib diisi.");

  return prisma.table.create({
    data: {
      tenantId,
      outletId,
      name: name.trim(),
      qrToken: ulid(),
      posX: posX ?? 0,
      posY: posY ?? 0,
      floor: floor ?? 1,
      shape: shape ?? "SQUARE",
      capacity: capacity ?? 2,
    },
  });
}

export async function updateTable(
  tenantId: string,
  id: string,
  name: string,
  posX?: number,
  posY?: number,
  floor?: number,
  shape?: string,
  capacity?: number
) {
  const table = await prisma.table.findFirst({ where: { id, tenantId } });
  if (!table) throw new Error("Meja tidak ditemukan.");
  if (!name.trim()) throw new Error("Nama meja wajib diisi.");
  return prisma.table.update({
    where: { id },
    data: {
      name: name.trim(),
      posX: posX ?? 0,
      posY: posY ?? 0,
      floor: floor ?? table.floor,
      shape: shape ?? table.shape,
      capacity: capacity ?? table.capacity,
    },
  });
}

export async function setTableActive(tenantId: string, id: string, isActive: boolean) {
  const table = await prisma.table.findFirst({ where: { id, tenantId } });
  if (!table) throw new Error("Meja tidak ditemukan.");
  return prisma.table.update({ where: { id }, data: { isActive } });
}

export async function getTable(tenantId: string, id: string) {
  return prisma.table.findFirst({ where: { id, tenantId }, include: { outlet: true } });
}

/**
 * Satu-satunya lookup yang boleh tanpa filter tenantId: dipakai halaman publik
 * /pesan/[qrToken] yang diakses pelanggan lewat scan QR, sebelum kita tahu tenant-nya.
 */
export async function getTableByQrToken(qrToken: string) {
  return prisma.table.findUnique({
    where: { qrToken },
    include: { outlet: true },
  });
}
