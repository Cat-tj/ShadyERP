---
tags: [database]
---
# UserOutlet

Domain: [[USER & AKSES]]

## Field

- `id`: String
- `tenantId`: String
- `userId`: String
- `outletId`: String
- `createdAt`: DateTime

## Relasi Database

- [[Outlet]] (`userOutlets`, 1-N)
- [[User]] (`userOutlets`, 1-N)

