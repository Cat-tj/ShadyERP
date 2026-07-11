---
tags: [database]
---
# ProductRecipeItem

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `ingredientId`: String
- `qty`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Product]] (`recipes`, 1-N)
- [[Tenant]] (`productRecipeItems`, 1-N)

