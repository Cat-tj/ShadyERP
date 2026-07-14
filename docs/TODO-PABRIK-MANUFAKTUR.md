# To-Do: Modul Altora Pabrik (Manufaktur)

> Kerja loop: implementasi → build & typecheck hijau → verifikasi manual (kalau ada UI) →
> commit & push → centang di sini → update section "Status saat ini" → lanjut item berikutnya.
>
> **Sumber**: `Altora_Pabrik_Master_Plan_Lengkap.pdf` (61 halaman, diupload user, versi 1.0/Juli 2026).
> File PDF itu sendiri TIDAK ada di repo — kalau butuh detail spesifik yang tidak
> terangkum di bawah, minta user upload ulang. Ringkasan tiap bagian penting sudah
> ditulis ulang di sini supaya agent lain tidak perlu baca 61 halaman dari nol.
>
> **North Star dokumen asli**: "Satu kejadian bisnis dicatat satu kali. Sistem
> menghasilkan seluruh konsekuensi yang sah, dapat ditelusuri, dapat dibalik, dan
> dapat direkonsiliasi." Operator mencatat fakta lapangan (scan, output, reject,
> downtime) — sistem yang mengurus stok, batch, payroll, costing, jurnal, exception.
>
> **PENTING — ikuti AGENTS.md**: setiap perubahan `schema.prisma` wajib migration
> (`npx prisma migrate dev`); setiap query wajib filter `tenantId` dari session;
> simple-by-default (sembunyikan kompleksitas di balik progressive disclosure,
> bukan hilangkan); jangan tambah integrasi API key eksternal (IoT/PLC itu
> eksplisit "Out of Scope Awal" di dokumen asli, lihat bawah).

## 🧭 Roadmap 7 Milestone (dari dokumen asli, section 21)

| # | Milestone | Cakupan | Status |
|---|---|---|---|
| M1 | Core Manufacturing | Plant, warehouse, location, product, UOM, BOM/routing version, WO, reservation, issue, return, operation, output, waste, stock movement | 🟡 **sedang jalan** |
| M2 | Batch dan Quality | Batch, expiry, incoming/in-process/final QC, quarantine, hold/release/reject, rework, genealogy, traceability | ⬜ belum |
| M3 | Planning dan Procurement | Demand, forecast, production plan, MRP, material request, purchase, receipt, supplier QC, putaway | ⬜ belum |
| M4 | Labor dan Payroll Produksi | Labor group, crew, skill, shift, assignment, labor log/output, rate card, hourly/piece/crew pay, approval, labor cost | ⬜ belum |
| M5 | Costing dan Finance | Material/labor/machine/overhead cost, WIP, standard/actual, variance, inventory valuation, journal, COGS, reports | ⬜ belum |
| M6 | Maintenance dan Exception | Machine, preventive maintenance, breakdown, downtime, sparepart, OEE, exception center, approval, escalation, SLA | ⬜ belum |
| M7 | Advanced Manufacturing | Finite scheduling, scenario planning, subcontracting, CAPA, recall, IoT, machine integration, advanced costing/payroll, multi-plant optimization | ⬜ belum |

**Exit criteria tiap milestone** (dari dokumen, section 21, berlaku ke semua M1-M7):
1. Use case utama bisa dijalankan end-to-end pada data pilot.
2. State machine, permission, audit, idempotency, dan reversal tersedia.
3. Unit, integration, concurrency, security, dan E2E test utama lulus.
4. Ledger dan balance dapat direkonsiliasi.
5. Dokumen migrasi, rollback, training, serta support tersedia.
6. Tidak ada bug kritis/blocker terbuka pada scope milestone.

**Guardrail wajib** (section 22, berlaku ke SEMUA milestone — cek ulang tiap PR):
1. Tidak ada material consumption tanpa WO.
2. Tidak ada material consumption tanpa lot yang jelas.
3. Tidak ada output tanpa operation.
4. Tidak ada output tanpa operator atau crew.
5. Tidak ada output dibayar dua kali.
6. Tidak ada payroll earning tanpa labor log/output source.
7. Tidak ada payroll tanpa rate card version.
8. Tidak ada batch Hold/Reject/Expired/Recalled/Blocked dijual sebagai available stock.
9. Tidak ada perubahan BOM/routing version pada WO berjalan (WO snapshot BOM/routing saat release).
10. Tidak ada perubahan tarif historis setelah earning/payroll dihitung.
11. Tidak ada penghapusan transaksi produksi; koreksi wajib reversal/adjustment.
12. Stock adjustment, QC override, cost adjustment, payroll adjustment, disposal, use-as-is wajib alasan serta audit.
13. WO tidak boleh ditutup tanpa output, waste declaration, material balance, final QC, costing, dan resolution exception blocking.
14. Pekerja tidak boleh aktif di dua operation pada waktu sama.
15. Machine rusak/maintenance/blocked tidak boleh dijadwalkan.
16. Material Hold, Reject, Expired, Recalled, atau Reserved untuk sumber lain tidak boleh di-issue.
17. Approval nilai tinggi, disposal, perubahan BOM, QC override, dan payroll mengikuti policy tenant.
18. Semua tindakan kritis wajib idempotent, atomic, tenant-scoped, permission-checked, dan audit-logged.

**Out of scope (jangan dibangun dulu)**: advanced APS/global multi-plant optimizer,
AI demand forecasting/computer vision QC/predictive maintenance, full MES machine
control/PLC write-back/digital twin/RPA, pharmaceutical validation/regulasi
tersertifikasi khusus, advanced treasury/global trade compliance/automated tax
filing penuh. (Konsisten dengan AGENTS.md rule "dilarang integrasi API key
eksternal".)

---

## 🏗️ Arsitektur — keputusan yang sudah diambil (hasil riset codebase, JANGAN ulangi riset ini)

- **"Plant" di dokumen = `Outlet` yang sudah ada.** Jangan bikin model `Plant` baru — extend `Outlet` kalau perlu field tambahan (mis. kapasitas produksi), tapi konsepnya sama.
- **Belum ada "Warehouse" / "StorageLocation" sub-level di bawah Outlet.** `ProductStock` cuma granular sampai `outletId`. Modul Pabrik butuh ini (raw material/WIP/finished goods/quarantine/reject perlu lokasi terpisah dalam satu Outlet) — ini yang pertama harus dibangun.
- **`ProductRecipeItem` adalah "BOM" versi flat**, sudah dipakai `sale-service.ts` (`buildFlattenedRecipeMap`) untuk resep F&B — TAPI tidak punya versioning, yield/waste allowance, UOM per baris, atau status draft/active/obsolete. Untuk Pabrik butuh model BOM baru (`BomVersion`/`BomVersionItem`) — jangan pakai `ProductRecipeItem` apa adanya, tapi boleh reuse pola self-relation Product-nya.
- **Tidak ada routing/work center/operation sama sekali.** Model baru murni.
- **Tidak ada WorkOrder / production order.** Model baru murni, perlu state machine sesuai section 25 dokumen asli:
  `DRAFT → PENDING_APPROVAL → APPROVED → MATERIAL_SHORTAGE/MATERIAL_RESERVED → SCHEDULED → RELEASED → IN_PROGRESS/PAUSED → AWAITING_QC → COMPLETED → CLOSED`; terminal `CANCELLED` dari state manapun sebelum RELEASED.
- **Tidak ada ledger stok generik (immutable movement log).** Semua stok existing (`ProductStock.qty`, `StockAdjustment`, dll) itu MUTASI LANGSUNG field, bukan ledger yang bisa di-replay. Modul Pabrik butuh `StockMovement` baru sebagai ledger append-only (source type + source id + idempotency key), dan `ProductStock`/kolom reserved jadi *projection* dari ledger ini — ini prinsip inti dokumen asli ("Stock balance harus dapat dibangun ulang dari Stock Movement Ledger").
- **Pola tenant-scoping**: setiap service function terima `tenantId` sebagai argumen pertama, tiap query Prisma pakai `{ ...id, tenantId }` di `findFirst`/`update`/`delete`. TIDAK ADA helper `requireTenant()` terpusat — ikuti konvensi manual yang sama persis dengan `purchase-order-service.ts`/`supplier-service.ts`.
- **Pola transaksi**: multi-step stock change selalu dibungkus `prisma.$transaction(async (tx) => {...})`, service function nested terima `tx?: Prisma.TransactionClient` opsional (default ke `prisma` global). Ikuti pola `stock-receipt-service.ts` persis.
- **Idempotency**: satu-satunya mekanisme yang ada sekarang adalah status-guard di dalam transaksi (`if (status === "COMPLETED") throw`). Belum ada idempotency key generik — modul Pabrik yang lebih rawan double-submit (scan barcode, operator tap cepat) sebaiknya mulai pakai idempotency key asli (kolom unique di `StockMovement`/`WorkOrderEvent`), bukan cuma status-guard.
- **Module registration**: `src/lib/modules.ts` (`MODULES` array) belum ada key untuk manufaktur. Perlu tambah `{ key: "produksi", label: "Produksi", core: false, color/colorDark/colorSoft }` dan wire ke `Tenant.disabledModules` + nav gating (`src/lib/nav.ts` atau sejenisnya) — ikuti pola modul lain yang sudah ada persis.
- **UOM**: belum ada tabel UOM global, cuma `ProductUom` per-produk (konversi lokal, mis. "Dus" = 12x "Pcs"). Untuk M1 minimal, BOM/routing bisa reuse `ProductUom` yang sudah ada dulu — tabel UOM canonical bisa nyusul kalau memang dibutuhkan (jangan over-engineer duluan).
- **KOREKSI (setelah baca schema lebih detail)**: `Equipment`/`EquipmentMaintenanceLog` SUDAH ADA (status ACTIVE/NEEDS_REPAIR/REPAIRING/RETIRED, log OPEN/IN_PROGRESS/RESOLVED) — dipakai sebagai "Machine" untuk M1, TIDAK bikin model `Machine` baru. `WorkCenter.equipmentId` (opsional) sudah di-wire ke `Equipment` yang ada.

---

## 📋 M1 — Core Manufacturing (breakdown kerja, urutan implementasi)

- [x] **P1** — Migration: `Warehouse` + `StorageLocation` — `ecf30e4` (migration `20260714150616_pabrik_m1_core_manufacturing`)
- [x] **P2a** — Migration: `StockMovement` ledger — migration sama di atas
- [x] **P2b** — Service `stock-movement-service.ts` — `recordMovement()` (idempotent lewat unique `idempotencyKey`, kembalikan record lama kalau key sama sudah pernah dipakai, bukan re-insert/error), `getWarehouseBalance()` (saldo dihitung ulang dari ledger, bukan field terpisah), `listMovementsBySource()`, `listMovementsForProductWarehouse()`, `buildIdempotencyKey()` helper
- [x] **P2c** — Service `warehouse-service.ts` (CRUD Warehouse/StorageLocation + `ensureDefaultWarehouses()` yang bikin 5 gudang standar otomatis sekali per outlet — sesuai AGENTS.md "isi otomatis, jangan suruh input manual")
- [x] **P3a** — Migration: `BomVersion` + `BomVersionItem` — migration sama di atas
- [x] **P3b** — Service `bom-service.ts` — create (auto-increment version per produk), activate (versi ACTIVE lama otomatis jadi OBSOLETE), update ISI HANYA kalau status DRAFT (guardrail #9 ditegakkan di kode, bukan cuma dokumentasi), obsolete
- [x] **P4a** — Migration: `WorkCenter` + `RoutingVersion`/`RoutingOperationStep` — migration sama di atas
- [x] **P4b** — Service `routing-service.ts` — pola sama persis dengan bom-service.ts (create/activate versi, guardrail #9)
- [x] **P5a** — Migration: `WorkOrder` + `WorkOrderOperation` — migration sama di atas
- [x] **P5b** — Service `work-order-service.ts` — state machine lengkap lewat `assertStatus()` guard di tiap fungsi transisi (bukan status string bebas): createWorkOrder (snapshot operation dari routing) → submitForApproval → approveWorkOrder → reserveMaterials (cek saldo ledger, TIDAK cek antar-WO secara atomik — lihat catatan simplifikasi di kepala file) → scheduleWorkOrder → releaseWorkOrder (di sinilah movement ISSUE beneran ditulis ke ledger, raw material → WIP) → startOperation/pauseOperation/resumeOperation → recordOutput (idempotency key dari caller, good→finished goods, reject+scrap→gudang scrap, rework tetap di WIP) → completeOperation (auto-buka operation berikutnya, WO ke AWAITING_QC kalau semua selesai) → markWorkOrderCompleted → closeWorkOrder (guardrail #13 versi ringan: semua operation selesai + minimal 1 output tercatat — BELUM invariant material balance penuh, lihat catatan di kepala file). Plus `cancelWorkOrder`, `returnMaterial`.
- [x] **P6** — Tercakup di P5b (reserveMaterials/releaseWorkOrder/returnMaterial) — lihat catatan simplifikasi soal guardrail #16 (belum ada status Hold/Reject per-lot di M1, itu masuk M2 Batch/Quality)
- [x] **P7** — Tercakup di P5b (startOperation/pauseOperation/resumeOperation/recordOutput/completeOperation/closeWorkOrder)
- [x] **P8** — Module registration: `produksi` ditambahkan ke `ModuleKey`/`MODULES` (modules.ts) + `ROUTE_MODULE_MAP` (`/produksi` -> modul `produksi`), hub baru `produksi` di `hubs.ts` (`HubKey`, `HUBS`, `ROUTE_HUB_MAP`, home `/produksi`), `verticals.ts` Pabrik vertical diupdate untuk referensi modul `produksi`, dan `NavItem` "Work Order" (`href: /produksi`, `hub: "produksi"`, `module: "produksi"`) ditambahkan ke `nav.ts` supaya hub-nya benar-benar muncul di `/pilih-aplikasi` (dicek: `hubsAvailableForRole()` cuma nampilin hub yang punya minimal 1 NavItem). Tenant SIMPLE-mode otomatis tidak lihat hub ini sama sekali (bypass ke `/simple/hari-ini`, sudah dicek di `pilih-aplikasi/page.tsx`).
- [~] **P9** — UI: Planner — buat WO (pilih produk, BOM version, routing version, qty, outlet) + approval sederhana. **Kode SUDAH DITULIS dan lolos `tsc`+`eslint`, TAPI BELUM di-commit/push, dan BELUM PERNAH dibuka di browser sama sekali** (lihat "Status saat ini" di bawah — ini yang paling penting buat agent penerus).
- [ ] **P10** — UI: Operator — layar produksi simpel (work list per shift, tombol Mulai/Catat Output/Catat Reject/Lapor Masalah/Selesai) — WAJIB progressive disclosure, bahasa sehari-hari, sesuai AGENTS.md rule "orang awam tanpa pelatihan". **Sengaja DIGABUNG ke dalam halaman detail WO yang sama (`/produksi/[id]`) di P9, bukan halaman terpisah** — lihat catatan "Keputusan desain P9" di bawah. Belum dievaluasi apakah ini cukup "simpel" untuk operator sungguhan atau perlu dipecah jadi layar sendiri.
- [~] **P11** — UI: Owner/Manager — daftar WO + status ringkas. Tercakup di halaman list `/produksi/page.tsx` yang sudah ditulis di P9 (badge status, tombol approve/cancel). Belum ada halaman ringkasan analytics (itu tetap M6/M7).
- [ ] **P12** — Verifikasi end-to-end: buat WO → reserve → issue → jalankan operation → catat output → tutup WO → cek `StockMovement` balance & `ProductStock` projection benar. **BELUM DIKERJAKAN SAMA SEKALI** — prioritas #1 buat agent penerus.
- [ ] **P13** — Commit & push per slice (jangan tunggu semua M1 selesai baru commit — commit tiap P-item yang solid)

## Status saat ini — BACA INI DULU sebelum lanjut

**Per akhir sesi ini**: P1-P8 sudah commit+push (lihat riwayat commit di git log branch
`claude/umkm-saas-pos-tv4asg`, cari pesan "Pabrik M1"). P9 (+P10/P11 yang digabung ke
dalamnya) **sudah ditulis lengkap sebagai kode tapi BELUM di-`git add`/commit/push** —
semua file di bawah ini ada di working tree tapi statusnya masih uncommitted. Cek
`git status` dulu sebelum melanjutkan, kemungkinan besar file-file ini masih menunggu commit:

- `src/app/(app)/produksi/layout.tsx` — guard `requireModule("produksi")`
- `src/app/(app)/produksi/page.tsx` — server component: list WO + auto-provision gudang
  (`ensureDefaultWarehouses` dipanggil per outlet tiap kali halaman dibuka) + hitung produk
  mana yang "siap produksi" (punya BOM version DAN routing version yang ACTIVE)
- `src/app/(app)/produksi/[id]/page.tsx` — server component detail WO (pakai `await params`
  sesuai konvensi Next 16 async params, LIHAT `src/app/(app)/member/[id]/page.tsx` sebagai
  referensi pola yang benar)
- `src/app/(app)/produksi/master/page.tsx` — server component "Data Produksi" (Work Center +
  BOM + Routing setup per produk) — **halaman ini TIDAK ada di rencana P9 awal, ditambahkan
  karena disadari saat mengerjakan P9: tanpa UI untuk bikin BOM/Routing version, Planner
  tidak akan pernah punya produk yang bisa dipilih di form buat WO.** Kalau mau di-split jadi
  P-item sendiri secara resmi, silakan, tapi kodenya sudah nyatu jadi satu slice P9.
- `src/app/(app)/produksi/actions.ts` — semua server action (createWorkOrderAction dst.),
  role-gate: Owner/Manager buat aksi planner (create/approve/cancel/master data), semua role
  (termasuk Staff) buat aksi operator (start/pause/resume/recordOutput/completeOperation)
- `src/components/produksi/work-order-manager.tsx` — client component list + modal create WO
- `src/components/produksi/work-order-detail.tsx` — client component detail WO, tombol alur
  status (Ajukan → Setujui → Cek Ketersediaan Bahan → Jadwalkan → Rilis) + panel operasi
  (Mulai/Catat Hasil/Jeda/Lanjutkan/Selesaikan per `WorkOrderOperation`)
- `src/components/produksi/master-data-manager.tsx` — client component Work Center + BOM +
  Routing version builder (pola array-item mengikuti `purchase-order-manager.tsx`)

Service layer juga dapat sedikit tambahan buat mendukung UI di atas (semua sudah lolos tsc):
- `bom-service.ts`: tambah `listActiveBomVersions()` dan `listAllBomVersionsForTenant()`
- `routing-service.ts`: tambah `listActiveRoutingVersions()` dan `listAllRoutingVersionsForTenant()`
- `work-order-service.ts`: `listWorkOrders`/`getWorkOrderById` sekarang ikut include relasi
  `product` (id,name) dan `outlet` (id,name) supaya UI gak perlu N+1 query nama — semua tempat
  yang return `WorkOrderWithOperations` (createWorkOrder, releaseWorkOrder, completeOperation)
  ikut disamakan include-nya (`workOrderListInclude` konstanta baru di kepala file).

**Sudah diverifikasi**: `npx tsc --noEmit` bersih, `npx eslint` bersih (1 error react/no-unescaped-entities
di master-data-manager.tsx sudah diperbaiki). **BELUM diverifikasi**: belum pernah dibuka
`npm run dev` + Playwright/browser sama sekali untuk halaman-halaman ini. Sebelum P9 dianggap
benar-benar selesai, WAJIB: jalankan dev server, login sebagai Owner, buka `/produksi`, coba
alur lengkap minimal sekali secara manual di browser (bukan cuma baca kode) — baru lanjut ke P12.

**Keputusan desain P9 (perlu tahu sebelum ubah apa pun)**:
- WO dibuat dengan **auto-pakai BOM version & routing version yang ACTIVE** untuk produk
  terpilih (bukan planner pilih versi spesifik secara manual dari dropdown versi) — pilihan
  ini demi kesederhanaan (AGENTS.md: auto-isi dari data yang ada, jangan minta input manual
  yang gak perlu). Kalau butuh planner bisa pilih versi historis tertentu, ini perlu diubah.
- Halaman detail WO (`/produksi/[id]`) menggabungkan aksi Planner (approve/schedule/release)
  DAN aksi Operator (start/record output/complete operation) dalam satu halaman yang sama,
  beda section, gated `canManage` cuma buat section Planner. Operator (role STAFF) tetap bisa
  buka halaman yang sama dan cuma lihat/pakai section "Proses produksi". P10 aslinya diminta
  sebagai "layar terpisah yang super simpel buat operator" — ini BELUM dipisah, masih satu
  halaman gabungan. Perlu dievaluasi di browser apakah ini cukup simpel atau perlu dipecah.
- `returnMaterial()` (retur sisa bahan dari WIP ke gudang bahan baku) sudah ada di service
  layer tapi **belum ada tombol/form di UI sama sekali** — gap yang disengaja untuk batasi
  scope P9, dicatat di sini biar tidak lupa.

**⚠️ Perbaikan tak terduga di luar rencana Pabrik yang ikut dikerjakan sesi ini** (penting
buat riwayat, TIDAK berhubungan langsung dengan modul Pabrik): saat mulai sesi ini, branch
sudah ke-push dengan commit dari kontributor lain (`af42845 feat(hris): add core hris models`)
yang menambah model `Person`/`Worker`/`Employment`/`Assignment`/`CompensationProfile` DAN
`FiscalPeriod`/`AccountingJournal`/`AccountingJournalLine` (COA hierarchy) ke `schema.prisma`
TANPA migration sama sekali — melanggar AGENTS.md rule #7, tabel-tabelnya sungguhan tidak ada
di database manapun. Sudah diperbaiki dengan migration baru
`prisma/migrations/20260714154832_coa_hierarchy_and_hris_core/migration.sql` (murni
CREATE TABLE/ALTER TABLE ADD COLUMN, diverifikasi `prisma migrate diff` nol drift setelah
diterapkan). Ini kerja HRIS/COA orang lain, bukan scope Pabrik — cuma migration-nya yang
ditambal di sini karena kebetulan ditemukan waktu setup DB lokal untuk kerja Pabrik.

**⚠️ SUSULAN, belum ditambal**: setelah commit P9 di atas, sebelum push, branch remote sudah
maju lagi 1 commit dari kontributor sama: `fa01297 feat(hris): implement Milestone 2 Time &
Service core models and service` — nambah ~70 baris model baru ke `schema.prisma` (kemungkinan
besar model time-tracking, lihat `src/server/services/time-service.ts` yang baru dibuat di
commit itu). Sudah di-merge (no conflict) dan `tsc` lolos setelah `prisma generate` ulang,
TAPI **belum dicek apakah commit ini juga lupa bikin migration** (pola yang sama persis
terjadi 2x berturut-turut sebelumnya). Kalau agent penerus mau kerja di area manapun yang
butuh migrasi berjalan (termasuk lanjut modul Pabrik/P12), WAJIB cek dulu:
`npx prisma migrate diff --from-config-datasource prisma.config.ts --to-schema prisma/schema.prisma`
(kosong = aman) — kalau ada diff, generate migration pakai `npx prisma migrate dev --name <deskripsi> --create-only`,
review SQL-nya (harus cuma CREATE/ALTER ADD, bukan DROP), baru apply. Pola commit HRIS ini
sepertinya rutin lupa migration — mungkin pantas diangkat ke user sebagai masalah proses lintas
sesi, bukan cuma ditambal diam-diam terus-menerus.

**⚠️ Known gaps sengaja ditunda dari P1-P7 (JANGAN dianggap selesai, ini bukan bug
tersembunyi — sudah dicatat di komentar kepala `work-order-service.ts` juga)**:
1. `reserveMaterials()` cek saldo ledger dikurangi kebutuhan WO lain yang masih aktif,
   TAPI belum atomik lintas WO — race condition kecil masih mungkin kalau dua planner
   approve WO yang rebutan bahan yang sama nyaris bersamaan. Perbaikan: tabel
   `MaterialReservation` terpisah dengan unique constraint, bukan hitung ulang tiap kali.
2. Invariant "Issued = Consumed + Returned + Waste + Remaining WIP" (dokumen section 9/26)
   BELUM ditegakkan penuh — `closeWorkOrder()` cuma mewajibkan minimal satu output
   tercatat. Butuh model konsumsi per-lot dari M2 (Batch dan Quality) untuk presisi.
3. Guardrail #14 (pekerja tidak boleh aktif di dua operation sekaligus) — `WorkOrderOperation`
   belum punya kolom operator wajib, jadi belum bisa dicek.
4. Guardrail #16 (jangan issue material Hold/Reject/Expired) — M1 belum punya status
   kualitas per-lot (itu `StockBatch`-nya modul retail lama, bukan untuk Pabrik), jadi
   semua saldo di ledger dianggap "available" tanpa pengecualian. Masuk cakupan M2.
5. UI sekarang sudah ada (P9) tapi **belum pernah dites lewat aksi nyata di browser**, cuma
   lolos `tsc`+`eslint`. **Jangan anggap P9 "selesai teruji"** sebelum ada verifikasi manual
   di browser + P12.

**Belum diputuskan / perlu keputusan sebelum lanjut ke item terkait**:
- Nama modul di `MODULES`: `produksi` vs `manufaktur` vs `pabrik` — pilih salah satu,
  konsisten dipakai di seluruh route/label. (Sementara dipakai: `produksi`.)

## Langkah selanjutnya paling langsung buat agent penerus

1. `git status` — commit dulu semua file P9 yang tercatat di atas (belum di-commit).
2. Jalankan `npm run dev`, login sebagai Owner tenant demo, buka `/pilih-aplikasi` → pastikan
   hub "Produksi" muncul → buka `/produksi/master` → buat Work Center → buat BOM version
   (draft) → aktifkan → buat Routing version (draft) → aktifkan → balik ke `/produksi` →
   buat Work Order → jalankan seluruh alur (Ajukan → Setujui → Cek Bahan → Jadwalkan →
   Rilis → Mulai operation → Catat Hasil → Selesaikan tiap operation → Tandai Selesai →
   Tutup WO). Screenshot tiap langkah kalau ada yang aneh.
3. Setelah alur di atas jalan mulus secara manual, itu baru P12 (verifikasi end-to-end) —
   tambahan: cek `StockMovement` di database beneran cocok (pakai `psql` atau Prisma Studio)
   sebelum dan sesudah tiap transisi (terutama setelah Rilis dan setelah Catat Hasil).
4. Baru setelah P9-P12 semua solid dan dites nyata, commit final + update checklist ini jadi
   `[x]` semua, lalu M1 "Core Manufacturing" bisa dianggap selesai secara jujur.

---

*Setiap item yang selesai akan ditandai `[x]` beserta commit hash-nya di sini, sama
seperti `docs/TODO-ERP-100.md`.*
