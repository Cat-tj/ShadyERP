# ShadyERP: Redesign Visual Premium + Kelengkapan Simple/Advanced Mode

**Status**: Approved (brainstorming), ready for implementation planning
**Tanggal**: 2026-07-09

## Latar Belakang

ShadyERP (Altora) sudah punya fondasi dua-mode: `SimpleShell` (bottom-tab, 4 menu, untuk tenant `accountingMode: SIMPLE`) dan `AppShell` (sidebar + 8 hub, untuk `ADVANCED`). Landing page (`src/app/landing.css`) sudah punya identitas brand sendiri — gradient logomark indigo→magenta→oranye dengan magenta `#a730a8` sebagai primary — tapi warna ini belum konsisten dipakai di dalam aplikasi (app masih pakai biru generik `#2563EB`).

Tujuan redesign ini: (1) bikin tampilan lebih premium & konsisten dengan brand landing, (2) tutup celah fungsional di Simple Mode, (3) perbaiki momen ganti mode supaya tidak berisiko "kepencet nggak sadar".

Audit kode menemukan hub "Kasir" sudah pakai warna magenta `#a730a8` yang sama persis dengan primary landing — ini titik pijak alami untuk migrasi warna.

## Keputusan Desain (dari sesi brainstorming visual companion)

Proses eksplorasi visual (clean-minimal vs warm-approachable vs dark-premium → refinement "B1 terracotta" → dibandingkan dengan palet asli landing) berujung pada keputusan: **pakai penuh palet landing** (bukan terracotta, bukan warna baru), karena app dan landing page harus terasa satu identitas brand yang sama.

## Bagian 1: Kelengkapan Menu Simple Mode

### Masalah
`src/app/(app)/simple/menu/page.tsx` punya daftar `menuItems` hardcoded berisi 11 entri. Modul yang sudah ada di sistem (`src/lib/modules.ts`) tapi TIDAK muncul di daftar ini: `booking` (Booking), `pesanan-digital` (Pesanan Meja QR & Command Center), Sales CRM (`/crm`, gated modul `keuangan`), dan Dokumen & Arsip (`/dokumen`, tidak ada gating modul, selalu aktif).

Akibat: tenant Simple Mode yang mengaktifkan modul-modul ini tidak punya jalan UI untuk mengaksesnya — fitur ada di database/backend tapi tidak reachable dari navigasi manapun di Simple Mode.

### Perubahan
Tambah 5 entri ke `menuItems` di `simple/menu/page.tsx`:

| href | label | module | roles |
|---|---|---|---|
| `/booking` | Booking | `booking` | OWNER, MANAGER, STAFF |
| `/pesanan-meja` | Pesanan Meja QR | `pesanan-digital` | OWNER, MANAGER, STAFF |
| `/command-center` | Command Center | `pesanan-digital` | OWNER, MANAGER, STAFF |
| `/crm` | Sales CRM | `keuangan` | OWNER, MANAGER |
| `/dokumen` | Dokumen & Arsip | *(tanpa gating modul)* | OWNER, MANAGER, STAFF |

### Restrukturisasi tampilan
Grid datar 2-kolom yang ada sekarang diganti jadi 3 seksi berjudul (masih grid 2-kolom di dalam tiap seksi, cuma dikelompokkan):

1. **Operasional Toko** — Setup Toko, Alert Center, Offline Sync, Booking, Pesanan Meja QR, Command Center
2. **Produk & Tim** — Produk, Inventory, Member, Absensi, Laundry
3. **Bisnis** — Finance, Sales CRM, Dokumen & Arsip, Pengaturan

Filtering by role+module tetap sama seperti sekarang (item hilang total dari tampilan kalau modul nonaktif atau role tidak sesuai — bukan disabled/greyed-out).

## Bagian 2: Momen Ganti Mode (Simple ↔ Advanced)

### Masalah
Toggle `accountingMode` di `src/components/pengaturan/bisnis-form.tsx` saat ini adalah dua tombol kecil di tengah form pengaturan bisnis umum, tanpa preview, tanpa penjelasan konsekuensi, tanpa konfirmasi — padahal ini mengubah seluruh sistem navigasi aplikasi (bottom-tab ↔ sidebar 8-hub) begitu tersimpan.

### Perubahan
Bagian toggle mode dipisah jadi blok visual tersendiri di dalam halaman yang sama (bukan halaman baru), berisi dua kartu berdampingan:

- **Kartu Simple**: mini-preview bottom-tab (ilustrasi statis/CSS, bukan screenshot), bullet "Kasir, catat kas, lihat omzet — cocok kalau baru mulai atau tim kecil"
- **Kartu Advanced**: mini-preview sidebar+hub, bullet "Laporan detail, jurnal akuntansi, banyak cabang — cocok kalau sudah lebih besar"

Kartu yang sedang aktif ditandai jelas (border/badge "Aktif"). Klik kartu yang berbeda dari mode aktif memicu dialog konfirmasi sebelum submit ke server action yang sudah ada:

> "Tampilan akan berubah jadi [Advanced/Simple]. Data kamu tetap aman, dan kamu bisa kembali kapan saja."

Tidak ada perubahan pada siapa yang boleh mengubah (tetap Owner-only via server action yang sudah ada) — ini murni perbaikan UX presentasi & safety-net konfirmasi, bukan perubahan model data/permission.

## Bagian 3: Sistem Visual Gabungan

### Prinsip warna

Token baru di `src/app/globals.css` (`:root`), diambil langsung dari `landing.css` supaya app dan landing identik, bukan "mirip-mirip":

| Token | Nilai lama | Nilai baru | Sumber |
|---|---|---|---|
| `--color-bg` | `#F8FAFC` (biru-abu) | `#f5f7fa` | `landing.css --bg` |
| `--color-bg-secondary` | `#F1F5F9` | `#eceef2` | `landing.css --bg-secondary` |
| `--color-text` | `#0F172A` | `#0a1f44` | `landing.css --text` |
| `--color-text-secondary` | `#475569` | `#5b6478` | `landing.css --text-secondary` |
| `--color-border` | `#E2E8F0` | `#e2e6ec` | `landing.css --border` |
| `--color-primary` | `#2563EB` (biru) | `#a730a8` | `landing.css --primary` |
| `--color-primary-dark` | `#1D4ED8` | `#6a3cc0` | `landing.css --primary-dark` |
| `--color-primary-soft` | `#EFF6FF` | `rgba(167,48,168,0.08)` | `landing.css --primary-soft` |

Gradient 3-stop untuk momen spesial (baru, belum ada di app): `linear-gradient(120deg, #2f3ba3 0%, #a730a8 55%, #f28a4e 100%)` — persis dari `landing.css .hero`.

- **Base/background**: pakai token di atas (netral terang, sedikit warm-grey — bukan lagi biru-abu Tailwind slate default).
- **Primary accent**: `--color-primary` (magenta) untuk tombol utama, state nav aktif, dan maksimal SATU kartu stat paling penting per layar. Tidak disebar ke semua elemen.
- **Gradient penuh** direservasi untuk momen spesial: banner onboarding, kartu upgrade/langganan, preview kartu mode-switch di Bagian 2. TIDAK dipakai sebagai wash rata di UI harian (POS dipakai berjam-jam, gradient penuh akan melelahkan mata).
- **Warna hub yang sudah ada** (Inventory teal `#0f766e`, Laundry cyan `#0891b2`, HRIS biru `#2563eb`, Finance hijau `#16a34a`, Admin abu `#57534e`, Command oranye `#ea580c`, Dokumen slate `#475569`) dipertahankan apa adanya (hex sama persis, tidak diubah) sebagai penanda wayfinding hub — fungsional, bukan sekadar dekorasi, terutama penting di Advanced Mode dengan 8 hub. Harmonisasi dengan base baru dicapai lewat background yang lebih warm-neutral, bukan lewat mengubah hex hub itu sendiri.

### Perbedaan Simple vs Advanced (selain warna)
- **Simple Mode**: kartu besar, touch-target lega, spacing longgar (token `--ui-scale` mobile yang sudah ada dipertahankan). Filosofi: tenang, tidak membanjiri dengan data.
- **Advanced Mode**: layout lebih padat (tabel/list rapat, token `--ui-scale` desktop yang sudah ada dipertahankan/diperkuat). Filosofi: efisiensi buat user yang butuh lihat banyak data sekaligus.
- Bahasa warna & bentuk (radius, shadow style) tetap SAMA di kedua mode, supaya pindah mode terasa seperti "aplikasi yang sama, kepadatan beda" — bukan ganti produk.

### Cakupan implementasi
Migrasi token warna di `src/app/globals.css` (`--color-primary` dan turunannya) dari biru ke magenta, plus penyesuaian saturasi warna hub di `src/lib/hubs.ts`. Komponen yang memakai `var(--color-primary)` otomatis ikut berubah tanpa perlu diedit satu-satu (StatCard, tombol, nav aktif state, dll — sudah pakai CSS variable, bukan hardcoded hex).

## Di Luar Cakupan (Eksplisit)

- Tidak mengubah struktur hub (tetap 8 hub yang sama) — hanya warna & kepadatan visual.
- Tidak menambah "graduation path" otomatis (auto-suggest pindah mode berdasarkan pertumbuhan bisnis) — itu ide terpisah yang didiskusikan tapi tidak dipilih (lihat opsi "beda tahap pertumbuhan" yang tidak dipilih user).
- Tidak mengubah siapa yang boleh ganti mode (tetap Owner-only).
- Tidak menyentuh logika `disabledModules`/gating modul itu sendiri — hanya menambah entri yang hilang dari daftar tampilan Simple Mode.

## Testing / Verifikasi

- Cek visual: buka `/simple/menu` sebagai Owner dengan semua modul aktif → 5 entri baru muncul, terkelompok dalam 3 seksi.
- Cek gating: nonaktifkan modul `booking` di Pengaturan → Modul → entri Booking hilang dari `/simple/menu`.
- Cek konfirmasi: klik kartu mode berbeda di Pengaturan → Bisnis → dialog konfirmasi muncul sebelum submit; cancel tidak mengubah apa pun.
- Cek warna: buka dashboard Simple (`/simple/hari-ini`) dan salah satu hub Advanced → warna primary magenta konsisten, background netral (bukan biru-abu lama).
