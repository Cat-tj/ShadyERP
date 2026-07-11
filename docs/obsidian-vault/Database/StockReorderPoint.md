---
tags: [database]
---
# StockReorderPoint

Domain: [[INVENTORY ENHANCEMENTS]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `outletId`: String
- `minQty`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`reorderPoints`, 1-N)
- [[Product]] (`reorderPoints`, 1-N)
- [[Tenant]] (`reorderPoints`, 1-N)

## Dipakai oleh Fitur

- [[inventory-service]]
