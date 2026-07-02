import { requireSession } from "@/server/require-session";
import { getDashboardSummary } from "@/server/services/dashboard-service";
import { formatTanggal } from "@/lib/format";

const STAT_CARDS = [
  { key: "outletCount", label: "Outlet aktif", icon: "🏬" },
  { key: "userCount", label: "Karyawan aktif", icon: "🧑‍💼" },
  { key: "productCount", label: "Produk aktif", icon: "📦" },
  { key: "memberCount", label: "Member terdaftar", icon: "👥" },
] as const;

export default async function DashboardPage() {
  const user = await requireSession();
  const summary = await getDashboardSummary(user.tenantId);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">{formatTanggal(new Date())}</p>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Halo, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ini ringkasan {summary.tenant?.name ?? "tokomu"} hari ini.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-bg)] text-lg">
              {card.icon}
            </div>
            <p className="mt-3 tabular-nums text-2xl font-bold text-[var(--color-text)]">
              {summary[card.key]}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-base font-bold text-[var(--color-text)]">Mulai berjualan</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Layar kasir, laporan omzet, dan kartu member akan hadir di tahap berikutnya. Untuk
          sekarang, coba jelajahi menu di samping atau di bawah layar.
        </p>
      </div>
    </div>
  );
}
