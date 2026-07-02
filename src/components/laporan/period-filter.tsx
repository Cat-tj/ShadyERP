import Link from "next/link";

const PERIODS = [
  { days: 7, label: "7 hari" },
  { days: 30, label: "30 hari" },
  { days: 90, label: "90 hari" },
];

export function PeriodFilter({ activeDays }: { activeDays: number }) {
  return (
    <div className="flex gap-2">
      {PERIODS.map((period) => (
        <Link
          key={period.days}
          href={`/laporan?days=${period.days}`}
          className={`min-h-[40px] rounded-full px-4 text-sm font-medium flex items-center ${
            activeDays === period.days
              ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              : "border border-[var(--color-border)] text-[var(--color-text)]"
          }`}
        >
          {period.label}
        </Link>
      ))}
    </div>
  );
}
