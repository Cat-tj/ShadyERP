# Cara Buka Vault Ini di Obsidian

1. Buka aplikasi **Obsidian** (unduh gratis di obsidian.md kalau belum ada)
2. **Open folder as vault** → pilih folder `docs/obsidian-vault` ini
3. Buka catatan **`Home.md`** sebagai pintu masuk
4. Klik ikon **Graph View** di sidebar kiri untuk lihat semua relasi
   sebagai peta interaktif — warnanya sudah diatur per kategori:
   - Ungu/indigo = Domain (pengelompokan database)
   - Magenta = Fitur
   - Oranye = Database (model/tabel)
   - Teal = Alur Kerja

## Struktur

| Folder | Isi | Sumber |
|---|---|---|
| `Database/` | Satu catatan per model — field, relasi ke model lain, dipakai fitur mana | ⚙️ auto |
| `Fitur/` | Satu catatan per fitur — bergantung ke fitur apa, dipakai fitur apa, model apa, halaman mana | ⚙️ auto |
| `Domain/` | Pengelompokan model per domain bisnis (Penjualan, Produk & Stok, dst.) | ⚙️ auto |
| `Alur Kerja/` | Diagram alur bisnis utama, ditulis naratif dengan link ke Database/Fitur terkait | ✍️ manual |

## Update

Folder bertanda ⚙️ dibuat ulang otomatis dari kode sumber setiap kali
dijalankan:

```bash
npm run knowledge
```

Jalankan setiap habis mengubah schema database atau menambah/mengubah fitur,
lalu commit hasilnya. Folder `Alur Kerja/` tidak pernah disentuh perintah ini
— aman diedit langsung di Obsidian kapan pun alur bisnisnya berubah.
