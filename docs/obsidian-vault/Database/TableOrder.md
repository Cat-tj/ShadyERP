---
tags: [database]
---
# TableOrder

Domain: [[PESAN LEWAT QR MEJA]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `tableId`: String
- `saleId`: String?
- `customerName`: String?
- `note`: String?
- `status`: TableOrderStatus
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`tableOrders`, 1-N)
- [[Sale]] (`tableOrder`, 1-1?)
- [[Table]] (`orders`, 1-N)
- [[TableOrderItem]] (`items`, 1-N)
- [[Tenant]] (`tableOrders`, 1-N)

## Dipakai oleh Fitur

- [[simple-dashboard-service]]
- [[table-order-service]]
