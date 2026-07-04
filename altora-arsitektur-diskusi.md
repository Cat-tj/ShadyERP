# Altora — Ringkasan Produk + Ide Reorganisasi Path (untuk konsultasi AI lain)

> Dokumen ini dibuat untuk didiskusikan dengan AI lain. Isinya: (1) kondisi
> produk Altora saat ini apa adanya, dan (2) sebuah ide reorganisasi struktur
> URL/halaman yang baru sedang **didiskusikan, belum diputuskan, dan belum
> ada satu baris kode pun yang ditulis untuk itu**. Bagian 2 murni proposal
> untuk dikritik, bukan rencana final.

---

## Bagian 1 — Kondisi produk saat ini

### 1.1 Apa itu Altora

SaaS multi-tenant untuk UMKM Indonesia (coffee shop, restoran, barbershop,
toko kecil): kasir/POS, manajemen produk & stok, member berkartu QR, absensi
karyawan, laporan, dan pemesanan mandiri lewat QR meja — satu aplikasi web.
Setiap bisnis yang daftar (`/register`) dapat satu **tenant** yang datanya
terisolasi penuh dari tenant lain.

### 1.2 Stack teknis

- Next.js 16 (App Router, Server Components + Server Actions, Turbopack) — **catatan: versi Next.js ini punya breaking changes dari versi standar** (mis. `middleware.ts` diganti jadi `src/proxy.ts`).
- TypeScript
- Tailwind CSS v4 (CSS-first config, tanpa `tailwind.config.js`)
- Prisma ORM 7 + driver adapter `@prisma/adapter-pg`
- PostgreSQL (Supabase di production)
- Auth.js / NextAuth v5 (JWT session, Credentials provider dengan bcrypt)
- Deploy ke Vercel
- PWA (installable, service worker cache-first untuk aset statis)

### 1.3 Struktur folder inti

```
src/
  app/
    (app)/            # Halaman yang butuh login, dibungkus AppShell (sidebar/nav)
    q/[uid]/           # Halaman publik kartu member (tanpa login)
    pesan/[qrToken]/   # Halaman publik menu pesan QR meja (tanpa login)
    login/, register/
  components/          # Client components, dikelompokkan per fitur
  server/
    services/          # Semua logika bisnis & akses database
    require-session.ts # Helper requireSession()/requireRole()/requireModule()
  lib/                  # Utilitas: format uang/tanggal, modul, nav, dsb.
  proxy.ts              # Middleware Auth.js — daftar path publik ada di sini
prisma/
  schema.prisma
  migrations/
  seed.ts
```

Pola umum satu fitur: migrasi Prisma → fungsi di `server/services/*.ts` →
Server Action (`actions.ts`, validasi + `revalidatePath`) → Server Component
(fetch awal) → Client Component (interaktif via `useTransition`).

Prinsip multi-tenant wajib: setiap fungsi service menerima `tenantId` sebagai
parameter pertama, setiap query Prisma wajib `where: { tenantId }`, dan
`tenantId` **tidak pernah** diambil dari input client — selalu dari sesi
login. Dua pengecualian terdokumentasi: `getCardByUid()` dan
`getTableByQrToken()` (publik, `tenantId` diturunkan dari token unik ULID).

### 1.4 Peran & hak akses

Tiga peran: **Owner**, **Manager**, **Staff**.

| Halaman | Owner | Manager | Staff |
|---|:---:|:---:|:---:|
| Beranda / Kasir / Member / Absensi | ✅ | ✅ | ✅ |
| Pesanan Meja | ✅ | ✅ | ✅ |
| Produk (+ riwayat stok, transfer stok) | ✅ | ✅ | ❌ |
| Laporan | ✅ | ✅ | ❌ |
| Pengeluaran | ✅ | ✅ | ❌ |
| Kelola tim (absensi/tim) | ✅ | ✅ | ❌ |
| Pengaturan (karyawan, outlet, bisnis, kartu, meja) | ✅ | ❌ | ❌ |

Manager/Staff hanya melihat outlet yang ditugaskan (`UserOutlet`); Owner
otomatis melihat semua outlet di tenant-nya.

### 1.5 Sistem modul fitur (baru dibangun, BUKAN microservice)

Setiap tenant bisa menyalakan/mematikan modul non-core lewat
**Pengaturan → Modul**. Ini murni flag akses + tema warna — satu app, satu
database. Definisi ada di `src/lib/modules.ts`:

| Modul | Key | Core? | Warna aksen | Deskripsi |
|---|---|:---:|---|---|
| Kasir & Produk | `kasir` | ✅ selalu aktif | `#a730a8` (magenta) | Transaksi, produk, kategori, stok |
| Pemesanan Digital | `pesanan-digital` | ❌ | `#ea580c` (oranye) | QR meja & kitchen display |
| Booking | `booking` | ❌ | `#db2777` (pink) | Appointment (barbershop, salon, klinik) |
| Member & Loyalitas | `member` | ❌ | `#0d9488` (teal) | Kartu member, poin, deposit |
| HR & Kepegawaian | `hr` | ❌ | `#2563eb` (biru) | Karyawan, jadwal, absensi |
| Keuangan | `keuangan` | ❌ | `#16a34a` (hijau) | Laporan & pengeluaran |
| Promo & Marketing | `promo` | ❌ | `#d97706` (kuning/amber) | Promo terjadwal |

Mekanismenya:
- `Tenant.disabledModules: String[]` di database.
- `resolveEnabledModules()` menghitung set modul aktif per tenant.
- `navItemsForRole(role, enabledModules)` menyaring item sidebar/nav sesuai modul aktif + peran.
- `requireModule(key)` — guard server-side di `layout.tsx` tiap grup halaman, redirect ke `/dashboard` kalau modul dimatikan (jadi tidak bisa diakali lewat akses URL langsung).
- `getModuleForPath(pathname)` memetakan path yang sedang dibuka ke modulnya (lihat tabel prefix di bawah), lalu `AppShell` meng-override CSS variable `--color-primary`/`--color-primary-dark` dan menambahkan gradient wash tipis di background halaman sesuai warna modul itu — jadi tiap fitur "terasa" beda temanya tanpa mengubah kode tiap halaman satu-satu.

Pemetaan path → modul saat ini (di `ROUTE_MODULE_MAP`, urutan paling spesifik dicek dulu):

```
/pengaturan/karyawan  -> hr
/pengaturan/promo     -> promo
/pengaturan/meja      -> pesanan-digital
/pengaturan/kartu     -> member
/dashboard            -> kasir
/kasir                -> kasir
/produk               -> kasir
/pesanan-meja         -> pesanan-digital
/dapur                -> pesanan-digital
/booking              -> booking
/member               -> member
/absensi              -> hr
/laporan              -> keuangan
/pengeluaran          -> keuangan
```

Path yang tidak match apa pun (mis. `/pengaturan`, `/akun`) dianggap netral —
tetap pakai warna brand default, tidak diblokir modul manapun.

### 1.6 Daftar fitur lengkap (existing, sudah jalan di production)

- **Kasir (POS)** — buka/tutup shift + modal awal, grid produk + kategori + pencarian, keranjang dengan diskon per-item/transaksi, pajak otomatis, metode bayar (Tunai+kembalian, QRIS, Transfer, E-Wallet, Saldo Deposit member), struk digital, riwayat transaksi, void, **retur/refund sebagian** (beda dari void, otomatis kembalikan stok & koreksi poin proporsional).
- **Produk & stok** — CRUD produk/kategori, harga jual & modal, aktif/nonaktif, stok per outlet, riwayat perubahan stok (audit trail), transfer stok antar outlet (atomik + validasi).
- **Member & loyalitas** — kartu QR/ULID (cetak per batch), halaman publik `/q/[uid]` (tanpa login) untuk pelanggan self-service (profil, poin, saldo, riwayat), poin otomatis per transaksi (rate dikonfigurasi), saldo deposit sebagai metode bayar.
- **Karyawan, outlet & absensi** — manajemen karyawan (3 peran) & outlet multi-cabang, clock-in/out dengan foto + GPS, jadwal kerja per outlet, halaman "Kelola tim" untuk memantau kehadiran.
- **Laporan & analitik** — omzet, jumlah transaksi, rata-rata, untung kotor & bersih (dikurangi pengeluaran), tren harian, produk terlaris, perbandingan antar outlet, filter 7/30/90 hari, sudah dinetokan terhadap retur.
- **Pengeluaran operasional** — kategori (sewa, gaji, listrik/air, bahan baku, marketing, transport, lainnya) per outlet, jadi pengurang di Laporan.
- **Pemesanan mandiri via QR meja** — meja per outlet dengan QR unik (Pengaturan → Meja), menu publik `/pesan/[qrToken]` tanpa login, **stok direservasi atomik saat pesan dibuat** (bukan saat bayar, mencegah race condition), staff pantau di "Pesanan Masuk" (auto-refresh) → terima → bayar langsung dari kartu pesanan → otomatis jadi Sale biasa. Batal otomatis mengembalikan stok.
- **Open bill per meja & patungan** — pesanan-pesanan QR meja yang belum dibayar digabung jadi satu tagihan berjalan; kalkulator bagi rata di layar bayar staff.
- **Varian & topping produk** — grup varian (pilih 1/pilih banyak, wajib/opsional) dengan opsi berbayar, snapshot harga & label tersimpan di tiap transaksi.
- **Layar dapur (Kitchen Display)** — `/dapur`, kartu besar per pesanan, alur baru → dimasak → siap saji, auto-refresh, penanda pesanan lama menunggu.
- **Promo terjadwal** — jadwal hari & jam (happy hour dsb), berlaku semua produk/kategori tertentu, syarat minimal belanja opsional, otomatis aktif tanpa input manual (diskon terbesar dipakai, tidak ditumpuk).
- **Booking/appointment** — `/booking`, jadwal per tanggal, penugasan staff, status menunggu → terkonfirmasi → selesai. **Belum ada halaman self-service publik** — staff yang input manual.
- **Mode offline POS** — checkout tersimpan di IndexedDB kalau internet putus (kecuali bayar saldo deposit), otomatis sync ulang saat online; transaksi yang gagal sync (mis. stok keburu habis) mengantre dengan error untuk penyelesaian manual.
- **Cetak struk fisik** — ESC/POS + RawBT (Android) ke printer thermal Bluetooth/USB, selain dialog print browser. Belum diverifikasi di printer fisik sungguhan.
- **Log audit & rate limiting** — aksi sensitif (void, retur, ubah harga, nonaktif produk, reset password karyawan) tercatat di Pengaturan → Log audit; endpoint publik/sensitif dibatasi percobaan/menit (in-memory, belum cocok untuk multi-instance/serverless scale).
- **Ekspor CSV** — di Riwayat transaksi & Laporan, BOM UTF-8 (kebuka rapi di Excel/Sheets).
- **Pengaturan** — Karyawan, Outlet, Profil bisnis (nama, jenis usaha, pajak, poin/rupiah, footer struk), Kartu member/karyawan, Meja QR, Promo, **Modul** (toggle fitur, baru). Semua di bawah `/pengaturan`, mayoritas khusus Owner.
- **Panel super-admin** — `/superadmin`, sesi terpisah total dari akun tenant, memantau semua tenant, omzet agregat, suspend/aktifkan tenant, konfirmasi upgrade paket. Tenant ajukan upgrade lewat Pengaturan → Langganan (transfer manual); batas paket (outlet/karyawan/produk) ditegakkan di service layer.
- **Landing page marketing** — `/` (root), untuk pengunjung belum login (halaman fitur, gallery, dsb). Kalau sudah login, redirect ke `/dashboard`.
- **Login & Register** — didesain ulang baru-baru ini dengan logomark gradient "a" milik brand, background gradient magenta/oranye/biru, split-layout foto untuk `/login` (desktop/tablet).

### 1.7 Keterbatasan yang didokumentasikan (belum dibangun / sengaja dibatasi)

- Belum ada lupa-password mandiri via email (Owner reset manual dari Pengaturan → Karyawan).
- Belum ada integrasi payment gateway otomatis (QRIS/e-wallet dicatat manual oleh staff/admin, bukan verifikasi otomatis Midtrans/Xendit dsb).
- Belum ada Sentry/error monitoring eksternal.
- Rate limiting masih in-memory per proses — tidak scale ke multi-instance/serverless.
- Mode offline POS tidak menjamin presisi stok 100% (revalidasi saat sync, bisa gagal kalau stok keburu habis).
- Booking belum punya halaman self-service publik untuk pelanggan.
- Printer thermal belum dites di perangkat fisik.

---

## Bagian 2 — Ide reorganisasi struktur path (BARU DIDISKUSIKAN, BELUM DIPUTUSKAN)

### 2.1 Ide awal dari pemilik produk

Tetap satu repo, satu database — tapi setiap area fitur besar dipisah ke path
top-level sendiri (bukan subdomain sungguhan, disepakati pakai path karena
lebih simpel untuk auth/session & deploy):

```
altora.my.id/kpi        (dulunya /dashboard — snapshot lintas modul)
altora.my.id/kasir       (sudah ada, solid)
altora.my.id/inventory   (rename dari /produk)
altora.my.id/finance     (gabungan /laporan + /pengeluaran)
altora.my.id/absensi     (diperluas jadi hub HR penuh)
altora.my.id/member      (KHUSUS untuk end customer, bukan staff)
altora.my.id/(sisanya)   ("rest of ERP" — belum dirinci pemilik produk)
```

Tujuan yang disebutkan pemilik produk: **kesan produk lebih modular/profesional**.
Sudah disepakati: pakai **path**, bukan subdomain sungguhan (lebih simpel,
tidak perlu wildcard DNS/SSL terpisah, session cookie tetap satu domain).

### 2.2 Draf pemetaan isi tiap path (proposal, untuk dikritik)

- **`/kpi`** (pengganti `/dashboard`) — dashboard ringkasan lintas modul: omzet hari ini, transaksi berjalan, status shift kasir, quick links ke modul aktif tenant (menggantikan quick-links yang sekarang ada di `/dashboard`).
- **`/kasir`** — tidak berubah signifikan, sudah dianggap solid: POS, keranjang, shift, riwayat, retur.
- **`/inventory`** — rename `/produk`: CRUD produk/kategori, riwayat stok, transfer stok antar outlet.
- **`/finance`** — gabungan `/laporan` + `/pengeluaran` jadi satu hub: laporan omzet/untung + pencatatan pengeluaran dalam satu tempat (saat ini dua halaman terpisah).
- **`/absensi`** — diperluas dari sekadar clock-in/out jadi hub HR penuh: usul memindahkan manajemen **Karyawan** (yang sekarang di `/pengaturan/karyawan`) ke sini juga, supaya semua hal soal "orang" (karyawan, jadwal, kehadiran) ada di satu tempat.
- **`/member`** — **butuh klarifikasi**, lihat 2.3 di bawah.
- **Sisa fitur yang belum masuk kategori di atas**: `/pesanan-digital` (QR meja + dapur), `/booking`, `/promo`, `/pengaturan` (yang tersisa: outlet, profil bisnis, kartu, meja, modul), `/superadmin`. Ini kandidat untuk masuk "rest of ERP" — belum disepakati apakah dikelompokkan lagi atau dibiarkan sebagai path masing-masing.

### 2.3 Konflik yang perlu diputuskan: `/member`

Saat ini di kode, path `/member` adalah halaman **staff-facing** (staff/Owner
mencari & mengelola data pelanggan, lihat poin/saldo mereka). Ini **berbeda**
dari portal self-service pelanggan yang sudah ada di `/q/[uid]` (tanpa login,
untuk pelanggan sendiri lihat profil/poin/riwayatnya).

Pemilik produk ingin `/member` di skema baru murni untuk **customer**, bukan
staff. Kalau itu terjadi, pengelolaan member sisi staff perlu pindah ke suatu
tempat. Tiga opsi yang pernah dilempar (belum dipilih):

1. Gabung ke `/kpi` sebagai salah satu section/tab.
2. Path staff-only baru, mis. `/pelanggan` (terpisah dari `/member` yang jadi customer-facing).
3. Tetap satu halaman dengan tab, salah satu tabnya cuma link keluar ke portal publik terpisah.

### 2.4 Hal yang eksplisit BELUM disepakati / belum dikerjakan

- Belum ada keputusan final soal path mana yang benar-benar dipakai atau
  isinya persis apa — semua di atas masih proposal diskusi.
- Belum ada satu baris kode pun yang diubah untuk reorganisasi ini (pemilik
  produk eksplisit minta "gausah ngoding dulu, kita pikirkan bareng" / "Dont
  Code").
- Belum diputuskan bagaimana relasi ide ini dengan sistem modul yang sudah
  ada (Bagian 1.5) — apakah path baru ini menggantikan mapping modul yang
  sudah ada, atau berjalan berdampingan (mis. modul tetap menentukan warna
  tema & akses, path baru cuma reorganisasi URL/nav).
- Belum dibahas dampaknya ke SEO/bookmark existing users, redirect dari path
  lama ke path baru, atau efeknya ke auth guard (`src/proxy.ts`) dan
  `ROUTE_MODULE_MAP` yang saat ini berbasis prefix path lama.

---

## Pertanyaan untuk didiskusikan dengan AI lain

1. Apakah reorganisasi path ini worth it dibanding cukup merapikan nav/label
   tanpa mengubah URL struktur (risiko: broken bookmarks, kerja migrasi
   redirect, harus update `ROUTE_MODULE_MAP` & proxy matcher)?
2. Bagaimana idealnya menyelesaikan konflik `/member` (staff vs customer)
   tanpa membingungkan dua audiens yang beda?
3. Apakah "rest of ERP" perlu dikelompokkan lagi (mis. `/operasional` untuk
   booking+promo+pesanan-digital) atau dibiarkan flat?
4. Apakah reorganisasi ini sebaiknya digabung sekalian dengan sistem modul
   yang sudah ada (satu path = satu modul), atau tetap dipisah sebagai dua
   konsep independen (path = organisasi navigasi, modul = flag akses+tema)?
