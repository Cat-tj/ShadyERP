import { Prisma, AccountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/server/services/audit-log-service";

export const DEFAULT_ACCOUNTS: { code: string; name: string; type: AccountType }[] = [
  { code: "11100", name: "Cash Drawer", type: AccountType.ASSET },
  { code: "11200", name: "Bank Clearing", type: AccountType.ASSET },
  { code: "11300", name: "Inventory Asset", type: AccountType.ASSET },
  { code: "21100", name: "Accounts Payable (Hutang)", type: AccountType.LIABILITY },
  { code: "31100", name: "Retained Earnings (Laba Ditahan)", type: AccountType.EQUITY },
  { code: "41100", name: "Sales Revenue", type: AccountType.REVENUE },
  { code: "41200", name: "Discounts & Promos", type: AccountType.REVENUE },
  { code: "51100", name: "Cost of Goods Sold (HPP)", type: AccountType.EXPENSE },
  { code: "51200", name: "Operational Expenses", type: AccountType.EXPENSE },
];

export async function ensureDefaultAccounts(tenantId: string, tx?: Prisma.TransactionClient) {
  const client = tx || prisma;
  // Self-healing: kalau DEFAULT_ACCOUNTS nambah akun baru di kemudian hari
  // (seperti Equity di sini), tenant lama yang sudah punya sebagian akun
  // tetap kebagian akun barunya — bukan cuma dicek sekali pas tenant kosong.
  // Skip createMany kalau sudah lengkap, biar tidak round-trip percuma tiap
  // posting jurnal (logSaleToJournal bisa panggil ini sampai 3x per sale).
  const count = await client.account.count({ where: { tenantId } });
  if (count >= DEFAULT_ACCOUNTS.length) return;

  await client.account.createMany({
    data: DEFAULT_ACCOUNTS.map((acc) => ({
      tenantId,
      code: acc.code,
      name: acc.name,
      type: acc.type,
    })),
    skipDuplicates: true,
  });
}

/**
 * Tanggal tutup buku tenant ini — null berarti belum pernah tutup buku sama
 * sekali, semua tanggal masih bebas diposting.
 */
export async function getPeriodLockDate(
  tenantId: string,
  tx?: Prisma.TransactionClient
): Promise<Date | null> {
  const client = tx || prisma;
  const setting = await client.tenantSetting.findUnique({ where: { tenantId } });
  return setting?.periodLockDate ?? null;
}

/**
 * Tolak aksi apa pun (posting jurnal baru, void/retur penjualan, hapus
 * pengeluaran) yang menyentuh tanggal yang sudah dikunci lewat tutup buku.
 * Dipanggil dari dalam transaction supaya seluruh aksi ikut batal kalau kena.
 */
export async function assertPeriodNotLocked(
  tenantId: string,
  date: Date,
  tx?: Prisma.TransactionClient
) {
  const lockDate = await getPeriodLockDate(tenantId, tx);
  if (lockDate && date <= lockDate) {
    const formatted = lockDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    throw new Error(
      `Periode sampai ${formatted} sudah ditutup. Tidak bisa memposting atau mengubah transaksi di tanggal ini lagi.`
    );
  }
}

/**
 * Tutup buku sampai tanggal tertentu. Hanya boleh maju (tidak bisa
 * mengunci ke tanggal yang lebih awal dari kunci sebelumnya) supaya
 * proteksi periode yang sudah tertutup tidak sengaja hilang.
 */
export async function setPeriodLockDate(tenantId: string, lockDate: Date, actingUserId: string) {
  const current = await getPeriodLockDate(tenantId);
  if (current && lockDate <= current) {
    throw new Error("Tanggal tutup buku baru harus lebih baru dari tanggal kunci sebelumnya.");
  }
  if (lockDate > new Date()) {
    throw new Error("Tidak bisa menutup buku untuk tanggal yang belum terjadi.");
  }
  const formatted = lockDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.tenantSetting.update({
      where: { tenantId },
      data: { periodLockDate: lockDate },
    });
    await recordAuditLog(tx, tenantId, actingUserId, "PERIOD_LOCK", `Tutup buku sampai ${formatted}.`);
    return updated;
  });
}

/** Buka kunci tutup buku (jalan darurat kalau ada salah input tanggal). */
export async function clearPeriodLockDate(tenantId: string, actingUserId: string) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.tenantSetting.update({
      where: { tenantId },
      data: { periodLockDate: null },
    });
    await recordAuditLog(tx, tenantId, actingUserId, "PERIOD_UNLOCK", "Membuka kunci tutup buku.");
    return updated;
  });
}

export async function postJournalEntry(params: {
  tenantId: string;
  description: string;
  debitCode: string;
  creditCode: string;
  amount: number;
  reference?: string;
  sourceKey?: string;
  date?: Date;
  tx?: Prisma.TransactionClient;
}) {
  const client = params.tx || prisma;

  if (!Number.isSafeInteger(params.amount) || params.amount <= 0) {
    throw new Error("Nominal jurnal harus berupa Rupiah bulat lebih dari nol.");
  }
  if (!params.debitCode.trim() || !params.creditCode.trim() || params.debitCode === params.creditCode) {
    throw new Error("Akun debit dan kredit jurnal harus valid dan berbeda.");
  }

  if (params.sourceKey) {
    const existing = await client.journalEntry.findFirst({
      where: { tenantId: params.tenantId, sourceKey: params.sourceKey },
    });
    if (existing) return existing;
  }

  // Skip posting if tenant is in SIMPLE mode
  const setting = await client.tenantSetting.findUnique({
    where: { tenantId: params.tenantId },
  });
  if (!setting || setting.accountingMode !== "ADVANCED") {
    return null;
  }

  const date = params.date ?? new Date();
  if (setting.periodLockDate && date <= setting.periodLockDate) {
    const formatted = setting.periodLockDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    throw new Error(`Periode sampai ${formatted} sudah ditutup. Tidak bisa memposting jurnal baru di tanggal ini.`);
  }

  // Ensure default accounts are present
  await ensureDefaultAccounts(params.tenantId, params.tx);

  return client.journalEntry.create({
    data: {
      tenantId: params.tenantId,
      description: params.description,
      debitCode: params.debitCode,
      creditCode: params.creditCode,
      amount: params.amount,
      reference: params.reference,
      sourceKey: params.sourceKey,
      date,
    },
  });
}

/**
 * Automatically logs POS Sale to Journal Entry.
 */
export async function logSaleToJournal(tenantId: string, saleId: string, tx?: Prisma.TransactionClient) {
  const client = tx || prisma;
  const sale = await client.sale.findUnique({
    where: { id: saleId },
    include: { items: true },
  });

  if (!sale) return;

  const total = sale.total;
  const discount = sale.discountAmount;

  // 1. Debet Kas/Bank, Kredit Penjualan
  const isDigital = sale.paymentMethod !== "CASH";
  const debitCode = isDigital ? "11200" : "11100"; // Bank Clearing vs Cash Drawer

  await postJournalEntry({
    tenantId,
    description: `POS Sale ${sale.invoiceNumber}`,
    debitCode,
    creditCode: "41100", // Sales Revenue
    amount: total,
    reference: `SALE-${sale.id}`,
    sourceKey: `SALE:${sale.id}:REVENUE`,
    tx: client,
  });

  // 2. Jika ada diskon, log diskon
  if (discount > 0) {
    await postJournalEntry({
      tenantId,
      description: `Discount for POS Sale ${sale.invoiceNumber}`,
      debitCode: "41200", // Discounts & Promos
      creditCode: debitCode,
      amount: discount,
      reference: `SALE-${sale.id}`,
      sourceKey: `SALE:${sale.id}:DISCOUNT`,
      tx: client,
    });
  }

  // 3. Log HPP (COGS) & Inventory jika cost (HPP) produk di-track
  let totalCOGS = 0;
  for (const item of sale.items) {
    const product = await client.product.findUnique({
      where: { id: item.productId },
      select: { cost: true },
    });
    if (product?.cost) {
      totalCOGS += product.cost * item.qty;
    }
  }

  if (totalCOGS > 0) {
    await postJournalEntry({
      tenantId,
      description: `COGS for POS Sale ${sale.invoiceNumber}`,
      debitCode: "51100", // COGS
      creditCode: "11300", // Inventory Asset
      amount: totalCOGS,
      reference: `SALE-${sale.id}`,
      sourceKey: `SALE:${sale.id}:COGS`,
      tx: client,
    });
  }
}

/**
 * Automatically logs Expense to Journal Entry.
 */
export async function logExpenseToJournal(tenantId: string, expenseId: string, tx?: Prisma.TransactionClient) {
  const client = tx || prisma;
  const expense = await client.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense) return;

  // Debet Operational Expenses, Kredit Cash Drawer
  // date pakai spentAt (bukan waktu posting) supaya jurnal tercatat di
  // tanggal transaksi yang sebenarnya kalau pengeluaran diinput mundur.
  await postJournalEntry({
    tenantId,
    description: `Expense: ${expense.note || expense.category}`,
    debitCode: "51200", // Operational Expenses
    creditCode: "11100", // Cash Drawer (debit/credit cash)
    amount: expense.amount,
    reference: `EXP-${expense.id}`,
    sourceKey: `EXP:${expense.id}:POST`,
    date: expense.spentAt,
    tx: client,
  });
}

/** Sisi normal saldo akun — Asset & Expense naik lewat debit, sisanya naik lewat kredit. */
function isDebitNormal(type: AccountType): boolean {
  return type === "ASSET" || type === "EXPENSE";
}

export type LedgerLine = {
  date: Date;
  description: string;
  reference: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
};

export type LedgerAccount = {
  code: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  lines: LedgerLine[];
  closingBalance: number;
};

/**
 * Buku Besar (General Ledger): "bongkar" tiap JournalEntry (yang cuma
 * berbentuk pasangan debitCode+creditCode) jadi baris per akun dengan saldo
 * berjalan. Tidak butuh model baru — cukup query di atas JournalEntry yang
 * sudah ada.
 */
export async function getGeneralLedger(
  tenantId: string,
  range: { start: Date; end: Date }
): Promise<LedgerAccount[]> {
  const [accounts, priorEntries, periodEntries] = await Promise.all([
    prisma.account.findMany({ where: { tenantId }, orderBy: { code: "asc" } }),
    prisma.journalEntry.findMany({ where: { tenantId, date: { lt: range.start } } }),
    prisma.journalEntry.findMany({
      where: { tenantId, date: { gte: range.start, lt: range.end } },
      orderBy: { date: "asc" },
    }),
  ]);

  return accounts.map((account) => {
    const debitNormal = isDebitNormal(account.type);

    let opening = 0;
    for (const entry of priorEntries) {
      if (entry.debitCode === account.code) opening += debitNormal ? entry.amount : -entry.amount;
      if (entry.creditCode === account.code) opening += debitNormal ? -entry.amount : entry.amount;
    }

    let running = opening;
    const lines: LedgerLine[] = [];
    for (const entry of periodEntries) {
      const debit = entry.debitCode === account.code ? entry.amount : 0;
      const credit = entry.creditCode === account.code ? entry.amount : 0;
      if (debit === 0 && credit === 0) continue;
      running += debitNormal ? debit - credit : credit - debit;
      lines.push({
        date: entry.date,
        description: entry.description,
        reference: entry.reference,
        debit,
        credit,
        runningBalance: running,
      });
    }

    return {
      code: account.code,
      name: account.name,
      type: account.type,
      openingBalance: opening,
      lines,
      closingBalance: running,
    };
  });
}

export type TrialBalanceRow = {
  code: string;
  name: string;
  type: AccountType;
  /** > 0 kalau saldo akun ini natural-nya ada di sisi debit (mis. Asset yang belum overdrawn). */
  debit: number;
  /** > 0 kalau saldo akun ini natural-nya ada di sisi kredit. */
  credit: number;
};

/**
 * Neraca Saldo (Trial Balance): snapshot saldo SEMUA akun per satu titik
 * waktu ("as of"), bukan rentang periode — beda dari Buku Besar yang
 * nunjukin pergerakan dalam rentang. Total kolom debit HARUS sama dengan
 * total kolom kredit; kalau tidak, itu tanda ada bug di sistem posting
 * jurnal (bukan cuma soal tampilan).
 */
export async function getTrialBalance(
  tenantId: string,
  asOf: Date
): Promise<{ rows: TrialBalanceRow[]; totalDebit: number; totalCredit: number; isBalanced: boolean }> {
  const [accounts, entries] = await Promise.all([
    prisma.account.findMany({ where: { tenantId }, orderBy: { code: "asc" } }),
    prisma.journalEntry.findMany({ where: { tenantId, date: { lt: asOf } } }),
  ]);

  const rows: TrialBalanceRow[] = accounts.map((account) => {
    const debitNormal = isDebitNormal(account.type);
    let balance = 0;
    for (const entry of entries) {
      if (entry.debitCode === account.code) balance += debitNormal ? entry.amount : -entry.amount;
      if (entry.creditCode === account.code) balance += debitNormal ? -entry.amount : entry.amount;
    }
    return {
      code: account.code,
      name: account.name,
      type: account.type,
      debit: debitNormal ? Math.max(balance, 0) : Math.max(-balance, 0),
      credit: debitNormal ? Math.max(-balance, 0) : Math.max(balance, 0),
    };
  });

  const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0);

  return { rows, totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
}

export type BalanceSheetLine = { code: string; name: string; balance: number };
export type BalanceSheetSection = { lines: BalanceSheetLine[]; total: number };

/**
 * Neraca (Balance Sheet): Assets = Liabilities + Equity. Karena belum ada
 * mekanisme tutup buku (A8), laba/rugi periode berjalan (Revenue−Expense)
 * belum "resmi" masuk ke akun Equity manapun — jadi dihitung on-the-fly
 * sebagai baris "Laba Berjalan (belum ditutup)" di seksi Equity, praktik
 * standar untuk neraca interim (bukan neraca akhir tahun).
 */
export async function getBalanceSheet(
  tenantId: string,
  asOf: Date
): Promise<{
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  currentEarnings: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}> {
  const [accounts, entries] = await Promise.all([
    prisma.account.findMany({ where: { tenantId }, orderBy: { code: "asc" } }),
    prisma.journalEntry.findMany({ where: { tenantId, date: { lt: asOf } } }),
  ]);

  function naturalBalance(account: { code: string; type: AccountType }): number {
    const debitNormal = isDebitNormal(account.type);
    let balance = 0;
    for (const entry of entries) {
      if (entry.debitCode === account.code) balance += debitNormal ? entry.amount : -entry.amount;
      if (entry.creditCode === account.code) balance += debitNormal ? -entry.amount : entry.amount;
    }
    return balance;
  }

  function section(type: AccountType): BalanceSheetSection {
    const lines = accounts
      .filter((a) => a.type === type)
      .map((a) => ({ code: a.code, name: a.name, balance: naturalBalance(a) }));
    return { lines, total: lines.reduce((sum, l) => sum + l.balance, 0) };
  }

  const assets = section("ASSET");
  const liabilities = section("LIABILITY");
  const equityRaw = section("EQUITY");
  const revenue = section("REVENUE");
  const expense = section("EXPENSE");

  const currentEarnings = revenue.total - expense.total;
  const equity: BalanceSheetSection = {
    lines: [...equityRaw.lines, { code: "", name: "Laba Berjalan (belum ditutup)", balance: currentEarnings }],
    total: equityRaw.total + currentEarnings,
  };

  const totalLiabilitiesAndEquity = liabilities.total + equity.total;

  return {
    assets,
    liabilities,
    equity,
    currentEarnings,
    totalLiabilitiesAndEquity,
    isBalanced: assets.total === totalLiabilitiesAndEquity,
  };
}

export type IncomeStatementLine = { code: string; name: string; amount: number };
export type IncomeStatementSection = { lines: IncomeStatementLine[]; total: number };

/**
 * Laba Rugi resmi dari COA — beda dari "Laba Rugi Simple" di
 * finance-analytics-service.ts (yang hitung langsung dari Sale/Expense
 * mentah, tersedia di mode Simpel). Ini murni dari JournalEntry yang sudah
 * diposting, jadi angkanya = apa yang tercatat di pembukuan resmi. Rentang
 * periode (bukan "as of" seperti Neraca) karena laba rugi itu laporan
 * pergerakan dalam satu periode, bukan snapshot titik waktu.
 */
export async function getIncomeStatement(
  tenantId: string,
  range: { start: Date; end: Date }
): Promise<{ revenue: IncomeStatementSection; expense: IncomeStatementSection; netIncome: number }> {
  const [accounts, entries] = await Promise.all([
    prisma.account.findMany({
      where: { tenantId, type: { in: [AccountType.REVENUE, AccountType.EXPENSE] } },
      orderBy: { code: "asc" },
    }),
    prisma.journalEntry.findMany({ where: { tenantId, date: { gte: range.start, lt: range.end } } }),
  ]);

  function periodBalance(account: { code: string; type: AccountType }): number {
    const debitNormal = isDebitNormal(account.type);
    let balance = 0;
    for (const entry of entries) {
      if (entry.debitCode === account.code) balance += debitNormal ? entry.amount : -entry.amount;
      if (entry.creditCode === account.code) balance += debitNormal ? -entry.amount : entry.amount;
    }
    return balance;
  }

  function section(type: AccountType): IncomeStatementSection {
    const lines = accounts
      .filter((a) => a.type === type)
      .map((a) => ({ code: a.code, name: a.name, amount: periodBalance(a) }));
    return { lines, total: lines.reduce((sum, l) => sum + l.amount, 0) };
  }

  const revenue = section(AccountType.REVENUE);
  const expense = section(AccountType.EXPENSE);

  return { revenue, expense, netIncome: revenue.total - expense.total };
}
