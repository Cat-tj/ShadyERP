---
tags: [database]
---
# StockBatch

Domain: [[INVENTORY ENHANCEMENTS]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `outletId`: String
- `batchNumber`: String
- `expirationDate`: DateTime?
- `qtyReceived`: Int
- `qtyRemaining`: Int
- `receivedDate`: DateTime
- `note`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`stockBatches`, 1-N)
- [[Product]] (`stockBatches`, 1-N)
- [[Tenant]] (`stockBatches`, 1-N)

## Dipakai oleh Fitur

- [[inventory-service]]
