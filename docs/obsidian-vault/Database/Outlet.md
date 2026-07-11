---
tags: [database]
---
# Outlet

Domain: [[TENANT & OUTLET]]

## Field

- `id`: String
- `tenantId`: String
- `name`: String
- `address`: String?
- `phone`: String?
- `isActive`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Attendance]] (`attendances`, 1-N)
- [[Booking]] (`bookings`, 1-N)
- [[CashFlow]] (`cashFlows`, 1-N)
- [[CashierShift]] (`cashierShifts`, 1-N)
- [[CashOutTransaction]] (`cashOutTransactions`, 1-N)
- [[Equipment]] (`equipments`, 1-N)
- [[EquipmentMaintenanceLog]] (`equipmentMaintenanceLogs`, 1-N)
- [[Expense]] (`expenses`, 1-N)
- [[LaundryOrder]] (`laundryOrders`, 1-N)
- [[ProductStock]] (`productStocks`, 1-N)
- [[Sale]] (`sales`, 1-N)
- [[ShiftSchedule]] (`shiftSchedules`, 1-N)
- [[StockAdjustment]] (`stockAdjustments`, 1-N)
- [[StockBatch]] (`stockBatches`, 1-N)
- [[StockCount]] (`stockCounts`, 1-N)
- [[StockReceipt]] (`stockReceipts`, 1-N)
- [[StockReorderPoint]] (`reorderPoints`, 1-N)
- [[StockTransfer]] (`transfersFrom`, 1-N)
- [[Table]] (`tables`, 1-N)
- [[TableOrder]] (`tableOrders`, 1-N)
- [[Tenant]] (`outlets`, 1-N)
- [[UserOutlet]] (`userOutlets`, 1-N)
- [[WarehouseLocation]] (`warehouseLocations`, 1-N)

## Dipakai oleh Fitur

- [[billing-service]]
- [[dashboard-service]]
- [[expense-service]]
- [[finance-operational-service]]
- [[kpi-service]]
- [[laundry-service]]
- [[outlet-service]]
- [[report-service]]
- [[table-service]]
