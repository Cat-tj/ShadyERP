import Link from "next/link";
import { requireSession } from "@/server/require-session";
import { getDashboardSummary } from "@/server/services/dashboard-service";
import { formatTanggal } from "@/lib/format";
import { GlassPanel } from "@/components/ui/glass-panel";
import { navItemsForRole } from "@/lib/nav";

const STAT_CARDS = [
  { key: "outletCount", label: "Outlet aktif", icon: "🏬" },
  { key: "userCount", label: "Karyawan aktif", icon: "🧑‍💼" },
  { key: "productCount", label: "Produk aktif", icon: "📦" },
  { key: "memberCount", label: "Member terdaftar", icon: "👥" },
] as const;

export default async function DashboardPage() {
  const user = await requireSession();
  const summary = await getDashboardSummary(user.tenantId);
  const quickLinks = navItemsForRole(user.role).filter((item) => item.href !== "/dashboard");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">{formatTanggal(new Date())}</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          Halo, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ini ringkasan {summary.tenant?.name ?? "tokomu"} hari ini.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <GlassPanel key={card.key} className="rounded-xl p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/50 text-lg">
              {card.icon}
            </div>
            <p className="mt-3 font-mono-data tabular-nums text-2xl font-semibold text-[var(--color-text)]">
              {summary[card.key]}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
          </GlassPanel>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-base font-semibold text-[var(--color-text)]">Aksi cepat</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pintasan ke menu yang paling sering dipakai.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[48px] items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium text-[var(--color-text)] transition-colors duration-150 hover:bg-[var(--color-bg)]"
            >
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
