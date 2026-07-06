import { prisma } from "@/lib/prisma";
import type { EquipmentStatus, MaintenanceStatus } from "@prisma/client";
import { logExpenseToJournal } from "@/server/services/accounting-service";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export type EquipmentInput = {
  outletId: string;
  name: string;
  category: string;
  serialNumber?: string | null;
  note?: string | null;
};

export type MaintenanceInput = {
  equipmentId: string;
  issue: string;
  actionTaken?: string | null;
  cost?: number;
};

export async function listEquipment(tenantId: string, outletIds: string[]) {
  return prisma.equipment.findMany({
    where: { tenantId, outletId: { in: outletIds } },
    include: {
      outlet: true,
      logs: {
        orderBy: { reportedAt: "desc" },
        take: 3,
        include: { reportedBy: true },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export async function createEquipment(tenantId: string, input: EquipmentInput) {
  if (!input.name.trim()) throw new Error("Nama alat wajib diisi.");
  if (!input.category.trim()) throw new Error("Kategori alat wajib diisi.");
  return prisma.equipment.create({
    data: {
      tenantId,
      outletId: input.outletId,
      name: input.name.trim(),
      category: input.category.trim(),
      serialNumber: input.serialNumber?.trim() || null,
      note: input.note?.trim() || null,
    },
  });
}

export async function updateEquipmentStatus(
  tenantId: string,
  id: string,
  status: EquipmentStatus
) {
  const equipment = await prisma.equipment.findFirst({ where: { id, tenantId } });
  if (!equipment) throw new Error("Alat tidak ditemukan.");
  return prisma.equipment.update({ where: { id }, data: { status } });
}

export async function reportMaintenance(
  tenantId: string,
  outletIds: string[],
  reportedById: string,
  input: MaintenanceInput
) {
  if (!input.issue.trim()) throw new Error("Masalah alat wajib diisi.");
  if (input.cost !== undefined && input.cost < 0) throw new Error("Biaya maintenance tidak valid.");

  const equipment = await prisma.equipment.findFirst({
    where: { id: input.equipmentId, tenantId, outletId: { in: outletIds } },
  });
  if (!equipment) throw new Error("Alat tidak ditemukan.");

  return prisma.$transaction(async (tx) => {
    const log = await tx.equipmentMaintenanceLog.create({
      data: {
        tenantId,
        outletId: equipment.outletId,
        equipmentId: equipment.id,
        reportedById,
        issue: input.issue.trim(),
        actionTaken: input.actionTaken?.trim() || null,
        cost: input.cost ?? 0,
      },
    });
    await tx.equipment.update({
      where: { id: equipment.id },
      data: { status: "NEEDS_REPAIR" },
    });
    return log;
  });
}

export async function updateMaintenanceStatus(
  tenantId: string,
  id: string,
  status: MaintenanceStatus,
  actionTaken?: string | null,
  cost?: number
) {
  const log = await prisma.equipmentMaintenanceLog.findFirst({
    where: { id, tenantId },
    include: { equipment: true },
  });
  if (!log) throw new Error("Log maintenance tidak ditemukan.");
  if (cost !== undefined && cost < 0) throw new Error("Biaya maintenance tidak valid.");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.equipmentMaintenanceLog.update({
      where: { id },
      data: {
        status,
        actionTaken: actionTaken?.trim() || log.actionTaken,
        cost: cost ?? log.cost,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
    });
    await tx.equipment.update({
      where: { id: log.equipmentId },
      data: {
        status:
          status === "RESOLVED"
            ? "ACTIVE"
            : status === "IN_PROGRESS"
              ? "REPAIRING"
              : "NEEDS_REPAIR",
      },
    });

    if (status === "RESOLVED" && updated.cost > 0) {
      const expense = await tx.expense.create({
        data: {
          tenantId,
          outletId: log.outletId,
          createdById: log.reportedById,
          category: "LAINNYA",
          amount: updated.cost,
          note: `Auto-Expense perbaikan alat: ${log.equipment.name} (${log.issue})`,
          spentAt: new Date(),
        },
      });

      await logExpenseToJournal(tenantId, expense.id, tx);
    }

    return updated;
  });
}
