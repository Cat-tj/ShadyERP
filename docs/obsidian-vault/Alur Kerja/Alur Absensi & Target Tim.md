---
tags: [alur-kerja]
---
# Alur Absensi & Target Tim

## Yang sudah ada
1. Staf buka halaman Absensi di HP
2. Clock-in: foto + lokasi → tercatat sebagai [[Attendance]]
3. [[ShiftSchedule]] — jadwal shift + approval manajer
4. Analitik kedisiplinan + estimasi gaji kasar (bukan slip resmi)

## Rencana (⭐ pembeda utama, belum dibangun)
Target Tim versi Simpel: owner isi satu kalimat ("Budi: jual Rp 15 jt bulan
ini"), lalu **progress terisi otomatis** dari data yang sudah ada di sistem —
tidak ada input manual, tidak ada approval:

- Progress penjualan → dari [[Sale]] (kasir mana yang jual)
- Progress kehadiran → dari [[Attendance]]

Ini beda dari [[Alur KPI Advanced (rencana)]] yang butuh setor manual +
approval — Target Tim justru sebaliknya: nol input manual.

## Fitur yang terlibat
- [[attendance-service]]
- [[schedule-service]]
- [[hr-analytics-service]]
- [[sale-service]] (sumber data progress otomatis)

Catatan: [[kpi-service]] yang ADA SEKARANG cuma hitung statistik dashboard
sederhana (jumlah outlet/karyawan/produk/member) — BUKAN sistem target/KPI
berbobot. Jangan tertukar dengan rencana di atas.
