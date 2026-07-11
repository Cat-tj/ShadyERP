# To-Do: 8 Fitur Fokus UMKM Cafe

> Kerja loop: implementasi → build & typecheck hijau → verifikasi manual (skrip lokal +
> Playwright kalau ada UI) → commit & push → centang di sini → lanjut item berikutnya.
> Urutan: **C1 → C8, satu-satu sampai selesai.**

## ☕ Fitur Cafe

- [x] **C1** — Kalkulator uang kembalian pas tutup shift: breakdown pecahan uang (100rb/50rb/.../koin), auto-total ke `closingCash`, simpan breakdown buat audit — `93e54b5`
- [x] **C2** — Profitabilitas menu: laporan HPP vs harga jual per produk (dari `cost`/resep bahan baku), margin Rp & %, kontribusi profit per item dari histori penjualan — `336941a`
- [x] **C3** — Kartu stempel (buy X get 1 free): program stempel per tenant, 1 stempel per transaksi, redeem reward gratis di kasir saat target tercapai — `a338f82`
- [x] **C4** — Verifikasi & permudah Paket/Kombo: mekanisme `ASSEMBLY` + resep produk-jadi sudah ada di schema tapi tidak ada UI sama sekali (ditemukan saat verifikasi) — dibangun editor resep di form produk, dan dibenerin bug potong stok/HPP yang cuma nurunin resep 1 level (sekarang rekursif sampai bahan dasar) — `8be7cd2`
- [x] **C5** — Catat waste/kerugian bahan: kategori alasan di `StockAdjustment` (Waste/Expired/Rusak/dll), halaman catat cepat, laporan total kerugian per periode — `a2b028c`
- [ ] **C6** — Auto-suggest reorder point: hitung rata-rata penjualan harian dari histori, saranin `minQty` di halaman reorder point dengan tombol "pakai saran"
- [ ] **C7** — Voucher/gift card jual: model baru `GiftCard` + transaksi, generate kode unik, jual di muka, redeem sebagai metode bayar saat checkout
- [ ] **C8** — Sambungkan `WholesalePrice` (bug: model ada di schema, tidak pernah dipakai di checkout) + harga beda per channel (dine-in/takeaway/dll pakai `OrderType` yang sudah ada)

---

*Setiap item yang selesai akan ditandai `[x]` beserta commit hash-nya di sini.*
