# Domain: MEMBER

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Member`, `PointTransaction`

```mermaid
erDiagram
  Member {
    String id
    String tenantId
    String name
    String phone
    String email
    Int points
    Int depositBalance
    DateTime joinedAt
  }
  PointTransaction {
    String id
    String tenantId
    String memberId
    PointTransactionType type
    Int points
    String saleId
    String note
    DateTime createdAt
  }
  Member ||--o{ PointTransaction : "pointTransactions"
```

## Relasi keluar domain

- `Tenant` → `Member` (`members`, 1-N)
- `Tenant` → `PointTransaction` (`pointTransactions`, 1-N)
- `Member` → `UidCard` (`member`, 1-1?)
- `Member` → `Sale` (`sales`, 1-N)
- `Sale` → `PointTransaction` (`pointTransactions`, 1-N)
