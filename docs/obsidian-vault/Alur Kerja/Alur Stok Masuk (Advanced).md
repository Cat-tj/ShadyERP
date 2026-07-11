---
tags: [alur-kerja]
---
# Alur Stok Masuk (Advanced)

1. Buat [[PurchaseOrder]] ke supplier
2. Supplier kirim barang
3. [[StockReceipt]] + [[StockReceiptItem]] — QC per item: diterima penuh / sebagian / ditolak
4. [[ProductStock]] bertambah otomatis sesuai yang diterima
5. [[SupplierInvoice]] tercatat sebagai hutang + jatuh tempo
6. Bayar bertahap lewat [[SupplierPayment]]

## Fitur yang terlibat
- [[purchase-order-service]]
- [[stock-receipt-service]]
- [[supplier-service]]
- [[inventory-service]] — opname, batch/expired, reorder point

## Versi
Fitur ini **hanya ada di mode Advanced** — tidak ada di Simpel.
