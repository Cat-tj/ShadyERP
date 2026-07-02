import { prisma } from "@/lib/prisma";
import { todayRangeJakarta, daysAgoRangeJakarta } from "@/lib/date-range";
import { getTodayScheduleForUser } from "@/server/services/schedule-service";

const LATE_GRACE_MINUTES = 15;

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function getTodayAttendance(tenantId: string, userId: string) {
  const { start, end } = todayRangeJakarta();
  return prisma.attendance.findFirst({
    where: { tenantId, userId, createdAt: { gte: start, lt: end } },
  });
}

export async function listRecentAttendance(tenantId: string, userId: string, days = 7) {
  const { start, end } = daysAgoRangeJakarta(days);
  return prisma.attendance.findMany({
    where: { tenantId, userId, createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listTeamAttendance(tenantId: string, outletIds: string[], days = 7) {
  const { start, end } = daysAgoRangeJakarta(days);
  return prisma.attendance.findMany({
    where: { tenantId, outletId: { in: outletIds }, createdAt: { gte: start, lt: end } },
    include: { user: true, outlet: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function clockIn(input: {
  tenantId: string;
  userId: string;
  outletId: string;
  photoUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
}) {
  const existing = await getTodayAttendance(input.tenantId, input.userId);
  if (existing) {
    throw new Error("Kamu sudah absen masuk hari ini.");
  }

  const now = new Date();
  const schedule = await getTodayScheduleForUser(input.tenantId, input.userId);
  let status: "PRESENT" | "LATE" = "PRESENT";
  if (schedule) {
    const graceMs = LATE_GRACE_MINUTES * 60 * 1000;
    if (now.getTime() > schedule.startAt.getTime() + graceMs) {
      status = "LATE";
    }
  }

  return prisma.attendance.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      outletId: input.outletId,
      clockInAt: now,
      clockInPhotoUrl: input.photoUrl ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      status,
    },
  });
}

export async function clockOut(tenantId: string, userId: string) {
  const attendance = await getTodayAttendance(tenantId, userId);
  if (!attendance) {
    throw new Error("Kamu belum absen masuk hari ini.");
  }
  if (attendance.clockOutAt) {
    throw new Error("Kamu sudah absen pulang hari ini.");
  }
  return prisma.attendance.update({
    where: { id: attendance.id },
    data: { clockOutAt: new Date() },
  });
}
