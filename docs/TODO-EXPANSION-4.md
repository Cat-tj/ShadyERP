# To-Do: Ekspansi 4 Arah (Vertikal Lain, Audit Simple, Kesiapan Produksi, Polish Cafe)

> Lanjutan dari `docs/TODO-CAFE-6.md` (D1-D6 sudah selesai). Hasil scoping dari riset kodebase,
> dipecah dari 4 arah yang diusulkan: (1) vertikal lain, (2) audit mode Simple, (3) kesiapan
> produksi nyata (tanpa API key eksternal — dilarang oleh guideline), (4) polish analitik fitur
> cafe D1-D6. Kerja loop: implementasi → build & typecheck hijau → verifikasi manual (skrip lokal
> + Playwright kalau ada UI) → commit & push → centang di sini → lanjut item berikutnya.
> Urutan: **E1 → E14, satu-satu sampai selesai**, diurutkan kasar dari value/effort tertinggi.

## 🚀 Ekspansi

- [x] **E1** — Global error boundary: `src/app/error.tsx` + `global-error.tsx` dengan pesan bahasa Indonesia + tombol "Coba lagi"/"Kembali" (Area 3: kesiapan produksi) — `44c0f37`
- [x] **E2** — Harden `api/health`: bungkus ping DB dengan try/catch, balikin `{ok:false}` + 503 kalau gagal, bukan 500 mentah (Area 3) — `ead43d3`
- [x] **E3** — Halaman publik cek status laundry (nomor order/HP, tanpa login) — reuse `LaundryOrderStatus` (Area 1: vertikal lain) — `a543b43`
- [x] **E4** — Sambungkan `LaundryOrder`/`Booking` ke Member: `memberId` opsional, auto-match nomor HP, dapat poin pas selesai (Area 1) — juga perbaiki bug lama `orderType "TAKE_AWAY"` invalid yang bikin booking selesai selalu gagal — `4708d6b`
- [x] **E5** — Laporan pemakaian split payment di Analitik: agregat `SalePayment` per metode/frekuensi 30 hari terakhir (Area 4: polish cafe) — `3626b9d`
- [x] **E6** — Tren selisih kas shift: laporan riwayat `expectedCash` vs `closingCash` antar shift, bukan cuma di layar tutup shift (Area 4) — `c3b6322`
- [x] **E7** — Peringatan bentrok jadwal booking: cek overlap `scheduledAt`+`durationMinutes` per staff, warning (bukan blokir) (Area 1) — `58bcb19`
- [x] **E8** — Toggle happy hour di mode Simple: kontrol on/off + jam mulai/selesai ringkas (halaman baru `/simple/promo`, link dari `/simple/menu`), tanpa masuk Pengaturan penuh (Area 2: audit Simple) — `4f88bd5`
- [x] **E9** — Setting lebar kertas printer 58mm/80mm per outlet, `LINE_WIDTH` di `escpos.ts` gak lagi hardcode 32 — sekalian perbaiki padding byte-safe buat nama non-ASCII (Area 3) — `cdeea73`
- [x] **E10** — Log & insight "produk sering habis": catat tiap kejadian auto-hide (D1), tampilkan sebagai insight Simple/Advanced (Area 4) — `41fae5b`
- [x] **E11** — Atribusi penjualan dari menu favorit member: tandai item yang asalnya dari klik favorit (D6), laporkan kontribusi omzetnya (Area 4) — `74f8a8f`
- [x] **E12** — Bayar laundry cicil/DP: ganti `paidAmount` tunggal jadi rincian pembayaran mirip `SalePayment[]` cafe (Area 1) — `f196a7d`
- [ ] **E13** — Setup Playwright smoke-test minimal: config + 3-5 test jalur kritis (login, transaksi kasir, tutup shift) — `playwright` sudah ada di devDependency tapi belum dipakai (Area 3)
- [ ] **E14** — Guardrail navigasi Simple → Advanced: label/banner halus pas link Simple mode (mis. `/simple/data` → `/kpi/analitik`) mendarat di layar mode Advanced (Area 2)

---

*Setiap item yang selesai akan ditandai `[x]` beserta commit hash-nya di sini.*
