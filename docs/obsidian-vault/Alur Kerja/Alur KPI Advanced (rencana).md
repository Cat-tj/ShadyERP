---
tags: [alur-kerja]
---
# Alur KPI Advanced (rencana)

> **Belum dibangun.** Rencana migrasi dari repo `svt-kpi-monitor` (lihat
> `docs/MASTER-GUIDELINE.md` §6 backlog #9). Hanya muncul di mode Advanced /
> produk Altora HRIS — bukan pengganti [[Alur Absensi & Target Tim]] versi
> Simpel, melainkan pelengkap untuk perusahaan formal.

1. Admin/HR definisikan KPI: target, bobot, periode, di-assign ke karyawan
   (rencana model baru, mis. `KpiDefinition` — belum ada di schema)
2. Staf setor realisasi per periode + bukti (rencana model `KpiEntry`)
3. Manajer review: approve / reject + catatan
4. Skor 0–100 terhitung berbobot
5. Ranking karyawan & departemen

## Beda dengan Target Tim (Simpel)
| | Target Tim (Simpel) | KPI Advanced |
|---|---|---|
| Input | Otomatis dari [[Sale]]/[[Attendance]] | Manual, disetor staf |
| Approval | Tidak ada | Ada, oleh manajer |
| Struktur | 1 kalimat | Bobot, sub-KPI, departemen |
| Target user | Owner warung/toko | HRD perusahaan formal |

## Fitur terkait (akan dibangun)
- Perluasan [[hr-analytics-service]] atau service baru `kpi-target-service`
- Butuh model baru: Departemen, KpiDefinition, KpiEntry, Approval
