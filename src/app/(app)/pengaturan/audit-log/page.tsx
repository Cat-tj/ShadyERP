import { requireRole } from "@/server/require-session";
import { listAuditLogs } from "@/server/services/audit-log-service";
import { formatTanggal, formatJam } from "@/lib/format";

const ACTION_LABEL: Record<string, string> = {
  SALE_VOID: "Batalkan transaksi",
  SALE_RETURN: "Retur transaksi",
  PRODUCT_PRICE_CHANGE: "Ubah harga produk",
  PRODUCT_DEACTIVATE: "Nonaktifkan produk",
  PRODUCT_ACTIVATE: "Aktifkan produk",
  PRODUCT_DELETE: "Hapus produk",
  USER_PASSWORD_RESET: "Reset kata sandi",
};

export default async function AuditLogPage() {
  const user = await requireRole(["OWNER"]);
  const logs = await listAuditLogs(user.tenantId);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Log audit</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Jejak aksi sensitif: pembatalan transaksi, retur, ubah harga, nonaktifkan produk, dan reset
        kata sandi karyawan — siapa melakukannya dan kapan.
      </p>

      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {logs.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada aksi sensitif yang tercatat.
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col gap-1 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--color-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text)]">
                    {ACTION_LABEL[log.action] ?? log.action}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                    {formatTanggal(log.createdAt)}, {formatJam(log.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text)]">{log.description}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">oleh {log.user.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
