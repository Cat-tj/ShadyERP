#!/usr/bin/env bash
# Skrip deploy manual buat app utama Altora di VPS.
# Jalankan dari root repo (mis. /home/altora/ShadyERP) sebagai user yang
# sama dengan yang dipakai altora-main.service.
#
# Usage: bash ops/deploy.sh

set -euo pipefail

echo "== git pull =="
git pull origin claude/umkm-saas-pos-tv4asg

echo "== npm install =="
npm install

echo "== prisma migrate deploy =="
npx prisma migrate deploy

echo "== build =="
npm run build

echo "== restart service =="
sudo systemctl restart altora-main

echo "== selesai, cek status =="
sudo systemctl status altora-main --no-pager -l | head -15
