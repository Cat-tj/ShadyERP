---
tags: [database]
---
# StockTransfer

Domain: [[PRODUK & STOK]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `fromOutletId`: String
- `toOutletId`: String
- `transferredById`: String
- `approvedById`: String?
- `sentById`: String?
- `receivedById`: String?
- `status`: StockTransferStatus
- `qty`: Int
- `sentQty`: Int?
- `receivedQty`: Int?
- `note`: String?
- `rejectReason`: String?
- `createdAt`: DateTime
- `approvedAt`: DateTime?
- `sentAt`: DateTime?
- `receivedAt`: DateTime?
- `rejectedAt`: DateTime?
- `cancelledAt`: DateTime?

## Relasi Database

- [[Outlet]] (`transfersFrom`, 1-N)
- [[Product]] (`stockTransfers`, 1-N)
- [[Tenant]] (`stockTransfers`, 1-N)
- [[User]] (`stockTransfersCreated`, 1-N)

## Dipakai oleh Fitur

- [[product-service]]
