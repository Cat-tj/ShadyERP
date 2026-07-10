# Domain: UNIVERSAL ID SYSTEM (KARTU QR)

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `UidBatch`, `UidCard`

```mermaid
erDiagram
  UidBatch {
    String id
    String tenantId
    UidCardType cardType
    Int quantity
    String serialPrefix
    DateTime createdAt
  }
  UidCard {
    String id
    String tenantId
    String batchId
    String uid
    String serialNumber
    UidCardType cardType
    UidCardStatus status
    String memberId
  }
  UidBatch ||--o{ UidCard : "cards"
```

## Relasi keluar domain

- `Tenant` → `UidBatch` (`uidBatches`, 1-N)
- `Tenant` → `UidCard` (`uidCards`, 1-N)
- `User` → `UidCard` (`uidCardsAssigned`, 1-N)
- `Member` → `UidCard` (`member`, 1-1?)
