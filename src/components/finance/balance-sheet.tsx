import { formatRupiah } from "@/lib/format";

type Line = { code: string; name: string; balance: number };
type Section = { lines: Line[]; total: number };

function SectionBlock({ title, section }: { title: string; section: Section }) {
  const activeLines = section.lines.filter((l) => l.balance !== 0);
  return (
    <div>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">{title}</h2>
      {activeLines.length === 0 ? (
        <p className="py-2 text-sm text-[var(--color-text-secondary)]">Belum ada saldo.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {activeLines.map((line) => (
            <div key={line.code || line.name} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-[var(--color-text)]">{line.name}</span>
              <span className="shrink-0 font-mono-data tabular-nums text-[var(--color-text)]">
                {formatRupiah(line.balance)}
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

export function BalanceSheet({
  assets,
  liabilities,
  equity,
  totalLiabilitiesAndEquity,
  isBalanced,
}: {
  assets: Section;
  liabilities: Section;
  equity: Section;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
          isBalanced
            ? "border-[var(--color-good-text)]/30 bg-[var(--color-good-bg)] text-[var(--color-good-text)]"
            : "border-[var(--color-danger)]/30 bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
        }`}
      >
        {isBalanced
          ? "✓ Neraca seimbang — Aset = Liabilitas + Ekuitas."
          : "⚠ Neraca TIDAK seimbang — ada bug di sistem, laporkan ke admin."}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <SectionBlock title="Aset" section={assets} />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-col gap-6">
          <SectionBlock title="Liabilitas" section={liabilities} />
          <SectionBlock title="Ekuitas" section={equity} />
        </div>
        <div className="mt-4 flex justify-between border-t-2 border-[var(--color-text)] pt-3 text-sm font-bold text-[var(--color-text)]">
          <span>Total Liabilitas + Ekuitas</span>
          <span className="font-mono-data tabular-nums">{formatRupiah(totalLiabilitiesAndEquity)}</span>
        </div>
      </div>
    </div>
  );
}
