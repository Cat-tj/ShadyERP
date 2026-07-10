# Domain: PESAN LEWAT QR MEJA

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Table`, `TableOrder`, `TableOrderItem`

```mermaid
erDiagram
  Table {
    String id
    String tenantId
    String outletId
    String name
    String qrToken
    Boolean isActive
    Int posX
    Int posY
  }
  TableOrder {
    String id
    String tenantId
    String outletId
    String tableId
    String saleId
    String customerName
    String note
    TableOrderStatus status
  }
  TableOrderItem {
    String id
    String tenantId
    String tableOrderId
    String productId
    String productName
    String variantLabel
    Int price
    Int qty
  }
  Table ||--o{ TableOrder : "orders"
  TableOrder ||--o{ TableOrderItem : "items"
```

## Relasi keluar domain

- `Tenant` → `Table` (`tables`, 1-N)
- `Tenant` → `TableOrder` (`tableOrders`, 1-N)
- `Tenant` → `TableOrderItem` (`tableOrderItems`, 1-N)
- `Outlet` → `Table` (`tables`, 1-N)
- `Outlet` → `TableOrder` (`tableOrders`, 1-N)
- `Product` → `TableOrderItem` (`tableOrderItems`, 1-N)
- `TableOrder` → `Sale` (`tableOrder`, 1-1?)
