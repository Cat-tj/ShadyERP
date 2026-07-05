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
      <p className="mt-3 font-mono-data tabular-nums text-xl font-semibold leading-tight text-[var(--color-text)] [overflow-wrap:anywhere] sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs leading-snug text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}
