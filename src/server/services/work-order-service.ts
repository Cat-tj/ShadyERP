import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma, WorkOrder, WorkOrderOperation, WorkOrderStatus, WorkOrderOperationStatus } from "@prisma/client";
import { recordMovement, getWarehouseBalance, buildIdempotencyKey } from "@/server/services/stock-movement-service";

/**
 * Perintah produksi (Work Order) + state machine-nya. Lihat
 * docs/TODO-PABRIK-MANUFAKTUR.md untuk diagram state lengkap dan guardrail wajib.
 *
 * BOM/routing TIDAK di-copy jadi baris terpisah saat WO dibuat — WO cukup
 * menyimpan bomVersionId/routingVersionId sebagai referensi. Ini tetap
 * "snapshot" yang aman karena bom-service/routing-service melarang edit isi
 * versi yang statusnya bukan DRAFT (guardrail #9) — begitu WO dibuat dari
 * versi ACTIVE, isi versi itu tidak akan pernah berubah lagi.
 *
 * SIMPLIFIKASI YANG DISADARI untuk M1 (dicatat di sini, bukan disembunyikan):
 * - Reservasi material (MATERIAL_RESERVED) cuma cek saldo ledger saat ini,
 *   BELUM ada tabel reservasi terpisah yang mencegah dua WO konkuren
 *   memperebutkan bahan yang sama antara reserve dan issue. Untuk volume kecil
 *   ini jarang jadi masalah nyata, tapi kalau tenant punya banyak planner
 *   paralel, ini perlu diperbaiki (tabel MaterialReservation) sebelum M2.
 * - Invariant penuh "Issued = Consumed + Returned + Waste + Remaining WIP"
 *   (dokumen section 9/26) belum ditegakkan sepenuhnya — versi M1 cuma
 *   mewajibkan minimal satu output tercatat sebelum WO ditutup (guardrail #13
 *   versi ringan). Penelusuran material-ke-output yang presisi butuh model
 *   konsumsi per-lot dari M2 (Batch dan Quality).
 * - Guardrail #14 (pekerja tidak boleh aktif di dua operation) belum
 *   ditegakkan — WorkOrderOperation belum punya kolom operator wajib di M1.
 */

const ACTIVE_RESERVATION_STATUSES: WorkOrderStatus[] = [
  "MATERIAL_RESERVED",
  "SCHEDULED",
  "RELEASED",
  "IN_PROGRESS",
  "PAUSED",
  "AWAITING_QC",
];

export type WorkOrderWithOperations = WorkOrder & { operations: WorkOrderOperation[] };

export async function generateWorkOrderCode(tenantId: string): Promise<string> {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const count = await prisma.workOrder.count({ where: { tenantId } });
  return `WO-${today}-${String(count + 1).padStart(3, "0")}`;
}

export async function listWorkOrders(tenantId: string, outletId?: string): Promise<WorkOrderWithOperations[]> {
  return prisma.workOrder.findMany({
    where: { tenantId, ...(outletId ? { outletId } : {}) },
    include: { operations: { orderBy: { sequence: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkOrderById(tenantId: string, workOrderId: string): Promise<WorkOrderWithOperations | null> {
  return prisma.workOrder.findFirst({
    where: { id: workOrderId, tenantId },
    include: { operations: { orderBy: { sequence: "asc" } } },
  });
}

/** Bikin WO baru (DRAFT) + snapshot langkah operation dari RoutingVersion yang dipilih. */
export async function createWorkOrder(
  tenantId: string,
  outletId: string,
  productId: string,
  bomVersionId: string,
  routingVersionId: string,
  targetQty: number,
  plannedById: string,
  options?: { dueDate?: Date; note?: string }
): Promise<WorkOrderWithOperations> {
  if (targetQty <= 0) throw new Error("Target produksi harus lebih dari 0.");

  const [bomVersion, routingVersion] = await Promise.all([
    prisma.bomVersion.findFirst({ where: { id: bomVersionId, tenantId, productId } }),
    prisma.routingVersion.findFirst({
      where: { id: routingVersionId, tenantId, productId },
      include: { steps: { orderBy: { sequence: "asc" } } },
    }),
  ]);
  if (!bomVersion) throw new Error("Versi BOM tidak ditemukan untuk produk ini.");
  if (!routingVersion) throw new Error("Versi routing tidak ditemukan untuk produk ini.");
  if (routingVersion.steps.length === 0) throw new Error("Routing ini belum punya langkah proses.");

  const code = await generateWorkOrderCode(tenantId);

  return prisma.workOrder.create({
    data: {
      tenantId,
      outletId,
      productId,
      bomVersionId,
      routingVersionId,
      code,
      targetQty,
      status: "DRAFT",
      plannedById,
      dueDate: options?.dueDate,
      note: options?.note,
      operations: {
        create: routingVersion.steps.map((step) => ({
          tenantId,
          workCenterId: step.workCenterId,
          sequence: step.sequence,
          name: step.name,
          status: "PENDING" as WorkOrderOperationStatus,
        })),
      },
    },
    include: { operations: { orderBy: { sequence: "asc" } } },
  });
}

function assertStatus(wo: WorkOrder, expected: WorkOrderStatus | WorkOrderStatus[]) {
  const expectedList = Array.isArray(expected) ? expected : [expected];
  if (!expectedList.includes(wo.status)) {
    throw new Error(`WO ${wo.code} berstatus ${wo.status}, bukan ${expectedList.join("/")} — aksi ini tidak valid.`);
  }
}

export async function submitForApproval(tenantId: string, workOrderId: string): Promise<WorkOrder> {
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) throw new Error("WO tidak ditemukan.");
  assertStatus(wo, "DRAFT");
  return prisma.workOrder.update({ where: { id: workOrderId }, data: { status: "PENDING_APPROVAL" } });
}

export async function approveWorkOrder(tenantId: string, workOrderId: string, approvedById: string): Promise<WorkOrder> {
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) throw new Error("WO tidak ditemukan.");
  assertStatus(wo, "PENDING_APPROVAL");
  return prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status: "APPROVED", approvedById, approvedAt: new Date() },
  });
}

export async function cancelWorkOrder(tenantId: string, workOrderId: string): Promise<WorkOrder> {
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) throw new Error("WO tidak ditemukan.");
  if (wo.status === "RELEASED" || wo.status === "IN_PROGRESS" || wo.status === "PAUSED" ||
      wo.status === "AWAITING_QC" || wo.status === "COMPLETED" || wo.status === "CLOSED") {
    throw new Error("WO yang sudah dirilis/berjalan/selesai tidak bisa dibatalkan — tutup atau selesaikan seperti biasa.");
  }
  return prisma.workOrder.update({ where: { id: workOrderId }, data: { status: "CANCELLED", cancelledAt: new Date() } });
}

async function requiredQtyPerIngredient(
  tx: Prisma.TransactionClient | typeof prisma,
  bomVersionId: string,
  targetQty: number
): Promise<{ ingredientId: string; qty: number }[]> {
  const bomVersion = await tx.bomVersion.findUniqueOrThrow({
    where: { id: bomVersionId },
    include: { items: true },
  });
  return bomVersion.items.map((item) => ({
    ingredientId: item.ingredientId,
    qty: Math.ceil((item.qty * targetQty) / bomVersion.outputQty),
  }));
}

async function findRawMaterialWarehouse(tenantId: string, outletId: string) {
  const warehouse = await prisma.warehouse.findFirst({
    where: { tenantId, outletId, type: "RAW_MATERIAL", isActive: true },
  });
  if (!warehouse) throw new Error("Belum ada gudang bahan baku untuk outlet ini — buat dulu di Pengaturan Produksi.");
  return warehouse;
}

async function findWarehouseByType(tenantId: string, outletId: string, type: "WIP" | "FINISHED_GOODS" | "REJECT" | "SCRAP") {
  const warehouse = await prisma.warehouse.findFirst({ where: { tenantId, outletId, type, isActive: true } });
  if (!warehouse) throw new Error(`Belum ada gudang ${type} untuk outlet ini — buat dulu di Pengaturan Produksi.`);
  return warehouse;
}

export interface MaterialAvailability {
  ingredientId: string;
  requiredQty: number;
  availableQty: number;
  sufficient: boolean;
}

/**
 * Cek & tandai ketersediaan bahan. Lihat catatan "SIMPLIFIKASI" di atas file —
 * ini cek saldo ledger saat ini, dikurangi kebutuhan WO lain yang statusnya
 * masih aktif (supaya tidak dobel-hitung bahan yang "sudah dipegang" WO lain),
 * TAPI belum atomik lintas WO (race condition kecil masih mungkin).
 */
export async function reserveMaterials(
  tenantId: string,
  workOrderId: string
): Promise<{ status: "MATERIAL_RESERVED" | "MATERIAL_SHORTAGE"; availability: MaterialAvailability[] }> {
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) throw new Error("WO tidak ditemukan.");
  assertStatus(wo, ["APPROVED", "MATERIAL_SHORTAGE"]);

  const rawWarehouse = await findRawMaterialWarehouse(tenantId, wo.outletId);
  const required = await requiredQtyPerIngredient(prisma, wo.bomVersionId, wo.targetQty);

  const otherActiveWOs = await prisma.workOrder.findMany({
    where: { tenantId, outletId: wo.outletId, status: { in: ACTIVE_RESERVATION_STATUSES }, id: { not: workOrderId } },
    select: { id: true, bomVersionId: true, targetQty: true },
  });

  const reservedElsewhere = new Map<string, number>();
  for (const otherWo of otherActiveWOs) {
    const otherRequired = await requiredQtyPerIngredient(prisma, otherWo.bomVersionId, otherWo.targetQty);
    for (const r of otherRequired) {
      reservedElsewhere.set(r.ingredientId, (reservedElsewhere.get(r.ingredientId) ?? 0) + r.qty);
    }
  }

  const availability: MaterialAvailability[] = [];
  for (const item of required) {
    const ledgerBalance = await getWarehouseBalance(tenantId, item.ingredientId, rawWarehouse.id);
    const heldByOthers = reservedElsewhere.get(item.ingredientId) ?? 0;
    const availableQty = ledgerBalance - heldByOthers;
    availability.push({
      ingredientId: item.ingredientId,
      requiredQty: item.qty,
      availableQty,
      sufficient: availableQty >= item.qty,
    });
  }

  const allSufficient = availability.every((a) => a.sufficient);
  const status: WorkOrderStatus = allSufficient ? "MATERIAL_RESERVED" : "MATERIAL_SHORTAGE";
  await prisma.workOrder.update({ where: { id: workOrderId }, data: { status } });

  return { status, availability };
}

export async function scheduleWorkOrder(tenantId: string, workOrderId: string, dueDate?: Date): Promise<WorkOrder> {
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) throw new Error("WO tidak ditemukan.");
  assertStatus(wo, "MATERIAL_RESERVED");
  return prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status: "SCHEDULED", ...(dueDate ? { dueDate } : {}) },
  });
}

/**
 * Rilis WO: pindahkan bahan baku dari gudang bahan baku ke gudang WIP (ini
 * pencatatan movement ISSUE yang sesungguhnya — reserveMaterials() di atas
 * cuma cek ketersediaan, belum menulis ledger), lalu buka operation pertama.
 */
export async function releaseWorkOrder(tenantId: string, workOrderId: string, actorId: string): Promise<WorkOrderWithOperations> {
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId }, include: { operations: { orderBy: { sequence: "asc" } } } });
  if (!wo) throw new Error("WO tidak ditemukan.");
  assertStatus(wo, "SCHEDULED");

  const rawWarehouse = await findRawMaterialWarehouse(tenantId, wo.outletId);
  const wipWarehouse = await findWarehouseByType(tenantId, wo.outletId, "WIP");
  const required = await requiredQtyPerIngredient(prisma, wo.bomVersionId, wo.targetQty);

  return prisma.$transaction(async (tx) => {
    for (const item of required) {
      await recordMovement(
        tenantId,
        {
          productId: item.ingredientId,
          qty: item.qty,
          fromWarehouseId: rawWarehouse.id,
          toWarehouseId: wipWarehouse.id,
          sourceType: "WORK_ORDER_ISSUE",
          sourceId: workOrderId,
          actorId,
          idempotencyKey: buildIdempotencyKey("WORK_ORDER_ISSUE", workOrderId, item.ingredientId),
        },
        tx
      );
    }

    const firstOp = wo.operations[0];
    if (firstOp) {
      await tx.workOrderOperation.update({ where: { id: firstOp.id }, data: { status: "READY" } });
    }

    return tx.workOrder.update({
      where: { id: workOrderId },
      data: { status: "RELEASED", releasedAt: new Date() },
      include: { operations: { orderBy: { sequence: "asc" } } },
    });
  });
}

/**
 * Kembalikan sisa bahan yang tidak terpakai dari WIP ke gudang bahan baku.
 * `submissionKey` harus dibuat SEKALI oleh pemanggil (mis. crypto.randomUUID()
 * di client) dan dikirim ulang persis sama kalau request di-retry — beda
 * dengan recordOutput yang boleh dipanggil berkali-kali dengan hasil baru
 * tiap kali, satu retur adalah satu kejadian yang tidak boleh dobel-catat.
 */
export async function returnMaterial(
  tenantId: string,
  workOrderId: string,
  actorId: string,
  items: { ingredientId: string; qty: number }[],
  submissionKey: string
): Promise<void> {
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) throw new Error("WO tidak ditemukan.");
  if (items.some((i) => i.qty <= 0)) throw new Error("Jumlah retur harus lebih dari 0.");

  const rawWarehouse = await findRawMaterialWarehouse(tenantId, wo.outletId);
  const wipWarehouse = await findWarehouseByType(tenantId, wo.outletId, "WIP");

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await recordMovement(
        tenantId,
        {
          productId: item.ingredientId,
          qty: item.qty,
          fromWarehouseId: wipWarehouse.id,
          toWarehouseId: rawWarehouse.id,
          sourceType: "WORK_ORDER_RETURN",
          sourceId: workOrderId,
          actorId,
          idempotencyKey: buildIdempotencyKey("WORK_ORDER_RETURN", workOrderId, `${item.ingredientId}:${submissionKey}`),
        },
        tx
      );
    }
  });
}

// ---------- Operation execution ----------

export async function startOperation(tenantId: string, operationId: string): Promise<WorkOrderOperation> {
  const op = await prisma.workOrderOperation.findFirst({ where: { id: operationId, tenantId }, include: { workOrder: true } });
  if (!op) throw new Error("Operation tidak ditemukan.");
  if (op.status !== "PENDING" && op.status !== "READY") {
    throw new Error(`Operation ini berstatus ${op.status}, tidak bisa dimulai.`);
  }
  if (op.workOrder.status !== "RELEASED" && op.workOrder.status !== "IN_PROGRESS") {
    throw new Error("WO belum dirilis — operation tidak bisa dimulai.");
  }

  return prisma.$transaction(async (tx) => {
    if (op.workOrder.status === "RELEASED") {
      await tx.workOrder.update({ where: { id: op.workOrderId }, data: { status: "IN_PROGRESS" } });
    }
    return tx.workOrderOperation.update({
      where: { id: operationId },
      data: { status: "IN_PROGRESS", actualStartAt: op.actualStartAt ?? new Date() },
    });
  });
}

export async function pauseOperation(tenantId: string, operationId: string): Promise<WorkOrderOperation> {
  const op = await prisma.workOrderOperation.findFirst({ where: { id: operationId, tenantId } });
  if (!op) throw new Error("Operation tidak ditemukan.");
  if (op.status !== "IN_PROGRESS") throw new Error("Cuma operation yang sedang berjalan yang bisa dijeda.");
  return prisma.workOrderOperation.update({ where: { id: operationId }, data: { status: "PAUSED" } });
}

export async function resumeOperation(tenantId: string, operationId: string): Promise<WorkOrderOperation> {
  const op = await prisma.workOrderOperation.findFirst({ where: { id: operationId, tenantId } });
  if (!op) throw new Error("Operation tidak ditemukan.");
  if (op.status !== "PAUSED") throw new Error("Cuma operation yang dijeda yang bisa dilanjutkan.");
  return prisma.workOrderOperation.update({ where: { id: operationId }, data: { status: "IN_PROGRESS" } });
}

export interface RecordOutputInput {
  goodQty?: number;
  rejectQty?: number;
  reworkQty?: number;
  scrapQty?: number;
  /** Digenerate di UI (mis. crypto.randomUUID()) supaya submit dobel (tap 2x/retry offline) tidak dobel-catat. */
  idempotencyKey?: string;
}

/**
 * Catat hasil produksi (bisa dipanggil berkali-kali sepanjang operation berjalan,
 * bukan cuma sekali di akhir). goodQty dipindah ke gudang barang jadi; reject+scrap
 * dipindah ke gudang reject/scrap. reworkQty ditambahkan ke qty operation tapi
 * TIDAK memindah stok (rework masih di WIP, diproses ulang).
 */
export async function recordOutput(
  tenantId: string,
  operationId: string,
  actorId: string,
  input: RecordOutputInput
): Promise<WorkOrderOperation> {
  const op = await prisma.workOrderOperation.findFirst({ where: { id: operationId, tenantId }, include: { workOrder: true } });
  if (!op) throw new Error("Operation tidak ditemukan.");
  if (op.status !== "IN_PROGRESS" && op.status !== "PAUSED") {
    throw new Error("Cuma operation yang sedang berjalan atau dijeda yang bisa dicatat hasilnya.");
  }

  const goodQty = Math.max(0, input.goodQty ?? 0);
  const rejectQty = Math.max(0, input.rejectQty ?? 0);
  const reworkQty = Math.max(0, input.reworkQty ?? 0);
  const scrapQty = Math.max(0, input.scrapQty ?? 0);
  if (goodQty + rejectQty + reworkQty + scrapQty <= 0) {
    throw new Error("Isi minimal salah satu jumlah (lolos/reject/rework/scrap).");
  }

  const key = input.idempotencyKey ?? randomUUID();
  const wo = op.workOrder;

  return prisma.$transaction(async (tx) => {
    const wipWarehouse = await findWarehouseByType(tenantId, wo.outletId, "WIP");

    if (goodQty > 0) {
      const finishedWarehouse = await findWarehouseByType(tenantId, wo.outletId, "FINISHED_GOODS");
      await recordMovement(
        tenantId,
        {
          productId: wo.productId,
          qty: goodQty,
          fromWarehouseId: wipWarehouse.id,
          toWarehouseId: finishedWarehouse.id,
          sourceType: "WORK_ORDER_OUTPUT",
          sourceId: wo.id,
          actorId,
          idempotencyKey: buildIdempotencyKey("WORK_ORDER_OUTPUT", operationId, key),
        },
        tx
      );
    }
    if (rejectQty + scrapQty > 0) {
      const scrapWarehouse = await findWarehouseByType(tenantId, wo.outletId, "SCRAP");
      await recordMovement(
        tenantId,
        {
          productId: wo.productId,
          qty: rejectQty + scrapQty,
          fromWarehouseId: wipWarehouse.id,
          toWarehouseId: scrapWarehouse.id,
          sourceType: "WORK_ORDER_WASTE",
          sourceId: wo.id,
          actorId,
          idempotencyKey: buildIdempotencyKey("WORK_ORDER_WASTE", operationId, key),
        },
        tx
      );
    }

    return tx.workOrderOperation.update({
      where: { id: operationId },
      data: {
        goodQty: { increment: goodQty },
        rejectQty: { increment: rejectQty },
        reworkQty: { increment: reworkQty },
        scrapQty: { increment: scrapQty },
      },
    });
  });
}

export async function completeOperation(tenantId: string, operationId: string): Promise<WorkOrderWithOperations> {
  const op = await prisma.workOrderOperation.findFirst({ where: { id: operationId, tenantId }, include: { workOrder: { include: { operations: true } } } });
  if (!op) throw new Error("Operation tidak ditemukan.");
  if (op.status !== "IN_PROGRESS" && op.status !== "PAUSED") {
    throw new Error("Cuma operation yang sedang berjalan atau dijeda yang bisa diselesaikan.");
  }
  if (op.goodQty + op.rejectQty + op.reworkQty + op.scrapQty <= 0) {
    throw new Error("Catat hasil produksi (lolos/reject/rework/scrap) sebelum menyelesaikan operation ini.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.workOrderOperation.update({ where: { id: operationId }, data: { status: "COMPLETED", actualEndAt: new Date() } });

    const siblings = op.workOrder.operations;
    const nextOp = siblings.find((s) => s.sequence === op.sequence + 1);
    if (nextOp) {
      await tx.workOrderOperation.update({ where: { id: nextOp.id }, data: { status: "READY" } });
    }

    const remaining = siblings.filter((s) => s.id !== operationId && s.status !== "COMPLETED" && s.status !== "SKIPPED");
    const wo = remaining.length === 0
      ? await tx.workOrder.update({ where: { id: op.workOrderId }, data: { status: "AWAITING_QC" }, include: { operations: { orderBy: { sequence: "asc" } } } })
      : await tx.workOrder.findFirstOrThrow({ where: { id: op.workOrderId }, include: { operations: { orderBy: { sequence: "asc" } } } });

    return wo;
  });
}

/** AWAITING_QC -> COMPLETED. Belum ada QC nyata di M1 (itu masuk M2) — ini transisi administratif dulu. */
export async function markWorkOrderCompleted(tenantId: string, workOrderId: string): Promise<WorkOrder> {
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) throw new Error("WO tidak ditemukan.");
  assertStatus(wo, "AWAITING_QC");
  return prisma.workOrder.update({ where: { id: workOrderId }, data: { status: "COMPLETED", completedAt: new Date() } });
}

/**
 * Tutup WO — guardrail #13 versi M1 (lihat catatan simplifikasi di atas file):
 * semua operation harus COMPLETED/SKIPPED dan minimal satu output tercatat.
 * Invariant material balance penuh belum ditegakkan di M1.
 */
export async function closeWorkOrder(tenantId: string, workOrderId: string): Promise<WorkOrder> {
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId }, include: { operations: true } });
  if (!wo) throw new Error("WO tidak ditemukan.");
  assertStatus(wo, "COMPLETED");

  const unfinished = wo.operations.some((op) => op.status !== "COMPLETED" && op.status !== "SKIPPED");
  if (unfinished) throw new Error("Masih ada operation yang belum selesai.");

  const totalOutput = wo.operations.reduce((sum, op) => sum + op.goodQty + op.rejectQty + op.reworkQty + op.scrapQty, 0);
  if (totalOutput <= 0) throw new Error("WO belum punya hasil produksi tercatat — tidak bisa ditutup.");

  return prisma.workOrder.update({ where: { id: workOrderId }, data: { status: "CLOSED", closedAt: new Date() } });
}
