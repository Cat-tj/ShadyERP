# Altora ERP Update: 2026-07-06 17:25 (Antigravity AI Agent)

Pembaruan sistem ini memperkenalkan **Otomatisasi ERP & Mode Akuntansi Ganda** untuk mendukung skala bisnis UMKM (sederhana) hingga enterprise (akuntansi formal).

---

## Fitur Utama yang Diimplementasikan

### 1. Peta Meja Kustom Bebas (Drag & Drop Canvas)
* Mengganti grid kaku di `kitchen-display.tsx` dengan kanvas pemosisian persentase absolut (`posX`, `posY` %).
* Fitur seret & taruh meja pada halaman pengaturan meja, terintegrasi dengan penempatan kursi visual yang dinamis.

### 2. Altora Autopilot ERP
* **HPP Moving Average:** Rata-rata modal produk dihitung ulang secara otomatis saat barang masuk diselesaikan.
* **Auto-Purchase Order:** Mengotomatiskan pembuatan PO draf saat stok produk/resep jatuh di bawah batas minimum (`minQty`).
* **Auto-Supplier Invoice:** Membuat draf tagihan hutang supplier otomatis saat struk penerimaan diselesaikan.

### 3. Mode Akuntansi Ganda (Simple vs Advanced ERP)
* **Mode Sederhana (Simple):** Menyembunyikan dasbor audit jurnal, mem-bypass posting jurnal akuntansi double-entry, serta menonaktifkan pembuatan otomatis invoice/PO draf untuk menjaga kesederhanaan operasional UMKM.
* **Mode Lanjutan (Advanced ERP):** Mengaktifkan modul akuntansi formal, pembukuan ledger, draf invoice/PO otomatis, dan dasbor Jurnal Buku Besar.

### 4. Buku Kas Harian Sederhana & CRM Ringan
* **Buku Kas Harian (`/finance/kas`):** Mengganti dasbor akuntansi rumit dengan pencatatan mutasi uang masuk dan uang keluar sederhana berdasarkan kategori untuk pengguna UMKM.
* **Sales CRM (`/crm`):** Dasbor Kanban interaktif untuk melacak prospek leads transaksi penjualan besar B2B/grosir.
* **Booking Auto-Invoice:** Konversi otomatis pemesanan/booking katering besar (`DONE`) menjadi invoice penjualan POS (`Sale`) yang sah.
* **Maintenance Auto-Expense:** Biaya perbaikan alat yang diselesaikan (`RESOLVED`) otomatis terposting sebagai pengeluaran operasional.
