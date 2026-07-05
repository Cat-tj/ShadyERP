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
  workType?: "REGULAR" | "OVERTIME" | "CASUAL";
  payType?: "MONTHLY" | "PER_SHIFT";
  shiftPay?: number | null;
  holidayBonus?: number;
  overtimeNote?: string | null;
  note?: string | null;
};

export async function createSchedule(tenantId: string, input: ScheduleInput) {
  if (input.endAt <= input.startAt) {
    throw new Error("Jam selesai harus setelah jam mulai.");
  }
  if (input.shiftPay !== null && input.shiftPay !== undefined && input.shiftPay < 0) {
    throw new Error("Bayaran shift tidak valid.");
  }
  if (input.holidayBonus !== undefined && input.holidayBonus < 0) {
    throw new Error("Bonus tanggal merah tidak valid.");
  }
  return prisma.shiftSchedule.create({
    data: {
      tenantId,
      userId: input.userId,
      outletId: input.outletId,
      startAt: input.startAt,
      endAt: input.endAt,
      workType: input.workType ?? "REGULAR",
      payType: input.payType ?? (input.workType === "CASUAL" ? "PER_SHIFT" : "MONTHLY"),
      shiftPay: input.shiftPay ?? null,
      holidayBonus: input.holidayBonus ?? 0,
      overtimeNote: input.overtimeNote?.trim() || null,
      note: input.note?.trim() || null,
    },
  });
}

export async function deleteSchedule(tenantId: string, id: string) {
  const schedule = await prisma.shiftSchedule.findFirst({ where: { id, tenantId } });
  if (!schedule) throw new Error("Jadwal tidak ditemukan.");
  return prisma.shiftSchedule.delete({ where: { id } });
}
