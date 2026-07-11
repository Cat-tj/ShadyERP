---
tags: [database]
---
# EquipmentMaintenanceLog

Domain: [[MAINTENANCE ALAT]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `equipmentId`: String
- `reportedById`: String
- `status`: MaintenanceStatus
- `issue`: String
- `actionTaken`: String?
- `cost`: Int
- `reportedAt`: DateTime
- `resolvedAt`: DateTime?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Equipment]] (`logs`, 1-N)
- [[Outlet]] (`equipmentMaintenanceLogs`, 1-N)
- [[Tenant]] (`equipmentMaintenanceLogs`, 1-N)
- [[User]] (`equipmentMaintenanceLogs`, 1-N)

## Dipakai oleh Fitur

- [[equipment-service]]
