---
tags: [database]
---
# StockReceipt

Domain: [[SUPPLIER & PURCHASE MANAGEMENT]]

## Field

- `id`: String
- `tenantId`: String
- `poId`: String
- `outletId`: String
- `receiptNumber`: String
- `status`: StockReceiptStatus
- `receivedAt`: DateTime
- `completedAt`: DateTime?
- `receivedById`: String?
- `checkedById`: String?
- `notes`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Outlet]] (`stockReceipts`, 1-N)
- [[PurchaseOrder]] (`stockReceipts`, 1-N)
- [[StockReceiptItem]] (`items`, 1-N)
- [[Tenant]] (`stockReceipts`, 1-N)
- [[User]] (`stockReceiptsReceived`, 1-N)

## Dipakai oleh Fitur

- [[stock-receipt-service]]
