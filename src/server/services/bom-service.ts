import { prisma } from "@/lib/prisma";
import type { BomVersion, BomVersionItem, BomVersionStatus } from "@prisma/client";

export interface BomItemInput {
  ingredientId: string;
  qty: number;
  wasteAllowancePct?: number;
  isOptional?: boolean;
}

export type BomVersionWithItems = BomVersion & { items: BomVersionItem[] };

export async function listBomVersions(tenantId: string, productId: string): Promise<BomVersionWithItems[]> {
  return prisma.bomVersion.findMany({
    where: { tenantId, productId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { version: "desc" },
  });
}

export async function getBomVersionById(tenantId: string, bomVersionId: string): Promise<BomVersionWithItems | null> {
  return prisma.bomVersion.findFirst({
    where: { id: bomVersionId, tenantId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

/** Semua versi BOM yang lagi ACTIVE untuk tenant ini — dipakai buat cek produk mana yang "siap produksi". */
export async function listActiveBomVersions(tenantId: string): Promise<BomVersion[]> {
  return prisma.bomVersion.findMany({ where: { tenantId, status: "ACTIVE" } });
}

/** Semua versi BOM tenant ini (semua produk sekaligus) — dipakai halaman Data Produksi supaya gak perlu 1 query per produk. */
export async function listAllBomVersionsForTenant(tenantId: string): Promise<BomVersionWithItems[]> {
  return prisma.bomVersion.findMany({
    where: { tenantId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ productId: "asc" }, { version: "desc" }],
  });
}

export async function getActiveBomVersion(tenantId: string, productId: string): Promise<BomVersionWithItems | null> {
  return prisma.bomVersion.findFirst({
    where: { tenantId, productId, status: "ACTIVE" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

/** Bikin versi baru sebagai DRAFT — versi ACTIVE lama tetap ACTIVE sampai versi baru diaktifkan lewat activateBomVersion(). */
export async function createBomVersion(
  tenantId: string,
  productId: string,
  outputQty: number,
  items: BomItemInput[],
  note?: string
): Promise<BomVersionWithItems> {
  if (items.length === 0) {
    throw new Error("BOM harus punya minimal satu bahan.");
  }
  if (outputQty <= 0) {
    throw new Error("Jumlah hasil (output qty) harus lebih dari 0.");
  }

  const lastVersion = await prisma.bomVersion.findFirst({
    where: { tenantId, productId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const nextVersion = (lastVersion?.version ?? 0) + 1;

  return prisma.bomVersion.create({
    data: {
      tenantId,
      productId,
      version: nextVersion,
      status: "DRAFT",
      outputQty,
      note,
      items: {
        create: items.map((item, index) => ({
          tenantId,
          ingredientId: item.ingredientId,
          qty: item.qty,
          wasteAllowancePct: item.wasteAllowancePct,
          isOptional: item.isOptional ?? false,
          sortOrder: index,
        })),
      },
    },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

/**
 * Aktifkan satu versi DRAFT — versi ACTIVE sebelumnya (kalau ada) otomatis jadi
 * OBSOLETE. Guardrail #9 (dokumen master plan): versi yang sedang ACTIVE dan
 * dipakai WO berjalan tidak boleh diedit isinya — tapi boleh diganti dengan
 * versi baru yang diaktifkan di sini, WO lama tetap pakai snapshot versi lama.
 */
export async function activateBomVersion(tenantId: string, bomVersionId: string): Promise<BomVersion> {
  const version = await prisma.bomVersion.findFirst({ where: { id: bomVersionId, tenantId } });
  if (!version) throw new Error("Versi BOM tidak ditemukan.");
  if (version.status === "OBSOLETE") {
    throw new Error("Versi BOM yang sudah usang tidak bisa diaktifkan lagi — buat versi baru.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.bomVersion.updateMany({
      where: { tenantId, productId: version.productId, status: "ACTIVE" },
      data: { status: "OBSOLETE" },
    });
    return tx.bomVersion.update({
      where: { id: bomVersionId },
      data: { status: "ACTIVE", effectiveDate: new Date() },
    });
  });
}

/** Edit isi BOM — HANYA boleh untuk versi DRAFT (guardrail #9). Versi ACTIVE/OBSOLETE harus dicabang jadi versi baru. */
export async function updateBomVersionItems(
  tenantId: string,
  bomVersionId: string,
  outputQty: number,
  items: BomItemInput[]
): Promise<BomVersionWithItems> {
  const version = await prisma.bomVersion.findFirst({ where: { id: bomVersionId, tenantId } });
  if (!version) throw new Error("Versi BOM tidak ditemukan.");
  if (version.status !== "DRAFT") {
    throw new Error("Versi BOM yang sudah aktif atau usang tidak boleh diedit — buat versi baru.");
  }
  if (items.length === 0) {
    throw new Error("BOM harus punya minimal satu bahan.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.bomVersionItem.deleteMany({ where: { bomVersionId } });
    await tx.bomVersion.update({ where: { id: bomVersionId }, data: { outputQty } });
    await tx.bomVersionItem.createMany({
      data: items.map((item, index) => ({
        tenantId,
        bomVersionId,
        ingredientId: item.ingredientId,
        qty: item.qty,
        wasteAllowancePct: item.wasteAllowancePct,
        isOptional: item.isOptional ?? false,
        sortOrder: index,
      })),
    });
    return tx.bomVersion.findFirstOrThrow({
      where: { id: bomVersionId },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
  });
}

export async function obsoleteBomVersion(tenantId: string, bomVersionId: string): Promise<BomVersion> {
  const version = await prisma.bomVersion.findFirst({ where: { id: bomVersionId, tenantId } });
  if (!version) throw new Error("Versi BOM tidak ditemukan.");
  return prisma.bomVersion.update({ where: { id: bomVersionId }, data: { status: "OBSOLETE" as BomVersionStatus } });
}
