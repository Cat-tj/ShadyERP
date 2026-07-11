---
tags: [database]
---
# LaundryService

Domain: [[LAUNDRY]]

## Field

- `id`: String
- `tenantId`: String
- `name`: String
- `serviceType`: LaundryServiceType
- `pricePerKg`: Int?
- `servicePrice`: Int
- `isActive`: Boolean
- `sortOrder`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[LaundryOrder]] (`orders`, 1-N)
- [[Tenant]] (`laundryServices`, 1-N)

## Dipakai oleh Fitur

- [[laundry-service]]
