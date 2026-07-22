<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Aturan Produk Altora (WAJIB untuk semua agent)

## Release target check (WAJIB)

Before any implementation or deployment, read
`docs/RELEASE_TARGETS.md` and state the repository, branch, target service, and
domain in the handover. A commit in another repository must never be described
as an Altora VPS deployment.

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

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
