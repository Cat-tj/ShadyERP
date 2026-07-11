---
tags: [database]
---
# Lead

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `name`: String
- `phone`: String?
- `email`: String?
- `source`: String?
- `interest`: String?
- `expectedValue`: Int
- `nextFollowUpAt`: DateTime?
- `status`: LeadStatus
- `notes`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Tenant]] (`leads`, 1-N)

## Dipakai oleh Fitur

- [[lead-service]]
