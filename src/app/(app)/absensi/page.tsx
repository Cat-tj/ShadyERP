import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getTodayAttendance, listRecentAttendance } from "@/server/services/attendance-service";
import { getTodayScheduleForUser } from "@/server/services/schedule-service";
import { ClockWidget } from "@/components/absensi/clock-widget";
import { RiwayatAbsensi } from "@/components/absensi/riwayat-absensi";
import { formatJam } from "@/lib/format";

export default async function AbsensiPage() {
  const user = await requireSession();

  const [outlets, attendance, recent, schedule] = await Promise.all([
    listOutletsForUser(user.tenantId, user.id, user.role),
    getTodayAttendance(user.tenantId, user.id),
    listRecentAttendance(user.tenantId, user.id),
    getTodayScheduleForUser(user.tenantId, user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Absensi</h1>
        {(user.role === "OWNER" || user.role === "MANAGER") && (
          <a
            href="/absensi/tim"
            className="min-h-[40px] rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] flex items-center hover:bg-[var(--color-surface)]"
          >
            Kelola tim
          </a>
        )}
      </div>

      <ClockWidget
        outlets={outlets.map((o) => ({ id: o.id, name: o.name }))}
        attendance={
          attendance
            ? {
                clockInAt: attendance.clockInAt?.toISOString() ?? null,
                clockOutAt: attendance.clockOutAt?.toISOString() ?? null,
                status: attendance.status,
                clockInPhotoUrl: attendance.clockInPhotoUrl,
              }
            : null
        }
        scheduleLabel={schedule ? `${formatJam(schedule.startAt)} - ${formatJam(schedule.endAt)}` : null}
      />

      <div>
        <h2 className="mb-2 text-base font-bold text-[var(--color-text)]">Riwayat 7 hari terakhir</h2>
        <RiwayatAbsensi
          rows={recent.map((a) => ({
            id: a.id,
            createdAt: a.createdAt.toISOString(),
            clockInAt: a.clockInAt?.toISOString() ?? null,
            clockOutAt: a.clockOutAt?.toISOString() ?? null,
            status: a.status,
          }))}
        />
      </div>
    </div>
  );
}
