---
tags: [database]
---
# SupplierPricingContract

Domain: [[SUPPLIER & PURCHASE MANAGEMENT]]

## Field

- `id`: String
- `tenantId`: String
- `supplierId`: String
- `productId`: String
- `unitPrice`: Int
- `minQty`: Int
- `leadDays`: Int
- `isActive`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Product]] (`supplierContracts`, 1-N)
- [[Supplier]] (`pricingContracts`, 1-N)
- [[Tenant]] (`supplierContracts`, 1-N)

## Dipakai oleh Fitur

- [[pricing-service]]
