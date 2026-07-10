# Domain: BILLING & LANGGANAN

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `SubscriptionRequest`

```mermaid
erDiagram
  SubscriptionRequest {
    String id
    String tenantId
    Plan requestedPlan
    SubscriptionRequestStatus status
    String note
    String reviewNote
    DateTime createdAt
    DateTime reviewedAt
  }
```

## Relasi keluar domain

- `Tenant` → `SubscriptionRequest` (`subscriptionRequests`, 1-N)
