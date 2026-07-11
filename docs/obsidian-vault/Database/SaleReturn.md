---
tags: [database]
---
# SaleReturn

Domain: [[PENJUALAN]]

## Field

- `id`: String
- `tenantId`: String
- `saleId`: String
- `processedById`: String
- `shiftId`: String?
- `reason`: String
- `totalRefund`: Int
- `refundMethod`: String
- `createdAt`: DateTime

## Relasi Database

- [[CashierShift]] (`saleReturns`, 1-N)
- [[Sale]] (`saleReturns`, 1-N)
- [[SaleReturnItem]] (`items`, 1-N)
- [[Tenant]] (`saleReturns`, 1-N)
- [[User]] (`saleReturnsProcessed`, 1-N)

## Dipakai oleh Fitur

- [[shift-service]]
