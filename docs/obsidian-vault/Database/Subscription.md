---
tags: [database]
---
# Subscription

Domain: [[BILLING & SUBSCRIPTION (SUMOPOD)]]

## Field

- `id`: String
- `tenantId`: String
- `plan`: Plan
- `status`: SubscriptionStatus
- `billingCycle`: String
- `currentPeriodStart`: DateTime
- `currentPeriodEnd`: DateTime
- `nextBillingDate`: DateTime?
- `lastPaymentId`: String?
- `lastPaymentAmount`: Int?
- `lastPaymentDate`: DateTime?
- `trialStartDate`: DateTime?
- `trialEndDate`: DateTime?
- `isOnTrial`: Boolean
- `autoRenew`: Boolean
- `cancelledAt`: DateTime?
- `cancelledReason`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Invoice]] (`invoices`, 1-N)
- [[PaymentHistory]] (`paymentHistory`, 1-N)
- [[Tenant]] (`subscription`, 1-1?)

## Dipakai oleh Fitur

- [[billing-service]]
