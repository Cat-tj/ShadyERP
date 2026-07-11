import { formatRupiah } from "@/lib/format";

type Line = { code: string; name: string; amount: number };
type Section = { lines: Line[]; total: number };

function SectionBlock({ title, section }: { title: string; section: Section }) {
  const activeLines = section.lines.filter((l) => l.amount !== 0);
  return (
    <div>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">{title}</h2>
      {activeLines.length === 0 ? (
        <p className="py-2 text-sm text-[var(--color-text-secondary)]">Belum ada transaksi pada rentang ini.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {activeLines.map((line) => (
            <div key={line.code} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-[var(--color-text)]">{line.name}</span>
              <span className="shrink-0 font-mono-data tabular-nums text-[var(--color-text)]">
                {formatRupiah(line.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2 flex justify-between border-t border-[var(--color-border)] pt-2 text-sm font-bold text-[var(--color-text)]">
        <span>Total {title}</span>
        <span className="font-mono-data tabular-nums">{formatRupiah(section.total)}</span>
      </div>
    </div>
  );
}

export function IncomeStatement({
  revenue,
  expense,
  netIncome,
}: {
  revenue: Section;
  expense: Section;
  netIncome: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-col gap-6">
          <SectionBlock title="Pendapatan" section={revenue} />
          <SectionBlock title="Beban" section={expense} />
        </div>
        <div
          className={`mt-4 flex justify-between rounded-lg border-t-2 border-[var(--color-text)] pt-3 text-base font-bold ${
            netIncome >= 0 ? "text-[var(--color-good-text)]" : "text-[var(--color-danger)]"
          }`}
        >
          <span>{netIncome >= 0 ? "Laba Bersih" : "Rugi Bersih"}</span>
          <span className="font-mono-data tabular-nums">{formatRupiah(netIncome)}</span>
        </div>
      </div>
    </div>
  );
}
