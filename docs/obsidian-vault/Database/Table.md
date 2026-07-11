---
tags: [database]
---
# Table

Domain: [[PESAN LEWAT QR MEJA]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `name`: String
- `qrToken`: String
- `isActive`: Boolean
- `posX`: Int
- `posY`: Int
- `floor`: Int
- `shape`: String
- `capacity`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`tables`, 1-N)
- [[TableOrder]] (`orders`, 1-N)
- [[Tenant]] (`tables`, 1-N)

## Dipakai oleh Fitur

- [[table-order-service]]
- [[table-service]]
