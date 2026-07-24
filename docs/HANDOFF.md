# Altora — Handover

Satu-satunya jalur rilis adalah `master` (lihat `docs/RELEASE_TARGETS.md`).
Setiap sesi kerja yang menyentuh aplikasi utama (bukan `apps/altora-teams-landing`,
yang punya handover sendiri di `docs/altora-teams/`) mencatat ringkasannya di sini,
entri terbaru di atas.

---

## 2026-07-23 — Fix: lokasi absensi tidak tampil

**Commit SHA:** akan dicatat setelah commit dibuat (lihat entri commit di bawah setelah push).

### Fitur/perubahan

Bug: widget absensi (`ClockWidget`) sudah menangkap `lat`/`lng` lewat
`navigator.geolocation` sejak awal dan menyimpannya ke `Attendance.lat/lng`,
tapi kedua halaman yang merender widget itu (personal `/absensi` dan manager
`/absensi/tim`) tidak pernah meneruskan field itu ke komponen — jadi lokasi
terekam di database tapi tidak pernah terlihat siapa pun. Diperbaiki dengan
meneruskan `lat`/`lng` dari service ke komponen, dan menampilkan link
"Lihat lokasi absen" (Google Maps, plain URL — tidak perlu API key) di kartu
absen personal maupun baris riwayat tim.

### File yang diubah

- `src/components/absensi/clock-widget.tsx` — `AttendanceInfo` type + `LocationLine` komponen
- `src/components/absensi/tim-attendance-list.tsx` — `TeamAttendanceRow` type + link lokasi per baris
- `src/app/(app)/absensi/page.tsx`, `src/app/(app)/absensi/tim/page.tsx` — teruskan `lat`/`lng` dari service ke komponen

### Hasil validasi

`npx tsc --noEmit` bersih, `npx eslint` pada semua file yang diubah bersih.
Tidak ada perubahan schema/migration (field `lat`/`lng` sudah ada sejak awal).

### Status deploy

Belum di-deploy — commit ini baru dibuat, VPS masih menjalankan SHA sebelumnya.

---

## 2026-07-23 — Dashboard Supermarket + migrasi ke `master`

**Commit SHA:** `20a5a77` (kode fitur) — sudah menjadi ancestor `master` saat ini
di `8339ceb` (verifikasi: `git merge-base --is-ancestor 20a5a77 origin/master` → true).
Tiga commit setelahnya (`be75e72`, `93a7b6a`, `8339ceb`) adalah pekerjaan
operator (bukan agent ini): mendefinisikan `master` sebagai release branch dan
mendokumentasikan migrasi VPS.

### Fitur/perubahan

Dashboard `/kpi` khusus vertical **supermarket** (`supermarket.altora.my.id`),
mengikuti `docs/design/altora-supermarket-dashboard-guidelines.md`:

- 4 KPI card (penjualan hari ini, jumlah transaksi, rata-rata transaksi,
  margin estimasi) dengan tren "vs kemarin".
- Action-center card ("Perlu perhatian": stok kritis, PO terlambat, outlet
  turun tajam).
- Grafik tren penjualan 7 hari.
- 4 panel operasional: produk terlaris, stok prioritas, purchase order
  terlambat, performa cabang.
- Sidebar: subheading berbasis pekerjaan (Overview/Operasional/Analitik/
  Pengaturan) di dalam hub yang aktif, khusus vertical supermarket.
- Perbaikan bug lama: beberapa token warna semantik (`success`/`warning`/
  `danger`/`info` surface, dll) di `globals.css` dideklarasikan di
  `@theme inline` tapi tidak pernah diberi nilai `:root` — sudah diperbaiki,
  berdampak positif ke komponen lain yang memakainya juga (StatCard,
  StatusBadge, dll), bukan cuma dashboard baru ini.

Gating fitur ketat ke `vertical?.key === "supermarket"` (turunan live dari
subdomain request, lihat `src/lib/request-vertical.ts`) — **bukan** dari
`Tenant.businessType` yang tersimpan, karena `businessType` menyamakan
supermarket/toko/ecommerce jadi satu nilai `"TOKO"` dan tidak bisa
membedakan tenant supermarket dari tenant toko biasa. Tenant non-supermarket
tidak berubah tampilannya sama sekali.

### File/area yang diubah

- `src/app/(app)/kpi/page.tsx` — cabang render supermarket, generic branch tetap utuh
- `src/app/(app)/kpi/supermarket-dashboard.tsx` — baru
- `src/components/dashboard/{kpi-trend-card,sales-trend-chart,action-center-card}.tsx` — baru
- `src/components/ui/skeleton.tsx` — baru
- `src/components/app-shell.tsx`, `src/components/simple-shell.tsx` — tema vertical + subheading sidebar
- `src/app/(app)/layout.tsx` — teruskan `vertical` ke `AppShell`
- `src/app/globals.css` — perbaikan token warna
- `src/server/services/report-service.ts` — `getTodayVsYesterday`, `getOutletPerformanceToday`
- `src/server/services/purchase-order-service.ts` — `getOverduePurchaseOrders`
- `src/lib/format.ts` — `formatRupiahCompact`
- Tidak ada perubahan `prisma/schema.prisma` pada batch ini → tidak ada migration baru.

### Hasil validasi

- `npx tsc --noEmit` — bersih, di commit `20a5a77` maupun ulang di `8339ceb` (kode identik).
- `npx eslint` pada semua file yang diubah — bersih (ada utang lint pra-eksisting di file lain, tidak tersentuh batch ini).
- `npm run build` (production) — sukses, seluruh route termasuk `/kpi` ter-compile.
- **Belum tervalidasi:** login + render browser nyata dengan data live. Sandbox
  agent ini tidak punya akses PostgreSQL yang bisa dijangkau (`prisma migrate
  dev` → `P1001: Can't reach database server`), jadi dev server tidak bisa
  login session nyata dan Playwright screenshot dashboard tidak bisa dijalankan
  dari sini. Perlu dicek visual di staging/production oleh sesi yang punya akses DB.

### Status deploy & target domain/service

- Repo: `Cat-tj/ShadyERP`, service `altora-main` di Altora VPS (`/home/altora/ShadyERP`), domain utama `altora.my.id` (dan subdomain vertical, termasuk `supermarket.altora.my.id`).
- Menurut `docs/RELEASE_TARGETS.md`: SHA aplikasi terakhir yang tercatat *deployed* ke VPS adalah `93a7b6a`, yang sudah meng-ancestor-kan `20a5a77` (fitur dashboard ini). `8339ceb` (HEAD saat ini) hanya perubahan dokumentasi, tidak ada kode yang perlu di-deploy ulang untuknya.
- Health check publik `https://altora.my.id/api/health` → `HTTP 200 {"ok":true}` (dicek dari sesi ini, 2026-07-23 03:10 UTC). **Catatan jujur:** ini membuktikan service hidup, bukan bukti langsung SHA yang jalan di VPS — sesi ini tidak punya akses SSH ke VPS untuk `git rev-parse HEAD` di server. Verifikasi SHA-persis sebelumnya tercatat di `docs/RELEASE_TARGETS.md` bagian "VPS deployment record", dibuat oleh sesi yang memang punya akses deploy.
- `supermarket.altora.my.id` secara spesifik belum diverifikasi visual (lihat "Belum tervalidasi" di atas) — perlu dicek subdomain itu langsung setelah deploy berjalan.

### Migration, risiko, follow-up

- **Migration:** tidak ada (tidak ada perubahan schema Prisma di batch ini).
- **Risiko:** rendah — semua perubahan digate ketat ke `vertical?.key === "supermarket"` atau perbaikan bug token CSS yang murni aditif; tenant/vertical lain tidak tersentuh secara fungsional.
- **Follow-up yang sengaja belum dikerjakan** (lihat guideline §5 dan §10):
  1. Sidebar collapsible/rail (desktop) dan drawer (tablet) — belum ada, karena butuh ubah `AppShell` yang dipakai semua vertical, di luar scope batch supermarket-only ini.
  2. Grouping sidebar lintas-hub yang benar-benar satu daftar (guideline maunya satu sidebar dengan grup Overview/Operasional/Analitik/Pengaturan merangkum semua fitur) — saat ini cuma subheading di dalam hub yang sedang aktif, karena arsitektur hub yang ada sengaja "tanpa link silang antar hub, pindah lewat /pilih-aplikasi" (lihat komentar di `src/lib/hubs.ts`). Mengubah ini butuh keputusan arsitektur terpisah, bukan tweak kecil.
  3. Verifikasi visual browser (desktop/tablet/mobile) untuk `supermarket.altora.my.id` — belum bisa dilakukan dari sandbox ini (lihat "Hasil validasi" di atas).
