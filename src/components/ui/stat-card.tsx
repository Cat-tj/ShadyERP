import type { ComponentType, SVGProps } from "react";

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "primary";
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 sm:p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)] ${
        variant === "primary"
          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-text)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            {title}
          </p>
          <p className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              variant === "primary"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {description && (
            <span className="text-[var(--color-text-secondary)]">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
