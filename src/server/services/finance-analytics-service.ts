import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "@/lib/date-range";

/**
 * Financial Analysis service
 * - P&L Statement with category breakdown
 * - Cash Flow Analysis
 * - Financial Ratios (margin, ROI, turnover)
 */

export interface FinancialSummary {
  period: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  netIncome: number;
  netMargin: number;
}

// ============ P&L STATEMENT ============

/**
 * Generate P&L statement untuk periode tertentu
 * Revenue - COGS - Operating Expenses = Net Income
 */
export async function getProfitAndLoss(
  tenantId: string,
  outletId?: string,
  year?: number,
  month?: number
): Promise<FinancialSummary> {
  let startDate: Date, endDate: Date;

  if (year && month) {
    const date = new Date(year, month - 1, 1);
    startDate = startOfMonth(date);
    endDate = endOfMonth(date);
  } else {
    const now = new Date();
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  }

  // Revenue from sales
  const salesData = await prisma.sale.aggregate({
    where: {
      tenantId,
      ...(outletId && { outletId }),
      status: "COMPLETED",
      createdAt: { gte: startDate, lte: endDate },
    },
    _sum: { total: true },
  });

  const revenue = salesData._sum.total ?? 0;

  // COGS - didapat dari cost product * quantity sold
  const cogsData = await prisma.saleItem.aggregate({
    where: {
      sale: {
        tenantId,
        ...(outletId && { outletId }),
        status: "COMPLETED",
        createdAt: { gte: startDate, lte: endDate },
      },
    },
    _sum: { qty: true },
  });

  // Estimate COGS: ambil total quantity sold, multiply dengan average cost
  const avgCost = await prisma.product.aggregate({
    where: { tenantId },
    _avg: { cost: true },
  });

  const cogs = (cogsData._sum.qty ?? 0) * (avgCost._avg.cost ?? 0);
  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0;

  // Operating Expenses
  const expensesData = await prisma.expense.aggregate({
    where: {
      tenantId,
      ...(outletId && { outletId }),
      createdAt: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  const operatingExpenses = expensesData._sum.amount ?? 0;
  const netIncome = grossProfit - operatingExpenses;
  const netMargin = revenue > 0 ? Math.round((netIncome / revenue) * 10000) / 100 : 0;

  const periodStr = month ? `${month}/${year}` : new Date().toISOString().slice(0, 7);

  return {
    period: periodStr,
    revenue,
    cogs,
    grossProfit,
    grossMargin,
    operatingExpenses,
    netIncome,
    netMargin,
  };
}

// ============ P&L BY CATEGORY ============

export async function getProfitByCategory(
  tenantId: string,
  outletId?: string,
  year?: number,
  month?: number
) {
  let startDate: Date, endDate: Date;

  if (year && month) {
    const date = new Date(year, month - 1, 1);
    startDate = startOfMonth(date);
    endDate = endOfMonth(date);
  } else {
    const now = new Date();
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  }

  const categories = await prisma.category.findMany({
    where: { tenantId },
    include: {
      products: {
        include: {
          saleItems: {
            where: {
              sale: {
                tenantId,
                ...(outletId && { outletId }),
                status: "COMPLETED",
                createdAt: { gte: startDate, lte: endDate },
              },
            },
          },
        },
      },
    },
  });

  return categories.map((cat) => {
    let revenue = 0,
      cogs = 0,
      qtySold = 0;

    cat.products.forEach((prod) => {
      prod.saleItems.forEach((item) => {
        revenue += item.subtotal;
        cogs += (prod.cost ?? 0) * item.qty;
        qtySold += item.qty;
      });
    });

    const grossProfit = revenue - cogs;
    const margin = revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      revenue,
      cogs,
      grossProfit,
      margin,
      qtySold,
    };
  });
}

// ============ CASH FLOW ANALYSIS ============

export async function getCashFlowTrend(tenantId: string, outletId?: string, monthsBack = 6) {
  const data = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    const [income, expenses] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          tenantId,
          ...(outletId && { outletId }),
          status: "COMPLETED",
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { total: true },
      }),
      prisma.expense.aggregate({
        where: {
          tenantId,
          ...(outletId && { outletId }),
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const cashIn = income._sum.total ?? 0;
    const cashOut = expenses._sum.amount ?? 0;

    data.push({
      month: date.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
      cashIn,
      cashOut,
      netCashFlow: cashIn - cashOut,
    });
  }

  return data;
}

// ============ FINANCIAL RATIOS ============

export async function getFinancialRatios(tenantId: string, outletId?: string) {
  const currentMonth = await getProfitAndLoss(tenantId, outletId);
  const prevMonth = getProfitAndLoss(
    tenantId,
    outletId,
    new Date().getFullYear(),
    new Date().getMonth()
  );

  const [current, prev] = await Promise.all([currentMonth, prevMonth]);

  // Profit Margin (already in %)
  // ROI = Net Income / Revenue (%)
  // Inventory Turnover = COGS / Average Inventory
  // Expense Ratio = Operating Expenses / Revenue (%)

  return {
    profitMargin: current.netMargin,
    grossProfitMargin: current.grossMargin,
    expenseRatio: current.revenue > 0 ? Math.round((current.operatingExpenses / current.revenue) * 10000) / 100 : 0,
    monthlyGrowth:
      prev.revenue > 0
        ? Math.round(((current.revenue - prev.revenue) / prev.revenue) * 10000) / 100
        : 0,
    averageTransactionValue: 0, // Will be calculated separately
  };
}

// ============ EXPENSE SUMMARY ============

export async function getExpenseSummary(tenantId: string, outletId?: string, period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  const expenses = await prisma.expense.groupBy({
    by: ["category"],
    where: {
      tenantId,
      ...(outletId && { outletId }),
      createdAt: { gte: startDate },
    },
    _sum: { amount: true },
    _count: true,
  });

  const total = expenses.reduce((sum, e) => sum + (e._sum.amount ?? 0), 0);

  return expenses.map((exp) => ({
    category: exp.category,
    amount: exp._sum.amount ?? 0,
    percentage: total > 0 ? Math.round(((exp._sum.amount ?? 0) / total) * 10000) / 100 : 0,
    count: exp._count,
  }));
}
