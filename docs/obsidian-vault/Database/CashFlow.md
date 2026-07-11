---
tags: [database]
---
# CashFlow

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `createdById`: String
- `type`: CashFlowType
- `category`: String
- `amount`: Int
- `note`: String?
- `spentAt`: DateTime
- `createdAt`: DateTime

## Relasi Database

- [[Outlet]] (`cashFlows`, 1-N)
- [[Tenant]] (`cashFlows`, 1-N)
- [[User]] (`cashFlowsCreated`, 1-N)

## Dipakai oleh Fitur

- [[cashflow-service]]
