---
tags: [database]
---
# Product

Domain: [[PRODUK & STOK]]

## Field

- `id`: String
- `tenantId`: String
- `categoryId`: String?
- `name`: String
- `sku`: String?
- `price`: Int
- `cost`: Int?
- `imageUrl`: String?
- `kind`: ProductKind
- `trackStock`: Boolean
- `trackExpiry`: Boolean
- `shelfLifeDays`: Int?
- `warrantyDays`: Int?
- `serviceDurationMin`: Int?
- `isActive`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[Category]] (`products`, 1-N)
- [[ProductCostHistory]] (`costHistory`, 1-N)
- [[ProductRecipeItem]] (`recipes`, 1-N)
- [[ProductStock]] (`stocks`, 1-N)
- [[ProductUom]] (`uoms`, 1-N)
- [[ProductVariantGroup]] (`variantGroups`, 1-N)
- [[PurchaseOrderItem]] (`purchaseOrderItems`, 1-N)
- [[SaleItem]] (`saleItems`, 1-N)
- [[StockAdjustment]] (`stockAdjustments`, 1-N)
- [[StockBatch]] (`stockBatches`, 1-N)
- [[StockCountItem]] (`stockCountItems`, 1-N)
- [[StockReceiptItem]] (`stockReceiptItems`, 1-N)
- [[StockReorderPoint]] (`reorderPoints`, 1-N)
- [[StockTransfer]] (`stockTransfers`, 1-N)
- [[SupplierPricingContract]] (`supplierContracts`, 1-N)
- [[TableOrderItem]] (`tableOrderItems`, 1-N)
- [[Tenant]] (`products`, 1-N)
- [[WholesalePrice]] (`wholesalePrices`, 1-N)

## Dipakai oleh Fitur

- [[billing-service]]
- [[booking-service]]
- [[dashboard-service]]
- [[finance-analytics-service]]
- [[kpi-service]]
- [[pricing-service]]
- [[product-service]]
- [[product-variant-service]]
- [[report-service]]
- [[stock-receipt-service]]
