---
tags: [database]
---
# UidBatch

Domain: [[UNIVERSAL ID SYSTEM (KARTU QR)]]

## Field

- `id`: String
- `tenantId`: String
- `cardType`: UidCardType
- `quantity`: Int
- `serialPrefix`: String
- `createdAt`: DateTime

## Relasi Database

- [[Tenant]] (`uidBatches`, 1-N)
- [[UidCard]] (`cards`, 1-N)

## Dipakai oleh Fitur

- [[uid-card-service]]
