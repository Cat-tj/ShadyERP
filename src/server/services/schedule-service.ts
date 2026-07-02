import { prisma } from "@/lib/prisma";
import { todayRangeJakarta } from "@/lib/date-range";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function listUpcomingSchedules(tenantId: string, outletIds: string[]) {
  const { start } = todayRangeJakarta();
  return prisma.shiftSchedule.findMany({
    where: { tenantId, outletId: { in: outletIds }, startAt: { gte: start } },
    include: { user: true, outlet: true },
    orderBy: { startAt: "asc" },
    take: 100,
  });
}

export async function getTodayScheduleForUser(tenantId: string, userId: string) {
  const { start, end } = todayRangeJakarta();
  return prisma.shiftSchedule.findFirst({
    where: { tenantId, userId, startAt: { gte: start, lt: end } },
    orderBy: { startAt: "asc" },
  });
}

export type ScheduleInput = {
  userId: string;
  outletId: string;
  startAt: Date;
  endAt: Date;
};

export async function createSchedule(tenantId: string, input: ScheduleInput) {
  if (input.endAt <= input.startAt) {
    throw new Error("Jam selesai harus setelah jam mulai.");
  }
  return prisma.shiftSchedule.create({ data: { tenantId, ...input } });
}

export async function deleteSchedule(tenantId: string, id: string) {
  const schedule = await prisma.shiftSchedule.findFirst({ where: { id, tenantId } });
  if (!schedule) throw new Error("Jadwal tidak ditemukan.");
  return prisma.shiftSchedule.delete({ where: { id } });
}
