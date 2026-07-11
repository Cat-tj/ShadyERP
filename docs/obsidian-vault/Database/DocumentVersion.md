---
tags: [database]
---
# DocumentVersion

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `documentId`: String
- `version`: Int
- `fileUrl`: String
- `createdAt`: DateTime
- `createdBy`: String

## Relasi Database

- [[Document]] (`versions`, 1-N)
- [[User]] (`documentVersions`, 1-N)

## Dipakai oleh Fitur

- [[document-service]]
