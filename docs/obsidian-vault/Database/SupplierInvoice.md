---
tags: [database]
---
# SupplierInvoice

Domain: [[DOKUMEN & E-SIGN]]

## Field

- `id`: String
- `tenantId`: String
- `supplierId`: String
- `outletId`: String?
- `invoiceNumber`: String
- `invoiceDate`: DateTime
- `dueDate`: DateTime?
- `subtotal`: Int
- `discountAmount`: Int
- `taxAmount`: Int
- `total`: Int
- `paidAmount`: Int
- `status`: SupplierInvoiceStatus
- `purchaseOrderId`: String?
- `stockReceiptId`: String?
- `notes`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Supplier]] (`invoices`, 1-N)
- [[SupplierPayment]] (`payments`, 1-N)
- [[Tenant]] (`supplierInvoices`, 1-N)

## Dipakai oleh Fitur

- [[simple-dashboard-service]]
- [[stock-receipt-service]]
