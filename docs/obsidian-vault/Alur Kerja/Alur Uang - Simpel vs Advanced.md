---
tags: [alur-kerja]
---
# Alur Uang — Simpel vs Advanced

## Simpel
- Uang masuk: otomatis dari [[Sale]] (kasir), tidak perlu input manual
- Catat pengeluaran: 3 kolom — buat apa, berapa, kapan → [[CashFlow]] / [[Expense]]
- Output: satu angka besar, **"Untung hari ini"**

## Advanced
- Laba rugi penuh: omzet − HPP − biaya
- Hutang supplier + jatuh tempo: [[SupplierInvoice]] → [[SupplierPayment]]
- Pembukuan double-entry: [[Account]] (Chart of Accounts) + [[JournalEntry]]
- *(roadmap)*: neraca, buku besar per akun, tutup buku periode

## Fitur yang terlibat
- [[cashflow-service]] / [[expense-service]] — versi Simpel
- [[accounting-service]] — jurnal & COA (Advanced)
- [[finance-operational-service]] — kas outlet, hutang supplier, metode bayar
- [[finance-analytics-service]] — laporan & analitik

## Mekanisme toggle
Diatur oleh `TenantSetting.accountingMode` (`SIMPLE` / `ADVANCED`) — pola
acuan untuk semua toggle versi lain di produk ini.
