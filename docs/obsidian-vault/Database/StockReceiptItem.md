---
tags: [database]
---
# StockReceiptItem

Domain: [[SUPPLIER & PURCHASE MANAGEMENT]]

## Field

- `id`: String
- `receiptId`: String
- `productId`: String
- `qtyReceived`: Int
- `qtyAccepted`: Int
- `qtyDefect`: Int
- `batchNumber`: String?
- `expirationDate`: DateTime?
- `qcStatus`: QCStatus
- `qcNotes`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Product]] (`stockReceiptItems`, 1-N)
- [[StockReceipt]] (`items`, 1-N)

## Dipakai oleh Fitur

- [[stock-receipt-service]]
