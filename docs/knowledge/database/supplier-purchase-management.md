# Domain: SUPPLIER & PURCHASE MANAGEMENT

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Supplier`, `SupplierPricingContract`, `PurchaseOrder`, `PurchaseOrderItem`, `StockReceipt`, `StockReceiptItem`, `StockCount`, `StockCountItem`, `ProductCostHistory`

```mermaid
erDiagram
  Supplier {
    String id
    String tenantId
    String name
    String address
    String city
    String phone
    String email
    String contactPerson
  }
  SupplierPricingContract {
    String id
    String tenantId
    String supplierId
    String productId
    Int unitPrice
    Int minQty
    Int leadDays
    Boolean isActive
  }
  PurchaseOrder {
    String id
    String tenantId
    String supplierId
    String poNumber
    PurchaseOrderStatus status
    DateTime sentAt
    DateTime expectedAt
    DateTime receivedAt
  }
  PurchaseOrderItem {
    String id
    String poId
    String productId
    Int qty
    Int unitPrice
    Int subtotal
    Int qtyReceived
    DateTime createdAt
  }
  StockReceipt {
    String id
    String tenantId
    String poId
    String outletId
    String receiptNumber
    StockReceiptStatus status
    DateTime receivedAt
    DateTime completedAt
  }
  StockReceiptItem {
    String id
    String receiptId
    String productId
    Int qtyReceived
    Int qtyAccepted
    Int qtyDefect
    String batchNumber
    DateTime expirationDate
  }
  StockCount {
    String id
    String tenantId
    String outletId
    DateTime countDate
    String countNumber
    StockCountStatus status
    String startedBy
    String completedBy
  }
  StockCountItem {
    String id
    String countId
    String productId
    Int systemQty
    Int physicalQty
    Int variance
    Int varianceValue
    String notes
  }
  ProductCostHistory {
    String id
    String tenantId
    String productId
    Int previousCost
    Int newCost
    String reason
    String changedBy
    DateTime createdAt
  }
  Supplier ||--o{ PurchaseOrder : "purchaseOrders"
  Supplier ||--o{ SupplierPricingContract : "pricingContracts"
  PurchaseOrder ||--o{ PurchaseOrderItem : "items"
  PurchaseOrder ||--o{ StockReceipt : "stockReceipts"
  StockReceipt ||--o{ StockReceiptItem : "items"
  StockCount ||--o{ StockCountItem : "items"
```

## Relasi keluar domain

- `Tenant` → `Supplier` (`suppliers`, 1-N)
- `Tenant` → `SupplierPricingContract` (`supplierContracts`, 1-N)
- `Tenant` → `PurchaseOrder` (`purchaseOrders`, 1-N)
- `Tenant` → `StockReceipt` (`stockReceipts`, 1-N)
- `Tenant` → `StockCount` (`stockCounts`, 1-N)
- `Tenant` → `ProductCostHistory` (`productCostHistory`, 1-N)
- `Outlet` → `StockReceipt` (`stockReceipts`, 1-N)
- `Outlet` → `StockCount` (`stockCounts`, 1-N)
- `User` → `PurchaseOrder` (`purchaseOrdersApproved`, 1-N)
- `User` → `StockReceipt` (`stockReceiptsReceived`, 1-N)
- `User` → `StockCount` (`stockCountsStarted`, 1-N)
- `User` → `ProductCostHistory` (`costHistoryChanges`, 1-N)
- `Product` → `SupplierPricingContract` (`supplierContracts`, 1-N)
- `Product` → `PurchaseOrderItem` (`purchaseOrderItems`, 1-N)
- `Product` → `StockReceiptItem` (`stockReceiptItems`, 1-N)
- `Product` → `StockCountItem` (`stockCountItems`, 1-N)
- `Product` → `ProductCostHistory` (`costHistory`, 1-N)
- `Supplier` → `SupplierInvoice` (`invoices`, 1-N)
