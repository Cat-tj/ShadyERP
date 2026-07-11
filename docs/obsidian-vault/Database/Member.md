---
tags: [database]
---
# Member

Domain: [[MEMBER]]

## Field

- `id`: String
- `tenantId`: String
- `name`: String
- `phone`: String
- `email`: String?
- `points`: Int
- `depositBalance`: Int
- `joinedAt`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[PointTransaction]] (`pointTransactions`, 1-N)
- [[Sale]] (`sales`, 1-N)
- [[Tenant]] (`members`, 1-N)
- [[UidCard]] (`member`, 1-1?)

## Dipakai oleh Fitur

- [[dashboard-service]]
- [[kpi-service]]
- [[member-service]]
- [[uid-card-service]]
