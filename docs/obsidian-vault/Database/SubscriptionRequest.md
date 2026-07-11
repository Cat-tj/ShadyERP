---
tags: [database]
---
# SubscriptionRequest

Domain: [[BILLING & LANGGANAN]]

## Field

- `id`: String
- `tenantId`: String
- `requestedPlan`: Plan
- `status`: SubscriptionRequestStatus
- `note`: String?
- `reviewNote`: String?
- `createdAt`: DateTime
- `reviewedAt`: DateTime?

## Relasi Database

- [[Tenant]] (`subscriptionRequests`, 1-N)

## Dipakai oleh Fitur

- [[billing-service]]
- [[super-admin-service]]
