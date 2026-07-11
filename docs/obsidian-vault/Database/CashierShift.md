---
tags: [database]
---
# CashierShift

Domain: [[SHIFT KASIR]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `userId`: String
- `openingCash`: Int
- `closingCash`: Int?
- `expectedCash`: Int?
- `status`: ShiftStatus
- `openedAt`: DateTime
- `closedAt`: DateTime?

## Relasi Database

- [[CashOutTransaction]] (`cashOutTransactions`, 1-N)
- [[Outlet]] (`cashierShifts`, 1-N)
- [[Sale]] (`sales`, 1-N)
- [[SaleReturn]] (`saleReturns`, 1-N)
- [[Tenant]] (`cashierShifts`, 1-N)
- [[User]] (`cashierShifts`, 1-N)

## Dipakai oleh Fitur

- [[cash-out-service]]
- [[finance-operational-service]]
- [[hr-analytics-service]]
- [[shift-service]]
- [[simple-dashboard-service]]
- [[table-order-service]]
