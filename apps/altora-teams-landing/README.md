# Altora Teams — Landing Page

Landing page standalone untuk vertikal Altora Teams (absensi, jadwal shift,
dan target tim untuk perusahaan). Aplikasi Next.js terpisah dari app utama
Altora (`src/` di root repo), di-deploy sendiri sebagai proses Node yang
di-reverse-proxy oleh Caddy — lihat `ops/Caddyfile.altora-teams`.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Build & deploy produksi (VPS)

```bash
npm run build
npm run start
```

`npm run start` menjalankan app di port `3003` (lihat `package.json`), sesuai
port yang di-proxy oleh `ops/Caddyfile.altora-teams` ke `teams.altora.my.id`.
Jalankan lewat process manager (mis. `pm2` atau `systemd`) supaya tetap hidup
setelah proses Caddy/SSH terputus.
