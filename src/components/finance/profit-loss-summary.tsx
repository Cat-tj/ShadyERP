"use client";

import { formatRupiah } from "@/lib/format";
import { GlassPanel } from "@/components/ui/glass-panel";

interface ProfitLossSummaryProps {
  period: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  netIncome: number;
  netMargin: number;
}

export function ProfitLossSummary({
  period,
  revenue,
  cogs,
  grossProfit,
  grossMargin,
  operatingExpenses,
  netIncome,
  netMargin,
}: ProfitLossSummaryProps) {
  const isProfit = netIncome >= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
          Laporan Laba-Rugi
        </h2>
        <span className="text-xs text-[var(--color-text-secondary)]">{period}</span>
      </div>

      {/* P&L Table */}
      <GlassPanel className="rounded-xl p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem]">
            <tbody className="divide-y divide-[var(--color-border)]">
              <tr>
                <td className="py-2 text-sm font-medium text-[var(--color-text)]">Pendapatan (Revenue)</td>
                <td className="py-2 text-right font-mono-data font-semibold text-green-600">
                  {formatRupiah(revenue)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-sm text-[var(--color-text-secondary)]">  - Biaya Pokok (COGS)</td>
                <td className="py-2 text-right font-mono-data text-[var(--color-text-secondary)]">
                  ({formatRupiah(cogs)})
                </td>
              </tr>
              <tr className="bg-[var(--color-surface)]/50">
                <td className="py-2 text-sm font-medium text-[var(--color-text)]">Laba Kotor</td>
                <td className="py-2 text-right font-mono-data font-semibold text-[var(--color-text)]">
                  {formatRupiah(grossProfit)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-xs text-[var(--color-text-secondary)]">  Margin: {grossMargin}%</td>
                <td />
              </tr>
              <tr>
                <td className="py-2 text-sm text-[var(--color-text-secondary)]">  - Beban Operasional</td>
                <td className="py-2 text-right font-mono-data text-[var(--color-text-secondary)]">
                  ({formatRupiah(operatingExpenses)})
                </td>
              </tr>
              <tr className={`${isProfit ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <td className={`py-2 text-sm font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
                  Laba Bersih
                </td>
                <td
                  className={`py-2 text-right font-mono-data text-lg font-bold ${
                    isProfit ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isProfit ? "+" : "-"}
                  {formatRupiah(Math.abs(netIncome))}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-xs text-[var(--color-text-secondary)]">
                  Net Margin: {netMargin}%
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
