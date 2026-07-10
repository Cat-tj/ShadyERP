# Domain: INVENTORY ENHANCEMENTS

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `StockReorderPoint`, `StockBatch`, `WarehouseLocation`

```mermaid
erDiagram
  StockReorderPoint {
    String id
    String tenantId
    String productId
    String outletId
    Int minQty
    DateTime createdAt
    DateTime updatedAt
  }
  StockBatch {
    String id
    String tenantId
    String productId
    String outletId
    String batchNumber
    DateTime expirationDate
    Int qtyReceived
    Int qtyRemaining
  }
  WarehouseLocation {
    String id
    String tenantId
    String outletId
    String code
    String name
    Int capacity
    Boolean isActive
    DateTime createdAt
  }
```

## Relasi keluar domain

- `Tenant` → `StockReorderPoint` (`reorderPoints`, 1-N)
- `Tenant` → `StockBatch` (`stockBatches`, 1-N)
- `Tenant` → `WarehouseLocation` (`warehouseLocations`, 1-N)
- `Outlet` → `StockReorderPoint` (`reorderPoints`, 1-N)
- `Outlet` → `StockBatch` (`stockBatches`, 1-N)
- `Outlet` → `WarehouseLocation` (`warehouseLocations`, 1-N)
- `Product` → `StockReorderPoint` (`reorderPoints`, 1-N)
- `Product` → `StockBatch` (`stockBatches`, 1-N)
