import type { ComponentType, SVGProps } from "react";

export function StatTile({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Baris kecil di bawah value, mis. "+12% dari minggu lalu". positive=false pakai warna merah. */
  trend?: { label: string; positive?: boolean };
}) {
  return (
    <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}
      >
        <Icon aria-hidden className="h-5 w-5" />
      </div>
      <p className="mt-3 font-mono-data tabular-nums text-xl font-semibold leading-tight text-[var(--color-text)] [overflow-wrap:anywhere] sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 font-mono-data text-[10.5px] font-semibold uppercase leading-snug tracking-[0.06em] text-[var(--color-text-secondary)]">
        {label}
      </p>
      {trend && (
        <p
          className="mt-1.5 font-mono-data text-[10.5px] font-semibold"
          style={{ color: trend.positive === false ? "var(--color-danger)" : "var(--color-good-text)" }}
        >
          {trend.label}
        </p>
      )}
    </div>
  );
}
