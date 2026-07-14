"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createWorkOrder,
  submitForApproval,
  approveWorkOrder,
  cancelWorkOrder,
  reserveMaterials,
  scheduleWorkOrder,
  releaseWorkOrder,
  startOperation,
  pauseOperation,
  resumeOperation,
  recordOutput,
  completeOperation,
  markWorkOrderCompleted,
  closeWorkOrder,
  type RecordOutputInput,
} from "@/server/services/work-order-service";
import { createWorkCenter } from "@/server/services/routing-service";
import { createBomVersion, activateBomVersion, type BomItemInput } from "@/server/services/bom-service";
import { createRoutingVersion, activateRoutingVersion, type RoutingStepInput } from "@/server/services/routing-service";
import { ensureDefaultWarehouses } from "@/server/services/warehouse-service";

async function requireSessionUser() {
  const session = await auth();
  if (!session?.user?.tenantId || !session.user.id) {
    throw new Error("Unauthorized");
  }
  return { tenantId: session.user.tenantId, userId: session.user.id, role: session.user.role };
}

function isPlanner(role: string) {
  return role === "OWNER" || role === "MANAGER";
}

export async function createWorkOrderAction(
  outletId: string,
  productId: string,
  bomVersionId: string,
  routingVersionId: string,
  targetQty: number,
  note?: string
) {
  try {
    const { tenantId, userId, role } = await requireSessionUser();
    if (!isPlanner(role)) return { error: "Cuma Owner/Manager yang bisa membuat Work Order." };

    await ensureDefaultWarehouses(tenantId, outletId);
    const wo = await createWorkOrder(tenantId, outletId, productId, bomVersionId, routingVersionId, targetQty, userId, { note });
    return { data: wo };
  } catch (err) {
    console.error("Error creating work order:", err);
    return { error: err instanceof Error ? err.message : "Gagal membuat Work Order." };
  }
}

export async function submitForApprovalAction(workOrderId: string) {
  try {
    const { tenantId } = await requireSessionUser();
    const wo = await submitForApproval(tenantId, workOrderId);
    return { data: wo };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal mengajukan persetujuan." };
  }
}

export async function approveWorkOrderAction(workOrderId: string) {
  try {
    const { tenantId, userId, role } = await requireSessionUser();
    if (!isPlanner(role)) return { error: "Cuma Owner/Manager yang bisa menyetujui Work Order." };
    const wo = await approveWorkOrder(tenantId, workOrderId, userId);
    return { data: wo };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal menyetujui Work Order." };
  }
}

export async function cancelWorkOrderAction(workOrderId: string) {
  try {
    const { tenantId, role } = await requireSessionUser();
    if (!isPlanner(role)) return { error: "Cuma Owner/Manager yang bisa membatalkan Work Order." };
    const wo = await cancelWorkOrder(tenantId, workOrderId);
    return { data: wo };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal membatalkan Work Order." };
  }
}

export async function reserveMaterialsAction(workOrderId: string) {
  try {
    const { tenantId } = await requireSessionUser();
    const result = await reserveMaterials(tenantId, workOrderId);
    const ingredients = await prisma.product.findMany({
      where: { tenantId, id: { in: result.availability.map((a) => a.ingredientId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(ingredients.map((i) => [i.id, i.name]));
    return {
      data: {
        status: result.status,
        availability: result.availability.map((a) => ({ ...a, ingredientName: nameById.get(a.ingredientId) ?? a.ingredientId })),
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal mengecek ketersediaan bahan." };
  }
}

export async function scheduleWorkOrderAction(workOrderId: string) {
  try {
    const { tenantId } = await requireSessionUser();
    const wo = await scheduleWorkOrder(tenantId, workOrderId);
    return { data: wo };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal menjadwalkan Work Order." };
  }
}

export async function releaseWorkOrderAction(workOrderId: string) {
  try {
    const { tenantId, userId } = await requireSessionUser();
    const wo = await releaseWorkOrder(tenantId, workOrderId, userId);
    return { data: wo };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal merilis Work Order." };
  }
}

export async function startOperationAction(operationId: string) {
  try {
    const { tenantId } = await requireSessionUser();
    const op = await startOperation(tenantId, operationId);
    return { data: op };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal memulai proses." };
  }
}

export async function pauseOperationAction(operationId: string) {
  try {
    const { tenantId } = await requireSessionUser();
    const op = await pauseOperation(tenantId, operationId);
    return { data: op };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal menjeda proses." };
  }
}

export async function resumeOperationAction(operationId: string) {
  try {
    const { tenantId } = await requireSessionUser();
    const op = await resumeOperation(tenantId, operationId);
    return { data: op };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal melanjutkan proses." };
  }
}

export async function recordOutputAction(operationId: string, input: RecordOutputInput) {
  try {
    const { tenantId, userId } = await requireSessionUser();
    const op = await recordOutput(tenantId, operationId, userId, input);
    return { data: op };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal mencatat hasil produksi." };
  }
}

export async function completeOperationAction(operationId: string) {
  try {
    const { tenantId } = await requireSessionUser();
    const wo = await completeOperation(tenantId, operationId);
    return { data: wo };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal menyelesaikan proses." };
  }
}

export async function markWorkOrderCompletedAction(workOrderId: string) {
  try {
    const { tenantId } = await requireSessionUser();
    const wo = await markWorkOrderCompleted(tenantId, workOrderId);
    return { data: wo };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal menandai Work Order selesai." };
  }
}

export async function closeWorkOrderAction(workOrderId: string) {
  try {
    const { tenantId, role } = await requireSessionUser();
    if (!isPlanner(role)) return { error: "Cuma Owner/Manager yang bisa menutup Work Order." };
    const wo = await closeWorkOrder(tenantId, workOrderId);
    return { data: wo };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal menutup Work Order." };
  }
}

// ---------- Master data: Work Center / BOM / Routing ----------

export async function createWorkCenterAction(outletId: string, name: string, equipmentId?: string | null) {
  try {
    const { tenantId, role } = await requireSessionUser();
    if (!isPlanner(role)) return { error: "Cuma Owner/Manager yang bisa mengatur data produksi." };
    const wc = await createWorkCenter(tenantId, outletId, name, equipmentId);
    return { data: wc };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal membuat pusat kerja." };
  }
}

export async function createBomVersionAction(productId: string, outputQty: number, items: BomItemInput[], note?: string) {
  try {
    const { tenantId, role } = await requireSessionUser();
    if (!isPlanner(role)) return { error: "Cuma Owner/Manager yang bisa mengatur resep produksi (BOM)." };
    const bom = await createBomVersion(tenantId, productId, outputQty, items, note);
    return { data: bom };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal membuat BOM." };
  }
}

export async function activateBomVersionAction(bomVersionId: string) {
  try {
    const { tenantId, role } = await requireSessionUser();
    if (!isPlanner(role)) return { error: "Cuma Owner/Manager yang bisa mengaktifkan BOM." };
    const bom = await activateBomVersion(tenantId, bomVersionId);
    return { data: bom };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal mengaktifkan BOM." };
  }
}

export async function createRoutingVersionAction(productId: string, steps: RoutingStepInput[], note?: string) {
  try {
    const { tenantId, role } = await requireSessionUser();
    if (!isPlanner(role)) return { error: "Cuma Owner/Manager yang bisa mengatur alur proses (routing)." };
    const routing = await createRoutingVersion(tenantId, productId, steps, note);
    return { data: routing };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal membuat routing." };
  }
}

export async function activateRoutingVersionAction(routingVersionId: string) {
  try {
    const { tenantId, role } = await requireSessionUser();
    if (!isPlanner(role)) return { error: "Cuma Owner/Manager yang bisa mengaktifkan routing." };
    const routing = await activateRoutingVersion(tenantId, routingVersionId);
    return { data: routing };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal mengaktifkan routing." };
  }
}
