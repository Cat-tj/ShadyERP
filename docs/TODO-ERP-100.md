# To-Do: Accounting & Inventory → Standar ERP Penuh

> Kerja loop: implementasi → build & typecheck hijau → verifikasi manual (kalau ada UI) →
> commit & push → centang di sini → lanjut item berikutnya.
> Urutan: **Accounting dulu sampai selesai, baru geser ke Inventory.**

## 🧾 Accounting

- [x] **A1** — Bungkus `postJournalEntry` + turunannya (`logSaleToJournal`, `logExpenseToJournal`) dalam `prisma.$transaction`, hindari race condition — `0a7768b`
- [x] **A2** — `Account.type` jadi enum `AccountType` (ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE) + migration + backfill data lama — `90745ad`
- [x] **A3** — Tambah akun Equity default ("Retained Earnings/Laba Ditahan") ke `DEFAULT_ACCOUNTS` — `324f73b`
- [x] **A4** — Buku Besar per akun: query "bongkar" tiap `JournalEntry` jadi 2 baris (debit/kredit), kelompokkan per akun, saldo berjalan + UI — `1fcb99c`
- [x] **A5** — Neraca Saldo (Trial Balance): total debit vs kredit per akun dalam satu rentang tanggal, harus balance ke Rp0 + UI — `b1c3384`
- [x] **A6** — Neraca (Balance Sheet): saldo akhir per tipe akun (Asset/Liability/Equity) per tanggal + UI — mode Advanced saja — `11aef15`
- [x] **A7** — Laba Rugi resmi dari COA (Revenue−Expense per periode dari `JournalEntry`, bukan versi simple lama) + UI — mode Advanced saja — `adbafe5`
- [x] **A8** — Tutup buku periode: kunci tanggal per tenant, tolak posting/edit entri sebelum tanggal kunci — mode Advanced saja — `561fc7a`

**🎉 Accounting selesai (A1–A8).**

## 📦 Inventory

- [x] **I1** — Sambungkan `consumeBatchFIFO` ke `sale-service.ts` (bug: fungsi sudah ada, tidak pernah dipanggil) — `40c0098`
- [x] **I2** — Bungkus moving-average calc di `stock-receipt-service.ts` (`completeReceipt`) dalam `prisma.$transaction` — `c2bb05f`
- [x] **I3** — Keputusan sadar: buang model `WarehouseLocation` (dead code, zero UI, `ProductStock` tidak punya field lokasi jadi tidak akan pernah nyambung) daripada bikin UI dekoratif yang tidak mengisi apa-apa — `7787314`
- [x] **I4** — Landed cost: field ongkir/biaya lain di `StockReceipt`, distribusi pro-rata ke cost tiap item — `fff7417`
- [x] **I5** — Serial number per unit di `Product` (retail elektronik/HP dengan IMEI/serial) — `76e6258`

**🎉 Inventory selesai (I1–I5). Accounting & Inventory 100%.**

---

*Setiap item yang selesai akan ditandai `[x]` beserta commit hash-nya di sini.*
