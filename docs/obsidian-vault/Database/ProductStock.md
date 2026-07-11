---
tags: [database]
---
# ProductStock

Domain: [[PRODUK & STOK]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `outletId`: String
- `qty`: Int
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`productStocks`, 1-N)
- [[Product]] (`stocks`, 1-N)
- [[Tenant]] (`productStocks`, 1-N)

## Dipakai oleh Fitur

- [[stock-count-service]]
- [[stock-receipt-service]]
