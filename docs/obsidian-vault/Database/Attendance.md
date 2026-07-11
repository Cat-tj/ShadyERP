---
tags: [database]
---
# Attendance

Domain: [[ABSENSI & JADWAL]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `userId`: String
- `clockInAt`: DateTime?
- `clockOutAt`: DateTime?
- `clockInPhotoUrl`: String?
- `lat`: Float?
- `lng`: Float?
- `status`: AttendanceStatus
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`attendances`, 1-N)
- [[Tenant]] (`attendances`, 1-N)
- [[User]] (`attendances`, 1-N)

## Dipakai oleh Fitur

- [[attendance-service]]
