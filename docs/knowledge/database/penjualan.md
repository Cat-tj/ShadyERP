# Domain: PENJUALAN

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Sale`, `CashOutTransaction`, `SaleItem`, `SaleReturn`, `SaleReturnItem`

```mermaid
erDiagram
  Sale {
    String id
    String tenantId
    String outletId
    String shiftId
    String cashierId
    String memberId
    String invoiceNumber
    Int subtotal
  }
  CashOutTransaction {
    String id
    String tenantId
    String outletId
    String shiftId
    String cashierId
    String referenceNumber
    String customerName
    String customerPhone
  }
  SaleItem {
    String id
    String tenantId
    String saleId
    String productId
    String productName
    String variantLabel
    Int price
    Int qty
  }
  SaleReturn {
    String id
    String tenantId
    String saleId
    String processedById
    String shiftId
    String reason
    Int totalRefund
    String refundMethod
  }
  SaleReturnItem {
    String id
    String tenantId
    String saleReturnId
    String saleItemId
    Int qty
    Int refundAmount
  }
  Sale ||--o{ SaleItem : "items"
  Sale ||--o{ SaleReturn : "saleReturns"
  SaleItem ||--o{ SaleReturnItem : "saleReturnItems"
  SaleReturn ||--o{ SaleReturnItem : "items"
```

## Relasi keluar domain

- `Tenant` → `Sale` (`sales`, 1-N)
- `Tenant` → `CashOutTransaction` (`cashOutTransactions`, 1-N)
- `Tenant` → `SaleItem` (`saleItems`, 1-N)
- `Tenant` → `SaleReturn` (`saleReturns`, 1-N)
- `Tenant` → `SaleReturnItem` (`saleReturnItems`, 1-N)
- `Outlet` → `Sale` (`sales`, 1-N)
- `Outlet` → `CashOutTransaction` (`cashOutTransactions`, 1-N)
- `User` → `Sale` (`salesAsCashier`, 1-N)
- `User` → `CashOutTransaction` (`cashOutTransactions`, 1-N)
- `User` → `SaleReturn` (`saleReturnsProcessed`, 1-N)
- `Member` → `Sale` (`sales`, 1-N)
- `Product` → `SaleItem` (`saleItems`, 1-N)
- `CashierShift` → `Sale` (`sales`, 1-N)
- `CashierShift` → `CashOutTransaction` (`cashOutTransactions`, 1-N)
- `CashierShift` → `SaleReturn` (`saleReturns`, 1-N)
- `Sale` → `PointTransaction` (`pointTransactions`, 1-N)
- `TableOrder` → `Sale` (`tableOrder`, 1-1?)
- `Booking` → `Sale` (`sales`, 1-N)
