# Dokumen Handover: Fitur Belum Terimplementasi (Pending Implementation)
**Proyek:** Altora ERP / ShadyERP
**Tanggal:** 6 Juli 2026

Dokumen ini berisi spesifikasi teknis, rancangan arsitektur, dan daftar tugas untuk fitur-fitur yang **telah disetujui tetapi belum diimplementasikan** dalam kode program. Fitur ini siap dikerjakan oleh pengembang berikutnya.

---

## 1. Altora Simple Mode UX (Tampilan Khusus UMKM)

Tujuan fitur ini adalah merombak total tata letak antarmuka (UI/UX) jika tenant menggunakan `accountingMode = "SIMPLE"`. Navigasi sidebar akan dihilangkan dan diganti dengan 4 tab di bagian bawah layar.

### A. Komponen Shell Baru (`SimpleShell`)
* **Lokasi Berkas Baru:** [simple-shell.tsx](file:///Users/icat/Documents/Codex/2026-07-05/computer-plugin-computer-use-openai-bundled/work/ShadyERP/src/components/simple-shell.tsx)
* **Desain:**
  * **Topbar:** Header tipis berisi nama toko, logo Altora, dan tombol menu profil/akun cepat di kanan.
  * **Bottom Tab Bar:** Terdiri dari 4 tab utama:
    1. 🛒 **Kasir** (menuju `/kasir` - layar POS saat ini)
    2. 💰 **Uang** (menuju `/simple/uang` - halaman baru gabungan kas & biaya)
    3. 📊 **Data** (menuju `/simple/data` - halaman dashboard insight ringkas)
    4. ☰ **Lainnya** (menuju `/simple/menu` - menu grid untuk modul aktif lainnya)

### B. Halaman Baru yang Perlu Dibuat
1. **Halaman Keuangan Ringkas (`/simple/uang`):**
   * Menggabungkan total kas harian dari shift yang aktif.
   * Menyediakan form cepat untuk mencatat Uang Keluar (biaya operasional) dan Uang Masuk (modal tambahan/omzet luar kasir).
   * Menampilkan daftar riwayat pengeluaran 7 hari terakhir.
2. **Halaman Dashboard Data (`/simple/data`):**
   * Menampilkan rangkuman performa tanpa konfigurasi rumit:
     * Omzet hari ini vs kemarin.
     * Grafik batang 5 produk terlaris.
     * Peringatan jika ada produk dengan stok menipis (jumlah ≤ 5).
3. **Halaman Menu Grid (`/simple/menu`):**
   * Grid navigasi untuk membuka fitur sekunder seperti manajemen produk (`/produk`), database pelanggan/member (`/member`), absensi karyawan (`/absensi`), dan halaman pengaturan bisnis (`/pengaturan`).

### C. Logika Pengalihan (Redirect)
* Di [layout.tsx](file:///Users/icat/Documents/Codex/2026-07-05/computer-plugin-computer-use-openai-bundled/work/ShadyERP/src/app/(app)/layout.tsx), tambahkan logika pengondisian:
  * Jika `accountingMode === "SIMPLE"`, bungkus halaman dengan `<SimpleShell>`.
  * Jika `accountingMode === "ADVANCED"`, gunakan `<AppShell>` (sidebar & hub switcher).
* Modifikasi halaman pemilihan aplikasi (`/pilih-aplikasi`): Jika tenant menggunakan mode `SIMPLE`, langsung alihkan (*auto-redirect*) ke `/kasir` tanpa menampilkan pilihan hub.

---

## 2. Peningkatan Dashboard Superadmin (Enhanced Client Control)

Peningkatan kemampuan kontrol bagi pengelola platform untuk memantau status agregat platform serta mengonfigurasi paket langganan dan mode akuntansi tenant secara langsung dari halaman `/superadmin`.

### A. Fungsi Service Baru di `super-admin-service.ts`
* `getPlatformStats()`: Menghitung total tenant terdaftar, jumlah tenant aktif vs disuspend, total omzet seluruh platform 30 hari terakhir, serta distribusi jenis usaha dan paket langganan (FREE, BASIC, PRO).
* `changeTenantPlan(tenantId, plan)`: Mengubah paket langganan tenant secara langsung tanpa melalui siklus approval permohonan.
* `changeTenantAccountingMode(tenantId, mode)`: Mengubah setting mode akuntansi tenant (SIMPLE / ADVANCED).
* `getTenantDetailForSuperAdmin(tenantId)`: Mengambil data profil lengkap satu tenant termasuk statistik operasional (jumlah outlet, jumlah produk, total omzet 30 hari) untuk ditampilkan di halaman detail.

### B. Server Actions Baru di `actions.ts`
* `changeTenantPlanAction(tenantId, plan)`
* `changeTenantAccountingModeAction(tenantId, mode)`

### C. Komponen Antarmuka (UI/UX)
1. **Widget Statistik Utama:** Ditampilkan di bagian atas `/superadmin` berisi kartu ringkasan dari fungsi `getPlatformStats()`.
2. **Kontrol Dropdown Paket & Toggle Mode:**
   * Di dalam [tenant-list-manager.tsx](file:///Users/icat/Documents/Codex/2026-07-05/computer-plugin-computer-use-openai-bundled/work/ShadyERP/src/components/superadmin/tenant-list-manager.tsx), tambahkan:
     * Dropdown (`<select>`) pilihan paket (Free, Basic, Pro) per baris tenant.
     * Tombol toggle cepat untuk mengubah Mode Akuntansi (Simple $\leftrightarrow$ Advanced).
     * Tombol/Link "Detail" yang mengarah ke `/superadmin/tenant/[id]`.
3. **Halaman Detail Tenant (`/superadmin/tenant/[id]/page.tsx`):**
   * Halaman baru untuk melihat performa spesifik satu tenant, daftar modul aktif, serta riwayat permintaan langganan mereka.
