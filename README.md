# Altora — Kasir & Manajemen Toko untuk UMKM

SaaS multi-tenant untuk UMKM Indonesia (coffee shop, restoran, barbershop, toko
kecil): kasir/POS, manajemen produk & stok, member berkartu QR, absensi karyawan,
laporan, dan pemesanan mandiri lewat QR meja — dalam satu aplikasi web.

## Daftar isi

1. [Fitur](#fitur)
2. [Peran & hak akses](#peran--hak-akses)
3. [Arsitektur teknis](#arsitektur-teknis)
4. [Model data](#model-data)
5. [Menjalankan secara lokal](#menjalankan-secara-lokal)
6. [Skrip npm](#skrip-npm)
7. [Deploy ke Vercel + Supabase](#deploy-ke-vercel--supabase)
8. [Mulai pakai untuk bisnis asli](#mulai-pakai-untuk-bisnis-asli)
9. [Akun demo](#akun-demo)
10. [Keterbatasan & belum dibangun](#keterbatasan--belum-dibangun)

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

### Member & loyalitas
- Kartu member berbasis QR/ULID unik yang bisa dicetak per batch.
- Halaman publik `/q/[uid]` (tanpa login) untuk pelanggan registrasi mandiri &
  melihat profil, poin, saldo deposit, dan riwayat transaksinya sendiri.
- Poin otomatis dari tiap transaksi (dapat dikonfigurasi Rp berapa per 1 poin),
  saldo deposit yang bisa dipakai sebagai metode bayar di kasir.

### Karyawan, outlet & absensi
- Manajemen karyawan (Owner/Manager/Staff) dan outlet multi-cabang.
- Absensi clock-in/out dengan foto & lokasi GPS, jadwal kerja per outlet, dan
  halaman "Kelola tim" untuk Owner/Manager memantau kehadiran timnya.

### Laporan & analitik
Omzet, jumlah transaksi, rata-rata transaksi, estimasi untung kotor & bersih
(setelah dikurangi pengeluaran operasional), tren omzet harian, produk terlaris,
dan perbandingan antar outlet — dengan filter periode 7/30/90 hari. Semua angka
sudah dinetokan terhadap retur.

### Pengeluaran operasional
Catat pengeluaran non-penjualan (sewa, gaji, listrik & air, bahan baku,
marketing, transport, lainnya) per outlet, muncul di Laporan sebagai pengurang
untuk menghitung untung bersih.

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

### Pengaturan
Karyawan, outlet, profil bisnis (nama, jenis usaha, pajak, poin per rupiah,
footer struk), kartu member/karyawan, meja QR, dan promo — semua di bawah
`/pengaturan` (khusus Owner, beberapa tab juga bisa diakses Manager).

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
performa real-user di production.

---

## Peran & hak akses

Ada tiga peran: **Owner**, **Manager**, **Staff**.

| Halaman                          | Owner | Manager | Staff |
| --------------------------------- | :---: | :-----: | :---: |
| Beranda / Kasir / Member / Absensi | ✅ | ✅ | ✅ |
| Pesanan Meja                       | ✅ | ✅ | ✅ |
| Produk (+ riwayat stok, transfer stok) | ✅ | ✅ | ❌ |
| Laporan                            | ✅ | ✅ | ❌ |
| Pengeluaran                        | ✅ | ✅ | ❌ |
| Kelola tim (absensi/tim)           | ✅ | ✅ | ❌ |
| Pengaturan (karyawan, outlet, bisnis, kartu, meja) | ✅ | ❌ | ❌ |

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
    (app)/            # Halaman yang butuh login, dibungkus AppShell (sidebar/nav)
    q/[uid]/           # Halaman publik kartu member (tanpa login)
    pesan/[qrToken]/   # Halaman publik menu pesan QR meja (tanpa login)
    login/, register/
  components/          # Client components, dikelompokkan per fitur
  server/
    services/          # Semua logika bisnis & akses database (lihat di bawah)
    require-session.ts # Helper requireSession()/requireRole() untuk tiap halaman
  lib/                  # Utilitas: format uang/tanggal, base URL, dsb.
  proxy.ts              # Middleware Auth.js — daftar path publik ada di sini
prisma/
  schema.prisma
  migrations/
  seed.ts               # Data demo
  scripts/clear-demo-data.ts
```

**Prinsip multi-tenant (WAJIB dipatuhi di semua kode baru):** setiap fungsi di
`src/server/services/*` menerima `tenantId` sebagai parameter pertama dan setiap
query Prisma WAJIB menyertakan `where: { tenantId }`. `tenantId` **tidak pernah**
diambil dari input client (form/query param) — selalu dari sesi login lewat
`requireSession()`/`requireRole()`. Dua pengecualian yang didokumentasikan
eksplisit di kode: `getCardByUid()` dan `getTableByQrToken()`, yang memang publik
dan menurunkan `tenantId` dari record yang di-resolve lewat token unik (ULID),
bukan dari input langsung.

**Pola umum satu fitur:** migrasi Prisma → fungsi di `server/services/*.ts` →
Server Action di `app/.../actions.ts` (validasi + panggil service + `revalidatePath`)
→ Server Component untuk fetch data awal → Client Component (`"use client"`) untuk
interaktivitas, memanggil Server Action lewat `useTransition`.

**Uang** selalu Rupiah bulat (`Int`, bukan desimal) dan diformat lewat satu fungsi
`formatRupiah()` di `src/lib/format.ts` — jangan format manual di tempat lain.

---

## Model data

Ringkasan model utama di `prisma/schema.prisma` (lihat file untuk relasi lengkap):

- **Tenant, Outlet, User, UserOutlet** — struktur bisnis & akses multi-outlet.
- **Product, Category, ProductStock, StockAdjustment, StockTransfer** — katalog
  & pergerakan stok.
- **CashierShift, Sale, SaleItem, SaleReturn, SaleReturnItem** — transaksi kasir
  dan retur sebagian.
- **Member, PointTransaction, UidCard, UidBatch** — loyalitas & kartu QR.
- **ShiftSchedule, Attendance** — jadwal & absensi.
- **Expense** — pengeluaran operasional.
- **Table, TableOrder, TableOrderItem** — meja QR dan pesanan mandiri pelanggan
  (open bill: satu TableOrder per meja menampung banyak ronde pesanan sampai dibayar).
- **ProductVariantGroup, ProductVariantOption** — varian & topping produk.
- **Promo** — promo terjadwal (happy hour, diskon kategori, minimal belanja).
- **Booking** — janji temu (barbershop dsb) & pesanan diantar/acara.
- **AuditLog** — jejak aksi sensitif (void, retur, ubah harga, dst).
- **SuperAdmin, SubscriptionRequest** — akun platform (lintas tenant) dan
  permintaan upgrade paket langganan.
- **TenantSetting** — pajak, poin per rupiah, footer struk.

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

1. Buat project baru di [Supabase](https://supabase.com/dashboard), ambil connection
   string dari Settings → Database.
2. Di Vercel, import repo ini lalu isi environment variables: `DATABASE_URL`
   (connection string Supabase) dan `AUTH_SECRET` (string acak panjang).
   `AUTH_URL`/`NEXTAUTH_URL` sengaja TIDAK diisi — Auth.js mendeteksi domain
   otomatis dari request (`trustHost: true`), jadi tetap jalan baik di domain
   produksi maupun preview URL.
3. Build otomatis menjalankan `prisma generate && prisma migrate deploy` sebelum
   `next build`, jadi skema database ikut ter-update tiap deploy.
4. (Opsional) Jalankan `npm run seed` sekali secara manual dengan `DATABASE_URL`
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
