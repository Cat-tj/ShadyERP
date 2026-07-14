import { prisma } from "@/lib/prisma";
import { createWorker } from "./worker-service";

/**
 * Membuat requisisi lowongan baru (ATS).
 */
export async function createJobRequisition(params: {
  tenantId: string;
  title: string;
  department?: string | null;
  budgetSalary: number;
}) {
  return prisma.jobRequisition.create({
    data: {
      tenantId: params.tenantId,
      title: params.title,
      department: params.department,
      budgetSalary: params.budgetSalary,
      status: "OPEN",
    },
  });
}

/**
 * Mencatat kandidat pelamar kerja baru (ATS).
 */
export async function submitCandidate(params: {
  tenantId: string;
  name: string;
  email: string;
  phone?: string | null;
  requisitionId: string;
}) {
  return prisma.candidate.create({
    data: {
      tenantId: params.tenantId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      requisitionId: params.requisitionId,
      status: "APPLIED",
    },
  });
}

/**
 * Mengonversi kandidat menjadi karyawan baru (Hired).
 * Secara otomatis membuat data Person & Worker (Menyambungkan ATS ke Core HRIS).
 */
export async function hireCandidate(params: {
  candidateId: string;
  employeeNumber: string;
  workerType: string;
  baseRate: number;
  salaryBasis: string;
}) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: params.candidateId },
  });

  if (!candidate) throw new Error("Kandidat tidak ditemukan.");

  return prisma.$transaction(async (tx) => {
    // 1. Update status kandidat menjadi HIRED
    await tx.candidate.update({
      where: { id: params.candidateId },
      data: { status: "HIRED" },
    });

    // 2. Buat data Person & Worker melalui service existing (worker-service)
    return createWorker(
      candidate.tenantId,
      params.employeeNumber,
      params.workerType as any,
      {
        name: candidate.name,
        preferredName: candidate.name.split(" ")[0],
        email: candidate.email,
        phone: candidate.phone,
      },
      {
        startDate: new Date(),
        status: "ACTIVE",
      },
      {
        startDate: new Date(),
      },
      {
        startDate: new Date(),
        salaryBasis: params.salaryBasis as any,
        baseRate: params.baseRate,
      }
    );
  });
}

/**
 * Memperbarui progres target kerja pekerja (KPI/OKR).
 */
export async function updateKpiProgress(goalId: string, actualValue: number) {
  const goal = await prisma.kpiGoal.findUnique({
    where: { id: goalId },
  });

  if (!goal) throw new Error("Target KPI tidak ditemukan.");

  const isAchieved = actualValue >= goal.targetValue;

  return prisma.kpiGoal.update({
    where: { id: goalId },
    data: {
      actualValue,
      status: isAchieved ? "ACHIEVED" : "ACTIVE",
    },
  });
}

/**
 * Enterprise Audit Logs (Immutability).
 * Mencatat log aktivitas perubahan data kritis HRIS.
 */
export async function logHrisAudit(params: {
  tenantId: string;
  actorId: string;
  action: string;
  details: string;
  ipAddress?: string | null;
}) {
  return prisma.hrisAuditLog.create({
    data: {
      tenantId: params.tenantId,
      actorId: params.actorId,
      action: params.action,
      details: params.details,
      ipAddress: params.ipAddress,
    },
  });
}
