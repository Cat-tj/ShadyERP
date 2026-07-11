---
tags: [database]
---
# DocumentAccess

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `documentId`: String
- `userId`: String?
- `role`: String?
- `level`: DocumentAccessLevel
- `createdAt`: DateTime

## Relasi Database

- [[Document]] (`accessControl`, 1-N)
- [[User]] (`documentAccess`, 1-N)

## Dipakai oleh Fitur

- [[document-service]]
