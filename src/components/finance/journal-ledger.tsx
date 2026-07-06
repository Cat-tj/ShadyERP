"use client";

import { useState } from "react";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";

export type JournalRow = {
  id: string;
  date: string;
  description: string;
  debitCode: string;
  debitName: string;
  creditCode: string;
  creditName: string;
  amount: number;
  reference: string | null;
};

interface JournalLedgerProps {
  entries: JournalRow[];
}

export function JournalLedger({ entries }: JournalLedgerProps) {
  const [search, setSearch] = useState("");

  const filteredEntries = entries.filter((entry) => {
    const s = search.toLowerCase();
    return (
      entry.description.toLowerCase().includes(s) ||
      entry.debitName.toLowerCase().includes(s) ||
      entry.creditName.toLowerCase().includes(s) ||
      (entry.reference && entry.reference.toLowerCase().includes(s))
    );
  });

  const totalAmount = filteredEntries.reduce((acc, entry) => acc + entry.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari deskripsi, akun, atau nomor referensi..."
            className="w-full min-h-[40px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] placeholder-[var(--color-text-secondary)]"
          />
        </div>
        <div className="text-xs font-semibold text-[var(--color-text-secondary)]">
          Menampilkan <span className="font-mono-data text-[var(--color-text)]">{filteredEntries.length}</span> baris entri jurnal umum.
        </div>
      </div>

      {/* Main double-entry general ledger table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] font-bold text-[var(--color-text-secondary)]">
                <th className="p-4 w-[120px]">Tanggal</th>
                <th className="p-4 w-[160px]">Referensi</th>
                <th className="p-4">Keterangan / Detail Jurnal</th>
                <th className="p-4 text-right w-[150px]">Debet</th>
                <th className="p-4 text-right w-[150px]">Kredit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Tidak ada transaksi jurnal buku besar ditemukan.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[var(--color-bg)]/40 transition-colors">
                    {/* Date */}
                    <td className="p-4 align-top font-medium text-[var(--color-text-secondary)]">
                      {formatTanggalPendek(entry.date)}
                    </td>
                    
                    {/* Reference ID */}
                    <td className="p-4 align-top font-mono-data font-bold text-[var(--color-primary)]">
                      {entry.reference || "-"}
                    </td>

                    {/* Double Entry Description & Accounts */}
                    <td className="p-4 align-top flex flex-col gap-2">
                      <p className="font-semibold text-[var(--color-text)]">{entry.description}</p>
                      
                      {/* Debit and Credit Rows */}
                      <div className="flex flex-col gap-1 text-[10px] border-l-2 border-[var(--color-border)] pl-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-blue-500/10 px-1 py-0.5 font-bold text-blue-600 dark:text-blue-400">
                            Dr
                          </span>
                          <span className="font-semibold text-[var(--color-text)]">
                            {entry.debitCode} - {entry.debitName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pl-6">
                          <span className="rounded bg-amber-500/10 px-1 py-0.5 font-bold text-amber-600 dark:text-amber-400">
                            Cr
                          </span>
                          <span className="font-semibold text-[var(--color-text-secondary)]">
                            {entry.creditCode} - {entry.creditName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Debit Amount Column */}
                    <td className="p-4 align-top text-right font-mono-data font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {formatRupiah(entry.amount)}
                    </td>

                    {/* Credit Amount Column */}
                    <td className="p-4 align-top text-right font-mono-data font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {formatRupiah(entry.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Balances Summary Footer */}
            {filteredEntries.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[var(--color-border)] bg-[var(--color-bg)] font-bold text-[var(--color-text)]">
                  <td colSpan={3} className="p-4 text-right uppercase tracking-wider text-xs text-[var(--color-text-secondary)]">
                    Total Keseimbangan Jurnal (Balanced Ledger)
                  </td>
                  <td className="p-4 text-right font-mono-data text-blue-600 dark:text-blue-400 tabular-nums text-xs">
                    {formatRupiah(totalAmount)}
                  </td>
                  <td className="p-4 text-right font-mono-data text-amber-600 dark:text-amber-400 tabular-nums text-xs">
                    {formatRupiah(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
