import QRCode from "qrcode";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/require-session";
import { listCardsForBatch } from "@/server/services/uid-card-service";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/base-url";
import { PrintButton } from "@/components/kasir/print-button";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const user = await requireRole(["OWNER"]);

  const [cards, tenant, baseUrl] = await Promise.all([
    listCardsForBatch(user.tenantId, batchId),
    prisma.tenant.findUnique({ where: { id: user.tenantId } }),
    getBaseUrl(),
  ]);

  if (cards.length === 0) {
    notFound();
  }

  const cardsWithQr = await Promise.all(
    cards.map(async (card) => ({
      ...card,
      qrDataUrl: await QRCode.toDataURL(`${baseUrl}/q/${card.uid}`, { width: 180, margin: 1 }),
    }))
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-display text-xl font-semibold text-[var(--color-text)]">
            Batch {cards[0].serialNumber.split("-")[0]}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{cards.length} kartu siap cetak</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/pengaturan/kartu"
            className="min-h-[44px] rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] flex items-center hover:bg-[var(--color-bg)]"
          >
            Kembali
          </Link>
          <PrintButton label="Cetak semua kartu" fullWidth={false} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {cardsWithQr.map((card) => (
          <div
            key={card.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center print:break-inside-avoid"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.qrDataUrl} alt={`QR ${card.serialNumber}`} className="h-32 w-32" />
            <p className="text-sm font-bold text-[var(--color-text)]">{tenant?.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{card.serialNumber}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
