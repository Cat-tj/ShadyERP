---
tags: [database]
---
# StockCount

Domain: [[SUPPLIER & PURCHASE MANAGEMENT]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `countDate`: DateTime
- `countNumber`: String
- `status`: StockCountStatus
- `startedBy`: String?
- `completedBy`: String?
- `verifiedBy`: String?
- `totalVariance`: Int
- `notes`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`stockCounts`, 1-N)
- [[StockCountItem]] (`items`, 1-N)
- [[Tenant]] (`stockCounts`, 1-N)
- [[User]] (`stockCountsStarted`, 1-N)

## Dipakai oleh Fitur

- [[stock-count-service]]
