# Knowledge System Altora

Pusat pengetahuan proyek — supaya siapa pun di tim bisa memvisualisasikan alur
kerja, relasi database, dan relasi antar fitur tanpa harus membaca ribuan baris
kode.

## Isi

| Dokumen | Isi | Sumber |
|---|---|---|
| [alur-kerja.md](./alur-kerja.md) | Diagram alur bisnis utama (penjualan, stok, QR meja, absensi, laundry, KPI, uang) | ✍️ manual |
| [relasi-fitur.md](./relasi-fitur.md) | Graf service↔service + peta halaman→service | ⚙️ auto |
| [database/README.md](./database/README.md) | Index ERD — 22 domain, 66 model | ⚙️ auto |
| [database/*.md](./database/) | ERD Mermaid per domain + relasi keluar domain | ⚙️ auto |

## Versi Obsidian (peta interaktif)

Semua isi di atas juga tersedia dalam bentuk vault Obsidian di
[`docs/obsidian-vault/`](../obsidian-vault/) — catatan atomik (66 model
Database, 41 Fitur, 22 Domain, 7 Alur Kerja) saling terhubung lewat
`[[wikilink]]`, bisa dijelajah lewat **Graph View** (peta relasi interaktif,
bukan diagram statis). Cara buka: lihat
[`docs/obsidian-vault/README.md`](../obsidian-vault/README.md).

Dokumen level atas yang berkaitan:

- [`docs/MASTER-GUIDELINE.md`](../MASTER-GUIDELINE.md) — prinsip produk, persona, matriks fitur, backlog
- [`docs/ARSITEKTUR.md`](../ARSITEKTUR.md) — arsitektur teknis (hub vs modul, multi-tenant, konvensi)
- [`docs/SKEMA-DATABASE.md`](../SKEMA-DATABASE.md) — penjelasan naratif per model

## Cara update

Yang bertanda ⚙️ **jangan diedit manual** — regenerate dari kode asli:

```bash
npm run knowledge
```

Jalankan setiap habis: mengubah `prisma/schema.prisma`, menambah/mengubah
service, atau menambah halaman yang memakai service. Commit hasilnya bersama
perubahan kodenya, supaya diagram selalu sinkron dengan kode di commit yang sama.

Yang bertanda ✍️ diedit manual saat alur bisnisnya berubah.

## Cara melihat diagram

Semua diagram memakai Mermaid — otomatis dirender GitHub saat file .md dibuka.
Di VS Code, pasang ekstensi "Markdown Preview Mermaid Support".
