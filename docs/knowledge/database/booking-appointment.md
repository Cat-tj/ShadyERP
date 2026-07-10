# Domain: BOOKING / APPOINTMENT

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Booking`

```mermaid
erDiagram
  Booking {
    String id
    String tenantId
    String outletId
    BookingType type
    String customerName
    String customerPhone
    String serviceName
    DateTime scheduledAt
  }
```

## Relasi keluar domain

- `Tenant` → `Booking` (`bookings`, 1-N)
- `Outlet` → `Booking` (`bookings`, 1-N)
- `User` → `Booking` (`bookingsAssigned`, 1-N)
- `Booking` → `Sale` (`sales`, 1-N)
