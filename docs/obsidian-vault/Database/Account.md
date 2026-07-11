---
tags: [database]
---
# Account

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `code`: String
- `name`: String
- `type`: String
- `createdAt`: DateTime

## Relasi Database

- [[Tenant]] (`accounts`, 1-N)

## Dipakai oleh Fitur

- [[accounting-service]]
