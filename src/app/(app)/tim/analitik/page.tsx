import { requireRole } from "@/server/require-session";
import {
  getAttendanceTrends,
  getTeamPerformance,
  getStaffComparison,
  getPayrollSummary,
} from "@/server/services/hr-analytics-service";
import { StatTile } from "@/components/laporan/stat-tile";
import { RankingBarChart } from "@/components/laporan/ranking-bar-chart";
import { formatRupiah } from "@/lib/format";
import { UsersIcon, MapPinIcon, WalletIcon, TrendingUpIcon } from "@/components/ui/icons";

export default async function TimAnalitikPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [attendanceTrends, teamPerformance, staffComparison, payroll] = await Promise.all([
    getAttendanceTrends(user.tenantId, 30),
    getTeamPerformance(user.tenantId),
    getStaffComparison(user.tenantId, undefined, 30),
    getPayrollSummary(user.tenantId),
  ]);

  const avgPunctuality =
    attendanceTrends.length > 0
      ? Math.round(attendanceTrends.reduce((sum, a) => sum + (a?.punctuality ?? 0), 0) / attendanceTrends.length)
      : 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Analitik Tim</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Kedisiplinan, performa, dan estimasi gaji 30 hari terakhir.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Karyawan aktif" value={String(teamPerformance.length)} icon={UsersIcon} />
        <StatTile label="Rata-rata ketepatan waktu" value={`${avgPunctuality}%`} icon={MapPinIcon} />
        <StatTile label="Estimasi payroll bulan ini" value={formatRupiah(payroll.totalPayroll)} icon={WalletIcon} />
        <StatTile
          label="Top performer"
          value={staffComparison[0]?.staffName ?? "-"}
          icon={TrendingUpIcon}
        />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Ketepatan waktu absen</h2>
        <div className="flex flex-col gap-3">
          {attendanceTrends.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">Belum ada data absensi.</p>
          ) : (
            attendanceTrends.map((a) => (
              <div key={a!.userId}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-[var(--color-text)]">{a!.userName}</span>
                  <span className="tabular-nums text-[var(--color-text-secondary)]">
                    {a!.onTime} tepat waktu · {a!.late} telat
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg)]">
                  <div
                    className={`h-full rounded-full ${a!.punctuality >= 80 ? "bg-green-500" : a!.punctuality >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${Math.max(2, a!.punctuality)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Kontribusi omzet per karyawan</h2>
        <RankingBarChart
          items={staffComparison
            .filter((s) => s.totalRevenue > 0)
            .map((s) => ({
              label: s.staffName,
              value: s.totalRevenue,
              sublabel: `${s.transactionCount} transaksi · rata-rata ${formatRupiah(s.avgTransaction)}`,
            }))}
        />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--color-text)]">Estimasi payroll — {payroll.period}</h2>
          <span className="text-xs text-[var(--color-text-secondary)]">Estimasi sederhana, bukan slip gaji resmi</span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {payroll.employees.map((emp) => (
            <div key={emp.userId} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-[var(--color-text)]">{emp.userName}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{emp.workingDays} hari kerja</p>
              </div>
              <p className="tabular-nums font-semibold text-[var(--color-text)]">{formatRupiah(emp.netSalary)}</p>
            </div>
          ))}
          {payroll.employees.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">Belum ada data kehadiran bulan ini.</p>
          )}
        </div>
      </div>
    </div>
  );
}
