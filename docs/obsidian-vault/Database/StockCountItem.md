---
tags: [database]
---
# StockCountItem

Domain: [[SUPPLIER & PURCHASE MANAGEMENT]]

## Field

- `id`: String
- `countId`: String
- `productId`: String
- `systemQty`: Int
- `physicalQty`: Int
- `variance`: Int
- `varianceValue`: Int
- `notes`: String?

## Relasi Database

- [[Product]] (`stockCountItems`, 1-N)
- [[StockCount]] (`items`, 1-N)

## Dipakai oleh Fitur

- [[stock-count-service]]
