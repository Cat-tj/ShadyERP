---
tags: [database]
---
# LaundryOrder

Domain: [[LAUNDRY]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `laundryServiceId`: String?
- `orderNumber`: String
- `customerName`: String
- `customerPhone`: String?
- `serviceType`: LaundryServiceType
- `serviceName`: String?
- `weightGram`: Int?
- `itemQty`: Int?
- `pricePerKg`: Int?
- `servicePrice`: Int
- `extraFee`: Int
- `discountAmount`: Int
- `total`: Int
- `paidAmount`: Int
- `dueAt`: DateTime?
- `pickupDelivery`: Boolean
- `deliveryAddress`: String?
- `status`: LaundryOrderStatus
- `note`: String?
- `createdById`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[LaundryService]] (`orders`, 1-N)
- [[Outlet]] (`laundryOrders`, 1-N)
- [[Tenant]] (`laundryOrders`, 1-N)
- [[User]] (`laundryOrdersCreated`, 1-N)

## Dipakai oleh Fitur

- [[laundry-service]]
