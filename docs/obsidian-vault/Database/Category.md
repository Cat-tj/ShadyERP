---
tags: [database]
---
# Category

Domain: [[PRODUK & STOK]]

## Field

- `id`: String
- `tenantId`: String
- `name`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Product]] (`products`, 1-N)
- [[Promo]] (`promos`, 1-N)
- [[Tenant]] (`categories`, 1-N)

## Dipakai oleh Fitur

- [[finance-analytics-service]]
- [[product-service]]
