---
tags: [database]
---
# AuditLog

Domain: [[AUDIT LOG]]

## Field

- `id`: String
- `tenantId`: String
- `userId`: String
- `action`: AuditAction
- `description`: String
- `createdAt`: DateTime

## Relasi Database

- [[Tenant]] (`auditLogs`, 1-N)
- [[User]] (`auditLogs`, 1-N)

## Dipakai oleh Fitur

- [[audit-log-service]]
