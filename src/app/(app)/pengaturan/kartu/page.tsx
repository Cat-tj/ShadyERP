import { Metadata } from "next";
import { requireRole } from "@/server/require-session";
import { listBatches } from "@/server/services/uid-card-service";
import { KartuManager } from "@/components/pengaturan/kartu-manager";

export const metadata: Metadata = {
  title: "Cetak & Kelola Kartu Member UID - Altora",
  description: "Cetak kartu member QR, registrasi kartu fisik UID/RFID pelanggan, kelola poin loyalitas belanja, dan top-up saldo deposit member.",
};

export default async function KartuSettingsPage() {
  const user = await requireRole(["OWNER"]);
  const batches = await listBatches(user.tenantId);

  return (
    <KartuManager
      batches={batches.map((b) => ({
        id: b.id,
        cardType: b.cardType,
        quantity: b.quantity,
        serialPrefix: b.serialPrefix,
        createdAt: b.createdAt.toISOString(),
        cardCount: b._count.cards,
      }))}
    />
  );
}
