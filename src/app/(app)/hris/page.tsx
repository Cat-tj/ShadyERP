import Link from "next/link";
import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listUsers } from "@/server/services/user-service";
import { listTeamAttendance } from "@/server/services/attendance-service";
import { listUpcomingSchedules } from "@/server/services/schedule-service";
import { Card } from "@/components/ui/card";
import { BarChartIcon, CalendarIcon, FileIcon, MapPinIcon, UsersIcon, WalletIcon } from "@/components/ui/icons";

const HRIS_FEATURES = [
  {
    title: "Database karyawan",
    desc: "Profil, outlet, jabatan, role akses, PIN kasir, dan status aktif.",
    href: "/pengaturan/karyawan",
    status: "Aktif",
    icon: UsersIcon,
  },
  {
    title: "Absensi & lokasi",
    desc: "Clock in/out, foto, riwayat hadir, dan ringkasan tim.",
    href: "/absensi",
    status: "Aktif",
    icon: MapPinIcon,
  },
  {
    title: "Jadwal & shift",
    desc: "Jadwal outlet, shift harian, dan assignment tim.",
    href: "/absensi/tim",
    status: "Aktif",
    icon: CalendarIcon,
  },
  {
    title: "Dokumen HR",
    desc: "Kontrak, SP, surat tugas, upload dokumen, dan tanda tangan digital.",
    href: "/dokumen",
    status: "Aktif",
    icon: FileIcon,
  },
  {
    title: "Payroll sederhana",
    desc: "Basis gaji, lembur, bonus tanggal merah, dan casual per shift.",
    href: null,
    status: "Berikutnya",
    icon: WalletIcon,
  },
  {
    title: "Performa & KPI staf",
    desc: "Target individu, departemen, organisasi, dan progres berkala.",
    href: "/hris/kpi",
    status: "Aktif",
    icon: BarChartIcon,
  },
] as const;

export default async function HrisPage() {
  const user = await requireSession();
  const isManager = user.role === "OWNER" || user.role === "MANAGER";
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((outlet) => outlet.id);

  const [users, attendance, schedules] = isManager
    ? await Promise.all([
        listUsers(user.tenantId),
        listTeamAttendance(user.tenantId, outletIds, 1),
        listUpcomingSchedules(user.tenantId, outletIds),
      ])
    : [[], [], []];

  const activeStaff = users.filter((item) => item.isActive).length;
  const presentToday = new Set(attendance.map((item) => item.userId)).size;
  const scheduledToday = schedules.length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft-sm)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">ALTORA HRIS</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--color-text)]">Pusat HR & kepegawaian</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Satu tempat untuk data karyawan, absensi, jadwal, dokumen HR, approval, dan analitik tim. Dibuat ringan untuk bisnis cabang kecil sampai multi-outlet.
        </p>
      </div>

      {isManager && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Karyawan aktif</p>
            <p className="mt-2 tabular-nums text-3xl font-bold text-[var(--color-text)]">{activeStaff}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Hadir hari ini</p>
            <p className="mt-2 tabular-nums text-3xl font-bold text-[var(--color-text)]">{presentToday}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Jadwal aktif</p>
            <p className="mt-2 tabular-nums text-3xl font-bold text-[var(--color-text)]">{scheduledToday}</p>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {HRIS_FEATURES.map((feature) => {
          const Icon = feature.icon;
          const content = (
            <Card className="flex h-full flex-col p-5 transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[var(--color-bg)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-text-secondary)]">
                  {feature.status}
                </span>
              </div>
              <h2 className="mt-4 text-base font-bold text-[var(--color-text)]">{feature.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{feature.desc}</p>
            </Card>
          );

          return feature.href ? (
            <Link key={feature.title} href={feature.href} className="block h-full">
              {content}
            </Link>
          ) : (
            <div key={feature.title}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
