import type { ExpenseCategory } from "@prisma/client";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  SEWA: "Sewa",
  GAJI: "Gaji",
  LISTRIK_AIR: "Listrik & air",
  BAHAN_BAKU: "Bahan baku",
  MARKETING: "Marketing",
  TRANSPORT: "Transport",
  EVENT: "Biaya event",
  LAINNYA: "Lainnya",
};

export const EXPENSE_CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as ExpenseCategory, label })
);
