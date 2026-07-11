---
tags: [database]
---
# Tenant

Domain: [[TENANT & OUTLET]]

## Field

- `id`: String
- `name`: String
- `slug`: String
- `businessType`: BusinessType
- `plan`: Plan
- `isActive`: Boolean
- `disabledModules`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Account]] (`accounts`, 1-N)
- [[Attendance]] (`attendances`, 1-N)
- [[AuditLog]] (`auditLogs`, 1-N)
- [[Booking]] (`bookings`, 1-N)
- [[CashFlow]] (`cashFlows`, 1-N)
- [[CashierShift]] (`cashierShifts`, 1-N)
- [[CashOutTransaction]] (`cashOutTransactions`, 1-N)
- [[Category]] (`categories`, 1-N)
- [[Document]] (`documents`, 1-N)
- [[Equipment]] (`equipments`, 1-N)
- [[EquipmentMaintenanceLog]] (`equipmentMaintenanceLogs`, 1-N)
- [[Expense]] (`expenses`, 1-N)
- [[JournalEntry]] (`journalEntries`, 1-N)
- [[LaundryOrder]] (`laundryOrders`, 1-N)
- [[LaundryService]] (`laundryServices`, 1-N)
- [[Lead]] (`leads`, 1-N)
- [[Member]] (`members`, 1-N)
- [[Outlet]] (`outlets`, 1-N)
- [[PointTransaction]] (`pointTransactions`, 1-N)
- [[Product]] (`products`, 1-N)
- [[ProductCostHistory]] (`productCostHistory`, 1-N)
- [[ProductRecipeItem]] (`productRecipeItems`, 1-N)
- [[ProductStock]] (`productStocks`, 1-N)
- [[ProductUom]] (`productUoms`, 1-N)
- [[ProductVariantGroup]] (`productVariantGroups`, 1-N)
- [[ProductVariantOption]] (`productVariantOptions`, 1-N)
- [[Promo]] (`promos`, 1-N)
- [[PurchaseOrder]] (`purchaseOrders`, 1-N)
- [[Sale]] (`sales`, 1-N)
- [[SaleItem]] (`saleItems`, 1-N)
- [[SaleReturn]] (`saleReturns`, 1-N)
- [[SaleReturnItem]] (`saleReturnItems`, 1-N)
- [[ShiftSchedule]] (`shiftSchedules`, 1-N)
- [[StockAdjustment]] (`stockAdjustments`, 1-N)
- [[StockBatch]] (`stockBatches`, 1-N)
- [[StockCount]] (`stockCounts`, 1-N)
- [[StockReceipt]] (`stockReceipts`, 1-N)
- [[StockReorderPoint]] (`reorderPoints`, 1-N)
- [[StockTransfer]] (`stockTransfers`, 1-N)
- [[Subscription]] (`subscription`, 1-1?)
- [[SubscriptionRequest]] (`subscriptionRequests`, 1-N)
- [[Supplier]] (`suppliers`, 1-N)
- [[SupplierInvoice]] (`supplierInvoices`, 1-N)
- [[SupplierPayment]] (`supplierPayments`, 1-N)
- [[SupplierPricingContract]] (`supplierContracts`, 1-N)
- [[Table]] (`tables`, 1-N)
- [[TableOrder]] (`tableOrders`, 1-N)
- [[TableOrderItem]] (`tableOrderItems`, 1-N)
- [[TenantSetting]] (`setting`, 1-1?)
- [[UidBatch]] (`uidBatches`, 1-N)
- [[UidCard]] (`uidCards`, 1-N)
- [[User]] (`users`, 1-N)
- [[WarehouseLocation]] (`warehouseLocations`, 1-N)
- [[WholesalePrice]] (`wholesalePrices`, 1-N)

## Dipakai oleh Fitur

- [[dashboard-service]]
- [[super-admin-service]]
- [[tenant-service]]
