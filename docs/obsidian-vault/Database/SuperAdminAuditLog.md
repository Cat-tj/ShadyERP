---
tags: [database]
---
# SuperAdminAuditLog

Domain: [[SUPER ADMIN (LINTAS TENANT)]]

## Field

- `id`: String
- `actorId`: String
- `action`: String
- `targetTenantId`: String?
- `description`: String
- `beforeJson`: Json?
- `afterJson`: Json?
- `createdAt`: DateTime

## Relasi Database

- [[SuperAdmin]] (`auditLogs`, 1-N)

## Dipakai oleh Fitur

- [[super-admin-service]]
