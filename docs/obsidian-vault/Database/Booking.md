---
tags: [database]
---
# Booking

Domain: [[BOOKING - APPOINTMENT]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `type`: BookingType
- `customerName`: String
- `customerPhone`: String?
- `serviceName`: String
- `scheduledAt`: DateTime
- `durationMinutes`: Int
- `staffUserId`: String?
- `pax`: Int?
- `eventAddress`: String?
- `quotedAmount`: Int?
- `transportFee`: Int
- `staffFee`: Int
- `depositAmount`: Int
- `status`: BookingStatus
- `note`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`bookings`, 1-N)
- [[Sale]] (`sales`, 1-N)
- [[Tenant]] (`bookings`, 1-N)
- [[User]] (`bookingsAssigned`, 1-N)

## Dipakai oleh Fitur

- [[booking-service]]
