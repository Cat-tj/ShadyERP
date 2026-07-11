---
tags: [database]
---
# DocumentSigner

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `documentId`: String
- `userId`: String
- `sequence`: Int
- `status`: SignerStatus
- `signedAt`: DateTime?
- `signatureData`: String?
- `rejectionReason`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Document]] (`signers`, 1-N)
- [[User]] (`documentSignings`, 1-N)

## Dipakai oleh Fitur

- [[document-service]]
- [[e-sign-service]]
