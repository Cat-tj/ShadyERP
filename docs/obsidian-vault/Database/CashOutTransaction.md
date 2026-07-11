---
tags: [database]
---
# CashOutTransaction

Domain: [[PENJUALAN]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `shiftId`: String
- `cashierId`: String
- `referenceNumber`: String
- `customerName`: String?
- `customerPhone`: String?
- `withdrawAmount`: Int
- `adminFee`: Int
- `totalCharged`: Int
- `method`: CashOutMethod
- `status`: CashOutStatus
- `voidReason`: String?
- `note`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[CashierShift]] (`cashOutTransactions`, 1-N)
- [[Outlet]] (`cashOutTransactions`, 1-N)
- [[Tenant]] (`cashOutTransactions`, 1-N)
- [[User]] (`cashOutTransactions`, 1-N)

## Dipakai oleh Fitur

- [[cash-out-service]]
- [[shift-service]]
