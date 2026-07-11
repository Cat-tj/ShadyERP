---
tags: [database]
---
# Equipment

Domain: [[MAINTENANCE ALAT]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `name`: String
- `category`: String
- `serialNumber`: String?
- `status`: EquipmentStatus
- `note`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[EquipmentMaintenanceLog]] (`logs`, 1-N)
- [[Outlet]] (`equipments`, 1-N)
- [[Tenant]] (`equipments`, 1-N)

## Dipakai oleh Fitur

- [[equipment-service]]
