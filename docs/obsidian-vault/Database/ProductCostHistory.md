---
tags: [database]
---
# ProductCostHistory

Domain: [[SUPPLIER & PURCHASE MANAGEMENT]]

## Field

- `id`: String
- `tenantId`: String
- `productId`: String
- `previousCost`: Int?
- `newCost`: Int
- `reason`: String?
- `changedBy`: String?
- `createdAt`: DateTime

## Relasi Database

- [[Product]] (`costHistory`, 1-N)
- [[Tenant]] (`productCostHistory`, 1-N)
- [[User]] (`costHistoryChanges`, 1-N)

## Dipakai oleh Fitur

- [[pricing-service]]
- [[stock-receipt-service]]
