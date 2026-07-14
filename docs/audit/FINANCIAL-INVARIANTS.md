# Financial Invariants

## POS price authority

Public cashier requests must never provide a unit-price override or a trusted variant-price snapshot.
The server derives price from the tenant product, selected valid variants, wholesale rules, promotions,
tax, and channel pricing. Internal table/catering settlement can use a separate server-only command
after its own source-order validation.

## Journal entry validity

Every automatic or manual journal posting must have a positive safe-integer Rupiah amount and
different non-empty debit and credit account codes. A journal with zero/negative amount or the
same account on both sides is rejected before persistence.

1. Semua jumlah uang integer rupiah atau Decimal; tidak memakai float.
2. Sale total = item subtotal - discount + tax + channel markup.
3. Payment ledger total = amount due, kecuali cash yang mencatat tendered/change eksplisit.
4. Satu command idempotent hanya boleh menciptakan satu Sale/Payment/Journal source event.
5. Journal posted: total debit = total credit; tidak dihapus, hanya reversal.
6. Shift drawer cash hanya mencakup metode cash; QRIS/card/delivery adalah digital settlement.
7. Refund/void selalu terkait source sale dan membuat reversal stok/poin/journal yang sesuai.
8. Supplier payment tidak boleh melampaui remaining AP secara atomik.

Semua invariant ini belum dibuktikan oleh test end-to-end saat baseline.
