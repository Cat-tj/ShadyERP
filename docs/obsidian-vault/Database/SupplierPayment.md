---
tags: [database]
---
# SupplierPayment

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `supplierInvoiceId`: String
- `paymentDate`: DateTime
- `amount`: Int
- `paymentMethod`: String
- `notes`: String?
- `createdAt`: DateTime

## Relasi Database

- [[SupplierInvoice]] (`payments`, 1-N)
- [[Tenant]] (`supplierPayments`, 1-N)

