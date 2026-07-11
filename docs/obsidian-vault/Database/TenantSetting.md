---
tags: [database]
---
# TenantSetting

Domain: [[PENGATURAN TENANT]]

## Field

- `id`: String
- `tenantId`: String
- `taxPercent`: Int
- `pointsPerAmount`: Int
- `receiptFooter`: String?
- `staticQrisPayload`: String?
- `enableParkingFee`: Boolean
- `accountingMode`: AccountingMode
- `updatedAt`: DateTime

## Relasi Database

- [[Tenant]] (`setting`, 1-1?)

## Dipakai oleh Fitur

- [[stock-receipt-service]]
- [[super-admin-service]]
- [[tenant-service]]
