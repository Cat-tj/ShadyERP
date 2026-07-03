import QRCode from "qrcode";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/require-session";
import { getTable } from "@/server/services/table-service";
import { getBaseUrl } from "@/lib/base-url";
import { PrintButton } from "@/components/kasir/print-button";

export default async function TableQrPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;
  const user = await requireRole(["OWNER"]);

  const [table, baseUrl] = await Promise.all([getTable(user.tenantId, tableId), getBaseUrl()]);

  if (!table) {
    notFound();
  }

  const orderUrl = `${baseUrl}/pesan/${table.qrToken}`;
  const qrDataUrl = await QRCode.toDataURL(orderUrl, { width: 320, margin: 1 });

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-display text-xl font-semibold text-[var(--color-text)]">{table.name}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{table.outlet.name}</p>
        </div>
        <Link
          href="/pengaturan/meja"
          className="min-h-[44px] rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] flex items-center hover:bg-[var(--color-bg)]"
        >
          Kembali
        </Link>
      </div>

      <div
        id="print-area"
        className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt={`QR pesan ${table.name}`} className="h-64 w-64" />
        <p className="text-lg font-bold text-[var(--color-text)]">{table.name}</p>
        <p className="text-sm text-[var(--color-text-secondary)]">Scan untuk pesan lewat HP</p>
      </div>

      <div className="mt-4 print:hidden">
        <PrintButton label="Cetak QR meja" />
      </div>
    </div>
  );
}
