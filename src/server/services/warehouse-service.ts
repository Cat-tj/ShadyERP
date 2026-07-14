import { prisma } from "@/lib/prisma";
import type { Warehouse, WarehouseType, StorageLocation } from "@prisma/client";

export async function listWarehouses(tenantId: string, outletId?: string): Promise<Warehouse[]> {
  return prisma.warehouse.findMany({
    where: { tenantId, ...(outletId ? { outletId } : {}), isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getWarehouseById(tenantId: string, warehouseId: string): Promise<Warehouse | null> {
  return prisma.warehouse.findFirst({ where: { id: warehouseId, tenantId } });
}

export async function createWarehouse(
  tenantId: string,
  outletId: string,
  name: string,
  type: WarehouseType
): Promise<Warehouse> {
  return prisma.warehouse.create({
    data: { tenantId, outletId, name: name.trim(), type },
  });
}

export async function updateWarehouse(
  tenantId: string,
  warehouseId: string,
  data: { name?: string; type?: WarehouseType; isActive?: boolean }
): Promise<Warehouse> {
  const existing = await prisma.warehouse.findFirst({ where: { id: warehouseId, tenantId } });
  if (!existing) throw new Error("Gudang tidak ditemukan.");
  return prisma.warehouse.update({
    where: { id: warehouseId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });
}

/**
 * Bikin set gudang standar (Bahan Baku/WIP/Barang Jadi/Karantina/Reject) sekaligus
 * untuk satu outlet — dipanggil sekali saat tenant pertama kali mengaktifkan modul
 * Produksi, supaya owner tidak perlu bikin satu-satu manual (AGENTS.md: isi otomatis
 * kalau memungkinkan, jangan suruh input manual kalau bisa dihindari).
 */
export async function ensureDefaultWarehouses(tenantId: string, outletId: string): Promise<Warehouse[]> {
  const existing = await prisma.warehouse.findMany({ where: { tenantId, outletId } });
  if (existing.length > 0) return existing;

  const defaults: { name: string; type: WarehouseType }[] = [
    { name: "Gudang Bahan Baku", type: "RAW_MATERIAL" },
    { name: "Area Proses (WIP)", type: "WIP" },
    { name: "Gudang Barang Jadi", type: "FINISHED_GOODS" },
    { name: "Area Karantina QC", type: "QUARANTINE" },
    { name: "Area Reject", type: "REJECT" },
  ];

  return prisma.$transaction(
    defaults.map((d) => prisma.warehouse.create({ data: { tenantId, outletId, name: d.name, type: d.type } }))
  );
}

export async function listStorageLocations(tenantId: string, warehouseId: string): Promise<StorageLocation[]> {
  return prisma.storageLocation.findMany({
    where: { tenantId, warehouseId, isActive: true },
    orderBy: { code: "asc" },
  });
}

export async function createStorageLocation(
  tenantId: string,
  warehouseId: string,
  code: string,
  name?: string
): Promise<StorageLocation> {
  const warehouse = await prisma.warehouse.findFirst({ where: { id: warehouseId, tenantId } });
  if (!warehouse) throw new Error("Gudang tidak ditemukan.");
  return prisma.storageLocation.create({
    data: { tenantId, warehouseId, code: code.trim(), name: name?.trim() || null },
  });
}
