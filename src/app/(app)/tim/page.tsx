import Link from "next/link";
import { requireSession } from "@/server/require-session";
import { listOutletsForUser, listAllOutlets } from "@/server/services/outlet-service";
import { listUsers } from "@/server/services/user-service";
import { getTodayAttendance, listTeamAttendance } from "@/server/services/attendance-service";
import { getTodayScheduleForUser, listUpcomingSchedules } from "@/server/services/schedule-service";
import { formatTanggal, formatJam } from "@/lib/format";
import { MapPinIcon, UsersIcon, CalendarIcon } from "@/components/ui/icons";
import { StatTile } from "@/components/laporan/stat-tile";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { SectionCard } from "@/components/ui/section-card";

export default async function TimHomePage() {
  const user = await requireSession();
  const isManager = user.role === "OWNER" || user.role === "MANAGER";

  const [attendance, schedule, outlets] = await Promise.all([
    getTodayAttendance(user.tenantId, user.id),
    getTodayScheduleForUser(user.tenantId, user.id),
    listOutletsForUser(user.tenantId, user.id, user.role),
  ]);

  let teamStats: { totalStaff: number; hadirHariIni: number; jadwalHariIni: number } | null = null;
  if (isManager) {
    const [allOutlets, allUsers, todayAttendance, upcoming] = await Promise.all([
      listAllOutlets(user.tenantId),
      listUsers(user.tenantId),
      listTeamAttendance(
        user.tenantId,
        outlets.map((o) => o.id),
        1
      ),
      listUpcomingSchedules(user.tenantId, outlets.map((o) => o.id)),
    ]);
    const uniquePresentToday = new Set(todayAttendance.map((a) => a.userId));
    teamStats = {
      totalStaff: allUsers.filter((u) => u.isActive).length,
      hadirHariIni: uniquePresentToday.size,
      jadwalHariIni: upcoming.length,
    };
    void allOutlets;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <EyebrowBadge>{formatTanggal(new Date())}</EyebrowBadge>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          Halo, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Ringkasan tim & absensi hari ini.</p>
      </div>

      {teamStats && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile label="Karyawan aktif" value={String(teamStats.totalStaff)} icon={UsersIcon} />
          <StatTile label="Hadir hari ini" value={String(teamStats.hadirHariIni)} icon={MapPinIcon} />
          <StatTile label="Jadwal hari ini" value={String(teamStats.jadwalHariIni)} icon={CalendarIcon} />
        </div>
      )}

      <SectionCard eyebrow="Hari ini" title="Status kamu hari ini">
        <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
          <p>
            Absen masuk:{" "}
            <span className="font-medium text-[var(--color-text)]">
              {attendance?.clockInAt ? formatJam(attendance.clockInAt) : "Belum absen"}
            </span>
          </p>
          <p>
            Absen keluar:{" "}
            <span className="font-medium text-[var(--color-text)]">
              {attendance?.clockOutAt ? formatJam(attendance.clockOutAt) : "-"}
            </span>
          </p>
          {schedule && (
            <p>
              Jadwal hari ini:{" "}
              <span className="font-medium text-[var(--color-text)]">
                {formatJam(schedule.startAt)} - {formatJam(schedule.endAt)}
              </span>
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/absensi"
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] transition-colors duration-150 hover:bg-[var(--color-primary-dark)]"
          >
            Buka Absensi
          </Link>
          {isManager && (
            <Link
              href="/absensi/tim"
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Kelola Tim
            </Link>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
