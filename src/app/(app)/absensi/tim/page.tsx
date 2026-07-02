import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listUsers } from "@/server/services/user-service";
import { listUpcomingSchedules } from "@/server/services/schedule-service";
import { listTeamAttendance } from "@/server/services/attendance-service";
import { JadwalManager } from "@/components/absensi/jadwal-manager";
import { TimAttendanceList } from "@/components/absensi/tim-attendance-list";

export default async function AbsensiTimPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((o) => o.id);

  const [allUsers, schedules, teamAttendance] = await Promise.all([
    listUsers(user.tenantId),
    listUpcomingSchedules(user.tenantId, outletIds),
    listTeamAttendance(user.tenantId, outletIds),
  ]);

  const staff = allUsers.filter(
    (u) => u.isActive && u.userOutlets.some((uo) => outletIds.includes(uo.outletId))
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Kelola tim</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Atur jadwal kerja dan pantau absensi timmu.</p>
      </div>

      <JadwalManager
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
        outlets={outlets.map((o) => ({ id: o.id, name: o.name }))}
        schedules={schedules.map((s) => ({
          id: s.id,
          userName: s.user.name,
          outletName: s.outlet.name,
          startAt: s.startAt.toISOString(),
          endAt: s.endAt.toISOString(),
        }))}
      />

      <div>
        <h2 className="mb-2 text-base font-bold text-[var(--color-text)]">Riwayat absensi tim (7 hari)</h2>
        <TimAttendanceList
          rows={teamAttendance.map((a) => ({
            id: a.id,
            userName: a.user.name,
            outletName: a.outlet.name,
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
