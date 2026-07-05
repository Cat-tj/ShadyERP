import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getPaymentMethodSummary } from "@/server/services/finance-operational-service";
import { PeriodFilter } from "@/components/laporan/period-filter";
import { StatTile } from "@/components/laporan/stat-tile";
import { RankingBarChart } from "@/components/laporan/ranking-bar-chart";
import { formatRupiah } from "@/lib/format";
import { WalletIcon, ReceiptIcon, BarChartIcon } from "@/components/ui/icons";

const VALID_DAYS = [7, 30, 90];

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
  DEPOSIT: "Deposit member",
};

export default async function MetodeBayarPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const { days: daysParam } = await searchParams;
  const days = VALID_DAYS.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const paymentMethods = await getPaymentMethodSummary(
    user.tenantId,
    outlets.map((outlet) => outlet.id),
    days
  );

  const totalAmount = paymentMethods.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = paymentMethods.reduce((sum, item) => sum + item.count, 0);
  const topMethod = paymentMethods[0];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Metode Bayar</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Pantau uang masuk dari tunai, QRIS, transfer, e-wallet, dan deposit member.
          </p>
        </div>
        <PeriodFilter activeDays={days} basePath="/finance/metode-bayar" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label={`Total ${days} hari`} value={formatRupiah(totalAmount)} icon={WalletIcon} />
        <StatTile label="Jumlah transaksi" value={String(totalCount)} icon={ReceiptIcon} />
        <StatTile
          label="Metode terbesar"
          value={topMethod ? PAYMENT_LABEL[topMethod.method] ?? topMethod.method : "-"}
          icon={BarChartIcon}
        />
      </div>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Breakdown pembayaran</h2>
        <RankingBarChart
          items={paymentMethods.map((item) => ({
            label: PAYMENT_LABEL[item.method] ?? item.method,
            value: item.amount,
            sublabel: `${item.count} transaksi · ${item.percentage}%`,
          }))}
        />
      </section>
    </div>
  );
}
