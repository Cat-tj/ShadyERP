---
tags: [database]
---
# JournalEntry

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `date`: DateTime
- `description`: String
- `debitCode`: String
- `creditCode`: String
- `amount`: Int
- `reference`: String?
- `createdAt`: DateTime

## Relasi Database

- [[Tenant]] (`journalEntries`, 1-N)

