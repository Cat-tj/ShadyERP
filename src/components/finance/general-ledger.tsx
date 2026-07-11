"use client";

import { useState } from "react";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { ChevronDownIcon } from "@/components/ui/icons";

export type LedgerLineRow = {
  date: string;
  description: string;
  reference: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
};

export type LedgerAccountRow = {
  code: string;
  name: string;
  type: string;
  openingBalance: number;
  lines: LedgerLineRow[];
  closingBalance: number;
};

const TYPE_LABEL: Record<string, string> = {
  ASSET: "Aset",
  LIABILITY: "Liabilitas",
  EQUITY: "Ekuitas",
  REVENUE: "Pendapatan",
  EXPENSE: "Beban",
};

export function GeneralLedger({ accounts }: { accounts: LedgerAccountRow[] }) {
  const [search, setSearch] = useState("");
  const [hideEmpty, setHideEmpty] = useState(true);
  const [openCode, setOpenCode] = useState<string | null>(null);

  const filtered = accounts.filter((account) => {
    if (hideEmpty && account.lines.length === 0 && account.openingBalance === 0) return false;
    const query = search.toLowerCase();
    if (!query) return true;
    return account.name.toLowerCase().includes(query) || account.code.includes(query);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode atau nama akun..."
          className="min-h-[44px] w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <input
            type="checkbox"
            checked={hideEmpty}
            onChange={(e) => setHideEmpty(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
          />
          Sembunyikan akun kosong
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          Tidak ada akun yang cocok.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((account) => {
            const isOpen = openCode === account.code;
            return (
              <div
                key={account.code}
                className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <button
                  onClick={() => setOpenCode(isOpen ? null : account.code)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {account.code} · {account.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {TYPE_LABEL[account.type] ?? account.type} · {account.lines.length} transaksi
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono-data tabular-nums text-sm font-bold text-[var(--color-text)]">
                      {formatRupiah(account.closingBalance)}
                    </span>
                    <ChevronDownIcon
                      aria-hidden
                      className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--color-border)] px-4 py-3">
                    <div className="mb-2 flex justify-between text-xs text-[var(--color-text-secondary)]">
                      <span>Saldo awal</span>
                      <span className="font-mono-data tabular-nums">{formatRupiah(account.openingBalance)}</span>
                    </div>

                    {account.lines.length === 0 ? (
                      <p className="py-4 text-center text-xs text-[var(--color-text-secondary)]">
                        Tidak ada transaksi pada rentang ini.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
                              <th className="py-1.5 pr-2 font-medium">Tanggal</th>
                              <th className="py-1.5 pr-2 font-medium">Deskripsi</th>
                              <th className="py-1.5 pr-2 text-right font-medium">Debit</th>
                              <th className="py-1.5 pr-2 text-right font-medium">Kredit</th>
                              <th className="py-1.5 text-right font-medium">Saldo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border)]">
                            {account.lines.map((line, i) => (
                              <tr key={i}>
                                <td className="whitespace-nowrap py-1.5 pr-2 text-[var(--color-text-secondary)]">
                                  {formatTanggalPendek(line.date)}
                                </td>
                                <td className="py-1.5 pr-2 text-[var(--color-text)]">
                                  {line.description}
                                  {line.reference && (
                                    <span className="ml-1 text-[var(--color-text-secondary)]">({line.reference})</span>
                                  )}
                                </td>
                                <td className="py-1.5 pr-2 text-right font-mono-data tabular-nums text-[var(--color-text)]">
                                  {line.debit > 0 ? formatRupiah(line.debit) : "–"}
                                </td>
                                <td className="py-1.5 pr-2 text-right font-mono-data tabular-nums text-[var(--color-text)]">
                                  {line.credit > 0 ? formatRupiah(line.credit) : "–"}
                                </td>
                                <td className="py-1.5 text-right font-mono-data tabular-nums font-semibold text-[var(--color-text)]">
                                  {formatRupiah(line.runningBalance)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="mt-2 flex justify-between border-t border-[var(--color-border)] pt-2 text-xs font-semibold text-[var(--color-text)]">
                      <span>Saldo akhir</span>
                      <span className="font-mono-data tabular-nums">{formatRupiah(account.closingBalance)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
