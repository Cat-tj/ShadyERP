import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/server/require-session";

export const KPI_SCOPES = ["INDIVIDUAL", "DEPARTMENT", "ORGANIZATION"] as const;
export type KpiScope = (typeof KPI_SCOPES)[number];

export type KpiGoalInput = {
  title: string;
  weight: number;
  targetValue: number;
  scope: KpiScope;
  workerId?: string;
  department?: string;
};

type ManagerContext = {
  workerId: string;
  department: string | null;
  managedWorkerIds: string[];
};

function isCdImm(department: string | null) {
  return department?.trim().toUpperCase() === "CD IMM";
}

async function getManagerContext(user: SessionUser): Promise<ManagerContext | null> {
  const manager = await prisma.worker.findFirst({
    where: { tenantId: user.tenantId, isActive: true, person: { email: user.email } },
    include: {
      assignments: {
        where: { endDate: null },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  if (!manager) return null;

  const managedWorkers = await prisma.assignment.findMany({
    where: { managerId: manager.id, endDate: null, worker: { tenantId: user.tenantId, isActive: true } },
    select: { workerId: true },
  });

  return {
    workerId: manager.id,
    department: manager.assignments[0]?.department ?? null,
    managedWorkerIds: managedWorkers.map((assignment) => assignment.workerId),
  };
}

async function getOwnWorkerId(user: SessionUser) {
  const worker = await prisma.worker.findFirst({
    where: { tenantId: user.tenantId, isActive: true, person: { email: user.email } },
    select: { id: true },
  });
  return worker?.id ?? null;
}

async function getVisibilityWhere(user: SessionUser) {
  if (user.role === "OWNER") return { tenantId: user.tenantId };

  if (user.role === "STAFF") {
    const workerId = await getOwnWorkerId(user);
    return { tenantId: user.tenantId, workerId: workerId ?? "__no_worker__", scope: "INDIVIDUAL" };
  }

  const manager = await getManagerContext(user);
  if (!manager) return { tenantId: user.tenantId, id: "__no_manager_worker__" };

  const individualWorkerIds = [...new Set([manager.workerId, ...manager.managedWorkerIds])];
  const scopes: Array<Record<string, unknown>> = [
    { scope: "INDIVIDUAL", workerId: { in: individualWorkerIds } },
  ];

  if (manager.department) scopes.push({ scope: "DEPARTMENT", department: manager.department });
  if (isCdImm(manager.department)) scopes.push({ scope: "ORGANIZATION" });

  return { tenantId: user.tenantId, OR: scopes };
}

/**
 * Read scope is resolved on the server. CD IMM managers receive their own
 * department targets plus organization targets; other managers do not.
 */
export async function listVisibleKpiGoals(user: SessionUser) {
  return prisma.kpiGoal.findMany({
    where: await getVisibilityWhere(user),
    include: {
      worker: { include: { person: { select: { name: true } } } },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export async function listKpiAssignees(user: SessionUser) {
  if (user.role === "OWNER") {
    return prisma.worker.findMany({
      where: { tenantId: user.tenantId, isActive: true },
      include: { person: { select: { name: true } }, assignments: { where: { endDate: null }, orderBy: { startDate: "desc" }, take: 1 } },
      orderBy: { employeeNumber: "asc" },
    });
  }

  if (user.role !== "MANAGER") return [];
  const manager = await getManagerContext(user);
  if (!manager) return [];

  return prisma.worker.findMany({
    where: { tenantId: user.tenantId, id: { in: manager.managedWorkerIds }, isActive: true },
    include: { person: { select: { name: true } }, assignments: { where: { endDate: null }, orderBy: { startDate: "desc" }, take: 1 } },
    orderBy: { employeeNumber: "asc" },
  });
}

async function assertCanManageInput(user: SessionUser, input: KpiGoalInput) {
  if (user.role === "OWNER") return;
  if (user.role !== "MANAGER") throw new Error("Anda tidak memiliki akses untuk mengelola KPI.");

  const manager = await getManagerContext(user);
  if (!manager) throw new Error("Profil Worker untuk manager belum terhubung. Lengkapi data karyawan terlebih dahulu.");

  if (input.scope === "ORGANIZATION" && !isCdImm(manager.department)) {
    throw new Error("Target organisasi hanya dapat dibuat oleh manager departemen CD IMM atau Owner.");
  }

  if (input.scope === "DEPARTMENT" && input.department !== manager.department) {
    throw new Error("Manager hanya dapat membuat target untuk departemennya sendiri.");
  }

  if (input.scope === "INDIVIDUAL" && (!input.workerId || !manager.managedWorkerIds.includes(input.workerId))) {
    throw new Error("Manager hanya dapat membuat KPI untuk anggota tim langsungnya.");
  }
}

export async function createKpiGoal(user: SessionUser, input: KpiGoalInput) {
  await assertCanManageInput(user, input);

  if (input.scope === "INDIVIDUAL" && !input.workerId) throw new Error("Pilih karyawan untuk KPI individu.");
  if (input.scope === "DEPARTMENT" && !input.department?.trim()) throw new Error("Pilih departemen untuk target departemen.");

  if (input.scope === "INDIVIDUAL") {
    const worker = await prisma.worker.findFirst({
      where: { id: input.workerId, tenantId: user.tenantId, isActive: true },
      select: { id: true },
    });
    if (!worker) throw new Error("Karyawan KPI tidak ditemukan pada tenant ini.");
  }

  return prisma.kpiGoal.create({
    data: {
      tenantId: user.tenantId,
      title: input.title.trim(),
      weight: input.weight,
      targetValue: input.targetValue,
      scope: input.scope,
      workerId: input.scope === "INDIVIDUAL" ? input.workerId : null,
      department: input.scope === "DEPARTMENT" ? input.department?.trim() : null,
      status: "ACTIVE",
    },
  });
}

export async function updateVisibleKpiProgress(user: SessionUser, goalId: string, actualValue: number) {
  const goal = await prisma.kpiGoal.findFirst({ where: { ...(await getVisibilityWhere(user)), id: goalId } });
  if (!goal) throw new Error("KPI tidak ditemukan atau Anda tidak memiliki akses.");

  const status = actualValue >= goal.targetValue ? "ACHIEVED" : "ACTIVE";
  return prisma.kpiGoal.update({ where: { id: goalId }, data: { actualValue, status } });
}
