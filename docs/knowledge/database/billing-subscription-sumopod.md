# Domain: BILLING & SUBSCRIPTION (SUMOPOD)

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Subscription`, `Invoice`, `PaymentHistory`

```mermaid
erDiagram
  Subscription {
    String id
    String tenantId
    Plan plan
    SubscriptionStatus status
    String billingCycle
    DateTime currentPeriodStart
    DateTime currentPeriodEnd
    DateTime nextBillingDate
  }
  Invoice {
    String id
    String subscriptionId
    String invoiceNumber
    String sumopodPaymentId
    Int amount
    Int tax
    Int total
    String currency
  }
  PaymentHistory {
    String id
    String subscriptionId
    String sumopodPaymentId
    String invoiceId
    Int amount
    String currency
    String paymentMethod
    PaymentStatus status
  }
  Subscription ||--o{ Invoice : "invoices"
  Subscription ||--o{ PaymentHistory : "paymentHistory"
  Invoice ||--o{ PaymentHistory : "paymentHistory"
```

## Relasi keluar domain

- `Subscription` → `Tenant` (`subscription`, 1-1?)
