import { formatRupiah } from "@/lib/format";

export type TrialBalanceRowData = { code: string; name: string; type: string; debit: number; credit: number };

const TYPE_LABEL: Record<string, string> = {
  ASSET: "Aset",
  LIABILITY: "Liabilitas",
  EQUITY: "Ekuitas",
  REVENUE: "Pendapatan",
  EXPENSE: "Beban",
};

export function TrialBalance({
  rows,
  totalDebit,
  totalCredit,
  isBalanced,
}: {
  rows: TrialBalanceRowData[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}) {
  const activeRows = rows.filter((r) => r.debit !== 0 || r.credit !== 0);

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
          ? "✓ Neraca saldo seimbang — total debit = total kredit."
          : "⚠ Neraca saldo TIDAK seimbang — ada bug di posting jurnal, laporkan ke admin."}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {activeRows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada transaksi yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-left text-xs text-[var(--color-text-secondary)]">
                  <th className="px-4 py-2.5 font-medium">Kode</th>
                  <th className="px-4 py-2.5 font-medium">Akun</th>
                  <th className="px-4 py-2.5 font-medium">Tipe</th>
                  <th className="px-4 py-2.5 text-right font-medium">Debit</th>
                  <th className="px-4 py-2.5 text-right font-medium">Kredit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {activeRows.map((row) => (
                  <tr key={row.code}>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono-data text-[var(--color-text-secondary)]">
                      {row.code}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[var(--color-text)]">{row.name}</td>
                    <td className="px-4 py-2.5 text-xs text-[var(--color-text-secondary)]">
                      {TYPE_LABEL[row.type] ?? row.type}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-data tabular-nums text-[var(--color-text)]">
                      {row.debit > 0 ? formatRupiah(row.debit) : "–"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-data tabular-nums text-[var(--color-text)]">
                      {row.credit > 0 ? formatRupiah(row.credit) : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--color-text)] font-bold text-[var(--color-text)]">
                  <td className="px-4 py-3" colSpan={3}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data tabular-nums">{formatRupiah(totalDebit)}</td>
                  <td className="px-4 py-3 text-right font-mono-data tabular-nums">{formatRupiah(totalCredit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
