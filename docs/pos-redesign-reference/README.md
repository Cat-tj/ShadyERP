# POS Redesign Reference

Update ini dibuat untuk menjaga arah overhaul UI/UX kasir ALTORA tetap jelas buat agent berikutnya.

## Request User

- Delivery tidak memakai dropdown.
- Saat user menekan Delivery, semua opsi channel langsung muncul di bawah jenis pesanan dengan title `Channel Delivery`.
- POS mengikuti referensi desain: kategori berbentuk kotak/card, menu punya gambar, dan quantity control memakai pola `- angka +`.
- Invoice pembayaran untuk desktop/tablet tetap berada di panel kanan, sedangkan HP boleh tetap memakai modal/sheet.
- Simpan screenshot referensi, permintaan user, dan summary kerja di folder ini supaya agent lain paham konteks.

## File Referensi

- `pos-reference.png`: referensi utama POS dengan kategori card, produk bergambar, invoice kanan.
- `table-layout-reference.png`: referensi masa depan untuk layout meja visual yang lebih premium.

## Yang Dikerjakan

- Payment sheet delivery diubah menjadi direct channel picker, bukan dropdown.
- Ditambahkan section `Channel Delivery` dengan pilihan logo untuk Kurir Toko, Gojek, Grab, Shopee Food, Maxim, dan Lainnya.
- Grid kategori kasir diubah menjadi card seperti referensi POS, dengan count menu per kategori.
- Card produk kasir diubah menjadi layout bergambar, nama, kategori/deskripsi pendek, harga, stok, dan kontrol `- angka +`.
- POS sekarang memakai `imageUrl` produk jika tersedia; jika belum ada foto produk, UI menampilkan placeholder visual yang rapi berdasarkan nama menu.

## Catatan Untuk Agent Berikutnya

- Schema `Product` sudah punya `imageUrl`, tetapi form upload/manajemen gambar produk belum sepenuhnya dibuat sebagai workflow lengkap.
- Referensi table layout belum diimplementasikan penuh di modul meja/command center pada update ini.
- Tetap jaga POS tablet-friendly dan low-spec friendly: hindari animasi berat, canvas besar, atau efek blur berlebihan.
