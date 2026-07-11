---
tags: [database]
---
# PurchaseOrderItem

Domain: [[SUPPLIER & PURCHASE MANAGEMENT]]

## Field

- `id`: String
- `poId`: String
- `productId`: String
- `qty`: Int
- `unitPrice`: Int
- `subtotal`: Int
- `qtyReceived`: Int
- `createdAt`: DateTime

## Relasi Database

- [[Product]] (`purchaseOrderItems`, 1-N)
- [[PurchaseOrder]] (`items`, 1-N)

## Dipakai oleh Fitur

- [[stock-receipt-service]]
