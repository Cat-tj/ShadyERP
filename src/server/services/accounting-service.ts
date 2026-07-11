import { Prisma, AccountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

export async function postJournalEntry(params: {
  tenantId: string;
  description: string;
  debitCode: string;
  creditCode: string;
  amount: number;
  reference?: string;
  tx?: Prisma.TransactionClient;
}) {
  const client = params.tx || prisma;
  
  // Skip posting if tenant is in SIMPLE mode
  const setting = await client.tenantSetting.findUnique({
    where: { tenantId: params.tenantId },
  });
  if (!setting || setting.accountingMode !== "ADVANCED") {
    return null;
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
  await postJournalEntry({
    tenantId,
    description: `Expense: ${expense.note || expense.category}`,
    debitCode: "51200", // Operational Expenses
    creditCode: "11100", // Cash Drawer (debit/credit cash)
    amount: expense.amount,
    reference: `EXP-${expense.id}`,
    tx: client,
  });
}
