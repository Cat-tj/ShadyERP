---
tags: [database]
---
# ProductVariantGroup

Domain: [[PRODUK & STOK]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `name`: String
- `type`: VariantGroupType
- `required`: Boolean
- `sortOrder`: Int
- `createdAt`: DateTime

## Relasi Database

- [[Product]] (`variantGroups`, 1-N)
- [[ProductVariantOption]] (`options`, 1-N)
- [[Tenant]] (`productVariantGroups`, 1-N)

## Dipakai oleh Fitur

- [[product-variant-service]]
