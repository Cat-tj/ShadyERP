# Dokumen Serah Terima Sistem (Handover Documentation)
**Proyek:** Altora ERP / ShadyERP
**Tanggal:** 6 Juli 2026

Dokumen ini mendokumentasikan seluruh fitur utama, peningkatan, dan perubahan arsitektur yang telah diimplementasikan dalam siklus pengembangan terakhir.

---

## 1. Sistem Mode Akuntansi Ganda (Simple vs Advanced ERP Mode)

Sistem ini dirancang agar Altora dapat melayani dua segmen pengguna: UMKM sederhana yang menginginkan input minimal tetapi hasil analisis kaya, dan bisnis berkembang yang membutuhkan pencatatan formal ganda (Double-entry Ledger).

### Perbedaan Teknis
* **Mode Sederhana (Simple):**
  * Menonaktifkan pembukuan debet-kredit otomatis saat penjualan (`Sale`) atau penerimaan stok (`StockReceipt`).
  * Menyembunyikan menu **Jurnal Buku Besar** (`/finance/jurnal`) dari navigasi.
  * Kasir dan stok bekerja secara langsung tanpa draf tagihan/PO formal yang rumit.
* **Mode Lanjutan (Advanced ERP):**
  * Mengaktifkan pencatatan double-entry ledger secara real-time.
  * Setiap transaksi kasir memicu pembuatan jurnal otomatis di database.
  * Akses penuh ke jurnal penyesuaian, laporan neraca saldo, dan rekonsiliasi kas terperinci.

### Cara Pengalihan (Switch)
* Pengaturan dapat diubah secara instan oleh Owner usaha melalui menu **Pengaturan Bisnis** (`/pengaturan/bisnis`).
* Modifikasi data disimpan dalam kolom `accountingMode` pada tabel `TenantSetting` di database Prisma.

---

## 2. Visualisasi Peta Layout Meja Dinamis (High-Fidelity Floor Plan)

Peningkatan visual komponen `TableVisual` di dashboard Kasir (`/kasir`), Cashier/Kitchen Command Center (`/command-center`), dan Pengaturan Meja (`/pengaturan/meja`).

### Peningkatan Visual
1. **Pemisahan Klasifikasi Meja:**
   * **VIP / VVIP:** Diberikan warna **Emas (Gold)** premium (`border-amber-400`), cincin bayangan keemasan, dan label penanda "VIP" di bagian bawah.
   * **Reguler:** Menggunakan warna **Biru (Blue)** cerah (`border-blue-400`) yang bersih.
2. **Penyajian Kode Singkat Meja:**
   * Ditambahkan parser cerdas `getTableDisplayCode` untuk mengekstraksi kode numerik/singkat (contoh: `"Meja 01"` menjadi `"01"`, `"Meja Bundar VVIP"` menjadi `"VVIP"`).
   * Menjamin text label tetap terpusat di tengah meja dan bebas dari kebocoran tulisan (*text overflow*).
   * Nama lengkap meja tetap dapat dilihat menggunakan browser *tooltip* bawaan saat kursor diarahkan ke atas meja.
3. **Template Ornamen Piring Makan (`Plates`):**
   * Menambahkan ornamen visual berupa piring makan melingkar di sekeliling meja yang mewakili posisi kursi yang tersedia.
   * Memberikan sensasi denah restoran fisik yang realistis bagi kasir dan pelayan toko.

---

## 3. Dasbor Superadmin Terintegrasi (Platform Client Management)

Halaman khusus untuk pengelola utama platform Altora guna memantau dan mengonfigurasi semua tenant/client secara manual.

### Fitur Utama Superadmin (`/superadmin`)
* **Keamanan:** Dilindungi oleh middleware pengecekan kredensial khusus superadmin (`requireSuperAdmin`) yang terpisah dari session user biasa.
* **Persetujuan Langganan (Subscription Approval):**
  * Manajemen permintaan upgrade paket secara manual (`SubscriptionRequest`).
  * Superadmin dapat menyetujui (`APPROVED`) atau menolak (`REJECTED`) permintaan setelah memverifikasi pembayaran bank manual di luar sistem.
* **Manajemen Modul & Fitur:**
  * Superadmin dapat mengaktifkan atau menonaktifkan modul tertentu per tenant secara dinamis melalui antarmuka toggle di panel utama (misalnya menyembunyikan modul laundry untuk tenant berjenis cafe).
* **Manajemen Status Akun:**
  * Tombol suspend instan untuk menonaktifkan akses tenant yang melanggar ketentuan layanan atau terlambat membayar biaya langganan.
