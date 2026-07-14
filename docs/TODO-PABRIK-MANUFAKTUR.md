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
- [ ] **P9** — UI: Planner — buat WO (pilih produk, BOM version, routing version, qty, outlet) + approval sederhana
- [ ] **P10** — UI: Operator — layar produksi simpel (work list per shift, tombol Mulai/Catat Output/Catat Reject/Lapor Masalah/Selesai) — WAJIB progressive disclosure, bahasa sehari-hari, sesuai AGENTS.md rule "orang awam tanpa pelatihan"
- [ ] **P11** — UI: Owner/Manager — daftar WO + status ringkas (bukan dashboard penuh dulu, itu masuk M6/M7)
- [ ] **P12** — Verifikasi end-to-end: buat WO → reserve → issue → jalankan operation → catat output → tutup WO → cek `StockMovement` balance & `ProductStock` projection benar
- [ ] **P13** — Commit & push per slice (jangan tunggu semua M1 selesai baru commit — commit tiap P-item yang solid)

## Status saat ini

**Terakhir dikerjakan**: seluruh service layer P1-P7 sudah ditulis dan `npx tsc --noEmit`
hijau (dicek berkali-kali, tiap file baru). File yang sudah ada dan siap dipakai:
`src/server/services/warehouse-service.ts`, `stock-movement-service.ts`, `bom-service.ts`,
`routing-service.ts`, `work-order-service.ts`. Sedang lanjut ke **P8** (module registration
ke `src/lib/modules.ts`), lalu **P9-P11** (UI planner/operator/owner) dan **P12** (verifikasi
end-to-end nyata pakai data pilot, bukan cuma tsc hijau — service belum pernah dites jalan
beneran end-to-end).

**⚠️ Known gaps sengaja ditunda (JANGAN dianggap selesai, ini bukan bug tersembunyi —
sudah dicatat di komentar kepala `work-order-service.ts` juga)**:
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
5. Belum ada UI sama sekali (P9-P11) — service layer belum pernah dites lewat aksi nyata
   di browser, cuma lolos `tsc`. **Jangan anggap P1-P7 "selesai teruji"** sebelum P12.

**Belum diputuskan / perlu keputusan sebelum lanjut ke item terkait**:
- Nama modul di `MODULES`: `produksi` vs `manufaktur` vs `pabrik` — pilih salah satu,
  konsisten dipakai di seluruh route/label. (Sementara dipakai: `produksi`.)

---

*Setiap item yang selesai akan ditandai `[x]` beserta commit hash-nya di sini, sama
seperti `docs/TODO-ERP-100.md`.*
