import { formatRupiah } from "@/lib/format";

export type RankingItem = { label: string; value: number; sublabel?: string };

export function RankingBarChart({ items }: { items: RankingItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
        Belum ada data pada rentang ini.
      </p>
    );
  }

  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium text-[var(--color-text)]">{item.label}</span>
            <span className="shrink-0 tabular-nums text-sm font-semibold text-[var(--color-text)]">
              {formatRupiah(item.value)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)]"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
          {item.sublabel && (
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{item.sublabel}</p>
          )}
        </div>
      ))}
    </div>
  );
}
