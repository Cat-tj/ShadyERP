import Link from "next/link";
import { requireSession } from "@/server/require-session";
import { getDashboardSummary } from "@/server/services/dashboard-service";
import { getEnabledModules } from "@/server/services/tenant-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getLowStockProducts } from "@/server/services/inventory-service";
import { formatTanggal } from "@/lib/format";
import { navItemsForHub } from "@/lib/nav";
import { BuildingIcon, BriefcaseIcon, PackageIcon, UsersIcon } from "@/components/ui/icons";
import { LowStockAlert } from "@/components/inventory/low-stock-alert";
import { StatTile } from "@/components/laporan/stat-tile";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { SectionCard } from "@/components/ui/section-card";

const STAT_CARDS = [
  { key: "outletCount", label: "Outlet aktif", icon: BuildingIcon },
  { key: "userCount", label: "Karyawan aktif", icon: BriefcaseIcon },
  { key: "productCount", label: "Produk aktif", icon: PackageIcon },
  { key: "memberCount", label: "Member terdaftar", icon: UsersIcon },
] as const;

export default async function KpiPage() {
  const user = await requireSession();
  const [summary, enabledModules, outlets] = await Promise.all([
    getDashboardSummary(user.tenantId),
    getEnabledModules(user.tenantId),
    listOutletsForUser(user.tenantId, user.id, user.role),
  ]);
  const quickLinks = navItemsForHub(user.role, "kasir", enabledModules).filter((item) => item.href !== "/kpi");

  const firstOutletId = outlets[0]?.id;
  const lowStockItems = firstOutletId
    ? await getLowStockProducts(user.tenantId, firstOutletId)
    : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <EyebrowBadge>{formatTanggal(new Date())}</EyebrowBadge>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          Halo, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Ini ringkasan {summary.tenant?.name ?? "tokomu"} hari ini.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <StatTile key={card.key} label={card.label} value={String(summary[card.key])} icon={card.icon} />
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <SectionCard eyebrow="Perhatian" title={`Stok menipis · ${outlets[0]?.name}`}>
          <LowStockAlert items={lowStockItems} />
        </SectionCard>
      )}

      <SectionCard eyebrow="Pintasan" title="Aksi cepat" description="Menu yang paling sering dipakai.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-[48px] items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium text-[var(--color-text)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
            >
              <item.icon
                aria-hidden
                className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)] transition-colors duration-150 group-hover:text-[var(--color-primary)]"
              />
              {item.label}
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
