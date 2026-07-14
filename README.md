# Altora — Kasir & Manajemen Toko untuk UMKM

SaaS multi-tenant untuk UMKM Indonesia (coffee shop, restoran, barbershop, toko
kecil): kasir/POS, manajemen produk & stok, pembelian ke supplier, member
berkartu QR, absensi karyawan, laporan & analitik, dokumen & tanda tangan
digital, dan pemesanan mandiri lewat QR meja — dalam satu aplikasi web yang
dipecah jadi beberapa "aplikasi" (hub) supaya tidak berisik dipakai sehari-hari.

📚 **Dokumentasi lebih dalam:** [docs/ARSITEKTUR.md](./docs/ARSITEKTUR.md)
(sistem hub, sistem modul, isolasi multi-tenant, konvensi kode, catatan
performa) dan [docs/SKEMA-DATABASE.md](./docs/SKEMA-DATABASE.md) (semua model
data dijelaskan per domain, dengan diagram).

👩‍💼 **Panduan operasional Owner, Manager, dan Staff:**
[docs/panduan-pengguna/README.md](./docs/panduan-pengguna/README.md) mencakup Cafe,
Toko/Retail, Laundry, Counter, Barbershop, dan Company.

## Daftar isi

1. [Konsep: Hub & Modul](#konsep-hub--modul)
2. [Fitur](#fitur)
3. [Peran & hak akses](#peran--hak-akses)
4. [Arsitektur teknis](#arsitektur-teknis)
5. [Model data](#model-data)
6. [Menjalankan secara lokal](#menjalankan-secara-lokal)
7. [Skrip npm](#skrip-npm)
8. [Deploy ke Vercel + Supabase](#deploy-ke-vercel--supabase)
9. [Mulai pakai untuk bisnis asli](#mulai-pakai-untuk-bisnis-asli)
10. [Akun demo](#akun-demo)
11. [Keterbatasan & belum dibangun](#keterbatasan--belum-dibangun)

---

## Konsep: Hub & Modul

Setelah login, user mendarat di **`/pilih-aplikasi`** — bukan langsung ke
dashboard. Dari situ user memilih mau buka "aplikasi" yang mana:

| Hub | Isinya | Siapa yang lihat |
| --- | --- | --- |
| 🟣 **Kasir & Operasional** | Kasir, produk & stok, pembelian ke supplier, barang masuk (QC), opname stok, booking, pesanan meja QR, member | Owner, Manager, Staff |
| 🔵 **Tim** | Beranda tim, absensi, analitik kehadiran & performa | Owner, Manager, Staff |
| 🟢 **Finance** | Laporan, pengeluaran, analitik keuangan lanjutan | Owner, Manager |
| ⚫ **Admin** | Pengaturan bisnis, karyawan, outlet, modul, langganan | Owner saja |

Sidebar tiap hub **hanya** berisi menu hub itu — tidak ada link silang ke hub
lain. Pindah hub harus lewat tombol "Ganti Aplikasi" yang membawa balik ke
`/pilih-aplikasi`. **Dokumen** adalah pengecualian: fitur ini standalone, tidak
terikat hub manapun, dan tetap muncul di sidebar semua hub.

Terpisah dari konsep hub, ada **sistem modul** (`Pengaturan → Modul`): Owner
bisa menyalakan/mematikan fitur non-inti (Booking, Pemesanan Digital, Member,
HR, Keuangan, Promo) sesuai kebutuhan bisnisnya — kedai kopi kecil tidak perlu
modul Booking, misalnya. Modul yang dimatikan otomatis hilang dari sidebar
**dan** diblokir kalau diakses lewat URL langsung. Detail teknis kedua sistem
ini ada di [docs/ARSITEKTUR.md § Sistem Hub](./docs/ARSITEKTUR.md#sistem-hub)
dan [§ Sistem Modul](./docs/ARSITEKTUR.md#sistem-modul).

---

## Fitur

### Autentikasi & multi-tenant
Login email+password (Auth.js/NextAuth v5). Setiap akun terikat ke satu **tenant**
(bisnis) yang datanya terisolasi penuh dari tenant lain — semua query di service
layer difilter `tenantId`. Registrasi mandiri via `/register` membuat tenant baru
dari nol beserta akun Owner pertamanya.

### Kasir (POS)
- Buka/tutup shift kasir per outlet dengan modal awal & rekonsiliasi kas.
- Grid produk dengan pencarian & filter kategori, keranjang dengan diskon per-item
  dan per-transaksi, pajak otomatis sesuai pengaturan tenant.
- Metode bayar: Tunai (dengan kembalian), QRIS, Transfer, E-Wallet, atau Saldo
  Deposit member.
- Struk digital per transaksi, riwayat transaksi, dan pembatalan transaksi (void).
- **Retur/refund sebagian** — retur sebagian item dari transaksi yang sudah selesai
  (beda dari void yang membatalkan seluruh transaksi), otomatis mengembalikan stok
  dan mengoreksi poin member secara proporsional.

### Manajemen produk & stok
- CRUD produk, kategori, harga jual & modal, status aktif/nonaktif, stok per outlet.
- **Riwayat perubahan stok** — jejak audit tiap kali stok diubah manual lewat
  halaman Produk (siapa, kapan, dari berapa ke berapa, catatan).
- **Transfer stok antar outlet** — pindahkan stok satu produk dari satu outlet ke
  outlet lain secara atomik dengan validasi stok cukup, tercatat di riwayat.

### Pembelian & penerimaan barang (Procurement)
Alur lengkap dari pesan ke supplier sampai stok masuk, di **Kasir & Operasional**:
- **Supplier** — data vendor, kontak, syarat pembayaran, rating, dan kontrak
  harga khusus per produk (dengan minimal order quantity).
- **Purchase Order** — buat pesanan ke supplier, alur persetujuan
  (Draft → Sesetujui/Dikirim → Dikonfirmasi supplier → Diterima).
- **Barang Masuk** — penerimaan fisik barang dengan **Quality Control**
  per item (jumlah lolos QC vs rusak dicatat terpisah); stok baru benar-benar
  bertambah setelah QC selesai.
- **Opname stok** — hitung fisik berkala, bandingkan dengan catatan sistem,
  hasil selisih (variance) perlu diverifikasi Owner/Manager sebelum
  mengoreksi stok.
- **Riwayat harga modal** — jejak tiap kali harga modal produk berubah.

Detail model & alur status lengkap ada di
[docs/SKEMA-DATABASE.md §4](./docs/SKEMA-DATABASE.md#4-pembelian--penerimaan-barang-procurement).

### Member & loyalitas
- Kartu member berbasis QR/ULID unik yang bisa dicetak per batch.
- Halaman publik `/q/[uid]` (tanpa login) untuk pelanggan registrasi mandiri &
  melihat profil, poin, saldo deposit, dan riwayat transaksinya sendiri.
- Poin otomatis dari tiap transaksi (dapat dikonfigurasi Rp berapa per 1 poin),
  saldo deposit yang bisa dipakai sebagai metode bayar di kasir.

### Karyawan, outlet & absensi (hub Tim)
- Manajemen karyawan (Owner/Manager/Staff) dan outlet multi-cabang.
- Absensi clock-in/out dengan foto & lokasi GPS, jadwal kerja per outlet, dan
  halaman "Kelola tim" untuk Owner/Manager memantau kehadiran timnya.
- Beranda hub Tim: staff lihat status absen sendiri hari ini, Owner/Manager
  lihat ringkasan tim (jumlah karyawan aktif, hadir hari ini, jadwal hari ini).

### Laporan & analitik (hub Finance)
Omzet, jumlah transaksi, rata-rata transaksi, estimasi untung kotor & bersih
(setelah dikurangi pengeluaran operasional), tren omzet harian, produk terlaris,
dan perbandingan antar outlet — dengan filter periode 7/30/90 hari. Semua angka
sudah dinetokan terhadap retur.

### Analitik lanjutan (per hub)
- **Analitik Kasir** (`/kpi/analitik`) — jam tersibuk (peak hours), produk
  terlaris, omzet per kategori, perputaran stok per produk, retensi member,
  perbandingan outlet.
- **Analitik Tim** (`/tim/analitik`) — ketepatan waktu absen per karyawan,
  kontribusi omzet per kasir, estimasi payroll bulanan (sederhana).
- **Analitik Finance** (`/finance/analitik`) — laporan laba-rugi (P&L), tren
  arus kas 6 bulan, laba per kategori produk, rasio keuangan, breakdown
  pengeluaran.

### Pengeluaran operasional
Catat pengeluaran non-penjualan (sewa, gaji, listrik & air, bahan baku,
marketing, transport, lainnya) per outlet, muncul di Laporan sebagai pengurang
untuk menghitung untung bersih.

### Dokumen & tanda tangan digital (E-Sign)
Fitur standalone (muncul di sidebar semua hub) untuk kelola dokumen bisnis:
- Upload dokumen (PDF/Word/Excel/gambar, maks 8MB), tampilan grid dengan
  filter status (Draft/Menunggu TTD/Selesai/Ditolak) dan badge warna per
  tipe file.
- **Tanda tangan berurutan** — pembuat dokumen menentukan siapa saja yang
  harus tanda tangan dan urutannya; penandatangan ke-2 baru bisa tanda
  tangan setelah ke-1 selesai.
- Tanda tangan digital berbasis canvas (gambar langsung di layar, bukan
  upload gambar tanda tangan).
- Kontrol akses per dokumen (per user tertentu atau per role).
- Preview PDF & gambar langsung di halaman; tipe file lain (Word/Excel)
  disediakan tombol unduh.

Detail model & keputusan desain (kenapa file disimpan sebagai base64, bukan
object storage) ada di
[docs/SKEMA-DATABASE.md §9](./docs/SKEMA-DATABASE.md#9-dokumen--e-sign).

### Pemesanan mandiri via QR meja
- Owner membuat meja per outlet di **Pengaturan → Meja**, tiap meja dapat QR code
  unik untuk dicetak dan ditempel di meja fisik.
- Pelanggan scan QR → buka menu publik tanpa login (`/pesan/[qrToken]`) → pilih
  produk → kirim pesanan (nama & catatan opsional).
- Stok produk **direservasi secara atomik** begitu pesanan dibuat (bukan nanti
  saat dibayar) — mencegah beberapa meja "menang" stok yang sama di waktu
  bersamaan (race condition pada stok terbatas).
- Staff (peran apa pun) memantau antrian di **Pesanan Masuk** (auto-refresh
  berkala): terima → proses pembayaran langsung dari kartu pesanan (tanpa
  retype manual, tidak memotong stok dua kali) → transaksi otomatis tercatat
  sebagai penjualan biasa dan muncul di Kasir → Riwayat. Batalkan pesanan
  otomatis mengembalikan stok yang sempat direservasi.

### Varian & topping produk
Produk bisa punya grup varian (pilih 1 atau pilih banyak, wajib/opsional) dengan
opsi yang menambah harga, mis. Ukuran (Reguler/Large), Level Gula, Topping.
Muncul sebagai pemilih varian di Kasir maupun di halaman pesan QR meja; harga
dan label varian yang dipilih disimpan sebagai snapshot di setiap transaksi.

### Open bill per meja & patungan
Pesanan QR meja yang belum dibayar digabung jadi satu tagihan berjalan per
meja — pelanggan bisa pesan berkali-kali sebelum bayar sekali di akhir.
Layar pembayaran staff punya kalkulator bagi rata (patungan) untuk menghitung
porsi per orang (pembayarannya sendiri tetap satu transaksi).

### Layar dapur (Kitchen Display)
Halaman `/dapur` khusus menampilkan pesanan QR meja sebagai kartu besar dengan
alur status baru → sedang dimasak → siap disajikan, auto-refresh, dan penanda
visual untuk pesanan yang sudah lama menunggu.

### Promo terjadwal
Owner/Manager bisa bikin promo dengan jadwal hari & jam (mis. happy hour),
berlaku untuk semua produk atau kategori tertentu, dengan syarat opsional
minimal belanja. Promo yang jadwalnya cocok dengan waktu sekarang otomatis
aktif di Kasir tanpa input manual (diskon terbesar yang dipakai, tidak
ditumpuk).

### Booking / appointment
Halaman `/booking` untuk staff mencatat janji temu (mis. potong rambut di
barbershop) atau pesanan yang diantar/dibawa ke acara, dengan jadwal per
tanggal, penugasan staff, dan alur status menunggu → terkonfirmasi → selesai.

### Mode offline POS
Kalau internet putus saat checkout di Kasir, transaksi (kecuali bayar saldo
deposit) disimpan dulu di IndexedDB lokal dan otomatis dikirim ulang begitu
koneksi kembali. Transaksi yang gagal sinkron (mis. stok ternyata sudah habis
dipakai transaksi lain selama offline) tetap mengantre dengan pesan error
untuk diselesaikan manual — bukan dipaksa sukses.

### Cetak struk fisik (printer thermal)
Halaman struk punya tombol cetak lewat ESC/POS + aplikasi RawBT (Android) ke
printer thermal Bluetooth/USB, selain cetak via dialog print browser.

### Log audit & rate limiting
Aksi sensitif (batalkan transaksi, retur, ubah harga produk, nonaktifkan
produk, reset kata sandi karyawan) tercatat di **Pengaturan → Log audit**
(siapa & kapan). Endpoint publik/sensitif (login, registrasi, pengiriman
pesanan QR meja) dibatasi jumlah percobaan per menit untuk mencegah
brute-force/spam.

### Ekspor data
Tombol "Ekspor CSV" di halaman Riwayat transaksi dan Laporan, hasilnya
langsung terbaca benar di Excel/Google Sheets (CSV ber-BOM UTF-8).

### Pengaturan (hub Admin)
Karyawan, outlet, profil bisnis (nama, jenis usaha, pajak, poin per rupiah,
footer struk), kartu member/karyawan, meja QR, promo, dan toggle modul —
semua di bawah `/pengaturan` (khusus Owner).

### Panel super-admin & langganan
Panel `/superadmin` (sesi terpisah total dari akun tenant) untuk memantau
semua tenant, omzet agregat, suspend/aktifkan tenant, dan mengonfirmasi
permintaan upgrade paket. Tenant mengajukan upgrade & transfer manual lewat
**Pengaturan → Langganan**; batas paket (jumlah outlet/karyawan/produk)
ditegakkan otomatis di service layer.

### Progressive Web App (PWA)
Bisa di-"Add to Home Screen" seperti aplikasi native (manifest + ikon adaptif).
Service worker meng-cache aset statis (JS/CSS/font/ikon) secara `cache-first`
begitu dimuat pertama kali, sehingga kunjungan berikutnya jauh lebih cepat —
sementara halaman & data tetap `network-first` supaya tidak pernah menampilkan
data toko yang basi. Terintegrasi dengan Vercel Speed Insights untuk memantau
performa real-user di production. Endpoint `GET /api/health` tersedia untuk
di-ping berkala oleh layanan cron eksternal supaya function & koneksi database
tidak "tidur" saat idle (mitigasi cold start serverless — lihat
[docs/ARSITEKTUR.md § Performa & operasional](./docs/ARSITEKTUR.md#performa--operasional)).

---

## Peran & hak akses

Ada tiga peran: **Owner**, **Manager**, **Staff**.

| Halaman/Hub                        | Owner | Manager | Staff |
| ----------------------------------- | :---: | :-----: | :---: |
| Beranda Kasir / Kasir / Member / Pesanan Meja | ✅ | ✅ | ✅ |
| Beranda Tim / Absensi               | ✅ | ✅ | ✅ |
| Produk, Inventori, Supplier, Pembelian, Barang Masuk, Opname | ✅ | ✅ | ❌ |
| Analitik (Kasir/Tim/Finance)        | ✅ | ✅ | ❌ |
| Laporan, Pengeluaran (hub Finance)  | ✅ | ✅ | ❌ |
| Kelola tim (absensi/tim)            | ✅ | ✅ | ❌ |
| Dokumen (standalone)                | ✅ | ✅ | ✅ |
| Pengaturan (hub Admin)              | ✅ | ❌ | ❌ |

Manager dan Staff hanya melihat outlet yang ditugaskan padanya (`UserOutlet`);
Owner otomatis melihat semua outlet di tenant-nya.

---

## Arsitektur teknis

**Stack:** Next.js 16 (App Router, Server Components + Server Actions) · TypeScript
· Tailwind CSS v4 (CSS-first config, tanpa `tailwind.config.js`) · Prisma ORM 7
dengan driver adapter `@prisma/adapter-pg` · PostgreSQL · Auth.js (NextAuth v5).

**Struktur folder penting:**
```
src/
  app/
    (app)/            # Halaman yang butuh login, dibungkus AppShell (sidebar per hub)
    pilih-aplikasi/    # Halaman pilih hub — DI LUAR (app)/, tanpa sidebar
    q/[uid]/           # Halaman publik kartu member (tanpa login)
    pesan/[qrToken]/   # Halaman publik menu pesan QR meja (tanpa login)
    api/health/        # Endpoint publik keep-warm (lihat docs/ARSITEKTUR.md)
    login/, register/
  components/          # Client components, dikelompokkan per fitur
  server/
    services/          # Semua logika bisnis & akses database (lihat di bawah)
    require-session.ts # requireSession()/requireRole()/requireModule(), di-cache per-request
  lib/
    hubs.ts, nav.ts, modules.ts  # Definisi hub, menu sidebar, modul toggleable
    format.ts, date-range.ts     # Utilitas format uang/tanggal (TANPA date-fns)
  proxy.ts              # Middleware Auth.js — daftar path publik ada di sini
prisma/
  schema.prisma
  migrations/
  seed.ts               # Data demo
  scripts/clear-demo-data.ts
docs/
  ARSITEKTUR.md          # Sistem hub/modul, multi-tenant, caching, konvensi
  SKEMA-DATABASE.md       # Semua model data dijelaskan per domain
```

**Prinsip multi-tenant (WAJIB dipatuhi di semua kode baru):** setiap fungsi di
`src/server/services/*` menerima `tenantId` sebagai parameter pertama dan setiap
query Prisma WAJIB menyertakan `where: { tenantId }`. `tenantId` **tidak pernah**
diambil dari input client (form/query param) — selalu dari sesi login lewat
`requireSession()`/`requireRole()`. Dua pengecualian yang didokumentasikan
eksplisit di kode: `getCardByUid()` dan `getTableByQrToken()`, yang memang publik
dan menurunkan `tenantId` dari record yang di-resolve lewat token unik (ULID),
bukan dari input langsung. Detail lengkap di
[docs/ARSITEKTUR.md § Isolasi multi-tenant](./docs/ARSITEKTUR.md#isolasi-multi-tenant).

**Pola umum satu fitur:** migrasi Prisma (**dengan file migration-nya**, jangan
cuma edit `schema.prisma`) → fungsi di `server/services/*.ts` → Server Action
di `app/.../actions.ts` (validasi + panggil service + `revalidatePath`) →
Server Component untuk fetch data awal → Client Component (`"use client"`)
untuk interaktivitas, memanggil Server Action lewat `useTransition`. Detail
lengkap tiap langkah di
[docs/ARSITEKTUR.md § Pola menambah 1 fitur baru](./docs/ARSITEKTUR.md#pola-menambah-1-fitur-baru).

**Uang** selalu Rupiah bulat (`Int`, bukan desimal) dan diformat lewat satu fungsi
`formatRupiah()` di `src/lib/format.ts` — jangan format manual di tempat lain.

---

## Model data

Ringkasan model utama di `prisma/schema.prisma` (60+ model) — lihat
**[docs/SKEMA-DATABASE.md](./docs/SKEMA-DATABASE.md)** untuk penjelasan
lengkap tiap model beserta diagram relasi per domain:

- **Tenant, Outlet, User, UserOutlet** — struktur bisnis & akses multi-outlet.
- **Product, Category, ProductStock, StockAdjustment, StockTransfer,
  ProductVariantGroup/Option** — katalog, varian, & pergerakan stok.
- **CashierShift, Sale, SaleItem, SaleReturn, SaleReturnItem** — transaksi kasir
  dan retur sebagian.
- **Supplier, SupplierPricingContract, PurchaseOrder, PurchaseOrderItem,
  StockReceipt, StockReceiptItem, StockCount, StockCountItem,
  ProductCostHistory** — alur pembelian, penerimaan barang (dengan QC), dan
  opname stok fisik.
- **Member, PointTransaction, UidCard, UidBatch** — loyalitas & kartu QR.
- **ShiftSchedule, Attendance** — jadwal & absensi.
- **Expense, TenantSetting** — pengeluaran operasional & pengaturan tenant.
- **Table, TableOrder, TableOrderItem** — meja QR dan pesanan mandiri pelanggan
  (open bill: satu TableOrder per meja menampung banyak ronde pesanan sampai dibayar).
- **Promo** — promo terjadwal (happy hour, diskon kategori, minimal belanja).
- **Booking** — janji temu (barbershop dsb) & pesanan diantar/acara.
- **Document, DocumentVersion, DocumentSigner, DocumentAccess** — manajemen
  dokumen & tanda tangan digital berurutan.
- **AuditLog** — jejak aksi sensitif (void, retur, ubah harga, dst).
- **SuperAdmin, SubscriptionRequest** — akun platform (lintas tenant) dan
  permintaan upgrade paket langganan.

---

## Menjalankan secara lokal

Butuh database PostgreSQL (lokal atau layanan seperti Supabase). Salin
`.env.example` ke `.env` dan isi `DATABASE_URL` serta `AUTH_SECRET`.

```bash
npm install
npx prisma migrate dev
npm run seed   # opsional: isi data demo
npm run dev
```

Buka http://localhost:3000.

---

## Skrip npm

| Skrip                | Fungsi |
| --------------------- | ------ |
| `npm run dev`          | Jalankan server pengembangan (Turbopack) |
| `npm run build`        | `prisma generate && prisma migrate deploy && next build` |
| `npm run start`        | Jalankan hasil build produksi |
| `npm run lint`         | ESLint |
| `npm run seed`         | Isi/reset data demo tenant "Kopi Nusantara" |
| `npm run db:clear-demo`| Hapus tenant demo beserta semua isinya (lihat di bawah) |

---

## Deploy ke Vercel + Supabase

1. Buat project baru di [Supabase](https://supabase.com/dashboard), ambil
   **dua** connection string dari Settings → Database: yang **pooler mode
   transaction** (port `6543`, tambahkan `?pgbouncer=true`) untuk
   `DATABASE_URL`, dan yang **direct** (port `5432`) untuk `DIRECT_URL`
   (dipakai khusus saat `prisma migrate deploy`, karena schema engine butuh
   advisory lock yang tidak didukung mode pooling).
2. Di Vercel, import repo ini lalu isi environment variables: `DATABASE_URL`,
   `DIRECT_URL`, dan `AUTH_SECRET` (string acak panjang). `AUTH_URL`/
   `NEXTAUTH_URL` sengaja TIDAK diisi — Auth.js mendeteksi domain otomatis
   dari request (`trustHost: true`), jadi tetap jalan baik di domain produksi
   maupun preview URL.
3. **Samakan region compute Vercel dengan region database Supabase** —
   `vercel.json` di repo ini sudah set `"regions": ["sin1"]` (Singapura);
   sesuaikan kalau project Supabase-mu ada di region lain. Region yang beda
   bisa bikin tiap request lambat beberapa ratus milidetik cuma karena
   jarak jaringan.
4. Build otomatis menjalankan `prisma generate && prisma migrate deploy` sebelum
   `next build`, jadi skema database ikut ter-update tiap deploy — **dengan
   syarat migration-nya memang sudah punya file** (lihat catatan di
   [docs/ARSITEKTUR.md § Pola menambah 1 fitur baru](./docs/ARSITEKTUR.md#pola-menambah-1-fitur-baru)).
5. (Opsional tapi direkomendasikan) Daftarkan `https://<domain-kamu>/api/health`
   ke layanan cron eksternal gratis (cron-job.org, UptimeRobot) tiap ~5 menit
   supaya function & koneksi database tidak "tidur" saat idle (cold start).
6. (Opsional) Jalankan `npm run seed` sekali secara manual dengan `DATABASE_URL`
   diarahkan ke Supabase, untuk mengisi data demo yang bisa dilihat sebelum
   mulai pakai data asli.

---

## Mulai pakai untuk bisnis asli

Aplikasi ini multi-tenant — setiap bisnis yang mendaftar lewat `/register`
mendapat tenant baru yang **terisolasi penuh**, jadi data demo (kalau ada) tidak
akan pernah terlihat atau tercampur dengan data bisnismu.

Kalau tetap ingin menghapus tenant demo "Kopi Nusantara" sepenuhnya dari
database (mis. supaya database production benar-benar kosong sebelum go-live):

```bash
DATABASE_URL="<connection-string-production-kamu>" npm run db:clear-demo
```

Skrip ini menghapus tenant demo beserta semua isinya (produk, transaksi, member,
karyawan, dll — cascade delete dari `Tenant`) dan aman dijalankan berkali-kali
(tidak melakukan apa-apa kalau data demo sudah tidak ada).

---

## Akun demo

Setelah menjalankan `npm run seed`, gunakan akun berikut (tenant "Kopi Nusantara"):

| Peran   | Email            | Kata sandi  |
| ------- | ---------------- | ----------- |
| Owner   | owner@demo.id    | password123 |
| Manager | manager@demo.id  | password123 |
| Staff   | staff1@demo.id   | password123 |
| Staff   | staff2@demo.id   | password123 |

---

## Keterbatasan & belum dibangun

Fitur berikut pernah dibahas tapi **belum** diimplementasikan, atau sengaja
dibangun dengan batasan tertentu:

- **Lupa password lewat email** — untuk karyawan biasa, admin (Owner) bisa
  reset kata sandi langsung dari **Pengaturan → Karyawan**; belum ada alur
  reset mandiri lewat email untuk yang lupa kata sandi (termasuk Owner sendiri
  atau customer di portal member).
- **Integrasi payment gateway** — pembayaran QRIS/e-wallet di kasir, pemesanan
  QR meja, maupun upgrade paket langganan dicatat/dikonfirmasi manual oleh
  staff/admin (tidak ada verifikasi otomatis ke penyedia pembayaran seperti
  Midtrans/Xendit).
- **Dokumen disimpan sebagai base64 di database, bukan object storage** —
  cukup untuk volume dokumen wajar (kontrak, invoice) dengan batas 8MB per
  file; kalau volume/ukuran dokumen membesar signifikan, ini kandidat
  pertama untuk dipindah ke Supabase Storage/S3 (lihat
  [docs/SKEMA-DATABASE.md §9](./docs/SKEMA-DATABASE.md#9-dokumen--e-sign)).
- **Monitoring error (Sentry)** — belum diintegrasikan karena butuh akun/DSN
  eksternal; saat ini error hanya terlihat di log server.
- **Rate limiting in-memory** — pembatas percobaan login/registrasi/pesan QR
  memakai penyimpanan in-memory per proses, cukup untuk deployment
  single-instance tapi tidak efektif kalau di-deploy multi-instance/serverless
  (state tidak dibagi antar instance). Perlu diganti ke penyimpanan bersama
  (mis. Redis) untuk scale ke banyak instance.
- **Mode offline POS tidak menjamin presisi stok** — reservasi stok atomik
  cuma valid dengan koneksi live ke database; transaksi yang diantre offline
  divalidasi ulang saat sinkron, dan bisa gagal (butuh penyelesaian manual
  kasir) kalau stoknya keburu habis dipakai transaksi lain selama offline.
- **Booking tanpa halaman self-service publik** — booking/appointment dicatat
  manual oleh staff (mis. saat pelanggan telepon), belum ada halaman publik
  untuk pelanggan booking sendiri.
- **Printer thermal belum dites di perangkat fisik** — perintah ESC/POS untuk
  RawBT dibangun sesuai standar EPSON-compatible tapi belum diverifikasi di
  printer sungguhan; kalau hasil cetak berantakan, sesuaikan urutan perintah
  di `src/lib/escpos.ts`.

---

## Teknologi

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, Prisma ORM 7 dengan
PostgreSQL (driver adapter `pg`), Auth.js (NextAuth v5) untuk login, Vercel
Speed Insights untuk monitoring performa.

---

## Catatan Perubahan Terbaru (AI Agents / Developer Notes)

### 1. Model & Skema Database Meja (`Table`)
* Kolom baru yang ditambahkan pada skema `Table`:
  * `floor` (Int, default: 1): Menentukan lantai penempatan meja (Lantai 1-3).
  * `shape` (String, default: "SQUARE"): Menentukan bentuk meja fisik (`SQUARE` untuk kotak, `ROUND` untuk bulat, `RECTANGLE` untuk meja panjang).
  * `capacity` (Int, default: 2): Kapasitas orang/kursi pada meja.
* Prisma Client telah diregenerasi dan migrasi PostgreSQL Supabase telah diterapkan.

### 2. Pengaturan Meja (Unified Workspace)
* Halaman `/pengaturan/meja` menyatukan **Daftar Meja** dan **Desain Layout Visual** berdampingan (side-by-side) alih-alih memakai tab terpisah.
* **Sinkronisasi Hover:** Mengarahkan kursor (hover) pada baris meja di daftar teks kiri akan otomatis meng-highlight meja terkait di grid layout visual kanan (dengan efek membesar `scale-[1.05]`, glowing border, dan `z-10`), begitu pula sebaliknya.
* **Grid Dinamis:** Ditambahkan pengatur ukuran grid kolom (X) dan baris (Y) dari 4x4 hingga 12x12 yang dapat diubah secara real-time via antarmuka. Pilihan sel koordinat modal meja otomatis mengikuti batas area grid aktif. Ukuran grid in-memory dihitung otomatis saat dimuat berdasarkan koordinat meja terjauh (minimal awal 6x6).
* **Mode Pindah:** Saat memindahkan posisi meja secara visual, lencana "Memindahkan..." berkedip di daftar teks kiri untuk memperjelas alur perpindahan meja antar koordinat atau antar lantai.

### 3. Command Center Layar Penuh
* Halaman `/command-center` dirancang untuk berjalan dalam mode full-screen (tanpa sidebar navigasi desktop, header mobile, atau bottom bar mobile) agar pas untuk monitor/tablet dapur.
* Ditambahkan tombol **← Keluar Fullscreen** untuk mempermudah keluar dari halaman ini.
* Halaman menyatukan **Daftar Antrean Masak** (kiri) dan **Peta Layout Meja** (kanan) berdampingan dalam satu layar tanpa tab pemisah.
