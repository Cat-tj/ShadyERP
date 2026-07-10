# Domain: LAUNDRY

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `LaundryOrder`, `LaundryService`

```mermaid
erDiagram
  LaundryOrder {
    String id
    String tenantId
    String outletId
    String laundryServiceId
    String orderNumber
    String customerName
    String customerPhone
    LaundryServiceType serviceType
  }
  LaundryService {
    String id
    String tenantId
    String name
    LaundryServiceType serviceType
    Int pricePerKg
    Int servicePrice
    Boolean isActive
    Int sortOrder
  }
  LaundryService ||--o{ LaundryOrder : "orders"
```

## Relasi keluar domain

- `Tenant` → `LaundryOrder` (`laundryOrders`, 1-N)
- `Tenant` → `LaundryService` (`laundryServices`, 1-N)
- `Outlet` → `LaundryOrder` (`laundryOrders`, 1-N)
- `User` → `LaundryOrder` (`laundryOrdersCreated`, 1-N)
