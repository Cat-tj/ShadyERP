# To-Do: 6 Fitur Lanjutan Fokus UMKM Cafe

> Lanjutan dari `docs/TODO-CAFE-8.md` (C1-C8 sudah selesai). Kerja loop: implementasi →
> build & typecheck hijau → verifikasi manual (skrip lokal + Playwright kalau ada UI) →
> commit & push → centang di sini → lanjut item berikutnya.
> Urutan: **D1 → D6, satu-satu sampai selesai.**

## ☕ Fitur Cafe (lanjutan)

- [x] **D1** — Auto-hide menu yang gak bisa dijual: kalau bahan resep (langsung/turunan) habis, produk otomatis nonaktif/gray di grid POS + indikator alasan — `dc88052`
- [x] **D2** — Saran harga jual dari HPP: owner isi target margin %, sistem hitung & saranin harga jual di form produk (pakai HPP dari resep/modal yang sudah ada), harga saran dibulatkan ke atas kelipatan Rp500 — `6de7b00`
- [x] **D3** — Peringatan selisih kas pas tutup shift: kalau `closingCash` vs `expectedCash` beda lebih dari Rp10.000, wajib isi catatan alasan sebelum submit — `f381d37`
- [ ] **D4** — Split payment: bayar 1 transaksi pakai lebih dari 1 metode (mis. sebagian cash sebagian QRIS)
- [ ] **D5** — Harga beda per jam (happy hour): markup/diskon otomatis berdasarkan jam transaksi, mirip pola markup channel (C8) tapi berbasis waktu
- [ ] **D6** — Rekomendasi menu favorit member: pas member dipilih di kasir, tampilkan menu yang paling sering dia beli buat checkout lebih cepat

---

*Setiap item yang selesai akan ditandai `[x]` beserta commit hash-nya di sini.*
