---
tags: [database]
---
# Sale

Domain: [[PENJUALAN]]

## Field

- `id`: String
- `tenantId`: String
- `outletId`: String
- `shiftId`: String?
- `cashierId`: String
- `memberId`: String?
- `invoiceNumber`: String
- `subtotal`: Int
- `discountAmount`: Int
- `taxAmount`: Int
- `total`: Int
- `paymentMethod`: PaymentMethod
- `amountPaid`: Int
- `changeAmount`: Int
- `orderType`: OrderType
- `cashbackAmount`: Int
- `parkingFee`: Int
- `status`: SaleStatus
- `voidReason`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `bookingId`: String?

## Relasi Database

- [[Booking]] (`sales`, 1-N)
- [[CashierShift]] (`sales`, 1-N)
- [[Member]] (`sales`, 1-N)
- [[Outlet]] (`sales`, 1-N)
- [[PointTransaction]] (`pointTransactions`, 1-N)
- [[SaleItem]] (`items`, 1-N)
- [[SaleReturn]] (`saleReturns`, 1-N)
- [[TableOrder]] (`tableOrder`, 1-1?)
- [[Tenant]] (`sales`, 1-N)
- [[User]] (`salesAsCashier`, 1-N)

## Dipakai oleh Fitur

- [[booking-service]]
- [[finance-analytics-service]]
- [[finance-operational-service]]
- [[kpi-service]]
- [[member-service]]
- [[report-service]]
- [[sale-service]]
- [[shift-service]]
- [[simple-dashboard-service]]
- [[super-admin-service]]
