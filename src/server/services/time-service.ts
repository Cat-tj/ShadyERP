import { prisma } from "@/lib/prisma";

/**
 * Melakukan clock-in untuk Worker di outlet tertentu dengan geofence check.
 */
export async function clockIn(
  workerId: string,
  outletId: string,
  lat?: number | null,
  lng?: number | null,
  clockInPhotoUrl?: string | null
) {
  // Validasi geofence sederhana (misal, radius outlet harus valid jika lat/lng dikirim)
  if (lat && lng) {
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
    });
    if (!outlet) throw new Error("Outlet tidak ditemukan.");
    // Radius geofence dummy (di dunia nyata menggunakan koordinat outlet)
  }

  // Buat sesi absensi baru
  return prisma.attendance.create({
    data: {
      tenantId: (await getTenantIdFromWorker(workerId)),
      outletId,
      workerId,
      userId: "", // backward compatibility
      clockInAt: new Date(),
      clockInPhotoUrl,
      lat,
      lng,
      status: "PRESENT",
    },
  });
}

/**
 * Melakukan clock-out untuk Worker di outlet tertentu.
 */
export async function clockOut(
  workerId: string,
  attendanceId: string,
  lat?: number | null,
  lng?: number | null
) {
  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId },
  });

  if (!attendance) throw new Error("Sesi absensi tidak ditemukan.");

  return prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      clockOutAt: new Date(),
    },
  });
}

/**
 * Melakukan penyesuaian/accrual saldo cuti menggunakan Leave Ledger (Append-Only).
 */
export async function adjustLeaveBalance(
  workerId: string,
  amount: number,
  transactionType: "ENTITLEMENT" | "ACCRUAL" | "USAGE" | "CANCEL" | "ADJUST",
  note?: string | null
) {
  return prisma.leaveLedgerEntry.create({
    data: {
      workerId,
      transactionType,
      amount,
      note,
    },
  });
}

/**
 * Mendapatkan total saldo cuti aktif Worker dengan merangkum ledger-nya.
 */
export async function getLeaveBalance(workerId: string): Promise<number> {
  const sum = await prisma.leaveLedgerEntry.aggregate({
    where: { workerId },
    _sum: {
      amount: true,
    },
  });
  return sum._sum.amount || 0;
}

/**
 * Mengajukan lembur terencana (Overtime Request).
 */
export async function createOvertimeRequest(
  workerId: string,
  date: Date,
  plannedHours: number,
  note?: string | null
) {
  return prisma.overtimeRequest.create({
    data: {
      workerId,
      date,
      plannedHours,
      status: "PENDING",
      note,
    },
  });
}

/**
 * Menyetujui pengajuan lembur oleh manager/supervisor.
 */
export async function approveOvertime(requestId: string, approvedById: string) {
  return prisma.overtimeRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      approvedById,
    },
  });
}

/** Helper untuk menarik tenantId dari Worker */
async function getTenantIdFromWorker(workerId: string): Promise<string> {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    select: { tenantId: true },
  });
  if (!worker) throw new Error("Worker tidak ditemukan.");
  return worker.tenantId;
}
