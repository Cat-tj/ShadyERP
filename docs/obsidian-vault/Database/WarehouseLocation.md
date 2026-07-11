---
tags: [database]
---
# WarehouseLocation

Domain: [[INVENTORY ENHANCEMENTS]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `code`: String
- `name`: String
- `capacity`: Int?
- `isActive`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`warehouseLocations`, 1-N)
- [[Tenant]] (`warehouseLocations`, 1-N)

## Dipakai oleh Fitur

- [[inventory-service]]
