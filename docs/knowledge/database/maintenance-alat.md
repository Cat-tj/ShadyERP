# Domain: MAINTENANCE ALAT

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Equipment`, `EquipmentMaintenanceLog`

```mermaid
erDiagram
  Equipment {
    String id
    String tenantId
    String outletId
    String name
    String category
    String serialNumber
    EquipmentStatus status
    String note
  }
  EquipmentMaintenanceLog {
    String id
    String tenantId
    String outletId
    String equipmentId
    String reportedById
    MaintenanceStatus status
    String issue
    String actionTaken
  }
  Equipment ||--o{ EquipmentMaintenanceLog : "logs"
```

## Relasi keluar domain

- `Tenant` → `Equipment` (`equipments`, 1-N)
- `Tenant` → `EquipmentMaintenanceLog` (`equipmentMaintenanceLogs`, 1-N)
- `Outlet` → `Equipment` (`equipments`, 1-N)
- `Outlet` → `EquipmentMaintenanceLog` (`equipmentMaintenanceLogs`, 1-N)
- `User` → `EquipmentMaintenanceLog` (`equipmentMaintenanceLogs`, 1-N)
