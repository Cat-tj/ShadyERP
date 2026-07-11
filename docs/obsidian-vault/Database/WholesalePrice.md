---
tags: [database]
---
# WholesalePrice

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `minQty`: Int
- `price`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Product]] (`wholesalePrices`, 1-N)
- [[Tenant]] (`wholesalePrices`, 1-N)

