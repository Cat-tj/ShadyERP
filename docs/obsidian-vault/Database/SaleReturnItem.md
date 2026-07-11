---
tags: [database]
---
# SaleReturnItem

Domain: [[PENJUALAN]]

## Field

- `id`: String
- `tenantId`: String
- `saleReturnId`: String
- `saleItemId`: String
- `qty`: Int
- `refundAmount`: Int

## Relasi Database

- [[SaleItem]] (`saleReturnItems`, 1-N)
- [[SaleReturn]] (`items`, 1-N)
- [[Tenant]] (`saleReturnItems`, 1-N)

