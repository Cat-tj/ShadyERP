# Domain: AUDIT LOG

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `AuditLog`

```mermaid
erDiagram
  AuditLog {
    String id
    String tenantId
    String userId
    AuditAction action
    String description
    DateTime createdAt
  }
```

## Relasi keluar domain

- `Tenant` → `AuditLog` (`auditLogs`, 1-N)
- `User` → `AuditLog` (`auditLogs`, 1-N)
