---
tags: [database]
---
# SuperAdmin

Domain: [[SUPER ADMIN (LINTAS TENANT)]]

## Field

- `id`: String
- `email`: String
- `passwordHash`: String
- `name`: String
- `createdAt`: DateTime

## Relasi Database

- [[SuperAdminAuditLog]] (`auditLogs`, 1-N)

## Dipakai oleh Fitur

- [[super-admin-service]]
