---
tags: [database]
---
# SaleItem

Domain: [[PENJUALAN]]

## Field

- `id`: String
- `tenantId`: String
- `saleId`: String
- `productId`: String
- `productName`: String
- `variantLabel`: String?
- `price`: Int
- `qty`: Int
- `discountAmount`: Int
- `subtotal`: Int
- `returnedQty`: Int

## Relasi Database

- [[Product]] (`saleItems`, 1-N)
- [[Sale]] (`items`, 1-N)
- [[SaleReturnItem]] (`saleReturnItems`, 1-N)
- [[Tenant]] (`saleItems`, 1-N)

## Dipakai oleh Fitur

- [[finance-analytics-service]]
- [[kpi-service]]
- [[report-service]]
