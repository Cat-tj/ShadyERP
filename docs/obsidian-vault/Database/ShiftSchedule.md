---
tags: [database]
---
# ShiftSchedule

Domain: [[ABSENSI & JADWAL]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `userId`: String
- `startAt`: DateTime
- `endAt`: DateTime
- `workType`: ShiftWorkType
- `payType`: ShiftPayType
- `shiftPay`: Int?
- `holidayBonus`: Int
- `overtimeNote`: String?
- `note`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`shiftSchedules`, 1-N)
- [[Tenant]] (`shiftSchedules`, 1-N)
- [[User]] (`shiftSchedules`, 1-N)

## Dipakai oleh Fitur

- [[schedule-service]]
