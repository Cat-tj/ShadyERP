import { prisma } from "@/lib/prisma";
import type { WorkCenter, RoutingVersion, RoutingOperationStep } from "@prisma/client";

// ---------- Work Center ----------

export async function listWorkCenters(tenantId: string, outletId?: string): Promise<WorkCenter[]> {
  return prisma.workCenter.findMany({
    where: { tenantId, ...(outletId ? { outletId } : {}), isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createWorkCenter(
  tenantId: string,
  outletId: string,
  name: string,
  equipmentId?: string | null
): Promise<WorkCenter> {
  return prisma.workCenter.create({
    data: { tenantId, outletId, name: name.trim(), equipmentId: equipmentId || null },
  });
}

// ---------- Routing Version ----------

export interface RoutingStepInput {
  workCenterId: string;
  name: string;
  standardDurationMin?: number;
  instruction?: string;
  qcCheckpoint?: boolean;
}

export type RoutingVersionWithSteps = RoutingVersion & { steps: RoutingOperationStep[] };

export async function listRoutingVersions(tenantId: string, productId: string): Promise<RoutingVersionWithSteps[]> {
  return prisma.routingVersion.findMany({
    where: { tenantId, productId },
    include: { steps: { orderBy: { sequence: "asc" } } },
    orderBy: { version: "desc" },
  });
}

/** Semua versi routing yang lagi ACTIVE untuk tenant ini — dipakai buat cek produk mana yang "siap produksi". */
export async function listActiveRoutingVersions(tenantId: string): Promise<RoutingVersion[]> {
  return prisma.routingVersion.findMany({ where: { tenantId, status: "ACTIVE" } });
}

/** Semua versi routing tenant ini (semua produk sekaligus) — dipakai halaman Data Produksi supaya gak perlu 1 query per produk. */
export async function listAllRoutingVersionsForTenant(tenantId: string): Promise<RoutingVersionWithSteps[]> {
  return prisma.routingVersion.findMany({
    where: { tenantId },
    include: { steps: { orderBy: { sequence: "asc" } } },
    orderBy: [{ productId: "asc" }, { version: "desc" }],
  });
}

export async function getActiveRoutingVersion(tenantId: string, productId: string): Promise<RoutingVersionWithSteps | null> {
  return prisma.routingVersion.findFirst({
    where: { tenantId, productId, status: "ACTIVE" },
    include: { steps: { orderBy: { sequence: "asc" } } },
  });
}

export async function createRoutingVersion(
  tenantId: string,
  productId: string,
  steps: RoutingStepInput[],
  note?: string
): Promise<RoutingVersionWithSteps> {
  if (steps.length === 0) {
    throw new Error("Routing harus punya minimal satu langkah proses.");
  }

  const lastVersion = await prisma.routingVersion.findFirst({
    where: { tenantId, productId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const nextVersion = (lastVersion?.version ?? 0) + 1;

  return prisma.routingVersion.create({
    data: {
      tenantId,
      productId,
      version: nextVersion,
      status: "DRAFT",
      note,
      steps: {
        create: steps.map((step, index) => ({
          tenantId,
          workCenterId: step.workCenterId,
          sequence: index + 1,
          name: step.name.trim(),
          standardDurationMin: step.standardDurationMin,
          instruction: step.instruction,
          qcCheckpoint: step.qcCheckpoint ?? false,
        })),
      },
    },
    include: { steps: { orderBy: { sequence: "asc" } } },
  });
}

/** Sama seperti activateBomVersion — versi ACTIVE lama jadi OBSOLETE, guardrail #9 berlaku sama. */
export async function activateRoutingVersion(tenantId: string, routingVersionId: string): Promise<RoutingVersion> {
  const version = await prisma.routingVersion.findFirst({ where: { id: routingVersionId, tenantId } });
  if (!version) throw new Error("Versi routing tidak ditemukan.");
  if (version.status === "OBSOLETE") {
    throw new Error("Versi routing yang sudah usang tidak bisa diaktifkan lagi — buat versi baru.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.routingVersion.updateMany({
      where: { tenantId, productId: version.productId, status: "ACTIVE" },
      data: { status: "OBSOLETE" },
    });
    return tx.routingVersion.update({ where: { id: routingVersionId }, data: { status: "ACTIVE" } });
  });
}
