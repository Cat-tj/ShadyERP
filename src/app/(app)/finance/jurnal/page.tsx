import { redirect } from "next/navigation";
import { requireRole } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { prisma } from "@/lib/prisma";
import { JournalLedger, type JournalRow } from "@/components/finance/journal-ledger";

export default async function JurnalPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  // Guard server-side — jangan cuma disembunyikan di nav, jurnal/COA itu
  // istilah akuntan yang cuma relevan di mode Advanced.
  const setting = await getTenantSetting(user.tenantId);
  if (setting?.accountingMode !== "ADVANCED") redirect("/finance");

  // Fetch all journal entries of this tenant
  const rawEntries = await prisma.journalEntry.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { date: "desc" },
  });

  // Fetch all COA accounts to map account names
  const accounts = await prisma.account.findMany({
    where: { tenantId: user.tenantId },
  });

  const accountMap = new Map(accounts.map((acc) => [acc.code, acc.name]));

  const entries: JournalRow[] = rawEntries.map((entry) => ({
    id: entry.id,
    date: entry.date.toISOString(),
    description: entry.description,
    debitCode: entry.debitCode,
    debitName: accountMap.get(entry.debitCode) || "Akun Debet",
    creditCode: entry.creditCode,
    creditName: accountMap.get(entry.creditCode) || "Akun Kredit",
    amount: entry.amount,
    reference: entry.reference,
  }));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Jurnal Umum</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Audit transparansi transaksi pembukuan otomatis (double-entry ledger) untuk seluruh aktivitas kasir POS,
          pengeluaran operasional, dan hutang supplier Anda. Lihat saldo per akun di{" "}
          <a href="/finance/buku-besar" className="font-semibold text-[var(--color-primary)]">
            Buku Besar
          </a>
          .
        </p>
      </div>

      <JournalLedger entries={entries} />
    </div>
  );
}
