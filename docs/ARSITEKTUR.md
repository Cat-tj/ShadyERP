# Arsitektur

Dokumen ini menjelaskan **bagaimana** Altora disusun secara teknis:
sistem hub, sistem modul, isolasi multi-tenant, pola caching, dan
konvensi yang dipegang di seluruh kode. Untuk **apa saja** fiturnya,
lihat [README.md](../README.md). Untuk detail tabel database, lihat
[SKEMA-DATABASE.md](./SKEMA-DATABASE.md).

## Daftar isi

1. [Gambaran besar](#gambaran-besar)
2. [Sistem Hub](#sistem-hub)
3. [Sistem Modul](#sistem-modul)
4. [Isolasi multi-tenant](#isolasi-multi-tenant)
5. [Pola caching per-request](#pola-caching-per-request)
6. [Struktur folder](#struktur-folder)
7. [Pola menambah 1 fitur baru](#pola-menambah-1-fitur-baru)
8. [Konvensi kode](#konvensi-kode)
9. [Performa & operasional](#performa--operasional)

---

## Gambaran besar

Altora **bukan** kumpulan microservice — satu aplikasi Next.js, satu
database Postgres. "Modul" dan "Hub" adalah dua cara berbeda mengiris
fitur yang sama, bukan dua sistem yang saling menggantikan:

| | Modul (`src/lib/modules.ts`) | Hub (`src/lib/hubs.ts`) |
|---|---|---|
| Jawab pertanyaan | Fitur mana yang **dibeli/dinyalakan** tenant ini? | Fitur yang aktif itu, dikelompokkan jadi **"aplikasi" mana**? |
| Diatur oleh | Owner (Pengaturan → Modul) | Tetap (definisi kode, tidak bisa diubah tenant) |
| Efeknya | Sembunyikan menu + blokir akses URL langsung | Sidebar cuma tampilkan menu hub yang lagi dibuka |
| Contoh | Matikan modul "Booking" kalau bisnisnya bukan barbershop | Menu Absensi & beranda Tim selalu satu grup "Tim", terpisah dari Kasir |

Alur navigasi tingkat tinggi:

```
Login ──▶ /pilih-aplikasi ──▶ pilih hub (Kasir/Tim/Finance/Admin) ──▶ AppShell
             (halaman penuh,         │                                (sidebar
              tanpa sidebar)         └── disimpan ke localStorage       hanya
                                          supaya /dokumen dkk tahu       menu
                                          "lagi di hub mana"             hub ini)
```

---

## Sistem Hub

**Kenapa ada:** supaya tiap "aplikasi" (Kasir, Tim, Finance, Admin)
terasa terpisah — sidebar tidak menampilkan puluhan menu campur aduk,
dan user harus sengaja pindah lewat halaman pemilihan, bukan nyasar
lewat link silang di sidebar.

**File kunci:** `src/lib/hubs.ts`

```ts
export type HubKey = "kasir" | "tim" | "finance" | "admin";

export const HUBS: HubDef[] = [
  { key: "kasir",   label: "Kasir & Operasional", color: "#a730a8", homeHref: "/kpi", ... },
  { key: "tim",     label: "Tim",                 color: "#2563eb", homeHref: "/tim", ... },
  { key: "finance", label: "Finance",              color: "#16a34a", homeHref: "/finance/laporan", ... },
  { key: "admin",   label: "Admin",                color: "#57534e", homeHref: "/pengaturan", ... },
];
```

Setiap `NavItem` di `src/lib/nav.ts` ditandai hub pemiliknya:

```ts
{ href: "/absensi", label: "Absensi", roles: [...], module: "hr", hub: "tim" }
```

`hub: "all"` artinya item itu **tampil di sidebar hub manapun** —
sampai saat ini cuma dipakai untuk **Dokumen** (fitur standalone, tidak
terikat modul/hub tertentu, lihat [SKEMA-DATABASE.md §9](./SKEMA-DATABASE.md#9-dokumen--e-sign)).

**Fungsi penting:**
- `navItemsForHub(role, hubKey, enabledModules)` — daftar menu untuk
  sidebar hub tertentu (filter role + modul + hub sekaligus).
- `hubsAvailableForRole(role, enabledModules)` — hub mana saja yang
  punya minimal 1 menu untuk role ini. Dipakai `/pilih-aplikasi` untuk
  menentukan kartu hub mana yang ditampilkan (Staff tidak akan pernah
  lihat kartu "Admin" atau "Finance", misalnya).

**Halaman pemilihan (`/pilih-aplikasi`) dan sidebar (`AppShell`) SALING
LEPAS secara render:** `/pilih-aplikasi` ada di luar folder route group
`(app)/` supaya tidak ikut terbungkus `AppShell` (tidak ada sidebar sama
sekali di halaman ini, sengaja full-page). Pilihan hub disimpan ke
`localStorage` (client-side) sekaligus dibaca dari path URL — kalau user
buka halaman yang hub-nya ambigu (mis. `/dokumen`, `/akun`), `AppShell`
jatuh balik ke hub yang tersimpan di `localStorage` terakhir.

> ⚠️ **Jebakan yang pernah kejadian:** komponen ikon React (`ComponentType`)
> di `HubDef.icon` TIDAK BOLEH dikirim sebagai prop dari Server Component
> ke Client Component — React Server Components menolak fungsi lewat
> batas serialisasi ini, lolos build & TypeScript tapi **meledak di
> runtime production**. Solusinya: Server Component cuma kirim
> `hubKeys: HubKey[]` (array string), Client Component (`HubPicker`)
> resolve balik ke objek `HubDef` lengkap (termasuk ikonnya) di dalam
> dirinya sendiri dengan mengimpor `HUBS` langsung. Kalau menambah pola
> serupa (kirim data dari `page.tsx` ke komponen `"use client"`), pastikan
> semua field-nya serializable (string/number/boolean/object polos) —
> jangan pernah sertakan fungsi/komponen.

**Deteksi "menu mana yang aktif" di sidebar** (`app-shell.tsx`): karena
beberapa href saling jadi prefix satu sama lain (mis. `/kpi` dan
`/kpi/analitik`), logika aktif TIDAK boleh cuma `pathname.startsWith(href)`
per item (dua menu bisa nyala bersamaan) — dipilih SATU item dengan
prefix path **terpanjang** yang cocok.

---

## Sistem Modul

**Kenapa ada:** satu tenant (mis. kedai kopi kecil) tidak butuh semua
fitur (mis. Booking appointment ala barbershop). Modul non-core bisa
dimatikan Owner supaya UI-nya tidak berisik dengan menu yang tidak
relevan buat bisnisnya.

**File kunci:** `src/lib/modules.ts` — 7 modul: `kasir` (core, selalu
aktif), `pesanan-digital`, `booking`, `member`, `hr`, `keuangan`, `promo`.

**Alur enforcement — dua lapis, bukan cuma UI:**

1. **Sembunyikan dari sidebar** — `navItemsForRole()`/`navItemsForHub()`
   filter item yang `module`-nya ada di `Tenant.disabledModules`.
2. **Blokir akses URL langsung** (WAJIB, bukan opsional) — tiap
   `layout.tsx` di bawah route yang termasuk modul non-core memanggil
   `requireModule("hr")` dkk. Kalau modul dimatikan tapi user tetap
   mengetik URL-nya langsung, tetap ditolak dan dilempar ke
   `/pilih-aplikasi`. Contoh: `src/app/(app)/absensi/layout.tsx`,
   `src/app/(app)/tim/layout.tsx`.

Setiap modul non-core juga punya warna aksen sendiri (`ModuleDef.color`)
yang di-inject sebagai CSS variable `--color-primary` oleh `AppShell`
saat user berada di halaman fitur itu — jadi tiap fitur terasa punya
"tema" sendiri tanpa perlu styling terpisah per halaman.

---

## Isolasi multi-tenant

**Aturan yang tidak boleh dilanggar di kode baru mana pun:**

1. Setiap fungsi di `src/server/services/*.ts` menerima `tenantId`
   sebagai **parameter pertama**.
2. Setiap query Prisma di dalamnya **wajib** menyertakan `where: { tenantId }`
   (atau lewat relasi yang sudah difilter tenant).
3. `tenantId` **tidak pernah** diambil dari input client (form field,
   query param, body request) — selalu dari sesi login lewat
   `requireSession()` / `requireRole()` / `requireModule()`.

**Dua pengecualian yang didokumentasikan eksplisit di kode** (karena
memang harus publik, tanpa login): `getCardByUid()` (portal member
`/q/[uid]`) dan `getTableByQrToken()` (menu pesan `/pesan/[qrToken]`).
Keduanya menurunkan `tenantId` dari **record yang di-resolve lewat token
unik** (ULID di `UidCard.uid` / `Table.qrToken`), bukan dari input
langsung — token itu sendiri praktis tidak bisa ditebak (ULID acak), jadi
tetap aman meski publik.

---

## Pola caching per-request

**Masalah yang pernah terjadi:** `(app)/layout.tsx` (dibungkus ke semua
halaman) memanggil salah satu fungsi auth setiap render untuk menyusun
sidebar. Hampir semua `page.tsx` di dalamnya JUGA memanggil fungsi auth
sendiri (`requireSession()`/`requireRole()`/`requireModule()`) untuk
validasi & ambil `tenantId`. Tanpa penanganan khusus, ini jadi **2×
`auth()` + 2× query tenant ke database untuk data yang identik, di
SETIAP request ke SEMUA halaman** — kontributor besar untuk keluhan
"aplikasi kerasa lambat".

**Solusi:** `src/server/require-session.ts` membungkus logika inti
(cek sesi + ambil status tenant) dengan `cache()` dari React:

```ts
const getAuthState = cache(async () => {
  const session = await auth();
  // ...
  const tenant = await prisma.tenant.findUnique({ ... });
  return { user, tenant };
});
```

`cache()` dari React memoize berdasarkan request render yang sedang
berjalan — dipanggil berkali-kali (dari layout, lalu dari page) dengan
argumen yang sama, tapi kerja sebenarnya (network call ke database)
cuma benar-benar terjadi **sekali**. `requireSession()`,
`requireSessionWithTenant()`, `requireRole()`, dan `requireModule()`
semuanya dibangun di atas satu fungsi cached ini.

> Pola ini berlaku untuk **data yang tidak berubah dalam satu request**
> (sesi login, status tenant). Jangan pakai `cache()` untuk data yang
> memang harus selalu fresh di tiap pemanggilan dalam request yang sama.

---

## Struktur folder

```
src/
  app/
    (app)/                 # Halaman yang butuh login, dibungkus AppShell
      kpi/                 # Beranda hub Kasir + /kpi/analitik
      kasir/, produk/, inventory/, supplier/, purchase-order/,
      stock-receipt/, stock-count/, member/, booking/,
      pesanan-meja/, dapur/                        # ── hub Kasir
      tim/, absensi/                               # ── hub Tim
      finance/                                     # ── hub Finance
      pengaturan/                                  # ── hub Admin
      dokumen/               # standalone, tampil di semua hub
      akun/
    pilih-aplikasi/         # Halaman pilih hub — DI LUAR (app)/, tanpa sidebar
    q/[uid]/                # Publik: portal member (tanpa login)
    pesan/[qrToken]/        # Publik: menu pesan QR meja (tanpa login)
    superadmin/              # Panel lintas-tenant, sesi terpisah total
    api/health/              # Publik: keep-warm ping (lihat §Performa)
    login/, register/
  components/               # Client components, dikelompokkan per fitur
    ui/                      # Ikon SVG, GlassPanel, dsb — dipakai lintas fitur
  server/
    services/                # SEMUA logika bisnis & akses database
    require-session.ts       # requireSession()/requireRole()/requireModule()
  lib/
    hubs.ts, nav.ts, modules.ts   # Definisi hub, menu, modul
    prisma.ts                     # Singleton PrismaClient (driver adapter pg)
    format.ts                     # formatRupiah(), formatTanggal(), dst
    date-range.ts                  # Helper tanggal murni (TANPA date-fns)
  proxy.ts                   # Middleware Auth.js — daftar path publik di sini
prisma/
  schema.prisma
  migrations/
  seed.ts                    # Data demo tenant "Kopi Nusantara"
  scripts/clear-demo-data.ts
docs/
  ARSITEKTUR.md               # File ini
  SKEMA-DATABASE.md            # Detail semua model data per domain
```

---

## Pola menambah 1 fitur baru

Urutan yang konsisten dipakai di seluruh riwayat pengembangan project ini:

1. **Migrasi Prisma** — tambah model di `schema.prisma`, lalu **WAJIB**
   generate file migration-nya (`npx prisma migrate dev --name nama_fitur`
   di lokal, atau `prisma migrate diff` kalau tidak ada akses database
   langsung). Jangan pernah cuma edit `schema.prisma` tanpa migration —
   `prisma migrate deploy` di build Vercel cuma menjalankan migration
   yang **sudah punya file-nya**; kalau lupa, Prisma Client akan generate
   query untuk tabel yang di database production belum pernah dibuat,
   dan aplikasi crash di runtime meski build-nya sukses.
2. **Service layer** (`server/services/nama-fitur-service.ts`) — semua
   fungsi terima `tenantId` sebagai parameter pertama.
3. **Server Action** (`app/.../actions.ts`) — validasi input, panggil
   service, `revalidatePath`/`router.refresh()` di client setelahnya.
4. **Server Component** (`page.tsx`) — fetch data awal, biasanya lewat
   `Promise.all` kalau ada beberapa query independen.
5. **Client Component** (`"use client"`) — interaktivitas, panggil
   Server Action lewat `useTransition`.
6. Kalau fitur baru itu perlu tampil di sidebar: tambah entri di
   `NAV_ITEMS` (`src/lib/nav.ts`) dengan `hub` yang sesuai, dan kalau
   dia bagian dari modul yang bisa dimatikan, tambah `module` juga +
   guard `requireModule()` di `layout.tsx` route-nya.

---

## Konvensi kode

- **Uang selalu `Int` Rupiah bulat**, tidak pernah desimal. Format
  tampilan selalu lewat `formatRupiah()` — jangan format manual di
  tempat lain.
- **Tanggal:** jangan tambah dependency `date-fns` atau library tanggal
  lain — pakai helper murni di `src/lib/date-range.ts`
  (`subDays`, `subMonths`, `startOfDay`, `endOfDay`, `todayRangeJakarta`,
  dst). Project ini sengaja menghindari dependency tanggal eksternal.
- **File/gambar berukuran kecil** (foto absensi, dokumen) disimpan
  sebagai **data URL base64 langsung di kolom database**, bukan
  diunggah ke object storage — lihat
  [SKEMA-DATABASE.md §6 & §9](./SKEMA-DATABASE.md#6-tim-jadwal--absensi)
  untuk detail & batas ukurannya.
- **Jangan optimasi N+1 dengan `Promise.all(items.map(async ...))`** kalau
  bisa satu query `groupBy`/`include` — pola `map(async)` per item
  masih dipakai di beberapa fungsi analitik lama (`kpi-service.ts`) dan
  itu utang teknis, bukan contoh yang harus ditiru di kode baru.

---

## Performa & operasional

Catatan dari investigasi nyata waktu aplikasi ini terasa lambat di
production — berguna kalau masalah serupa muncul lagi:

1. **Region compute vs region database harus sama.** Vercel secara
   default deploy function di region tertentu (mis. Washington D.C.);
   kalau database (Supabase) ada di region lain (mis. Singapura), setiap
   query bolak-balik lintas benua (~300-400ms one-way). Fix: set
   `"regions": ["sin1"]` di `vercel.json` supaya compute & database
   satu region.
2. **`DATABASE_URL` harus lewat connection pooler** (Supabase: port
   `6543` + `?pgbouncer=true`), bukan koneksi direct (port `5432`) —
   serverless bisa bikin banyak koneksi baru sekaligus, direct connection
   gampang kehabisan slot. `DIRECT_URL` (port `5432`) tetap dipakai
   khusus untuk `prisma migrate deploy`, karena schema engine butuh
   advisory lock yang tidak didukung mode pooling.
3. **Hindari query duplikat di request path yang sama** — lihat
   [§Pola caching per-request](#pola-caching-per-request) di atas.
4. **Cold start serverless itu nyata dan bukan bug** — tanda cirinya:
   klik pertama lambat, klik kedua (segera setelah itu) jauh lebih
   cepat. Mitigasi gratis: ping endpoint `GET /api/health` (query
   ringan ke database, sengaja dikecualikan dari auth di `proxy.ts`)
   secara berkala (mis. tiap 5 menit) pakai layanan cron eksternal
   gratis (cron-job.org, UptimeRobot) supaya function & koneksi
   database tidak "tidur" saat idle. Kalau butuh lebih kencang lagi dari
   ini, opsinya Vercel Pro (Fluid Compute) atau pindah ke platform
   always-on (Railway/Render/Fly.io) — bukan buru-buru sewa VPS mentah,
   karena itu artinya kamu sendiri yang mengurus deploy, SSL, dan
   process management yang selama ini otomatis di Vercel.
