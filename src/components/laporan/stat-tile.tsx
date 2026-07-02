import type { ComponentType, SVGProps } from "react";

export function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-bg)] text-[var(--color-primary)]">
        <Icon aria-hidden className="h-5 w-5" />
      </div>
      <p className="mt-3 truncate font-mono-data tabular-nums text-2xl font-semibold text-[var(--color-text)]">{value}</p>
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}
