# Domain: PENGELUARAN OPERASIONAL

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Expense`

```mermaid
erDiagram
  Expense {
    String id
    String tenantId
    String outletId
    String createdById
    ExpenseCategory category
    Int amount
    String note
    DateTime spentAt
  }
```

## Relasi keluar domain

- `Tenant` → `Expense` (`expenses`, 1-N)
- `Outlet` → `Expense` (`expenses`, 1-N)
- `User` → `Expense` (`expensesCreated`, 1-N)
