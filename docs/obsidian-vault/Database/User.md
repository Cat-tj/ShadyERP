---
tags: [database]
---
# User

Domain: [[USER & AKSES]]

## Field

- `id`: String
- `tenantId`: String
- `name`: String
- `email`: String
- `phone`: String?
- `passwordHash`: String
- `role`: UserRole
- `jobTitle`: String?
- `pin`: String?
- `isActive`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Attendance]] (`attendances`, 1-N)
- [[AuditLog]] (`auditLogs`, 1-N)
- [[Booking]] (`bookingsAssigned`, 1-N)
- [[CashFlow]] (`cashFlowsCreated`, 1-N)
- [[CashierShift]] (`cashierShifts`, 1-N)
- [[CashOutTransaction]] (`cashOutTransactions`, 1-N)
- [[Document]] (`documentsUploaded`, 1-N)
- [[DocumentAccess]] (`documentAccess`, 1-N)
- [[DocumentSigner]] (`documentSignings`, 1-N)
- [[DocumentVersion]] (`documentVersions`, 1-N)
- [[EquipmentMaintenanceLog]] (`equipmentMaintenanceLogs`, 1-N)
- [[Expense]] (`expensesCreated`, 1-N)
- [[LaundryOrder]] (`laundryOrdersCreated`, 1-N)
- [[ProductCostHistory]] (`costHistoryChanges`, 1-N)
- [[PurchaseOrder]] (`purchaseOrdersApproved`, 1-N)
- [[Sale]] (`salesAsCashier`, 1-N)
- [[SaleReturn]] (`saleReturnsProcessed`, 1-N)
- [[ShiftSchedule]] (`shiftSchedules`, 1-N)
- [[StockAdjustment]] (`stockAdjustments`, 1-N)
- [[StockCount]] (`stockCountsStarted`, 1-N)
- [[StockReceipt]] (`stockReceiptsReceived`, 1-N)
- [[StockTransfer]] (`stockTransfersCreated`, 1-N)
- [[Tenant]] (`users`, 1-N)
- [[UidCard]] (`uidCardsAssigned`, 1-N)
- [[UserOutlet]] (`userOutlets`, 1-N)

## Dipakai oleh Fitur

- [[billing-service]]
- [[booking-service]]
- [[dashboard-service]]
- [[hr-analytics-service]]
- [[tenant-service]]
- [[user-service]]
