---
tags: [database]
---
# PurchaseOrder

Domain: [[SUPPLIER & PURCHASE MANAGEMENT]]

## Field

- `id`: String
- `tenantId`: String
- `supplierId`: String
- `poNumber`: String
- `status`: PurchaseOrderStatus
- `sentAt`: DateTime?
- `expectedAt`: DateTime?
- `receivedAt`: DateTime?
- `totalAmount`: Int
- `approvedById`: String?
- `rejectionNote`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[PurchaseOrderItem]] (`items`, 1-N)
- [[StockReceipt]] (`stockReceipts`, 1-N)
- [[Supplier]] (`purchaseOrders`, 1-N)
- [[Tenant]] (`purchaseOrders`, 1-N)
- [[User]] (`purchaseOrdersApproved`, 1-N)

## Dipakai oleh Fitur

- [[finance-operational-service]]
- [[purchase-order-service]]
- [[stock-receipt-service]]
- [[supplier-service]]
