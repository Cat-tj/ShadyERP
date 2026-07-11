---
tags: [alur-kerja]
---
# Alur Penjualan Kasir

Alur inti yang paling sering dipakai — pengguna: kasir/staf harian.

1. Kasir buka [[CashierShift]] + catat uang modal awal
2. Tap/scan produk → masuk keranjang ([[Product]] → [[ProductStock]] dicek real-time)
3. (Opsional) scan/pilih [[Member]] — poin & promo member otomatis kepakai
4. Bayar: tunai / QRIS / transfer / e-wallet
5. [[Sale]] + [[SaleItem]] tercatat, [[ProductStock]] berkurang otomatis
6. Struk: cetak thermal atau kirim digital
7. Tutup shift: setoran dihitung, selisih kas ketahuan otomatis

## Fitur yang terlibat
- [[shift-service]] — buka/tutup shift, rekonsiliasi kas
- [[sale-service]] — transaksi, retur/refund sebagian
- [[product-service]] — cek & kurangi stok
- [[member-service]] — poin & promo member
- [[promo-service]] — diskon otomatis terjadwal

## Versi
- **Simpel**: tap produk → bayar → selesai
- **Advanced**: + scan barcode, varian/topping, split bill, open bill meja, shift multi-kasir
