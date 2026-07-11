---
tags: [database]
---
# Promo

Domain: [[PROMO TERJADWAL]]

## Field

- `id`: String
- `tenantId`: String
- `name`: String
- `discountType`: PromoDiscountType
- `discountValue`: Int
- `scope`: PromoScope
- `categoryId`: String?
- `minSpend`: Int
- `daysOfWeek`: Int
- `startTime`: String
- `endTime`: String
- `isActive`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Category]] (`promos`, 1-N)
- [[Tenant]] (`promos`, 1-N)

## Dipakai oleh Fitur

- [[promo-service]]
