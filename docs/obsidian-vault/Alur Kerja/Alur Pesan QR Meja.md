---
tags: [alur-kerja]
---
# Alur Pesan QR Meja (Cafe/Resto)

1. Pelanggan scan QR di [[Table]] — tanpa install apa pun
2. Pilih menu dari HP sendiri
3. [[TableOrder]] + [[TableOrderItem]] masuk ke layar dapur (kitchen display)
4. Dapur tandai status: dimasak → siap
5. Kasir gabungkan ke [[Sale]] saat pembayaran

## Halaman publik
`/pesan/[qrToken]` — tanpa login, tenant di-resolve dari `qrToken` di [[Table]].

## Fitur yang terlibat
- [[table-service]]
- [[table-order-service]]
- [[sale-service]]

## Versi
Fitur ini **hanya ada di mode Advanced**, khusus vertikal Cafe.
