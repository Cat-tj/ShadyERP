---
tags: [database]
---
# TableOrderItem

Domain: [[PESAN LEWAT QR MEJA]]

## Field

- `id`: String
- `tenantId`: String
- `tableOrderId`: String
- `productId`: String
- `productName`: String
- `variantLabel`: String?
- `price`: Int
- `qty`: Int
- `note`: String?

## Relasi Database

- [[Product]] (`tableOrderItems`, 1-N)
- [[TableOrder]] (`items`, 1-N)
- [[Tenant]] (`tableOrderItems`, 1-N)

