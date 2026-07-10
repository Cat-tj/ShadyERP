# Domain: DOKUMEN & E-SIGN

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Document`, `DocumentVersion`, `DocumentSigner`, `DocumentAccess`, `ProductUom`, `WholesalePrice`, `ProductRecipeItem`, `SupplierInvoice`, `SupplierPayment`, `Account`, `JournalEntry`, `Lead`, `CashFlow`

```mermaid
erDiagram
  Document {
    String id
    String tenantId
    String name
    String description
    String fileUrl
    DocumentStatus status
    String uploadedBy
    DateTime createdAt
  }
  DocumentVersion {
    String id
    String documentId
    Int version
    String fileUrl
    DateTime createdAt
    String createdBy
  }
  DocumentSigner {
    String id
    String documentId
    String userId
    Int sequence
    SignerStatus status
    DateTime signedAt
    String signatureData
    String rejectionReason
  }
  DocumentAccess {
    String id
    String documentId
    String userId
    String role
    DocumentAccessLevel level
    DateTime createdAt
  }
  ProductUom {
    String id
    String tenantId
    String productId
    String name
    Int conversionRate
    Int price
    DateTime createdAt
    DateTime updatedAt
  }
  WholesalePrice {
    String id
    String tenantId
    String productId
    Int minQty
    Int price
    DateTime createdAt
    DateTime updatedAt
  }
  ProductRecipeItem {
    String id
    String tenantId
    String productId
    String ingredientId
    Int qty
    DateTime createdAt
    DateTime updatedAt
  }
  SupplierInvoice {
    String id
    String tenantId
    String supplierId
    String outletId
    String invoiceNumber
    DateTime invoiceDate
    DateTime dueDate
    Int subtotal
  }
  SupplierPayment {
    String id
    String tenantId
    String supplierInvoiceId
    DateTime paymentDate
    Int amount
    String paymentMethod
    String notes
    DateTime createdAt
  }
  Account {
    String id
    String tenantId
    String code
    String name
    String type
    DateTime createdAt
  }
  JournalEntry {
    String id
    String tenantId
    DateTime date
    String description
    String debitCode
    String creditCode
    Int amount
    String reference
  }
  Lead {
    String id
    String tenantId
    String name
    String phone
    String email
    String source
    String interest
    Int expectedValue
  }
  CashFlow {
    String id
    String tenantId
    String outletId
    String createdById
    CashFlowType type
    String category
    Int amount
    String note
  }
  Document ||--o{ DocumentVersion : "versions"
  Document ||--o{ DocumentSigner : "signers"
  Document ||--o{ DocumentAccess : "accessControl"
  SupplierInvoice ||--o{ SupplierPayment : "payments"
```

## Relasi keluar domain

- `Tenant` → `Document` (`documents`, 1-N)
- `Tenant` → `ProductUom` (`productUoms`, 1-N)
- `Tenant` → `WholesalePrice` (`wholesalePrices`, 1-N)
- `Tenant` → `ProductRecipeItem` (`productRecipeItems`, 1-N)
- `Tenant` → `SupplierInvoice` (`supplierInvoices`, 1-N)
- `Tenant` → `SupplierPayment` (`supplierPayments`, 1-N)
- `Tenant` → `Account` (`accounts`, 1-N)
- `Tenant` → `JournalEntry` (`journalEntries`, 1-N)
- `Tenant` → `Lead` (`leads`, 1-N)
- `Tenant` → `CashFlow` (`cashFlows`, 1-N)
- `Outlet` → `CashFlow` (`cashFlows`, 1-N)
- `User` → `Document` (`documentsUploaded`, 1-N)
- `User` → `DocumentVersion` (`documentVersions`, 1-N)
- `User` → `DocumentSigner` (`documentSignings`, 1-N)
- `User` → `DocumentAccess` (`documentAccess`, 1-N)
- `User` → `CashFlow` (`cashFlowsCreated`, 1-N)
- `Product` → `ProductUom` (`uoms`, 1-N)
- `Product` → `WholesalePrice` (`wholesalePrices`, 1-N)
- `Product` → `ProductRecipeItem` (`recipes`, 1-N)
- `Supplier` → `SupplierInvoice` (`invoices`, 1-N)
