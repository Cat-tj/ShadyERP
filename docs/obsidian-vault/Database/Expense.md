---
tags: [database]
---
# Expense

Domain: [[PENGELUARAN OPERASIONAL]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `createdById`: String
- `category`: ExpenseCategory
- `amount`: Int
- `note`: String?
- `spentAt`: DateTime
- `createdAt`: DateTime

## Relasi Database

- [[Outlet]] (`expenses`, 1-N)
- [[Tenant]] (`expenses`, 1-N)
- [[User]] (`expensesCreated`, 1-N)

## Dipakai oleh Fitur

- [[expense-service]]
- [[finance-analytics-service]]
- [[finance-operational-service]]
