---
tags: [database]
---
# PaymentHistory

Domain: [[BILLING & SUBSCRIPTION (SUMOPOD)]]

## Field

- `id`: String
- `subscriptionId`: String
- `sumopodPaymentId`: String
- `invoiceId`: String
- `amount`: Int
- `currency`: String
- `paymentMethod`: String?
- `status`: PaymentStatus
- `failureReason`: String?
- `createdAt`: DateTime
- `processedAt`: DateTime?
- `metadata`: Json?

## Relasi Database

- [[Invoice]] (`paymentHistory`, 1-N)
- [[Subscription]] (`paymentHistory`, 1-N)

## Dipakai oleh Fitur

- [[billing-service]]
