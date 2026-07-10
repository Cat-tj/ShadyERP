<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Aturan Produk Altora (WAJIB untuk semua agent)

Sebelum menambah/mengubah fitur apa pun, baca `docs/MASTER-GUIDELINE.md`.
Intinya:

1. Target user utama = orang awam (pemilik warung). Fitur harus bisa dipakai
   **tanpa pelatihan** — kalau tidak bisa, sembunyikan di mode **Advanced**.
2. **Simple by default, Advanced via toggle** (pola `accountingMode` yang sudah
   ada). Jangan pernah menghapus versi simpel demi fitur canggih.
3. Bahasa UI mode Simpel = bahasa sehari-hari (lihat Kamus Istilah di guideline).
4. **Dilarang** menambah integrasi yang butuh API key/token eksternal.
5. Kalau data sudah ada di sistem (POS, absensi), fitur baru harus mengisi
   otomatis — jangan menyuruh user input manual.
6. Multi-tenant: setiap query Prisma wajib filter `tenantId` dari session.
7. Setiap perubahan `prisma/schema.prisma` WAJIB disertai file migration
   (`prisma migrate dev`) — sudah dua kali insiden schema tanpa migration.
