---
tags: [database]
---
# ProductUom

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `name`: String
- `conversionRate`: Int
- `price`: Int?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Product]] (`uoms`, 1-N)
- [[Tenant]] (`productUoms`, 1-N)

