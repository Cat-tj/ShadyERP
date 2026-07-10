# Altora Sales Brochure — Design Spec

Date: 2026-07-07

## Purpose

A printable (PDF) sales brochure for Altora, to be handed out or emailed to
prospective UMKM business owners (coffee shops, restaurants, barbershops,
small retail) evaluating the product. Two language versions: Bahasa
Indonesia and English, same structure and content, translated copy.

## Audience & context

- **Who:** Prospective UMKM owners considering Altora (cold outreach / sales
  collateral), not existing customers or investors.
- **Format:** Multi-page catalog-style brochure, ~12-13 pages, A4, print-ready
  PDF (not a single-page flyer or tri-fold — the feature set is too broad).

## Content plan (page-by-page)

1. **Cover** — Altora gradient logomark, product name, tagline "Tutup toko,
   tanpa tutup buku." (existing landing-page headline).
2. **Kenapa Altora** — pain points (nota kertas, grup WA karyawan, buku
   catatan stok manual) vs. Altora's solution, adapted from the landing
   page's "Kenapa Altora" section.
3. **Konsep Hub & Modul** — the 4-hub overview table (Kasir & Operasional,
   Tim, Finance, Admin) from README.md, explaining the product's
   organizing concept.
4. **Kasir & Operasional deep-dive** — POS, stock, procurement, QR-meja
   ordering + kitchen display, with the real `qr-meja.png` screenshot.
5. **Produk & Stok deep-dive** — product/stock management, multi-outlet
   transfer, stock opname, with the real `inventory.png` screenshot.
6. **Tim & Absensi deep-dive** — employee management, clock-in/out with
   photo+GPS, with the real `absen.png` screenshot.
7. **Finance & Laporan deep-dive** — revenue/expense reporting, analytics,
   with the real `finance.png` screenshot.
8. **Fitur lengkap** — full feature checklist table, adapted from the
   landing page's feature ledger section.
9. **Cocok untuk usaha kamu** — 3 use cases (coffee shop/F&B, barbershop/
   salon, retail), adapted from the landing page.
10. **Cara kerja** — 3 steps to start using Altora (daftar → atur produk &
    tim → mulai jualan), from the landing page.
11. **Harga** — Free / Basic / Pro pricing table (Rp0, Rp99.000/bln,
    Rp249.000/bln with their outlet/karyawan/produk limits), from the
    landing page.
12. **Kontak / CTA back cover** — contact person **Richard**, WhatsApp
    **+62-851-3322-1170**, website **altora.my.id**, plus a real QR code
    (generated locally, not a placeholder image) linking to the website.

English version mirrors this exact structure with translated copy.

## Visual design

Reuse Altora's actual brand system so the brochure looks identical in
spirit to the real product, not a generic template:

- **Colors:** navy text `#0a1f44`, primary blue `#2563eb` / `#1d4ed8`,
  light background `#f5f7fa`/`#eceef2`, from `src/app/globals.css`.
- **Logomark:** the real gradient "a" mark from
  `src/components/ui/altora-logomark.tsx` (inlined as SVG).
- **Typography:** Inter (body/display), matching the app's font stack.
  Since brand Inter woff2 files aren't locally cached in this repo, fall
  back to the system UI sans stack (`-apple-system, "Segoe UI", Roboto,
  Inter, sans-serif`) so PDF rendering doesn't depend on a network fetch.
- **Screenshots:** the 4 real PNGs already in `public/landing-previews/`
  (qr-meja, finance, absen, inventory) — no mockups or stock photos.
- **Print layout:** CSS `@page { size: A4; margin: ... }`, one `<section>`
  per page with `break-after: page`, restrained shadows/gradients (avoid
  backdrop-filter/glass effects, which don't render reliably in print).

## Technical approach

- Two standalone HTML files (`brochure-id.html`, `brochure-en.html`)
  sharing one CSS stylesheet, built by hand (not through the app's
  Next.js build — this is a standalone static document).
- A real QR code is generated locally via the `qrcode` npm package
  (already a devDependency of this repo) as an embedded SVG/PNG data URI
  — no third-party QR API calls.
- PDF export via **Playwright** (already a devDependency of this repo):
  a small Node script opens each HTML file headless and calls
  `page.pdf({ format: 'A4', printBackground: true })`.
- Output: `brochure-altora-id.pdf` and `brochure-altora-en.pdf`, plus the
  source HTML/CSS for future edits. Files are built in the session
  scratchpad, not committed to the ShadyERP git repo (this is marketing
  collateral, not app code) unless the user asks to keep them in-repo.

## Out of scope

- No changes to the actual ShadyERP/Altora application code.
- No testimonials/case studies (none exist yet in the codebase) — the
  "why Altora" page uses the existing pain-point framing instead.
- No print-shop preflight (bleed, CMYK conversion) — this is a
  digital/office-printer-ready PDF, not a professional print run.
