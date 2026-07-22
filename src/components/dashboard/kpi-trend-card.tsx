import type { ComponentType, SVGProps } from "react";
import { TrendingUpIcon, TrendingDownIcon } from "@/components/ui/icons";

export function KpiTrendCard({
  label,
  value,
  icon: Icon,
  trendPercent,
  trendContext = "vs kemarin",
}: {
  label: string;
  value: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** null/undefined kalau periode pembanding tidak punya data untuk dibandingkan. */
  trendPercent?: number | null;
  trendContext?: string;
}) {
  const hasTrend = trendPercent != null && Number.isFinite(trendPercent);
  const isPositive = hasTrend && trendPercent >= 0;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft-sm)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          {label}
        </p>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-mono-data text-2xl font-bold tabular-nums text-[var(--color-text)] sm:text-[28px]">
        {value}
      </p>
      {hasTrend ? (
        <p
          className="mt-2 flex items-center gap-1 text-xs font-semibold"
          style={{ color: isPositive ? "var(--color-success)" : "var(--color-danger)" }}
        >
          {isPositive ? <TrendingUpIcon className="h-3.5 w-3.5" /> : <TrendingDownIcon className="h-3.5 w-3.5" />}
          {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(Math.abs(trendPercent))}% {trendContext}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">Belum ada data {trendContext}</p>
      )}
    </div>
  );
}
