import { prisma } from "@/lib/prisma";

/**
 * Membuat tarif borongan/komisi baru per unit produk per work center.
 */
export async function createRateCard(params: {
  tenantId: string;
  workCenterId: string;
  productName: string;
  ratePerUnit: number;
  startDate: Date;
  endDate?: Date | null;
}) {
  return prisma.productionRateCard.create({
    data: {
      tenantId: params.tenantId,
      workCenterId: params.workCenterId,
      productName: params.productName,
      ratePerUnit: params.ratePerUnit,
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
}

/**
 * Mencatat log produksi harian pekerja.
 */
export async function logWorkerProduction(params: {
  tenantId: string;
  workerId: string;
  workOrderId: string;
  workCenterId: string;
  quantityProduced: number;
  quantityPassedQc: number;
  note?: string | null;
}) {
  if (params.quantityPassedQc > params.quantityProduced) {
    throw new Error("Jumlah lolos QC tidak boleh melampaui jumlah produksi.");
  }

  return prisma.workerProductionLog.create({
    data: {
      tenantId: params.tenantId,
      workerId: params.workerId,
      workOrderId: params.workOrderId,
      workCenterId: params.workCenterId,
      quantityProduced: params.quantityProduced,
      quantityPassedQc: params.quantityPassedQc,
      status: "PENDING",
      note: params.note,
    },
  });
}

/**
 * Melakukan persetujuan terhadap log produksi pekerja oleh supervisor.
 */
export async function approveProductionLog(logId: string) {
  return prisma.workerProductionLog.update({
    where: { id: logId },
    data: { status: "APPROVED" },
  });
}

/**
 * Menghitung akumulasi komisi borongan (Variable Pay) berdasarkan output yang lolos QC.
 */
export async function calculateVariableEarnings(
  workerId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Ambil semua log produksi pekerja yang telah disetujui dalam rentang periode
  const logs = await prisma.workerProductionLog.findMany({
    where: {
      workerId,
      status: "APPROVED",
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      workOrder: {
        select: { product: { select: { name: true } } },
      },
    },
  });

  let totalEarnings = 0;

  for (const log of logs) {
    const productName = log.workOrder.product.name;

    // Cari Rate Card aktif yang cocok dengan work center dan nama produk
    const rateCard = await prisma.productionRateCard.findFirst({
      where: {
        workCenterId: log.workCenterId,
        productName: productName,
        startDate: { lte: log.createdAt },
        OR: [{ endDate: null }, { endDate: { gte: log.createdAt } }],
      },
    });

    if (rateCard) {
      // Hanya unit yang lolos QC (quantityPassedQc) yang dibayar
      totalEarnings += log.quantityPassedQc * rateCard.ratePerUnit;
    }
  }

  return totalEarnings;
}

/**
 * Integrasi Crew Pool: Membagi komisi borongan regu ke seluruh anggota tim yang aktif.
 */
export async function distributeCrewPoolCommission(params: {
  tenantId: string;
  workCenterId: string;
  workOrderId: string;
  totalQuantityPassedQc: number;
  productName: string;
  crewWorkerIds: string[];
  date: Date;
}) {
  const rateCard = await prisma.productionRateCard.findFirst({
    where: {
      workCenterId: params.workCenterId,
      productName: params.productName,
      startDate: { lte: params.date },
      OR: [{ endDate: null }, { endDate: { gte: params.date } }],
    },
  });

  if (!rateCard) throw new Error("Rate Card tidak ditemukan untuk distribusi regu.");

  const totalPoolEarning = params.totalQuantityPassedQc * rateCard.ratePerUnit;
  // Pembagian merata (split) ke setiap anggota crew yang ditugaskan
  const splitEarning = Math.round(totalPoolEarning / params.crewWorkerIds.length);

  const logs = [];
  const perWorkerQty = Math.round(params.totalQuantityPassedQc / params.crewWorkerIds.length);

  for (const workerId of params.crewWorkerIds) {
    logs.push(
      prisma.workerProductionLog.create({
        data: {
          tenantId: params.tenantId,
          workerId,
          workOrderId: params.workOrderId,
          workCenterId: params.workCenterId,
          quantityProduced: perWorkerQty,
          quantityPassedQc: perWorkerQty,
          status: "APPROVED",
          note: `Pembagian komisi regu/crew pool. Total grup: Rp ${totalPoolEarning.toLocaleString()}`,
        },
      })
    );
  }

  // Eksekusi semua secara paralel dalam transaksi
  return prisma.$transaction(logs);
}
