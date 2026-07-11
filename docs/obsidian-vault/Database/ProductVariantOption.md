---
tags: [database]
---
# ProductVariantOption

Domain: [[PRODUK & STOK]]

## Field

- `id`: String
- `tenantId`: String
- `variantGroupId`: String
- `name`: String
- `priceDelta`: Int
- `sortOrder`: Int

## Relasi Database

- [[ProductVariantGroup]] (`options`, 1-N)
- [[Tenant]] (`productVariantOptions`, 1-N)

## Dipakai oleh Fitur

- [[product-variant-service]]
