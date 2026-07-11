---
tags: [database]
---
# PointTransaction

Domain: [[MEMBER]]

## Field

- `id`: String
- `tenantId`: String
- `memberId`: String
- `type`: PointTransactionType
- `points`: Int
- `saleId`: String?
- `note`: String?
- `createdAt`: DateTime

## Relasi Database

- [[Member]] (`pointTransactions`, 1-N)
- [[Sale]] (`pointTransactions`, 1-N)
- [[Tenant]] (`pointTransactions`, 1-N)

## Dipakai oleh Fitur

- [[member-service]]
