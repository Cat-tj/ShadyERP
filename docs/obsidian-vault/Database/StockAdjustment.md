---
tags: [database]
---
# StockAdjustment

Domain: [[PRODUK & STOK]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `outletId`: String
- `changedById`: String
- `previousQty`: Int
- `newQty`: Int
- `delta`: Int
- `note`: String?
- `createdAt`: DateTime

## Relasi Database

- [[Outlet]] (`stockAdjustments`, 1-N)
- [[Product]] (`stockAdjustments`, 1-N)
- [[Tenant]] (`stockAdjustments`, 1-N)
- [[User]] (`stockAdjustments`, 1-N)

## Dipakai oleh Fitur

- [[product-service]]
- [[stock-count-service]]
