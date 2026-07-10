# Domain: PROMO TERJADWAL

> Digenerate otomatis dari `prisma/schema.prisma` — jangan edit manual, jalankan `npm run knowledge`.

Model: `Promo`

```mermaid
erDiagram
  Promo {
    String id
    String tenantId
    String name
    PromoDiscountType discountType
    Int discountValue
    PromoScope scope
    String categoryId
    Int minSpend
  }
```

## Relasi keluar domain

- `Tenant` → `Promo` (`promos`, 1-N)
- `Category` → `Promo` (`promos`, 1-N)
