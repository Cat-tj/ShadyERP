import { prisma } from "@/lib/prisma";
import type { Prisma, QualityInspection, InspectionType, InspectionStatus, Warehouse } from "@prisma/client";
import { recordMovement, buildIdempotencyKey } from "./stock-movement-service";

type Client = Prisma.TransactionClient | typeof prisma;

async function findWarehouseByType(tenantId: string, outletId: string, type: "WIP" | "FINISHED_GOODS" | "QUARANTINE" | "REJECT", tx: Client = prisma): Promise<Warehouse> {
  const warehouse = await tx.warehouse.findFirst({ where: { tenantId, outletId, type, isActive: true } });
  if (!warehouse) throw new Error(`Belum ada gudang ${type} untuk outlet ini — buat dulu di Pengaturan Produksi.`);
  return warehouse;
}

async function findRawMaterialWarehouse(tenantId: string, outletId: string, tx: Client = prisma): Promise<Warehouse> {
  const warehouse = await tx.warehouse.findFirst({ where: { tenantId, outletId, type: "RAW_MATERIAL", isActive: true } });
  if (!warehouse) throw new Error("Belum ada gudang Bahan Baku untuk outlet ini — buat dulu di Pengaturan Gudang.");
  return warehouse;
}

export async function createInspection(
  tenantId: string,
  inspectionType: InspectionType,
  sourceType: string,
  sourceId: string,
  inspectorId: string,
  quantityInspected: number,
  tx: Client = prisma
): Promise<QualityInspection> {
  if (quantityInspected <= 0) {
    throw new Error("Jumlah yang diinspeksi harus lebih dari 0.");
  }

  return tx.qualityInspection.create({
    data: {
      tenantId,
      inspectionType,
      sourceType,
      sourceId,
      inspectorId,
      quantityInspected,
      quantityPassed: 0,
      quantityFailed: 0,
      status: "PENDING",
    },
  });
}

export async function submitInspectionResult(
  tenantId: string,
  inspectionId: string,
  quantityPassed: number,
  quantityFailed: number,
  notes?: string
): Promise<QualityInspection> {
  if (quantityPassed < 0 || quantityFailed < 0) {
    throw new Error("Jumlah lulus dan gagal tidak boleh negatif.");
  }

  return prisma.$transaction(async (tx) => {
    const inspection = await tx.qualityInspection.findFirst({
      where: { id: inspectionId, tenantId },
    });
    if (!inspection) throw new Error("Inspeksi tidak ditemukan.");
    if (inspection.status !== "PENDING") {
      throw new Error("Inspeksi ini sudah diproses sebelumnya.");
    }

    if (quantityPassed + quantityFailed !== inspection.quantityInspected) {
      throw new Error(
        `Jumlah lulus (${quantityPassed}) + gagal (${quantityFailed}) harus sama dengan jumlah yang diinspeksi (${inspection.quantityInspected}).`
      );
    }

    const newStatus: InspectionStatus = quantityFailed > 0 ? "FAILED" : "PASSED";

    const updated = await tx.qualityInspection.update({
      where: { id: inspectionId },
      data: {
        quantityPassed,
        quantityFailed,
        status: newStatus,
        notes,
      },
    });

    // Jalankan pergerakan stok otomatis berdasarkan jenis inspeksi
    if (inspection.inspectionType === "FINAL") {
      // Final QC untuk Work Order
      const wo = await tx.workOrder.findFirst({
        where: { id: inspection.sourceId, tenantId },
      });
      if (wo) {
        const finishedGoodsWarehouse = await findWarehouseByType(tenantId, wo.outletId, "FINISHED_GOODS", tx);
        const quarantineWarehouse = await findWarehouseByType(tenantId, wo.outletId, "QUARANTINE", tx);
        const rejectedWarehouse = await findWarehouseByType(tenantId, wo.outletId, "REJECT", tx);

        // Cari batch yang terkait dengan Work Order ini
        const batch = await tx.stockBatch.findFirst({
          where: { tenantId, productId: wo.productId, batchNumber: `BATCH-${wo.code}` },
        });
        const batchId = batch?.id;

        // Pindahkan dari Karantina ke Barang Jadi
        if (quantityPassed > 0) {
          await recordMovement(
            tenantId,
            {
              productId: wo.productId,
              qty: quantityPassed,
              fromWarehouseId: quarantineWarehouse.id,
              toWarehouseId: finishedGoodsWarehouse.id,
              sourceType: "QUALITY_CONTROL",
              sourceId: inspectionId,
              actorId: inspection.inspectorId,
              batchId,
              idempotencyKey: buildIdempotencyKey("QUALITY_CONTROL", inspectionId, "pass"),
              note: `Lolos QC Final: ${notes ?? ""}`,
            },
            tx
          );

          // Update status batch produksi menjadi AVAILABLE jika lolos QC
          if (batch) {
            await tx.stockBatch.update({
              where: { id: batch.id },
              data: { status: "AVAILABLE" },
            });
          }
        }

        // Pindahkan dari Karantina ke Reject
        if (quantityFailed > 0) {
          await recordMovement(
            tenantId,
            {
              productId: wo.productId,
              qty: quantityFailed,
              fromWarehouseId: quarantineWarehouse.id,
              toWarehouseId: rejectedWarehouse.id,
              sourceType: "QUALITY_CONTROL",
              sourceId: inspectionId,
              actorId: inspection.inspectorId,
              batchId,
              idempotencyKey: buildIdempotencyKey("QUALITY_CONTROL", inspectionId, "fail"),
              note: `Gagal QC Final: ${notes ?? ""}`,
            },
            tx
          );

          // Jika gagal sepenuhnya, set batch ke REJECTED
          if (quantityPassed === 0 && batch) {
            await tx.stockBatch.update({
              where: { id: batch.id },
              data: { status: "REJECTED" },
            });
          }
        }
      }
    } else if (inspection.inspectionType === "INCOMING") {
      // Incoming QC dari Stock Receipt (Penerimaan Supplier)
      const receipt = await tx.stockReceipt.findFirst({
        where: { id: inspection.sourceId, tenantId },
      });
      if (receipt) {
        const rawWarehouse = await findRawMaterialWarehouse(tenantId, receipt.outletId, tx);
        const quarantineWarehouse = await findWarehouseByType(tenantId, receipt.outletId, "QUARANTINE", tx);
        const rejectedWarehouse = await findWarehouseByType(tenantId, receipt.outletId, "REJECT", tx);

        const receiptItems = await tx.stockReceiptItem.findMany({
          where: { receiptId: receipt.id },
        });

        for (const item of receiptItems) {
          if (quantityPassed > 0) {
            await recordMovement(
              tenantId,
              {
                productId: item.productId,
                qty: quantityPassed,
                fromWarehouseId: quarantineWarehouse.id,
                toWarehouseId: rawWarehouse.id,
                sourceType: "QUALITY_CONTROL",
                sourceId: inspectionId,
                actorId: inspection.inspectorId,
                idempotencyKey: buildIdempotencyKey("QUALITY_CONTROL", `${inspectionId}:${item.productId}`, "pass"),
                note: `Lolos QC Masuk: ${notes ?? ""}`,
              },
              tx
            );
          }

          if (quantityFailed > 0) {
            await recordMovement(
              tenantId,
              {
                productId: item.productId,
                qty: quantityFailed,
                fromWarehouseId: quarantineWarehouse.id,
                toWarehouseId: rejectedWarehouse.id,
                sourceType: "QUALITY_CONTROL",
                sourceId: inspectionId,
                actorId: inspection.inspectorId,
                idempotencyKey: buildIdempotencyKey("QUALITY_CONTROL", `${inspectionId}:${item.productId}`, "fail"),
                note: `Gagal QC Masuk: ${notes ?? ""}`,
              },
              tx
            );
          }
        }
      }
    }

    return updated;
  });
}

export async function listInspections(tenantId: string): Promise<QualityInspection[]> {
  return prisma.qualityInspection.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { inspector: { select: { name: true } } },
  });
}
