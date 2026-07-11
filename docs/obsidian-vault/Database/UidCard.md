---
tags: [database]
---
# UidCard

Domain: [[UNIVERSAL ID SYSTEM (KARTU QR)]]

## Field

- `id`: String
- `tenantId`: String
- `batchId`: String?
- `uid`: String
- `serialNumber`: String
- `cardType`: UidCardType
- `status`: UidCardStatus
- `memberId`: String?
- `employeeUserId`: String?
- `activatedAt`: DateTime?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Member]] (`member`, 1-1?)
- [[Tenant]] (`uidCards`, 1-N)
- [[UidBatch]] (`cards`, 1-N)
- [[User]] (`uidCardsAssigned`, 1-N)

## Dipakai oleh Fitur

- [[uid-card-service]]
