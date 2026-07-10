# Domain: PENGATURAN TENANT

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `TenantSetting`

```mermaid
erDiagram
  TenantSetting {
    String id
    String tenantId
    Int taxPercent
    Int pointsPerAmount
    String receiptFooter
    String staticQrisPayload
    Boolean enableParkingFee
    AccountingMode accountingMode
  }
```

## Relasi keluar domain

- `TenantSetting` → `Tenant` (`setting`, 1-1?)
