# Alur Kerja Utama

> Ditulis manual (bukan digenerate) — update kalau alur bisnisnya berubah.
> Diagram dirender otomatis oleh GitHub (Mermaid).

## 1. Alur Penjualan Kasir

```mermaid
flowchart LR
  A[Kasir buka shift\n+ uang modal] --> B[Tap/scan produk\nmasuk keranjang]
  B --> C{Ada member?}
  C -- ya --> D[Scan kartu / pilih member\npoin & promo member aktif]
  C -- tidak --> E[Bayar: tunai / QRIS /\ntransfer / e-wallet]
  D --> E
  E --> F[Struk: cetak thermal /\nkirim digital]
  E --> G[(Stok berkurang\notomatis)]
  E --> H[(Uang masuk tercatat\ndi laporan & buku kas)]
  F --> I[Tutup shift:\nsetoran dihitung,\nselisih ketahuan]
```

Model terkait: `CashierShift → Sale → SaleItem` · stok: `ProductStock` · uang: laporan omzet + `CashFlow`.

## 2. Alur Stok Masuk (Advanced)

```mermaid
flowchart LR
  A[Buat PO ke supplier] --> B[Supplier kirim barang]
  B --> C[Barang Masuk + QC:\nditerima / ditolak sebagian]
  C --> D[(Stok bertambah\nper outlet)]
  C --> E[(Hutang supplier\ntercatat + jatuh tempo)]
  E --> F[Bayar bertahap\nvia invoice supplier]
```

Model: `PurchaseOrder → StockReceipt(+Item QC) → ProductStock` · hutang: `SupplierInvoice → SupplierPayment`.

## 3. Alur Pesan QR Meja (Cafe)

```mermaid
flowchart LR
  A[Pelanggan scan QR\ndi meja] --> B[Pilih menu dari HP\nsendiri, tanpa install]
  B --> C[Order masuk ke\nlayar dapur/KDS]
  C --> D[Dapur tandai:\ndimasak → siap]
  D --> E[Kasir proses bayar\ndigabung ke Sale]
```

Model: `Table(qrToken) → TableOrder(+Item) → Sale`. Halaman publik: `/pesan/[qrToken]` (tanpa login, tenant di-resolve dari token).

## 4. Alur Absensi & (rencana) Target Tim

```mermaid
flowchart LR
  A[Staf buka /absensi\ndi HP] --> B[Clock-in: foto + lokasi]
  B --> C[(Attendance tercatat)]
  C --> D[Analitik kedisiplinan\n+ estimasi gaji]
  E[(Transaksi POS\nper kasir)] -.->|"rencana ⭐: progress target\nterisi OTOMATIS"| F[Target Tim\n'Budi: jual 15jt/bulan']
  C -.-> F
```

Model: `ShiftSchedule`, `Attendance` · rencana: model Target (lihat MASTER-GUIDELINE §4 Tim).

## 5. Alur Laundry

```mermaid
flowchart LR
  A[Terima cucian:\nkiloan/satuan + layanan] --> B[Status: RECEIVED]
  B --> C[WASHING → DRYING →\nIRONING → READY]
  C --> D[Pelanggan ambil /\ndiantar → PICKED_UP]
  D --> E[(Pembayaran tercatat,\nbisa DP dulu)]
```

Model: `LaundryService` (definisi layanan) → `LaundryOrder` (status berjalan).

## 6. Alur KPI Advanced (rencana — migrasi dari svt-kpi-monitor)

```mermaid
flowchart LR
  A[Admin/HR definisikan KPI:\ntarget, bobot, periode,\nassign ke karyawan] --> B[Staf setor realisasi\nper periode + bukti]
  B --> C{Manajer review}
  C -- approve --> D[(Skor 0-100\nterhitung berbobot)]
  C -- reject --> B
  D --> E[Ranking karyawan\n& departemen]
```

Hanya muncul di mode **Advanced** / produk HRIS. Versi Simpel-nya = Target Tim (alur #4).

## 7. Alur Uang (dua versi)

```mermaid
flowchart LR
  subgraph Simpel
    A[(Uang masuk:\notomatis dari kasir)] --> C[Untung hari ini\n= 1 angka besar]
    B[Catat pengeluaran:\nbuat apa, berapa, kapan] --> C
  end
  subgraph Advanced
    C --> D[Laba rugi penuh:\nomzet − HPP − biaya]
    D --> E[COA + jurnal\ndouble-entry]
    E --> F[rencana: neraca,\nbuku besar, tutup buku]
  end
```

Toggle: `TenantSetting.accountingMode` (SIMPLE/ADVANCED) — pola acuan untuk semua toggle versi.
