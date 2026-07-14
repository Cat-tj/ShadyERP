# Inventory Invariants

1. Stock balance = initial + inbound - outbound + adjustment, dibuktikan oleh StockMovement ledger.
2. Tidak ada stok negatif tanpa policy tenant yang eksplisit.
3. Setiap sale/void/return/receipt/transfer/count menghasilkan movement idempotent.
4. Recipe flattening tidak boleh circular dan snapshot consumption melekat pada sale item.
5. Batch expired tidak boleh dikonsumsi; FEFO untuk stock batch enabled.
6. Transfer memiliki states request/approve/send/receive/discrepancy dan tidak langsung menambah tujuan saat kirim.
7. Count belum dihitung bukan berarti nol; variance memakai cost.

Baseline memakai `ProductStock` dan proses terkait. Ledger/reconciliation belum selesai.
