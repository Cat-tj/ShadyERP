import { prisma } from "@/lib/prisma";

export type PersonInput = {
  name: string;
  preferredName?: string | null;
  birthPlace?: string | null;
  birthDate?: Date | null;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankHolder?: string | null;
  nik?: string | null;
  npwp?: string | null;
  taxStatus?: string | null;
};

export type EmploymentInput = {
  startDate: Date;
  endDate?: Date | null;
  status: "ACTIVE" | "SUSPENDED" | "TERMINATED" | "LEAVE";
  probationEnd?: Date | null;
  note?: string | null;
};

export type AssignmentInput = {
  startDate: Date;
  endDate?: Date | null;
  position?: string | null;
  department?: string | null;
  outletId?: string | null;
  managerId?: string | null;
  costCenter?: string | null;
  shiftGroup?: string | null;
};

export type CompensationInput = {
  startDate: Date;
  endDate?: Date | null;
  grade?: string | null;
  salaryBasis: "MONTHLY" | "DAILY" | "HOURLY" | "PIECE_RATE";
  baseRate: number;
  bpjsKesActive?: boolean;
  bpjsTkActive?: boolean;
};

/**
 * Mendaftarkan Tenaga Kerja baru (Worker) lengkap dengan Person, Employment, Assignment, dan Kompensasi awal.
 */
export async function createWorker(
  tenantId: string,
  employeeNumber: string,
  workerType: "EMPLOYEE" | "CONTRACTOR" | "INTERN" | "OUTSOURCED",
  personInput: PersonInput,
  employmentInput: EmploymentInput,
  assignmentInput: AssignmentInput,
  compensationInput: CompensationInput
) {
  // Cek apakah employee number sudah terpakai di tenant ini
  const existingWorker = await prisma.worker.findFirst({
    where: {
      tenantId,
      employeeNumber,
    },
  });

  if (existingWorker) {
    throw new Error(`Employee number "${employeeNumber}" sudah digunakan di unit usaha ini.`);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Buat data Person
    const person = await tx.person.create({
      data: {
        ...personInput,
      },
    });

    // 2. Buat data Worker
    const worker = await tx.worker.create({
      data: {
        tenantId,
        personId: person.id,
        employeeNumber,
        workerType,
        isActive: true,
      },
    });

    // 3. Buat Kontrak Employment awal
    await tx.employment.create({
      data: {
        workerId: worker.id,
        ...employmentInput,
      },
    });

    // 4. Buat Penugasan Assignment awal
    await tx.assignment.create({
      data: {
        workerId: worker.id,
        ...assignmentInput,
      },
    });

    // 5. Buat Profil Kompensasi awal
    await tx.compensationProfile.create({
      data: {
        workerId: worker.id,
        ...compensationInput,
      },
    });

    return worker;
  });
}

/**
 * Melakukan mutasi jabatan / update penugasan baru dengan sistem berversi tanggal (Effective Dating).
 */
export async function updateWorkerAssignment(
  workerId: string,
  newAssignment: Omit<AssignmentInput, "startDate">,
  effectiveDate: Date
) {
  return prisma.$transaction(async (tx) => {
    // 1. Cari assignment aktif terakhir
    const activeAssignment = await tx.assignment.findFirst({
      where: {
        workerId,
        endDate: null,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    if (activeAssignment) {
      // Jika effective date mutasi baru tabrakan / sebelum start date assignment lama
      if (effectiveDate <= activeAssignment.startDate) {
        throw new Error("Tanggal berlaku penugasan baru harus setelah tanggal penugasan aktif saat ini.");
      }

      // 2. Update assignment lama agar berakhir tepat 1 detik sebelum effective date baru
      const dayBefore = new Date(effectiveDate.getTime() - 1000);
      await tx.assignment.update({
        where: { id: activeAssignment.id },
        data: { endDate: dayBefore },
      });
    }

    // 3. Buat assignment baru yang aktif sejak effective date
    return tx.assignment.create({
      data: {
        workerId,
        startDate: effectiveDate,
        ...newAssignment,
      },
    });
  });
}

/**
 * Mengambil rekap profil lengkap 360 karyawan.
 */
export async function getWorker360View(workerId: string) {
  return prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      person: true,
      employments: {
        orderBy: { startDate: "desc" },
      },
      assignments: {
        orderBy: { startDate: "desc" },
        include: { outlet: true },
      },
      compensations: {
        orderBy: { startDate: "desc" },
      },
    },
  });
}
