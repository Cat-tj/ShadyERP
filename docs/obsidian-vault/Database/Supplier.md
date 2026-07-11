---
tags: [database]
---
# Supplier

Domain: [[SUPPLIER & PURCHASE MANAGEMENT]]

## Field

- `id`: String
- `tenantId`: String
- `name`: String
- `address`: String?
- `city`: String?
- `phone`: String?
- `email`: String?
- `contactPerson`: String?
- `paymentTerms`: String?
- `taxId`: String?
- `rating`: Int?
- `notes`: String?
- `status`: SupplierStatus
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[PurchaseOrder]] (`purchaseOrders`, 1-N)
- [[SupplierInvoice]] (`invoices`, 1-N)
- [[SupplierPricingContract]] (`pricingContracts`, 1-N)
- [[Tenant]] (`suppliers`, 1-N)

## Dipakai oleh Fitur

- [[stock-receipt-service]]
- [[supplier-service]]
