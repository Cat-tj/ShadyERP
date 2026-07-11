---
tags: [database]
---
# Document

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `name`: String
- `description`: String?
- `fileUrl`: String
- `status`: DocumentStatus
- `uploadedBy`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `expiresAt`: DateTime?

## Relasi Database

- [[DocumentAccess]] (`accessControl`, 1-N)
- [[DocumentSigner]] (`signers`, 1-N)
- [[DocumentVersion]] (`versions`, 1-N)
- [[Tenant]] (`documents`, 1-N)
- [[User]] (`documentsUploaded`, 1-N)

## Dipakai oleh Fitur

- [[document-service]]
- [[e-sign-service]]
