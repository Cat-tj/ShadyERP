---
tags: [alur-kerja]
---
# Alur Laundry

1. Terima cucian: pilih [[LaundryService]] (kiloan/satuan/dry clean/setrika/express)
2. [[LaundryOrder]] dibuat, status awal `RECEIVED`
3. Status berjalan: `WASHING` → `DRYING` → `IRONING` → `READY`
4. Pelanggan ambil / diantar → `PICKED_UP`
5. Pembayaran tercatat, bisa DP dulu (`paidAmount` < `total`)

## Fitur yang terlibat
- [[laundry-service]]

## Versi
- **Simpel**: terima → tandai selesai → diambil
- **Advanced**: status per tahap penuh, kiloan vs satuan, pickup/delivery
